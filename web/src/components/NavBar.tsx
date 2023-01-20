import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import {isServer} from "../utils/isServer";
import {useRouter} from "next/router";

interface NavBarProps{}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching},logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    });

    let body = null;

    // data is loading
    if (fetching){
    // user not logged in
    } else if (fetching || !data?.me){
        body = (
            <>
            <Link as={NextLink} href="/login" mr={2}>login</Link>
            <Link as={NextLink} href="/register" >register</Link>
            </>
        );
        // user is logged in
    } else {
        body = (
            <Flex align="center">
            <Link as={NextLink} href="/create-post">
                <Button as={Link} mr={4}>
                  create post
                </Button>
            </Link>
            <Box mr={2}>{data.me.username}</Box>
            <Button 
              onClick={async () => {
                await logout();
                router.reload();
            }}
            isLoading={logoutFetching}
            variant="link"
            >
                logout
                </Button>
            </Flex>
        );
    }

    return (
    <Flex
        zIndex={1} 
        position="sticky" 
        top={0} 
        bg="tan" 
        p={4}
    >
      <Flex flex={1} m="auto" align="center" maxW={800}>
            <Link as={NextLink} href="/">
              <Heading>LiReddit</Heading>
            </Link>

        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
    );
};