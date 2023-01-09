import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { ButtonGroup, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";

interface EditDeletePostButtonsProps {
    id: number;
    onDelete: (id: number) => void;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    onDelete
}) => {
  return (
    <ButtonGroup ml="auto">
      <IconButton
        as={NextLink}
        href={`/post/edit/${id}`}
        aria-label="Edit post"
        icon={<EditIcon boxSize={4} />}
      />
      <IconButton
        aria-label="Delete post"
        icon={<DeleteIcon boxSize={4} />}
        onClick={() => onDelete(id)}
      />
    </ButtonGroup>
  );
};

export default EditDeletePostButtons;