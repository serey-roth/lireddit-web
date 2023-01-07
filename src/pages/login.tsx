import React from 'react'
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form'
import { Button, Box, Link, Flex } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { useMutation } from 'urql'
import { LoginDocument, MutationLoginArgs, RegularErrorFragment, RegularUserResponseFragment } from '../gql/graphql'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../util/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import { toObjectKeyTypes } from '../util/toObjectKeyTypes'
import NextLink from 'next/link';

type InputKeyTypes = toObjectKeyTypes<MutationLoginArgs>;

type UnionKeysType = InputKeyTypes[keyof InputKeyTypes];

type loginProps = {}

const Login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [, login] = useMutation(LoginDocument);

    const methods = useForm<MutationLoginArgs>();

    const onSubmit: SubmitHandler<MutationLoginArgs> = async (values) => {
        const response = await login(values);
        const loginResponse = response.data?.login as RegularUserResponseFragment
        if (loginResponse?.errors) {
            loginResponse.errors.forEach(error => {
                const { field, message } = (error as RegularErrorFragment);
                methods.setError(field as UnionKeysType, 
                { type: 'custom', message }, 
                { shouldFocus: true });
            });
        } else if (loginResponse?.user) {
            if (typeof router.query.next === 'string') {
                router.push(router.query.next); //when previous page is not homepage like create-post page
            } else {
                router.push("/"); //client-side navigation to home page
            }
        }
    }

    return (
        <Wrapper variant='small'>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <InputField 
                        label='Username/Email'
                        name='usernameOrEmail'
                        type='text'
                        placeholder='Enter username or email'/>
                    <Box mt={4}>
                        <InputField 
                            label='Password'
                            name='password'
                            type='password'
                            placeholder='Enter password'/>
                    </Box>
                    <Flex mt={2}>
                    <Link as={NextLink} href='/forget-password' ml='auto'>forgot password?</Link>
                    </Flex>
                    <Button 
                        mt={4} 
                        colorScheme='teal' 
                        isLoading={methods.formState.isSubmitting} 
                        type='submit'>
                        Submit
                    </Button>
                </form>
            </FormProvider>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login);