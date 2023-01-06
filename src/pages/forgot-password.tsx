import { Box, Button } from '@chakra-ui/react';
import React, { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'urql';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { ForgotPasswordDocument } from '../gql/graphql';

type Input = { email: string };

const ForgotPassword: React.FC<{}> = ({ }) => {
    const methods = useForm<Input>();
    const [, forgotPassword] = useMutation(ForgotPasswordDocument);
    const [complete, setComplete] = useState(false);

    const onSubmit: SubmitHandler<Input> = async (values) => {
        await forgotPassword(values);
        setComplete(true);
    }

    return (
        <Wrapper variant='small'>
            <FormProvider {...methods}>
                {complete ? 
                <Box>if an account with that email exists, we sent you an email</Box>
                :<form onSubmit={methods.handleSubmit(onSubmit)}>
                    <InputField
                        label='Email'
                        name='email'
                        type='email'
                        placeholder='Enter email'
                        minLength={4} />
                    <Button
                        mt={4}
                        colorScheme='teal'
                        isLoading={methods.formState.isSubmitting}
                        type='submit'>
                        Forgot Password
                    </Button>
                </form>}
            </FormProvider>
        </Wrapper>
    );
}

export default ForgotPassword;