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
              shallow={true} // this will have no effect on the first load if the page is not wrapped with a HOC
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
