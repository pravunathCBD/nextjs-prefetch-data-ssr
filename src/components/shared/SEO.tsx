import Head from 'next/head';
import React from 'react';

export interface SEOProps {
  title: string;
  description: string;
}

const SEO: React.FC<SEOProps> = ({ description, title }) => {
  return (
    <Head>
      <title>{title} | Nextjs Prefetch Query with SSR</title>
      <meta name='description' content={description} />
    </Head>
  );
};

export default SEO;
