import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMeQuery, usePostQuery, usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Heading, Link, Stack,Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from 'react';
import { UpdootSection } from '../components/UpdootSection';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';

const Index = () => {
  const [variables,setVariables] = useState({ 
    limit: 15, 
    cursor: null as null | string, 
  });

  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
      <div>you got query failed for some reason </div>
      <div>{error?.message}</div>
      </div>
    );
  }



  return(
    <Layout>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
        {data!.posts.posts.map((p) => 
          !p ? null :(
          <Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
            <UpdootSection post={p} />
            <Box flex={1}>
              <Link 
                as={NextLink} 
                href={{
                    pathname:"/post/[id]",
                    query: {id:p.id},
                  }}
              >
              <Heading fontSize='xl'>{p.title}</Heading>
              </Link>

              <Text>posted by {p.creator.username}</Text>
              <Flex align="center">
                <Text flex={1} mt={4}>
                  {p.textSnippet}
                </Text>
                <Box ml="auto">
                  <EditDeletePostButtons 
                    id={p.id} 
                    creatorId={p.creator.id}
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
      <Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length -1].createdAt,
          })
        }}
        isLoading={fetching} 
        m="auto" 
        my={8}
        >
          load more
          </Button>
      </Flex>
      ) : null}
    </Layout>   
  );

}

export default withUrqlClient(createUrqlClient ,{ ssr: true })(Index);