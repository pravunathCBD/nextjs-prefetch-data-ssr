import { useQuery } from '@tanstack/react-query';

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

export const getPost = async (id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  const data = await response.json();

  if (response.status !== 200 && response.status === 404) {
    throw new Error('Post not found');
  }

  return data as Post;
};

export const usePosts = () =>
  useQuery<Post[], Error>({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
  });
};
