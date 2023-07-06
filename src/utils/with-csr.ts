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
