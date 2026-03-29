'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function ItemDetail() {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'lost';
  const id = params?.id;

  useEffect(() => {
    async function fetchItem() {
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/${type}/${id}`);
        if (!res.ok) {
          setItem(null);
          return;
        }
        const data = await res.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, type]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimProof, setClaimProof] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const openClaimModal = (matchItem?: any) => {
    setSelectedMatch(matchItem || null);
    setIsModalOpen(true);
    setClaimStatus(null);
  };

  const handleClaimSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to claim items.");
      router.push('/login');
      return;
    }

    if (!claimProof.trim()) {
      alert("Please provide proof details.");
      return;
    }

    setClaiming(true);
    setIsModalOpen(false);
    
    try {
      const targetId = selectedMatch ? selectedMatch.id : id;
      const res = await fetch('http://localhost:5000/api/claim/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          itemId: targetId,
          proofDetails: claimProof
        })
      });

      if (res.ok) {
        setClaimStatus({ 
          type: 'success', 
          msg: 'Claim submitted! INSTRUCTIONS: Finder will take the item to the nearest police station. You must meet there with your ID for verification and handover.' 
        });
        setClaimProof('');
      } else {
        const err = await res.json();
        setClaimStatus({ type: 'error', msg: err.error || 'Failed to submit claim' });
      }
    } catch (error) {
      console.error('Claim error:', error);
      setClaimStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setClaiming(false);
    }
  };

  const [userClaim, setUserClaim] = useState<any>(null);

  useEffect(() => {
    async function checkClaim() {
      const token = localStorage.getItem('token');
      if (!token || !id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/user/dashboard`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        // Look for any claim by this user for THIS item
        // Note: data.claims might need to be explicitly added to user dashboard controller if not there
        // For now, let's assume we can fetch claim by itemId or it's in the dashboard
        const claim = data.claims?.find((c: any) => c.itemId === id);
        setUserClaim(claim);
      } catch (e) {
        console.error(e);
      }
    }
    checkClaim();
  }, [id]);

  const handleConfirmReceipt = async () => {
    if (!userClaim?.id) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/claim/confirm-receipt/${userClaim.id}`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        alert("Receipt confirmed! Thank you for using ItemTrace.");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading item details...</div>;
  if (!item) return <div className="p-8 text-center text-red-500 font-bold">Item not found. Please ensure the URL is correct.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-8">
      {claimStatus && (
        <div className={`p-4 rounded-lg mb-4 ${claimStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {claimStatus.msg}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{item.title}</h1>
            <span className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-bold ${type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {type.toUpperCase()}
            </span>
          </div>
          {item.imageUrl && (
            <div className="ml-6 w-48 h-48 relative rounded-lg overflow-hidden border bg-gray-50">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Location {type === 'lost' ? 'Lost' : 'Found'}</h3>
            <p className="text-gray-600">{item.locationLost || item.locationFound}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Date {type === 'lost' ? 'Lost' : 'Found'}</h3>
            <p className="text-gray-600">{new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
          </div>
          {item.contactNumber && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
              <h3 className="text-lg font-bold text-green-800">✅ Contact Information Revealed</h3>
              <p className="text-2xl font-extrabold text-green-600 mt-1">{item.contactNumber}</p>
              <p className="text-sm text-green-700 mt-1">Found person confirmed. You can now contact them to retrieve your item.</p>
            </div>
          )}
        </div>

        <div className="mt-8 border-t pt-6 flex space-x-4">
          {type === 'found' && (
            <button 
              disabled={claiming}
              onClick={() => openClaimModal()}
              className="bg-blue-600 text-white font-medium py-3 px-6 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {claiming ? 'Submitting Claim...' : 'Claim This Item'}
            </button>
          )}

          {userClaim?.status === 'APPROVED' && (
            <button 
              onClick={handleConfirmReceipt}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 shadow-lg shadow-green-100 transition"
            >
              ✅ I Have Received This Item
            </button>
          )}

          {userClaim?.status === 'RECEIVED' && (
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold border border-green-200">
              Item Successfully Returned 📁
            </div>
          )}
        </div>
      </div>

      {type === 'lost' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Possible Matches</h2>
          
          {(!item.matches || item.matches.length === 0) ? (
            <p className="text-gray-500 text-sm italic">No AI matches found currently. Check back later.</p>
          ) : (
            <div className="space-y-4">
               {item.matches.map((match: any) => (
                  <div key={match.id} className="bg-green-50 p-4 rounded border border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {match.foundItem?.imageUrl && (
                          <div className="w-16 h-16 rounded overflow-hidden border">
                            <img src={match.foundItem.imageUrl} alt={match.foundItem.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-green-800">Found: {match.foundItem?.title || "Unknown Item"}</p>
                          <p className="text-sm text-green-700 mt-1">Found on {new Date(match.foundItem?.dateFound).toLocaleDateString()} near {match.foundItem?.locationFound}</p>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1 rounded-full border border-green-300 text-green-800 font-bold text-sm shadow-sm">
                        Confidence: {match.confidence}%
                      </div>
                    </div>
                    <button 
                      disabled={claiming}
                      onClick={() => openClaimModal(match.foundItem)}
                      className="text-blue-600 bg-white border border-blue-600 px-4 py-2 rounded mt-4 text-sm font-medium hover:bg-blue-50 transition disabled:opacity-50"
                    >
                      {claiming ? 'Processing...' : 'Verify & Claim Match'}
                    </button>
                  </div>
               ))}
            </div>
          )}
        </div>
      )}

      {/* Other matches section for type === 'found' */}
      {type === 'found' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Possible Lost Item Matches</h2>
          
          {(!item.matches || item.matches.length === 0) ? (
            <p className="text-gray-500 text-sm italic">No AI matches found currently from existing lost items. Check back later.</p>
          ) : (
            <div className="space-y-4">
               {item.matches.map((match: any) => (
                  <div key={match.id} className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {match.lostItem?.imageUrl && (
                          <div className="w-16 h-16 rounded overflow-hidden border">
                            <img src={match.lostItem.imageUrl} alt={match.lostItem.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-yellow-800">Lost Item: {match.lostItem?.title || "Unknown Item"}</p>
                          <p className="text-sm text-yellow-700 mt-1">Lost on {new Date(match.lostItem?.dateLost).toLocaleDateString()} near {match.lostItem?.locationLost}</p>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1 rounded-full border border-yellow-300 text-yellow-800 font-bold text-sm shadow-sm">
                        Confidence: {match.confidence}%
                      </div>
                    </div>
                  </div>
               ))}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM CLAIM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 space-y-6 relative border-t-8 border-blue-600">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Verify & Claim Match</h2>
              <p className="text-gray-500 mt-2">Please follow the official verification process.</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
              <h3 className="font-bold text-blue-800 flex items-center">
                <span className="mr-2">🔍</span> Match Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-semibold uppercase text-xs">Title</p>
                  <p className="text-gray-800 font-medium">{selectedMatch?.title || item.title}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-semibold uppercase text-xs">Location Found</p>
                  <p className="text-gray-800 font-medium font-bold underline italic text-red-600">{selectedMatch?.locationFound || item.locationFound}</p>
                </div>
              </div>
              <div>
                <p className="text-blue-600 font-semibold uppercase text-xs">Description</p>
                <p className="text-gray-800 text-sm italic">"{selectedMatch?.description || item.description}"</p>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="font-bold text-red-800 mb-3 flex items-center">
                <span className="mr-2">⚖️</span> Police Verification Handover (Required)
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-red-700 text-sm font-medium">
                <li>The finder will surrender the item to the <span className="underline font-bold">nearest Police Station</span>.</li>
                <li>Both the <span className="font-bold">Owner</span> and the <span className="font-bold">Finder</span> must meet at the station.</li>
                <li>Owner must present valid ID and prove ownership to the police officers.</li>
                <li>The handover will be officially documented and completed at the station.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Enter Identification/Proof Details</label>
              <textarea 
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="E.g., I have the invoice/box or serial number ends in... etc."
                className="w-full border-gray-300 rounded-lg shadow-sm p-4 text-gray-900 border focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleClaimSubmit}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
