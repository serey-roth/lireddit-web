import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link';
import { useMutation, useQuery } from 'urql';
import { LogoutDocument, MeDocument, RegularUserFragment } from '../gql/graphql';
import { isServer } from '../util/isServer';
import { useRouter } from 'next/router';

interface NavbarProps {
    home?: boolean;
}

// when Index is server-side rendered, Navbar makes a Me query 
// on the next.js server but the next.js server doesn't have the cookie
// so return { me: null }
export const Navbar: React.FC<NavbarProps> = ({home=false}) => {
    const router = useRouter();
    const [{ data, fetching }] = useQuery({ 
        query : MeDocument,
        pause: isServer(), //don't query on server -> make query client-side on browser
    });
    const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);

    //use useState for re-hydration issue since we make query request on client-side
    const [body, setBody] = useState<any>(null);

    useEffect(() => {
        //data is loading
        if (fetching) {
            setBody(null);
        // user is not logged in
        } else if (!data?.me) {
            setBody(<>
                <Link as={NextLink} href='/login' mr={4}>login</Link>
                <Link as={NextLink} href='/register'>register</Link>
            </>);
        // user is logged in
        } else {
            setBody(
                <Flex>
                    <Box mr={4}>{(data.me as RegularUserFragment).username}</Box>
                    <Button 
                        variant='link'
                        isLoading={logoutFetching}
                        onClick={async () => {
                            await logout({});
                            router.reload(); //reset the cache by reloading the page
                        }}>logout</Button>
                </Flex>
            );
        }
    }, [fetching, data]);

    return (
        <Flex position='sticky' top={0} zIndex={1} bg='tan' alignItems='center' p={4}>
            {!home && <Box>
                <Link as={NextLink} href='/'>
                    <Heading>LiReddit</Heading>
                </Link>
            </Box>}
            <Box ml='auto'>
                {body}
            </Box>
        </Flex>
    );
}