import Navbar from '@/components/shared/Navbar';
import SEO from '@/components/shared/SEO';
import { Button } from '@mantine/core';
import Link from 'next/link';
import React from 'react';

const HomePage = () => {
  return (
    <main>
      <SEO
        title='Home Page'
        description='This is the home page of the Nextjs Prefetch Query with SSR demo'
      />
      <section className='container my-10'>
        <p>This is the home page</p>
        <Link
          href='/posts'
          shallow={true} // this will have no effect on the first load if the page is not wrapped with a HOC
        >
          <Button className='mt-10'>Go to Posts</Button>
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
