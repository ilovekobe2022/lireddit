import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{data}] = usePostsQuery();
  return(
    <Layout>
      {/* <NextLink href="/create-post"> */}
      <Link  as={NextLink} href="/create-post">create post</Link>
      {/* </NextLink> */}
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map(p => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);