import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Wrench, AlertTriangle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

const FixAccounts = () => {
  const [brokenAccounts, setBrokenAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const findBrokenAccounts = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Query all users
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const broken = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const userId = doc.id;
        
        // Check for broken accounts
        const issues = [];
        
        if (data.name === 'Anonymous') {
          issues.push('Name is "Anonymous"');
        }
        
        if (!data.name || data.name.trim() === '') {
          issues.push('Missing name');
        }
        
        if (!data.email || data.email.trim() === '') {
          issues.push('Missing email');
        }
        
        if (data.emailVerified === undefined) {
          issues.push('Missing emailVerified field');
        }
        
        if (data.emailVerified === false) {
          issues.push('Email not verified');
        }
        
        if (issues.length > 0) {
          broken.push({
            id: userId,
            name: data.name || '(no name)',
            email: data.email || '(no email)',
            mobile: data.mobile || '(no mobile)',
            emailVerified: data.emailVerified,
            issues: issues,
            data: data
          });
        }
      });
      
      setBrokenAccounts(broken);
      setMessage(`Found ${broken.length} accounts with issues`);
      setLoading(false);
    } catch (error) {
      console.error('Error finding broken accounts:', error);
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  const fixAccount = async (accountId, newData) => {
    try {
      const accountRef = doc(db, 'users', accountId);
      await updateDoc(accountRef, newData);
      
      setMessage(`✅ Fixed account ${accountId}`);
      
      // Refresh the list
      await findBrokenAccounts();
    } catch (error) {
      console.error('Error fixing account:', error);
      setMessage('❌ Error: ' + error.message);
    }
  };

  const deleteAccount = async (accountId, email) => {
    if (!window.confirm(`Are you sure you want to DELETE account:\n${email}\n\nThis action CANNOT be undone!`)) {
      return;
    }
    
    try {
      const accountRef = doc(db, 'users', accountId);
      await deleteDoc(accountRef);
      
      // Also delete OTP code if exists
      try {
        const otpRef = doc(db, 'otpCodes', accountId);
        await deleteDoc(otpRef);
      } catch (err) {
        // OTP might not exist, that's okay
      }
      
      setMessage(`🗑️ Deleted account ${email}`);
      
      // Refresh the list
      await findBrokenAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage('❌ Error: ' + error.message);
    }
  };

  const markAsVerified = async (accountId) => {
    if (!window.confirm('Mark this account as email verified?')) {
      return;
    }
    
    await fixAccount(accountId, { emailVerified: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="text-yellow-500" size={28} />
            Fix Broken Accounts
          </h2>
          <p className="text-gray-400 mt-1">Find and fix accounts with issues (Anonymous, missing data, etc.)</p>
        </div>
        <button
          onClick={findBrokenAccounts}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Find Broken Accounts
            </>
          )}
        </button>
      </div>

      {/* Warning banner */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">⚠️ Use with Caution!</p>
            <p>This tool can modify or delete user accounts. Only fix accounts you're certain about.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') || message.includes('❌') 
            ? 'bg-red-900/20 border border-red-500/30 text-red-400' 
            : 'bg-green-900/20 border border-green-500/30 text-green-400'
        }`}>
          {message}
        </div>
      )}

      {/* Results */}
      {brokenAccounts.length === 0 && !loading && message && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
          <p className="text-green-400 font-semibold">No broken accounts found! 🎉</p>
          <p className="text-gray-400 text-sm mt-1">All accounts are in good shape.</p>
        </div>
      )}

      {brokenAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Found {brokenAccounts.length} account{brokenAccounts.length !== 1 ? 's' : ''} with issues:
          </h3>
          
          {brokenAccounts.map((account) => (
            <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{account.name}</h4>
                    {account.name === 'Anonymous' && (
                      <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded">ANONYMOUS</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{account.email}</p>
                  <p className="text-gray-500 text-xs mt-1">ID: {account.id}</p>
                  {account.mobile && (
                    <p className="text-gray-500 text-xs">Mobile: {account.mobile}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteAccount(account.id, account.email)}
                  className="flex items-center gap-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>

              {/* Issues */}
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-2">Issues:</p>
                <div className="flex flex-wrap gap-2">
                  {account.issues.map((issue, idx) => (
                    <span key={idx} className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-gray-800 pt-3">
                {account.emailVerified === false && (
                  <button
                    onClick={() => markAsVerified(account.id)}
                    className="flex items-center gap-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 px-3 py-1.5 rounded text-sm"
                  >
                    <CheckCircle size={14} />
                    Mark as Verified
                  </button>
                )}
                
                {account.name === 'Anonymous' && (
                  <button
                    onClick={() => {
                      const newName = window.prompt('Enter correct name for this account:', '');
                      if (newName && newName.trim()) {
                        fixAccount(account.id, { name: newName.trim() });
                      }
                    }}
                    className="flex items-center gap-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-3 py-1.5 rounded text-sm"
                  >
                    <Wrench size={14} />
                    Fix Name
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FixAccounts;
