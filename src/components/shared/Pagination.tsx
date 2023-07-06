import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';

export interface PaginationProps {
  postId: number;
}

const Pagination: React.FC<PaginationProps> = ({ postId }) => {
  const previousPosts = Array.from(
    { length: 3 },
    (_, i) => postId - i - 1
  ).reverse();
  const nextPosts = Array.from({ length: 3 }, (_, i) => postId + i + 1);

  return (
    <div className='flex gap-6 items-center mt-8 max-w-max mx-auto'>
      {previousPosts.map((post) => (
        <Link
          key={post}
          href={`/posts/${post}`}
          className={classNames(
            'px-3 py-2 font-medium rounded-md',
            post === postId ? 'bg-slate-900 text-white' : 'bg-white text-black',
            post < 1 && 'hidden'
          )}
          shallow={true} // this will actually work
        >
          {post}
        </Link>
      ))}
      <Link
        key={postId}
        href={`/posts/${postId}`}
        className='px-3 py-2 font-medium bg-slate-900 text-white rounded-md'
        shallow={true} // this will actually work
      >
        {postId}
      </Link>
      {nextPosts.map((post) => (
        <Link
          key={post}
          href={`/posts/${post}`}
          className={classNames(
            'px-3 py-2 font-medium rounded-md',
            post === postId ? 'bg-slate-900 text-white' : 'bg-white text-black',
            post > 100 && 'hidden'
          )}
          shallow={true} // this will actually work
        >
          {post}
        </Link>
      ))}
    </div>
  );
};

export default Pagination;
