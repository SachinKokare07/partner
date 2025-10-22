import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Check, X, Users, UserMinus, Search, Loader, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';

const PartnerRequest = () => {
  const { user, partner, sendPartnerRequest, acceptPartnerRequest, rejectPartnerRequest, removePartner, requests } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set()); // Track sent requests

  // Load sent requests when component mounts
  useEffect(() => {
    const loadSentRequests = async () => {
      if (!user?.id) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Get list of users to whom we've sent requests
          const sentRequestsList = userData.pendingRequests || [];
          setSentRequests(new Set(sentRequestsList));
        }
      } catch (error) {
        console.error('Error loading sent requests:', error);
      }
    };
    
    loadSentRequests();
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name or email to search' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setSearching(true);
    setSearchResults([]);
    
    try {
      const usersRef = collection(db, 'users');
      const searchTerm = searchQuery.toLowerCase().trim();
      
      console.log('Searching for:', searchTerm);
      console.log('Current user ID:', user.id);
      
      // Always fetch all users and filter client-side for maximum compatibility
      const allUsersQuery = query(usersRef, limit(100));
      const allSnapshot = await getDocs(allUsersQuery);
      
      console.log('Total users found:', allSnapshot.size);
      
      let results = [];
      const addedIds = new Set();
      const addedEmails = new Set(); // Track emails to avoid duplicates
      
      allSnapshot.forEach(doc => {
        const userData = doc.data();
        const userEmail = userData.email?.toLowerCase() || '';
        
        console.log('Checking user:', doc.id, userEmail, userData.name);
        
        // Skip current user
        if (doc.id === user.id) {
          console.log('Skipping current user');
          return;
        }
        
        // Skip duplicate emails
        if (addedEmails.has(userEmail)) {
          console.log('Skipping duplicate email:', userEmail);
          return;
        }
        
        // Skip users who already have a partner
        if (userData.partner) {
          console.log('Skipping user with existing partner');
          return;
        }
        
        // Check email match (exact or partial)
        const userName = userData.name?.toLowerCase() || '';
        
        const emailMatch = userEmail === searchTerm || userEmail.includes(searchTerm);
        const nameMatch = userName.includes(searchTerm);
        
        if ((emailMatch || nameMatch) && !addedIds.has(doc.id)) {
          console.log('Match found:', userEmail, userData.name);
          
          // Determine request status
          let requestStatus = 'none';
          if (sentRequests.has(doc.id)) {
            requestStatus = 'sent'; // We sent a request to this user
          } else if (requests.some(req => req.from === doc.id)) {
            requestStatus = 'received'; // This user sent us a request
          }
          
          results.push({ 
            id: doc.id, 
            ...userData,
            requestStatus 
          });
          addedIds.add(doc.id);
          addedEmails.add(userEmail); // Track this email as added
        }
      });
      
      console.log('Total results:', results.length);
      
      // Sort results: exact matches first
      results.sort((a, b) => {
        const aExactEmail = a.email?.toLowerCase() === searchTerm;
        const bExactEmail = b.email?.toLowerCase() === searchTerm;
        const aExactName = a.name?.toLowerCase() === searchTerm;
        const bExactName = b.name?.toLowerCase() === searchTerm;
        
        if (aExactEmail && !bExactEmail) return -1;
        if (!aExactEmail && bExactEmail) return 1;
        if (aExactName && !bExactName) return -1;
        if (!aExactName && bExactName) return 1;
        
        return 0;
      });
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setMessage({ type: 'error', text: `No users found matching "${searchQuery}". Check the console for details.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'success', text: `Found ${results.length} user${results.length > 1 ? 's' : ''}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetUserId, targetEmail) => {
    setLoading(true);
    const result = await sendPartnerRequest(targetEmail);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    
    // Update sent requests and search results if request sent successfully
    if (result.success) {
      setSentRequests(prev => new Set([...prev, targetUserId]));
      setSearchResults(prev => prev.map(u => 
        u.id === targetUserId ? { ...u, requestStatus: 'sent' } : u
      ));
    }
  };

  const handleAccept = async (fromUserId) => {
    const result = await acceptPartnerRequest(fromUserId);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleReject = async (fromUserId) => {
    const result = await rejectPartnerRequest(fromUserId);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleRemovePartner = async () => {
    if (confirm(`Are you sure you want to remove ${partner?.name} as your partner?`)) {
      const result = await removePartner();
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (partner) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Partner</h2>
          <p className="text-gray-400">Your partnership connection</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 mx-auto mb-4 flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">You're Connected!</h3>
            <p className="text-gray-400 mb-4 text-center">Your partner: <span className="text-white font-semibold">{partner.name}</span></p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-3 text-gray-300">
                <Mail size={16} />
                <span className="text-sm">{partner.email}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-indigo-400">{partner.dsa || 0}</p>
                <p className="text-xs text-gray-400 mt-1">DSA Score</p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-cyan-400">{partner.dev || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Dev Score</p>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{partner.streak || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Day Streak</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-6">View detailed comparison on the Dashboard</p>
            
            <button
              onClick={handleRemovePartner}
              className="w-full mt-6 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <UserMinus size={18} />
              Remove Partner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Find Partner</h2>
        <p className="text-gray-400">Connect with a friend to track progress together</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search size={20} className="text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Search Users</h2>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Search by name or email..."
              />
              <button 
                type="submit" 
                disabled={searching}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
              >
                {searching ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                Search
              </button>
            </form>
          </div>

          {/* Search Results */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
            {searching ? (
              <div className="text-center py-8 text-gray-400">
                <Loader size={32} className="mx-auto mb-2 animate-spin" />
                <p>Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No results. Try searching for a user!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((foundUser) => {
                  const { requestStatus } = foundUser;
                  
                  return (
                    <div key={foundUser.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {foundUser.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{foundUser.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-400">{foundUser.email}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-indigo-400">DSA: {foundUser.dsa || 0}</span>
                            <span className="text-xs text-cyan-400">Dev: {foundUser.dev || 0}</span>
                            <span className="text-xs text-purple-400">Streak: {foundUser.streak || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {requestStatus === 'sent' ? (
                        <div className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                          <Clock size={16} />
                          Request Sent
                        </div>
                      ) : requestStatus === 'received' ? (
                        <div className="bg-green-600/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                          <Mail size={16} />
                          Check Requests →
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(foundUser.id, foundUser.email)}
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                        >
                          <UserPlus size={16} />
                          Send Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests Section - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={20} className="text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Requests</h2>
              {requests.length > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
              )}
            </div>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Mail size={32} className="mx-auto mb-2 opacity-30" />
                  No pending requests
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.from} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {req.fromName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{req.fromName}</p>
                        <p className="text-xs text-gray-400 truncate">{req.fromEmail}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(req.from)} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition"
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button 
                        onClick={() => handleReject(req.from)} 
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRequest;
