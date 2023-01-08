import { Button, Box, Link, Flex } from '@chakra-ui/react';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'urql';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { ChangePasswordDocument, RegularErrorFragment, RegularUserResponseFragment } from '../../gql/graphql';
import { createUrqlClient } from '../../util/createUrqlClient';
import NextLink from 'next/link';

type Input = { newPassword: string };

const ChangePassword: NextPage<{}> = ({}) => {
    const router = useRouter();
    const [, changePassword] = useMutation(ChangePasswordDocument);
    const methods = useForm<Input>();
    
    const token = typeof router.query.token === 'string' ? router.query.token : "";
    const [tokenError, setTokenError] = useState("");

    const onSubmit: SubmitHandler<Input> = async (values) => {
        const response = await changePassword({ token, newPassword: values.newPassword });
        const changePasswordResponse = response.data?.changePassword as RegularUserResponseFragment
        if (changePasswordResponse?.errors) {
            changePasswordResponse.errors.forEach(error => {
                const { field, message } = (error as RegularErrorFragment);
                if (field === 'newPassword') {
                    methods.setError(field as "newPassword", 
                    { type: 'custom', message }, 
                    { shouldFocus: true });
                } else {
                    setTokenError(message);   
                }
            });
        } else if (changePasswordResponse?.user) {
            router.push('/'); //client-side navigation to home page
        }
    }

    return (
        <Wrapper variant='small'>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <InputField 
                        label='New Password'
                        name='newPassword'
                        type='password'
                        placeholder='Enter new password'
                        minLength={4}/>
                    {tokenError && <Flex mt={2} alignItems='center' justifyContent='space-between'>
                        <Box color='red'>
                        {tokenError}
                        </Box>
                        <Link as={NextLink} href='/forgot-password'>click to get a new password</Link>
                    </Flex>}
                    <Button 
                        mt={4} 
                        colorScheme='teal' 
                        isLoading={methods.formState.isSubmitting} 
                        type='submit'>
                        Change Password
                    </Button>
                </form>
            </FormProvider>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ChangePassword);