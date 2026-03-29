'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Registration successful, please login!");
        router.push('/login');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to register'}`);
      }
    } catch (error) {
      console.error('Register Error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border mt-16">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Register for ItemTrace</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input required name="email" value={formData.email} onChange={handleChange} type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="your@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input required name="password" value={formData.password} onChange={handleChange} type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select required name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900">
             <option value="USER">User (Report/Claim)</option>
             {/* Note: Admin is usually restricted in a real system but exposed here for demo purposes */}
             <option value="ADMIN">Admin (Moderator)</option>
          </select>
        </div>
        
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition mt-4 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login here.</Link>
      </p>
    </div>
  );
}
