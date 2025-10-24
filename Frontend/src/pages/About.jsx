import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProfilePic from '../assets/Logo.png';
import { Edit2, Save, X } from 'lucide-react';

const About = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    course: user?.course || '',
    college: user?.college || '',
    year: user?.year || '',
    mobile: user?.mobile || '',
  });

  // Update formData when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        course: user.course || '',
        college: user.college || '',
        year: user.year || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      course: user?.course || '',
      college: user?.college || '',
      year: user?.year || '',
      mobile: user?.mobile || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    // Check if user is logged in
    if (!user || !user.id) {
      setError('User not logged in. Please refresh the page and try again.');
      setLoading(false);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        name: formData.name,
        course: formData.course,
        college: formData.college,
        year: formData.year,
        mobile: formData.mobile,
      }, { merge: true });

      // Update local user state
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      
      setSuccess('✅ Profile updated successfully!');
      console.log('Profile saved to Firestore:', updatedUser);
      
      setTimeout(() => {
        setSuccess('');
        setIsEditing(false);
      }, 2000);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg">
        <div className="text-center text-gray-400">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={!user}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Picture and Basic Info */}
      <div className="flex flex-col items-center mb-8">
        <img 
          src={ProfilePic} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-indigo-600" 
        />
        <h2 className="text-xl font-bold text-white mb-1">{user?.name || 'User'}</h2>
        <span className="text-gray-400 text-sm">{user?.email}</span>
      </div>

      {/* Editable Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your name"
            />
          ) : (
            <p className="text-gray-300">{user?.name || 'Not set'}</p>
          )}
        </div>

        {/* Course */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Course</label>
          {isEditing ? (
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="e.g. B.Tech Computer Science"
            />
          ) : (
            <p className="text-gray-300">{user?.course || 'Not set'}</p>
          )}
        </div>

        {/* College */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">College</label>
          {isEditing ? (
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="e.g. ABC Institute of Technology"
            />
          ) : (
            <p className="text-gray-300">{user?.college || 'Not set'}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Year</label>
          {isEditing ? (
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          ) : (
            <p className="text-gray-300">{user?.year || 'Not set'}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Mobile Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="e.g. +919876543210"
            />
          ) : (
            <p className="text-gray-300">{user?.mobile || 'Not set'}</p>
          )}
        </div>

        {/* Start Date (Read-only) */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-4">
          <label className="block text-gray-300 text-sm font-semibold mb-2">🎯 Journey Start Date</label>
          <p className="text-white text-lg font-semibold">{formatDate(user?.startDate)}</p>
          <p className="text-xs text-gray-400 mt-1">This is when you began your learning journey</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 text-green-400 rounded-lg text-sm text-center">
          {success}
        </div>
      )}

      {/* Footer */}
      {!isEditing && (
        <div className="text-center pt-4 border-t border-gray-800">
          <span className="text-xs text-gray-500">
            Click "Edit Profile" to update your information
          </span>
        </div>
      )}
    </div>
  );
};

export default About;
