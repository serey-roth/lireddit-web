import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql"
import { useQuery } from "urql";
import Layout from "../components/Layout";
import { PostsDocument } from "../gql/graphql";
import { createUrqlClient } from "../util/createUrqlClient";
import NextLink from "next/link";

const Index = () => {
    const [{ data }] = useQuery({ query: PostsDocument });
    return (
        <Layout>
            <Link as={NextLink} href='/create-post'>Create post</Link>
            <br />
            { !data?.posts ? null : data.posts.map(post => <div key={post.id}>{post.title}</div>)}
        </Layout>
    )
}

//set up urql provider around index
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

//ssr for better seo and when there is dynamic data (when you query data)