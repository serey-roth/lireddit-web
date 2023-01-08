import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql"
import { useQuery } from "urql";
import Layout from "../components/Layout";
import { PostsDocument, RegularPostFragment } from "../gql/graphql";
import { createUrqlClient } from "../util/createUrqlClient";
import NextLink from "next/link";

const Index = () => {
    const [{ data }] = useQuery({ 
        query: PostsDocument,
        variables: {
            limit: 10
        }
    });
    return (
        <Layout>
            <Link as={NextLink} href='/create-post'>Create post</Link>
            <br />
            {!data?.posts ? 
            (<div>Loading posts...</div>) : 
            (<Stack spacing={8} direction='column'>
                {data.posts.map(post => {
                    const actualPost = post as RegularPostFragment;
                    return (
                        <Box key={actualPost.id} p={5} shadow='md' borderWidth='1px'>
                            <Heading fontSize='xl'>{actualPost.title}</Heading>
                            <Text mt={4}>{actualPost.text.slice(0, 50)}</Text>
                        </Box>
                    )
                })}
            </Stack>)}
        </Layout>
    )
}

//set up urql provider around index
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

//ssr for better seo and when there is dynamic data (when you query data)