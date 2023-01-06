import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, RegularUserResponseFragment } from "../gql/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

// create urql client with next-urql for optional server rendering of select pages
export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4040/graphql',
    fetchOptions: {
        credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
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
    ssrExchange,
    fetchExchange],
});