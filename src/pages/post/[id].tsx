import { Box, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { useMutation, useQuery } from 'urql';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { DeletePostDocument, MeDocument, Post, PostDocument, User } from '../../gql/graphql';
import { createUrqlClient } from '../../util/createUrqlClient';
import { useGetIntId } from '../../util/useGetIntId';

const Post: React.FC<{}> = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{ data, fetching, error }] = useQuery({ 
        query: PostDocument,
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const [{ data: meData }] = useQuery({ query: MeDocument });
    const [, deletePost] = useMutation(DeletePostDocument);

    const handleDeletePost = async (id: number) => {
        await deletePost({ id });
        router.push('/');
    };
    
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
            <div>cannot find post</div>
        </Layout>
    }

    const post = data.post as Post;

    return (
        <Layout>
            <Heading>{post.title}</Heading>
            <Text mt={4} mb={12}>{post.text}</Text>
            <Box>
                {(meData?.me as User)?.id === (data.post as Post)?.creatorId &&
                <EditDeletePostButtons
                    id={intId}
                    onDelete={handleDeletePost} />}
            </Box>
        </Layout>
    );
}


export default withUrqlClient(createUrqlClient, { ssr: true })(Post);