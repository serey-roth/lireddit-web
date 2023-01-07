import React from 'react'
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form'
import { Button, Box } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { useMutation } from 'urql'
import { RegisterDocument, RegularErrorFragment, RegularUserResponseFragment, UsernamePasswordInput } from '../gql/graphql'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../util/createUrqlClient'
import { toObjectKeyTypes } from '../util/toObjectKeyTypes'

type InputTypes = toObjectKeyTypes<UsernamePasswordInput>;

type UnionKeysType = InputTypes[keyof InputTypes];

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, register] = useMutation(RegisterDocument);

    const methods = useForm<UsernamePasswordInput>()

    const onSubmit: SubmitHandler<UsernamePasswordInput> = async (values) => {
        const response = await register({ options: values });
        const registerResponse = response.data?.register as RegularUserResponseFragment;
        if (registerResponse?.errors) {
            registerResponse.errors.forEach(error => {
                const { field, message } = error as RegularErrorFragment;
                methods.setError(field as UnionKeysType, 
                    { type: 'custom', message }, 
                    { shouldFocus: true });
            });
        } else if (registerResponse?.user) {
            router.push('/'); //client-side navigation to home page
        }
    }

    return (
        <Wrapper variant='small'>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <InputField 
                        label='Username'
                        name='username'
                        type='text'
                        placeholder='Enter username'/>
                    <Box mt={4}>
                        <InputField 
                            label='Email'
                            name='email'
                            type='email'
                            placeholder='Enter email'/>
                    </Box>
                    <Box mt={4}>
                        <InputField 
                            label='Password'
                            name='password'
                            type='password'
                            placeholder='Enter password'
                            minLength={6}/>
                    </Box>
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

export default withUrqlClient(createUrqlClient)(Register);