import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

const CleanupDuplicates = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const findDuplicates = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('email'));
      const snapshot = await getDocs(usersQuery);
      
      const emailMap = new Map();
      const duplicateList = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const email = data.email?.toLowerCase();
        
        if (!email) return;
        
        if (emailMap.has(email)) {
          // Found duplicate!
          const existing = emailMap.get(email);
          duplicateList.push({
            email,
            accounts: [
              ...existing.accounts,
              { id: doc.id, ...data }
            ]
          });
          emailMap.set(email, {
            accounts: [
              ...existing.accounts,
              { id: doc.id, ...data }
            ]
          });
        } else {
          emailMap.set(email, {
            accounts: [{ id: doc.id, ...data }]
          });
        }
      });
      
      // Filter to only show emails with duplicates
      const actualDuplicates = Array.from(emailMap.values())
        .filter(item => item.accounts.length > 1)
        .map(item => ({
          email: item.accounts[0].email,
          accounts: item.accounts
        }));
      
      setDuplicates(actualDuplicates);
      setMessage({ 
        type: 'success', 
        text: `Found ${actualDuplicates.length} emails with duplicates (${actualDuplicates.reduce((sum, d) => sum + d.accounts.length, 0)} total accounts)` 
      });
    } catch (error) {
      console.error('Error finding duplicates:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId, email) => {
    if (!confirm(`Are you sure you want to delete this account?\n\nEmail: ${email}\nID: ${accountId}`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', accountId));
      
      // Remove from duplicates list
      setDuplicates(prev => prev.map(dup => ({
        ...dup,
        accounts: dup.accounts.filter(acc => acc.id !== accountId)
      })).filter(dup => dup.accounts.length > 1)); // Remove if no longer duplicate
      
      setMessage({ type: 'success', text: 'Account deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Cleanup Duplicate Accounts</h2>
        <p className="text-gray-400">Find and remove duplicate user accounts by email</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
            : 'bg-red-900/20 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <button
          onClick={findDuplicates}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          {loading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Find Duplicates
            </>
          )}
        </button>
      </div>

      {duplicates.length > 0 && (
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-400 text-sm">
              <p className="font-semibold mb-1">⚠️ Warning: Be careful when deleting accounts!</p>
              <p>Keep the account with the correct name and most recent data. Delete the others.</p>
            </div>
          </div>

          {duplicates.map((dup, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Email: {dup.email}</h3>
                <p className="text-sm text-gray-400">{dup.accounts.length} duplicate accounts found</p>
              </div>

              <div className="space-y-3">
                {dup.accounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                          {account.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{account.name || 'No Name'}</p>
                          <p className="text-xs text-gray-400">ID: {account.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Email: </span>
                          <span className="text-white">{account.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Mobile: </span>
                          <span className="text-white">{account.mobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Partner: </span>
                          <span className="text-white">{account.partner ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Verified: </span>
                          <span className="text-white">{account.emailVerified ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">DSA: </span>
                          <span className="text-indigo-400">{account.dsa || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dev: </span>
                          <span className="text-cyan-400">{account.dev || 0}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAccount(account.id, account.email)}
                      disabled={deleting}
                      className="bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-800/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition ml-4"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {duplicates.length === 0 && !loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">Click "Find Duplicates" to scan for duplicate accounts</p>
        </div>
      )}
    </div>
  );
};

export default CleanupDuplicates;
