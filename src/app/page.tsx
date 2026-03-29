import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 mt-16 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
        Find Lost Items Faster
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl">
        ItemTrace is a centralized digital system to report lost items, register found items, match them, and securely return them to the rightful owner.
      </p>

      <div className="flex space-x-4">
        <Link href="/browse" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          Browse Items
        </Link>
        <Link href="/report-lost" className="px-6 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition">
          Report Lost Item
        </Link>
        <Link href="/report-found" className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
          Report Found Item
        </Link>
      </div>

      <div className="mt-16 bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl text-left border">
        <h2 className="text-2xl font-bold mb-4">How ItemTrace Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><strong>Report Item:</strong> Submit a missing or found item with details like location, category, and date.</li>
          <li><strong>System Matches Items:</strong> Our AI matches similarity in descriptions, category and location automatically.</li>
          <li><strong>Verify Ownership:</strong> Claimers must provide accurate proof of ownership for verification.</li>
          <li><strong>Item Returned:</strong> After admin approval, the item is securely returned to the rightful owner.</li>
        </ol>
      </div>
    </div>
  );
}
