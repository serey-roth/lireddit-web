import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { pipe, tap } from "wonka";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, RegularUserResponseFragment } from "../gql/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";

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
 /*     const visited = new Set();
        let result: NullArray<string> = [];
        let prevOffset: number | null = null;

        for (let i = 0; i < size; i++) {
            const { fieldKey, arguments: args } = fieldInfos[i];
            if (args === null || !compareArgs(fieldArgs, args)) {
                continue;
            }

            const links = cache.resolve(entityKey, fieldKey) as string[];
            const currentOffset = args[cursor];

            if (
                links === null ||
                links.length === 0 ||
                typeof currentOffset !== 'number'
            ) {
                continue;
            }

            const tempResult: NullArray<string> = [];

            for (let j = 0; j < links.length; j++) {
                const link = links[j];
                if (visited.has(link)) continue;
                tempResult.push(link);
                visited.add(link);
            }

            if (
                (!prevOffset || currentOffset > prevOffset) ===
                (mergeMode === 'after')
            ) {
                result = [...result, ...tempResult];
            } else {
                result = [...tempResult, ...result];
            }

            prevOffset = currentOffset;
        }

        const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        if (hasCurrentPage) {
            return result;
        } else if (!(info as any).store.schema) {
            return undefined;
        } else {
            info.partial = true;
            return result;
        } */
    };
};

// create urql client with next-urql for optional server rendering of select pages
export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4040/graphql',
    fetchOptions: {
        credentials: 'include' as const,
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
                    )
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
                    )
                }
            }
        }
    }),
        errorExchange,
        ssrExchange,
        fetchExchange],
});