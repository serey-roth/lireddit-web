import { withUrqlClient } from "next-urql"
import { useQuery } from "urql";
import { Navbar } from "../components/Navbar"
import { PostsDocument } from "../gql/graphql";
import { createUrqlClient } from "../util/createUrqlClient";

const Index = () => {
    const [{ data }] = useQuery({ query: PostsDocument });
    return (
        <div>
            <Navbar />
            Hello world
            <br />
            { !data ? null : data.posts.map(post => <div key={post.id}>{post.title}</div>)}
        </div>
    )
}

//set up urql provider around index
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

//ssr for better seo and when there is dynamic data (when you query data)