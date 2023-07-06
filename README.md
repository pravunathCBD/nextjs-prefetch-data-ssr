## POC - Using Next.js with Prefetch Query and SSR

This is a POC to test how prefetching data in Next.js works and how it can be used with SSR. This repo also contains a simple benchmark to test the performance of the different approaches:

- Fetching data on the client
- Prefetching data on the server
- Benchmarking the time taken for a page, using multiple Mantine components, to render vs the time taken for a page, using just tailwind, to render.

#### The first two sections explain hydrating query cache, fetch and prefetch query. These concepts are important to understand how this POC works. The last section explains the code and some key point to keep in mind while using fetching data using SSR.

### Hydrating query cache, what and why?

- Hydrating the query cache means populating the cache with data that is already available on the server. This is done to avoid making unnecessary requests to the server when the page is rendered on the client and it also prevents the cache from being empty when the app loads on the client.

The above process is important for a few reasons:

- If the cache is hydrated the app will not show a loading state when the page is rendered on the client
- While performing SSR, hydrating the cache will ensure that the server and the client have the same initial data.

### Understanding the difference between fetch query and prefetch query

- Using `fetchQuery` on the server fetches the data and caches the query. It will either resolve the query and return the data or throw an error.
- `prefetchQuery` on the other hand, will not throw an error if the query fails. It will simply cache the query and return a promise. This promise will resolve when the query is resolved on the client.

## Code Walkthrough

### Setting up hydration:

Setting up hydration is fairly simple. You can refer the [Tanstack Query Docs](https://tanstack.com/query/v4/docs/react/reference/hydration) or you can simply add this code to your `_app.js` file:

```tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </Hydrate>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

### Prefetching data on the server

In our `posts/index.tsx` page we are fetching a list of posts from the [JSON Placeholder API](https://jsonplaceholder.typicode.com/).

```tsx
import { getPosts, usePosts } from '@/hooks/posts';
import { GetServerSideProps } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery(['posts'], () => getPosts());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
```

Just to be clear, this is the implementation of the `getPosts` function:

```tsx
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const getPosts = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();
  return data as Post[];
};
```

By doing this we can now easily use this prefetched data in our `posts/index.tsx` page:

```tsx
import Navbar from '@/components/shared/Navbar';
import { GetServerSideProps } from 'next';
import SEO from '@/components/shared/SEO';
import { getPosts, usePosts } from '@/hooks/posts';
import { hasNavigationCSR } from '@/utils/with-csr';
import { Loader } from '@mantine/core';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import Link from 'next/link';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async () => {
  // ... implementation of the above getServerSideProps
};

const PostsPage = () => {
  // this is the hook that we created to fetch the data.
  const posts = usePosts();

  // Note: We are also fetching the data on the client side so that we can use it during Client side navigation (will be discussed in a later section)

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
```

Implementation of `usePosts` hook:

```tsx
export const usePosts = () =>
  useQuery<Post[], Error>({
    queryKey: ['posts'],
    queryFn: getPosts,
  });
```

### Understanding shallow routing and issues with the above code

Currently with the above implementation and the way `Pages` directory works in Next.js, we are prefetching the data and the `getServerSideProps` is being called everytime we are navigating from the home page or rather any page to the `posts/index.tsx` page.

What this essentially means is that everytime you visit the `posts/index.tsx` page, either by clicking on the link or by typing the url in the browser, you'll see a visible lag or a screen freeze for a few milliseconds until the data is completely fetched after which the client side navigation takes over.

To solve this issue we can use shallow routing. Shallow routing is a technique that allows you to update the URL of a page without reloading the page itself or fetching new data from the server.
Shallow routing will enable us to manage our data fetching and caching mechanism just in the client.

Passing the `shallow` prop to the `Link` component will enable shallow routing.

Implementation of shallow routing in our `components/shared/navbar.tsx` page:

```tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Posts', href: '/posts' },
];

