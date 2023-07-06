import Pagination from '@/components/shared/Pagination';
import SEO from '@/components/shared/SEO';
import { getPost, usePost } from '@/hooks/posts';
import { hasNavigationCSR } from '@/utils/with-csr';
import { Loader } from '@mantine/core';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import Error from 'next/error';
import { useRouter } from 'next/router';
import React from 'react';

export const getServerSideProps = hasNavigationCSR(async (ctx) => {
  console.log('getServerSideProps');

  let isError = false;

  const id = ctx.params?.id as string;

  const queryClient = new QueryClient();

  let post = {};

  try {
    post = await queryClient.fetchQuery(['post', id], () => getPost(id));
  } catch (error) {
    isError = true;
  }

  // check if post is empty
  if (Object.keys(post).length === 0 && isError) {
    return {
      notFound: true, // this will render a 404 page and change the status code to 404
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});

const PostPage = ({ isError }: { isError: boolean }) => {
  const router = useRouter();
  const { id } = router.query;

  const post = usePost(id as string);

  // if (isError) {
  //   return <Error statusCode={404} message='Post not found' />;
  // }

  return (
    <main>
      <SEO
        title='Post Page'
        description='This is the post page of the Nextjs Prefetch Query with SSR demo'
      />
      <section className='container my-10 h-64'>
        <h1 className='text-center font-semibold'>
          This is the post page for post id: {id}
        </h1>

        {post.isLoading ? (
          <div className='max-w-max mx-auto my-10'>
            <Loader />
          </div>
        ) : (
          <div className='mt-10'>
            <p className='text-center text-2xl font-semibold'>
              {post?.data?.title}
            </p>
            <p className='mt-5 text-center'>{post?.data?.body}</p>
          </div>
        )}

        <Pagination postId={Number(id)} />
      </section>
    </main>
  );
};

export default PostPage;
