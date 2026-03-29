'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BrowseItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lostRes, foundRes] = await Promise.all([
          fetch('http://localhost:5000/api/lost'),
          fetch('http://localhost:5000/api/found')
        ]);
        
        const lostData = await lostRes.json();
        const foundData = await foundRes.json();

        // Map and merge data dynamically
        const merged = [
          ...(Array.isArray(lostData) ? lostData.map(i => ({ ...i, type: 'lost' })) : []),
          ...(Array.isArray(foundData) ? foundData.map(i => ({ ...i, type: 'found' })) : [])
        ];

        // Sort by date created desc
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setItems(merged);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading items...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Browse Items</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-8 flex gap-4">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="flex-1 rounded border-gray-300 shadow-sm border p-2 text-gray-900" 
        />
        <select className="rounded border-gray-300 shadow-sm border p-2 text-gray-900">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Bags</option>
          <option>Wallet/Purse</option>
        </select>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Search</button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center">No items found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col">
              <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Location: {item.locationLost || item.locationFound}</p>
              <p className="text-sm text-gray-500">Date: {new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
              <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 self-start">
                Status: <span className={`ml-1 font-bold ${item.type === 'lost' ? 'text-red-600' : 'text-green-600'}`}>{item.status || (item.verified ? 'VERIFIED' : 'FOUND')}</span>
              </div>
              <div className="mt-6">
                <Link href={`/item/${item.id}?type=${item.type}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-600 rounded px-4 py-2 hover:bg-blue-50 transition w-full text-center block">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
