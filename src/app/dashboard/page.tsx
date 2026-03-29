'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No token found, displaying placeholder dynamic data until user logs in");
          // Fake mock structure to prevent crash before Auth is fully tied in
          setData({ lostItems: [], foundItems: [], claims: [] });
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/dashboard`, {
          headers: { 'x-auth-token': token }
        });
        
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        } else {
          setData({ lostItems: [], foundItems: [], claims: [] });
        }
      } catch (error) {
        console.error('Error fetching dashboard', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handlePrintReceipt = (claim: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>ItemTrace - Return Receipt</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; pb: 20px; mb: 30px; }
            .content { max-width: 600px; margin: 0 auto; }
            .field { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #ddd; pb: 5px; }
            .label { font-weight: bold; color: #666; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
            .stamp { border: 3px solid #22c55e; color: #22c55e; padding: 10px; display: inline-block; transform: rotate(-5deg); font-weight: bold; font-size: 24px; margin-top: 30px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="content">
            <div class="header">
              <h1>ItemTrace Return Receipt</h1>
              <p>Official Confirmation of Item Handover</p>
            </div>
            
            <div class="field"><span class="label">Receipt ID</span><span>${claim.id.substring(0, 15).toUpperCase()}</span></div>
            <div class="field"><span class="label">Claimer Name</span><span>${data?.user?.name || 'N/A'}</span></div>
            <div class="field"><span class="label">Claimer Email</span><span>${data?.user?.email || 'N/A'}</span></div>
            <div class="field"><span class="label">Return Date</span><span>${new Date().toLocaleDateString()}</span></div>
            <div class="field"><span class="label">Item status</span><span>RETURNED</span></div>
            
            <div style="text-align: center;">
              <div class="stamp">OFFICIALLY RETURNED</div>
            </div>

            <div class="footer">
              <p>Thank you for using ItemTrace. We're glad we could help get your item back!</p>
              <p>© ${new Date().getFullYear()} ItemTrace System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          {data?.user && <p className="text-gray-800 dark:text-gray-200 mt-1">Welcome back, <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">{data.user.name}</span></p>}
        </div>
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} 
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {data?.matches && data.matches.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 p-6 rounded-lg animate-pulse-slow">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🔔</span>
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide">AI Match Notifications!</h2>
          </div>
          <div className="space-y-3">
            {data.matches.map((match: any) => (
              <div key={match.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-blue-100 dark:border-blue-900">
                <p className="text-gray-800 dark:text-gray-200">
                  A potential match was found for your <span className="font-bold underline">"{match.lostItem?.title}"</span>!
                </p>
                <a href={`/item/${match.lostItem?.id}?type=lost`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition">
                  View Match
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-400 border-b dark:border-gray-700 pb-2">My Lost Items ({data?.lostItems.length || 0})</h2>
        <div className="space-y-4">
          {data?.lostItems.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No lost items reported.</p> : 
            data?.lostItems.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center border dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-900">
                <div>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lost on {new Date(item.dateLost).toLocaleDateString()} near {item.locationLost}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === 'LOST' ? 'bg-yellow-100 text-yellow-800' : (item.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')}`}>
                  {item.status === 'RETURNED' ? 'Returned to Owner' : item.status}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-400 border-b dark:border-gray-700 pb-2">My Found Items ({data?.foundItems.length || 0})</h2>
        <div className="space-y-4">
          {data?.foundItems.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No found items reported.</p> : 
            data?.foundItems.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center border dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-900">
                <div>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Found on {new Date(item.dateFound).toLocaleDateString()} near {item.locationFound}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${!item.verified ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {!item.verified ? 'Unverified' : 'Verified'}
                  </span>
                  {item.status === 'RETURNED' && (
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                      Product Returned
                    </span>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-400 border-b dark:border-gray-700 pb-2">My Claims ({data?.claims.length || 0})</h2>
        <div className="space-y-4">
          {data?.claims.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No claims submitted.</p> : 
            data?.claims.map((claim: any) => (
              <div key={claim.id} className="border dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">Claim ID: {claim.id.substring(0,8)}...</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Claim submitted on {new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${claim.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : (claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : (claim.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'))}`}>
                    {claim.status === 'PENDING' ? 'Pending Review' : (claim.status === 'RECEIVED' ? 'Product Received' : claim.status)}
                  </span>
                </div>
                
                {claim.status === 'RECEIVED' && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handlePrintReceipt(claim)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md font-bold transition flex items-center gap-2"
                    >
                      <span>🖨️</span> Print Return Receipt
                    </button>
                  </div>
                )}
                
                {claim.status === 'APPROVED' && (
                  <div className="mt-4 p-4 border-t dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Did you receive your item?</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (1-5)</label>
                        <select 
                          id={`rating-${claim.id}`}
                          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Average</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Terrible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback Comment</label>
                        <textarea 
                          id={`comment-${claim.id}`}
                          placeholder="Tell us about the return process..."
                          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <button 
                        onClick={async () => {
                          const rating = (document.getElementById(`rating-${claim.id}`) as HTMLSelectElement).value;
                          const comment = (document.getElementById(`comment-${claim.id}`) as HTMLTextAreaElement).value;
                          const token = localStorage.getItem('token');
                          
                          try {
                            // Confirm Receipt
                            const confirmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/claims/confirm-receipt/${claim.id}`, {
                              method: 'POST',
                              headers: { 'x-auth-token': token || '' }
                            });
                            
                            if (confirmRes.ok) {
                              // Submit Feedback
                              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/claims/feedback`, {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'x-auth-token': token || '' 
                                },
                                body: JSON.stringify({ claimId: claim.id, rating: parseInt(rating), comment })
                              });
                              alert('Thank you for your feedback! Product marked as returned.');
                              window.location.reload();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold transition focus:ring-4 focus:ring-green-500/50"
                      >
                        Submit Feedback & Confirm Receipt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
