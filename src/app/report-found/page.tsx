'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportFound() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    locationFound: '',
    dateFound: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // For testing dynamically without an active login form, if token does not exist we could alert
      if (!token) {
        alert("Authentication Token is required. Please login first (mock token functionality missing from frontend UI yet)");
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/found/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Found item reported successfully - awaiting admin verification!");
        router.push('/dashboard');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to submit'}`);
      }
    } catch (error) {
      console.error('Error submitting report', error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report a Found Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input required name="title" value={formData.title} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="E.g., Silver Casio Watch" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select required name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900">
             <option>Electronics</option>
            <option>Wallet/Purse</option>
            <option>Jewelry/Watches</option>
            <option>Bags/Luggage</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" rows={3} placeholder="Please provide general details. Don't reveal unique identifiers to prevent fake claims."></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location Found</label>
            <input required name="locationFound" value={formData.locationFound} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="E.g., Cafeteria table 4" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Found</label>
            <input required name="dateFound" value={formData.dateFound} onChange={handleChange} type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="url" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="E.g., https://example.com/item-image.jpg" />
          <p className="text-xs text-gray-500 mt-1">Optional: Provide a link to an image of the item.</p>
        </div>
        
        <button disabled={loading} type="submit" className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition mt-4 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Found Item'}
        </button>
      </form>
    </div>
  );
}
