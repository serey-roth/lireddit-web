import { Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { useQuery } from 'urql';
import Layout from '../../components/Layout';
import { PostDocument, Post } from '../../gql/graphql';
import { createUrqlClient } from '../../util/createUrqlClient';

interface PostProps {

}

const Post: React.FC<PostProps> = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data, fetching, error }] = useQuery({ 
        query: PostDocument,
        pause: intId === -1,
        variables: {
            id: intId,
        }
    })

    if (fetching) {
        return <Layout>
            <div>loading...</div>
        </Layout>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    if (!data?.post) {
        return <Layout>
            <div>loading...</div>
        </Layout>
    }

    const post = data.post as Post;

    return (
        <Layout>
            <Heading>{post.title}</Heading>
            <Text mt={4}>{post.text}</Text>
        </Layout>
    );
}


export default withUrqlClient(createUrqlClient, { ssr: true })(Post);