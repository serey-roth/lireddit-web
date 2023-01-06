import { Button, Box } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'urql';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { CreatePostDocument } from '../gql/graphql';
import { createUrqlClient } from '../util/createUrqlClient';

type Inputs = {
    title: string,
    text: string,
}

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, createPost] = useMutation(CreatePostDocument);
    const methods = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        const response = await createPost({ input: values });
        console.log(response)
    }

    return (
        <Layout variant='small'>
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <InputField 
                    label='Title'
                    name='title'
                    type='text'
                    placeholder='Enter title'
                    />
                <Box mt={4}>
                    <InputField 
                        label='Body'
                        name='text'
                        type='text'
                        placeholder='Enter text'
                        textArea
                    />
                </Box>
                <Button 
                    mt={4} 
                    colorScheme='teal' 
                    isLoading={methods.formState.isSubmitting} 
                    type='submit'>
                    Create Post
                </Button>
            </form>
        </FormProvider>
    </Layout> 
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);