const Navbar = () => {
  const router = useRouter();

  const currentRoute = router.pathname;

  return (
    <nav className='bg-slate-900 py-4'>
      <ul className='container flex items-center gap-10 text-gray-400 text-lg'>
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className={`${
                currentRoute === link.href ? 'text-white font-medium' : ''
              }`}
              shallow={true}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
```

But there is still an issue, shallow routing only works for the same page, i.e if you are navigating from let's say `/about?limit=10` to `/about?limit=20` or from `/posts/1` to `posts/2` then shallow routing will work but if you are navigating from `/about?limit=10` to `/team?limit=20` then shallow routing will not work and `getServerSideProps` will be called again.

You can read more about it [here](https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#caveats).

Next 13 with it's app router fixes these problems. Read [this](https://github.com/vercel/next.js/discussions/32243) discussion thread to learn more about it.

For the page directory, here is a simple workaround:

```tsx
// utils/with-csr.tsx

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

/**
 * Do not SSR the page when navigating.
 * Has to be added right before the final getServerSideProps function
 */
export const hasNavigationCSR =
  (next?: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {
    if (ctx.req.url?.startsWith('/_next')) {
      return {
        props: {},
      };
    }
    return next?.(ctx)!;
  };
```

To use the above HOC we now need to wrap our `getServerSideProps` function with it:

```tsx
export const getServerSideProps = hasNavigationCSR(async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery('posts', getPosts);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});
```

Now if we navigate from different pages to post pages, `getServerSideProps` won't fetch any data and it just returns an empty object for props.

### Handling 404 status code

Let's say now you want to fetch the data for a particular post by it's id. Here is the implementation of the `getServerSideProps` function:

```tsx
export const getServerSideProps = hasNavigationCSR(async (ctx) => {
  console.log('getServerSideProps');

  const id = ctx.params?.id as string;

  const queryClient = new QueryClient();

  await queryClient.fetchQuery(['post', id], () => getPost(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
});
```

The implementation of the `getPost` function and the `usePost` hook.

```tsx
export const getPost = async (id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  const data = await response.json();

  // if the post is not found, throw an error, since JSON Placeholder API does not return a 404 status code or an error message
  if (response.status !== 200 && response.status === 404) {
    throw new Error('Post not found');
  }

  return data as Post;
};

export const usePost = (id: string) =>
  useQuery<Post, Error>({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
  });
```

##### NOTE: In the above `usePost` hook we have typed the `id` to be a string and not a number because the query key expects a string or an array. If you pass a number you'll get a error `queryFn is missing`. Follow the discussion [here](https://github.com/TanStack/query/issues/2316) and the code sample [here](https://github.com/TanStack/query/blob/4083c1ef8a8734d2680a4e5f031c7958c18ee176/src/core/utils.ts#L393-L395)

Right now with all the above code, even if the post is not found or is not available Next.js renders an empty page and doesn't actually respond with an error status code.

This is wrong, since search engines will translate this to "Everything went fine, we found the page". To prevent this we need to modify our `getServerSideProps` function to throw an error if the post is not found.

```tsx
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
```

And the final implementation of the `posts/[id].tx` page:

```tsx
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

  try {
    await queryClient.fetchQuery(['post', id], () => getPost(id));
  } catch (error) {
    isError = true;
    ctx.res.statusCode = 404;
  }

  return {
    props: {
      isError,
      dehydratedState: dehydrate(queryClient),
    },
  };
});

const PostPage = ({ isError }: { isError: boolean }) => {
  const router = useRouter();
  const { id } = router.query;

  const post = usePost(id as string);

  if (isError) {
    return <Error statusCode={404} message='Post not found' />;
  }

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
```

## Conclusion:

We setup a caching mechanism with the ability to prefetch data on the server in SSR context. We also learned how to use shallow routing for faster client side navigation.

#### And ultimately SSR is always faster than CSR if we use it correctly.
