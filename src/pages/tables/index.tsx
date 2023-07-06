import Navbar from '@/components/shared/Navbar';
import SEO from '@/components/shared/SEO';
import React from 'react';

const TablesPage = () => {
  return (
    <main>
      <SEO
        title='Home Page'
        description='This is the home page of the Nextjs Prefetch Query with SSR demo'
      />
      <section className='container my-10'>
        <p>This is the tables page</p>
      </section>
    </main>
  );
};

export default TablesPage;
