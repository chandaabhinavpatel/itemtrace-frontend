'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const [isLogged, setIsLogged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLogged(true);
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);
    router.push('/login');
    window.location.reload(); 
  };

  // Render a fixed-size placeholder during SSR/hydration to prevent layout shift
  if (!mounted) {
    return (
      <div className="flex space-x-2 pl-4 border-l border-gray-700 min-w-[160px] h-[34px]">
        {/* Invisible placeholder to reserve space and prevent dancing */}
      </div>
    );
  }

  if (isLogged) {
    return (
      <div className="flex space-x-4 items-center pl-4 border-l border-gray-700">
         {/* Admin Link should ideally be protected by fetching checking user role, added as shortcut demo */}
         <Link href="/admin" className="text-purple-400 font-bold hover:text-white transition group flex flex-col relative">Admin
            <span className="absolute -bottom-6 left-0 text-xs hidden group-hover:block transition whitespace-nowrap bg-black p-1 rounded">Moderator panel</span>
         </Link>
         <button onClick={handleLogout} className="text-sm bg-gray-800 border border-gray-600 px-3 py-1 rounded hover:bg-gray-700 hover:text-red-400 transition">
           Logout
         </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2 pl-4 border-l border-gray-700">
      <Link href="/login" className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded transition font-medium">Login</Link>
      <Link href="/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded transition font-medium text-white shadow">Register</Link>
    </div>
  );
}
