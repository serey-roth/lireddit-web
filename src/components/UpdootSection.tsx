import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { useMutation } from "urql";
import { RegularPostFragment, VoteDocument } from "../gql/graphql";

interface UpdootSectionProps {
    postId: RegularPostFragment["id"];
    points: RegularPostFragment["points"]; //select subtype in another type
}

type LoadingState = "updoot-loading" | "downdoot-loading" | "not-loading";

export const UpdootSection: React.FC<UpdootSectionProps> = ({ postId, points }) => {
    const [loadingState, setLoadingState] = useState<LoadingState>("not-loading")
    const [{ fetching, operation }, vote] = useMutation(VoteDocument);
    
    const handleUpdoot = async () => {
        setLoadingState("updoot-loading");
        await vote({ postId, value: 1 });
        setLoadingState("not-loading");
    };

    const handleDowndoot = () => {
        setLoadingState("downdoot-loading");
        vote({ postId, value: -1 });
        setLoadingState("not-loading");
    };

    return (
        <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
        <IconButton
            variant="ghost"
            size="sm"
            aria-label="Updoot post"
            isLoading={loadingState === "updoot-loading"}
            icon={<ChevronUpIcon boxSize={8} />}
            onClick={handleUpdoot}
        />
        {points}
        <IconButton
            variant="ghost"
            size="sm"
            aria-label="Downdoot post"
            isLoading={loadingState === "downdoot-loading"}
            icon={<ChevronDownIcon boxSize={8} />}
            onClick={handleDowndoot}
        />
        </Flex>
    );
};
