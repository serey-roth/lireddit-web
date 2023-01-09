import { Box, Button } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'urql';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { Post, PostDocument, UpdatePostDocument } from '../../../gql/graphql';
import { createUrqlClient } from '../../../util/createUrqlClient';
import { useGetIntId } from '../../../util/useGetIntId';

type Inputs = {
    title: string,
    text: string,
}

const EditPost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{ data, fetching, error }] = useQuery({ 
        query: PostDocument,
        pause: intId === -1,
        variables: {
            id: intId
        }
    });

    const [, updatePost] = useMutation(UpdatePostDocument);
    const methods = useForm<Inputs>({ 
        values: {
            title: (data?.post as Post)?.title,
            text: (data?.post as Post)?.text,
        }
    });

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        await updatePost({ id: intId, ...values });
        router.back(); //go back to previous page
    }

    if (fetching) {
        return <Layout>
            <div>loading...</div>
        </Layout>
    }

    if (!data?.post) {
        return <Layout>
            <div>cannot find post</div>
        </Layout>
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
                    Edit Post
                </Button>
            </form>
        </FormProvider>
    </Layout> 
    );
}

export default withUrqlClient(createUrqlClient)(EditPost);