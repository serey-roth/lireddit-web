import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, gql, stringifyVariables } from "urql";
import { pipe, tap } from "wonka";
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, RegularUserResponseFragment, VoteMutationVariables } from "../gql/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import { isServer } from "./isServer";

export const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // If the OperationResult has an error
            // the error is a CombinedError with networkError and graphqlErrors properties
            if (error?.message.includes('not authenticated')) {
                Router.replace('/login');
            }
        })
    );
};

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey); //get all the fields(or queries) in the cache under the entitykey
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        //check if data is in the cache
        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`; //e.g looks like posts({ limit: 10 })
        const isItInTheCache = cache.resolve(
            cache.resolve(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache; //if not in the cache, fetch new data
        //as we paginate, we combine all the data in the cache and
        //store in results
        let results: string[] = [];
        let hasMore = true;
        fieldInfos.forEach(fi => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string; //get the query key
            //resolve each field because they are nested 
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = !!_hasMore;
            }
            results.push(...data);
        })

        return {
            __typename: "PaginatedPosts", //solve InvalidResolverValue error
            hasMore,
            posts: results,
        };
    };
};

const invalidateAllPosts = (cache: Cache) => {
    const allFields = cache.inspectFields("Query");
    const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
    fieldInfos.forEach((fi) => {
        //createPost add post to our database
        //then invalidate the first posts query in
        //the cache so that browser can refetch data from the
        //server
        cache.invalidate("Query", "posts", fi.arguments);
    });
};
// create urql client with next-urql for optional server rendering of select pages
export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = '';
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie; // when server side rendering, browser sends cookie to next.js so we move to forward it our graphql api
    }

    return {
    url: process.env.NEXT_PUBLIC_API_URL as string,
    fetchOptions: {
        credentials: 'include' as const,
        headers: cookie ? {
            cookie
        } : undefined,
    },
    exchanges: [
        dedupExchange, 
        cacheExchange({
        keys: {
            PaginatedPosts: () => null, //no id to solve InvalidKey error
        },
        //add resolvers on client-side
        resolvers: {
            Query: {
                posts: cursorPagination(), //will run when we make the post query and it will alter the posts query result
            }
        },
        //add cache updates for login, register and logout
        updates: {
            Mutation: {
                logout: (_result, args, cache, info) => {
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        () => ({ me: null }),
                    )
                },
                login: (_result, args, cache, info) => {
                    betterUpdateQuery<LoginMutation, MeQuery>(cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if ((result.login as RegularUserResponseFragment).errors) {//if login give errors, return current query
                                return query;
                            } else {//otherwise, return me query
                                return {
                                    me: (result.login as RegularUserResponseFragment).user,
                                }
                            }
                        }
                    );
                    invalidateAllPosts(cache);//reset the cache to fetch new data
                },
                register: (_result, args, cache, info) => {
                    betterUpdateQuery<RegisterMutation, MeQuery>(cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if ((result.register as RegularUserResponseFragment).errors) {//if login give errors, return current query
                                return query;
                            } else {//otherwise, return me query
                                return {
                                    me: (result.register as RegularUserResponseFragment).user,
                                }
                            }
                        }
                    );
                    invalidateAllPosts(cache);
                },
                createPost: (_result, args, cache, info) => {
                    invalidateAllPosts(cache);
                },/* 
                updatePost: (_result, args, cache, info) => {
                    //invalidateAllPosts(cache);
                }, */
                vote: (_result, args, cache, info) => {
                    const { postId, value } = args as VoteMutationVariables;
                    const data = cache.readFragment(
                        gql`
                          fragment _ on Post {
                            id
                            points
                            voteStatus
                          }
                        `,
                        { id: postId }
                    );
                    if (data) {
                        if (data.voteStatus === value) {
                            return;
                        }
                        const newPoints = (data.points as number) + 
                        ((!data.voteStatus ? 1 : 2) * value);
                        cache.writeFragment(
                            gql`
                                fragment _ on Post {
                                    points
                                    voteStatus
                                }
                            `, 
                            { id: postId, points: newPoints, voteStatus: value }
                        );
                    }
                },
                deletePost: (_result, args, cache, info) => {
                    //invalidate the deleted post in the cache 
                    //the post becomes null in the cache
                    cache.invalidate({ __typename: "Post", id: (args as DeletePostMutationVariables).id})
                }
            }
        }
    }),
        errorExchange,
        ssrExchange,
        fetchExchange],
}};