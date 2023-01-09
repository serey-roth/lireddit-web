import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { useMutation } from "urql";
import { Post, VoteDocument } from "../gql/graphql";

interface UpdootSectionProps {
    post: Post; //select subtype in another type
}

type LoadingState = "updoot-loading" | "downdoot-loading" | "not-loading";

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<LoadingState>("not-loading")
    const [, vote] = useMutation(VoteDocument);
    
    const handleUpdoot = async () => {
        setLoadingState("updoot-loading");
        await vote({ postId: post.id, value: 1 });
        setLoadingState("not-loading");
    };

    const handleDowndoot = () => {
        setLoadingState("downdoot-loading");
        vote({ postId: post.id, value: -1 });
        setLoadingState("not-loading");
    };

    return (
        <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
        <IconButton
            colorScheme={post.voteStatus === 1 ? 'green' : undefined}
            size="sm"
            aria-label="Updoot post"
            isLoading={loadingState === "updoot-loading"}
            icon={<ChevronUpIcon boxSize={8} />}
            onClick={handleUpdoot}
        />
        {post.points}
        <IconButton
            colorScheme={post.voteStatus === -1 ? 'red' : undefined}
            size="sm"
            aria-label="Downdoot post"
            isLoading={loadingState === "downdoot-loading"}
            icon={<ChevronDownIcon boxSize={8} />}
            onClick={handleDowndoot}
        />
        </Flex>
    );
};
