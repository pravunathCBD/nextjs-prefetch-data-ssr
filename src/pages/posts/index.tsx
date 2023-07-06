import Navbar from '@/components/shared/Navbar';
import SEO from '@/components/shared/SEO';
import { getPosts, usePosts } from '@/hooks/posts';
import { hasNavigationCSR } from '@/utils/with-csr';
import { Loader } from '@mantine/core';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import Link from 'next/link';
import React from 'react';

export const getServerSideProps = hasNavigationCSR(async () => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery(['posts'], () => getPosts());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});

const PostsPage = () => {
  const posts = usePosts();
  return (
    <main>
      <SEO
        title='Posts Page'
        description='This is the posts page of the Nextjs Prefetch Query with SSR demo'
      />

      <section className='container my-10'>
        <h1 className='font-semibold text-center'>
          Click on the post button to view the details
        </h1>
        {posts.isLoading ? (
          <div className='max-w-max mx-auto'>
            <Loader />
          </div>
        ) : (
          <div className='flex items-center gap-4 my-10 flex-wrap'>
            {posts?.data?.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className='px-3 py-2 font-medium bg-slate-900 text-white rounded-md'
                shallow={true} // this will have no effect on the first load if the page is not wrapped with a HOC
              >
                {post?.id}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default PostsPage;
