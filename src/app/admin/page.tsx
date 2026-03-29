'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const token = localStorage.getItem('token');
      // A full app would redirect. We fake a static fallback structure 
      // in case of missing auth token so frontend doesn't crash here.
      if (!token) {
        setStats({ totalLost: 0, totalFound: 0, recoveryRate: 0, pendingFoundItems: [], pendingClaims: [] });
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'x-auth-token': token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        if (res.status === 403 || res.status === 401) {
           setStats({ accessDenied: true });
        }
        console.error("Failed to load admin stats");
      }
    } catch (error) {
      console.error('Error fetching admin dashboard', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const handleVerify = async (id: string, action: 'Approve' | 'Reject') => {
    // Basic verification stub integrating the actual backend verify admin route
    // Only Approve is currently handled by backend explicitly via verify-found
    const token = localStorage.getItem('token');
    if (action === 'Approve') {
      try {
         await fetch('http://localhost:5000/api/admin/verify-found', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
           body: JSON.stringify({ id })
         });
         fetchStats(); // REFRESH DATA!
      } catch (err) {
         console.error('Failed verification', err);
      }
    }
  };

  const handleClaim = async (claimId: string, action: 'Approve' | 'Reject') => {
    const token = localStorage.getItem('token');
    const endpoint = action === 'Approve' ? 'approve-claim' : 'reject-claim';
    try {
       await fetch(`http://localhost:5000/api/admin/${endpoint}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
         body: JSON.stringify({ claimId })
       });
       fetchStats(); // REFRESH DATA!
    } catch (err) {
       console.error(`Failed to ${action} claim`, err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading Admin Dashboard...</div>;
  if (stats?.accessDenied) return <div className="p-8 mt-8 text-center text-red-600 font-bold border border-red-400 bg-red-50 rounded mx-auto max-w-lg">Access Denied.<br/>You must use an account with the 'ADMIN' role to view this dashboard.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Total Lost Items</p>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats?.totalLost || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Total Found Items</p>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats?.totalFound || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Recovery Rate</p>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats?.recoveryRate || 0}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Found Items Verification</h2>
        <div className="space-y-4">
          {(!stats?.pendingFoundItems || stats?.pendingFoundItems.length === 0) ? (
            <p className="text-gray-500">No items pending verification.</p>
          ) : stats.pendingFoundItems.map((item: any) => (
             <div key={item.id} className="flex justify-between items-center border p-4 rounded bg-gray-50">
              <div>
                <p className="font-semibold text-lg text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">Found near {item.locationFound} by User {item.user?.name || item.userId.substring(0,8)}</p>
              </div>
              <div className="space-x-3">
                <button onClick={() => handleVerify(item.id, 'Approve')} className="bg-green-500 text-white font-medium px-4 py-2 rounded hover:bg-green-600 transition">Approve</button>
                <button onClick={() => handleVerify(item.id, 'Reject')} className="bg-red-500 text-white font-medium px-4 py-2 rounded hover:bg-red-600 transition">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">AI Suggested Matches</h2>
        <div className="space-y-4">
          {(!stats?.suggestedMatches || stats?.suggestedMatches.length === 0) ? (
             <p className="text-gray-500">No high-confidence AI matches detected yet.</p>
          ) : stats.suggestedMatches.map((match: any) => (
            <div key={match.id} className="flex justify-between items-center border p-4 rounded bg-purple-50 border-purple-200">
              <div>
                <p className="font-semibold text-purple-900">Possible Match!</p>
                <p className="text-sm text-purple-700">Lost: <span className="font-bold">{match.lostItem?.title}</span> ↔ Found: <span className="font-bold">{match.foundItem?.title}</span></p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-white px-3 py-1 rounded-full border border-purple-300 text-purple-800 font-bold text-sm">
                  {match.confidence}% Match
                </span>
                <a href={`/item/${match.lostItem?.id}?type=lost`} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium transition text-sm">Review</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center">
          <span className="mr-2">📋</span> Pending Claims Verification
        </h2>
        <div className="space-y-4">
          {(!stats?.pendingClaims || stats.pendingClaims.length === 0) ? (
            <p className="text-gray-500 italic">No pending claims to review.</p>
          ) : stats.pendingClaims.map((claim: any) => (
            <div key={claim.id} className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Claim by {claim.claimer.name}</p>
                <p className="text-xs text-gray-500">Proof: {claim.proofDetails.substring(0, 50)}...</p>
              </div>
              <div className="space-x-3">
                <button onClick={() => handleClaim(claim.id, 'Approve')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm">Approve</button>
                <button onClick={() => handleClaim(claim.id, 'Reject')} className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center">
          <span className="mr-2">🎁</span> Returned Products Report
        </h2>
        {(!stats?.returnedItems || stats.returnedItems.length === 0) ? (
          <p className="text-green-600 italic">No items officially returned yet.</p>
        ) : (
          <div className="bg-white rounded-lg border border-green-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="p-4 font-bold border-b">Item Title</th>
                  <th className="p-4 font-bold border-b">Returned To (Owner)</th>
                  <th className="p-4 font-bold border-b">Return Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {stats.returnedItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-green-50 transition">
                    <td className="p-4 text-gray-800 font-medium">{item.itemTitle}</td>
                    <td className="p-4 text-gray-600">{item.claimer.name} ({item.claimer.email})</td>
                    <td className="p-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
