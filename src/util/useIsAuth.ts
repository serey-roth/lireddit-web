import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useQuery } from 'urql';
import { MeDocument } from '../gql/graphql';

export default function useIsAuth() {
    const [{ data, fetching }] = useQuery({ query: MeDocument });
    const router = useRouter();

    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace('/login');
        }
    }, [data, fetching, router]);

    return {
        data,
        fetching
    };
}
