import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql"
import { useQuery } from "urql";
import Layout from "../components/Layout";
import { PostsDocument, RegularPostFragment } from "../gql/graphql";
import { createUrqlClient } from "../util/createUrqlClient";
import NextLink from "next/link";
import { useState } from "react";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null as null | string,
    })
    const [{ data, fetching }] = useQuery({ 
        query: PostsDocument,
        variables
    });

    if (!fetching && !data) {
        return <div>query failed for some reason</div>
    }

    const handleLoadMore = () => {
        if (data && data.posts) {
            setVariables({
                limit: variables.limit,
                cursor: (data.posts.posts[data.posts.posts.length - 1] as RegularPostFragment).createdAt
            });
        }
    }

    return (
        <Layout>
            <Flex alignItems='center'>
                <Heading>LiReddit</Heading>
                <Link as={NextLink} href='/create-post' ml="auto">Create post</Link>
            </Flex>
            <br />
            {!data && fetching ? 
                (<div>Loading posts...</div>) : 
                (<Stack spacing={8} direction='column'>
                    {data?.posts?.posts.map(post => {
                        const actualPost = post as RegularPostFragment;
                        return (
                            <Box key={actualPost.id} p={5} shadow='md' borderWidth='1px'>
                                <Heading fontSize='xl'>{actualPost.title}</Heading>
                                <Text>posted by {actualPost.creator.username}</Text>
                                <Text mt={4}>{actualPost.textSnippet}</Text>
                            </Box>
                        )
                    })}
                </Stack>)
            }
            {data && data.posts?.hasMore ? (
                <Flex>
                    <Button 
                    isLoading={fetching} 
                    m="auto"
                    my={8}
                    onClick={handleLoadMore}>
                        load more</Button>
                </Flex>
            ) : null}
        </Layout>
    )
}

//set up urql provider around index
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

//ssr for better seo and when there is dynamic data (when you query data)