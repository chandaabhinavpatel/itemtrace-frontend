import Link from 'next/link';
import AuthButtons from './AuthButtons';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-400">
          ItemTrace
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/browse" className="hover:text-blue-300">Browse Items</Link>
          <Link href="/report-lost" className="hover:text-blue-300">Report Lost</Link>
          <Link href="/report-found" className="hover:text-blue-300">Report Found</Link>
          <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}
