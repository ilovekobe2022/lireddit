import React from "react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface EditDeletePostButtonsProps {
    id: number,
    creatorId: number,
 }

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    creatorId
 }) => {
    const [{ data: meData }] = useMeQuery({
        pause: isServer(),
    });
    const [, deletePost] = useDeletePostMutation();

    if (meData?.me?.id !== creatorId) {
        return null;
    }

    return (
        <Box>
            <Link 
                  as={NextLink} 
                  href={{
                    pathname:"/post/edit/[id]",
                    query: {id: id},
                  }}
            >
                <IconButton
                    mr={4}
                    icon={<EditIcon />}
                    aria-label="Edit Post"
                />
            </Link>


            <IconButton
                icon={<DeleteIcon />}
                aria-label="Delete Post"
                onClick={() => {
                    deletePost({ id });
                }}
            />
        </Box>
    );
}