import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider, createEmotionCache } from '@mantine/core';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ModalsProvider } from '@mantine/modals';
import React from 'react';
import RouterTransition from '@/components/shared/RouterTransition';

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      })
  );

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={appendCache}
      theme={{
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <RouterTransition />
          <ModalsProvider>
            <Component {...pageProps} />
          </ModalsProvider>
        </Hydrate>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default App;
