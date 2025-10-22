import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, BookOpen, Code } from 'lucide-react';

const Notes = () => {
  const { user, partner } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'partner'
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'DSA'
  });

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, partner, filter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const notesRef = collection(db, 'notes');
      let allNotes = [];

      if (filter === 'my') {
        // Fetch only user's notes
        const q = query(notesRef, where('userId', '==', user.id), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        allNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          isOwner: true
        }));
      } else if (filter === 'partner' && partner) {
        // Fetch only partner's notes
        const q = query(notesRef, where('userId', '==', partner.id), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        allNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          isOwner: false
        }));
      } else {
        // Fetch user's notes
        const userQuery = query(notesRef, where('userId', '==', user.id), orderBy('createdAt', 'desc'));
        const userSnapshot = await getDocs(userQuery);
        const userNotes = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          isOwner: true
        }));

        allNotes = [...userNotes];

        // Fetch partner's notes if partner exists
        if (partner) {
          const partnerQuery = query(notesRef, where('userId', '==', partner.id), orderBy('createdAt', 'desc'));
          const partnerSnapshot = await getDocs(partnerQuery);
          const partnerNotes = partnerSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            isOwner: false
          }));

          allNotes = [...allNotes, ...partnerNotes];
          
          // Sort all notes by date
          allNotes.sort((a, b) => b.createdAt - a.createdAt);
        }
      }
      
      setNotes(allNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please enter both title and content');
      return;
    }

    try {
      const noteData = {
        userId: user.id,
        userName: user.name,
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        category: newNote.category,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notes'), noteData);
      
      setNewNote({
        title: '',
        content: '',
        category: 'DSA'
      });
      
      setShowCreateModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note: ' + error.message);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        title: updatedData.title,
        content: updatedData.content,
        category: updatedData.category
      });
      
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteDoc(doc(db, 'notes', noteId));
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!user) {
    return (
      <div className="text-white text-center py-20">
        <p>Please login to view notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Notes</h2>
          <p className="text-gray-400">Learning notes and documentation</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Notes {partner && `(You & ${partner.name})`}
        </button>
        <button
          onClick={() => setFilter('my')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'my'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          My Notes
        </button>
        {partner && (
          <button
            onClick={() => setFilter('partner')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'partner'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {partner.name}'s Notes
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className={`bg-gray-900 border rounded-xl p-6 hover:border-gray-700 transition-colors ${
              note.isOwner ? 'border-gray-800' : 'border-indigo-900'
            }`}>
              {editingNote?.id === note.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 h-32"
                  />
                  <select
                    value={editingNote.category}
                    onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DSA">DSA</option>
                    <option value="Dev">Dev</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id, editingNote)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        note.category === 'DSA' ? 'bg-indigo-900 text-indigo-300' : 'bg-cyan-900 text-cyan-300'
                      }`}>
                        <Code size={12} />
                        {note.category}
                      </span>
                      {!note.isOwner && (
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs">
                          {note.userName || partner?.name || 'Partner'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                      {note.isOwner && (
                        <>
                          <button
                            onClick={() => setEditingNote(note)}
                            className="text-blue-400 hover:text-blue-300 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{note.title}</h3>
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{note.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Note</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g., Dynamic Programming Patterns"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="DSA">DSA</option>
                  <option value="Dev">Dev</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your notes here..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-48"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold text-white transition"
                >
                  Create Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
