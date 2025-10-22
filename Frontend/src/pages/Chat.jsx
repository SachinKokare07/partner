import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  or,
  and,
  deleteDoc,
  doc
} from 'firebase/firestore';

const Chat = () => {
  const { user, partner } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const listenerRef = useRef(null); // Track listener to avoid duplicates

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time message listener
  useEffect(() => {
    if (!user || !partner) {
      setLoading(false);
      return;
    }

    // Clean up previous listener if exists
    if (listenerRef.current) {
      console.log('🧹 Cleaning up previous listener');
      listenerRef.current();
      listenerRef.current = null;
    }

    setLoading(true);
    console.log('🔌 Setting up NEW message listener');
    console.log('👤 User:', user.id, user.name);
    console.log('👥 Partner:', partner.id, partner.name);

    // Query messages where user is sender OR receiver
    const messagesRef = collection(db, 'messages');
    
    // Get all messages where current user is involved (as sender or receiver)
    const q1 = query(
      messagesRef,
      where('senderId', '==', user.id),
      orderBy('createdAt', 'asc')
    );
    
    const q2 = query(
      messagesRef,
      where('receiverId', '==', user.id),
      orderBy('createdAt', 'asc')
    );

    try {
      // Listen to both queries
      const unsubscribe1 = onSnapshot(
        q1,
        (snapshot) => {
          updateMessagesFromSnapshot(snapshot, 'sent');
        },
        (error) => {
          console.error('❌ Sent messages listener error:', error);
        }
      );
      
      const unsubscribe2 = onSnapshot(
        q2,
        (snapshot) => {
          updateMessagesFromSnapshot(snapshot, 'received');
        },
        (error) => {
          console.error('❌ Received messages listener error:', error);
        }
      );

      // Store both unsubscribes
      listenerRef.current = () => {
        unsubscribe1();
        unsubscribe2();
      };
      
      console.log('✅ Listeners set up successfully');
      setLoading(false);
    } catch (error) {
      console.error('❌ Error setting up listener:', error);
      setLoading(false);
    }
    
    // Helper function to update messages from snapshot
    function updateMessagesFromSnapshot(snapshot, type) {
      console.log(`🔥 ${type} messages snapshot:`, snapshot.docs.length);
      
      const newMessages = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        })
        .filter(msg => 
          (msg.senderId === user.id && msg.receiverId === partner.id) ||
          (msg.senderId === partner.id && msg.receiverId === user.id)
        );
      
      // Merge and deduplicate messages
      setMessages(prev => {
        const messageMap = new Map();
        
        // Add existing messages
        prev.forEach(msg => messageMap.set(msg.id, msg));
        
        // Add/update new messages
        newMessages.forEach(msg => messageMap.set(msg.id, msg));
        
        // Convert back to array and sort
        return Array.from(messageMap.values())
          .sort((a, b) => a.createdAt - b.createdAt);
      });
      
      setTimeout(() => scrollToBottom(), 100);
    }

    return () => {
      console.log('🔌 Unmounting - cleaning up listener');
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [user?.id, partner?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !partner) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    console.log('📤 SENDING MESSAGE:', messageText);
    console.log('👤 From:', user.id, '(' + user.name + ')');
    console.log('👥 To:', partner.id, '(' + partner.name + ')');
    console.log('⏰ Time:', new Date().toLocaleTimeString());

    // Optimistic UI - add message immediately
    const tempMessage = {
      id: 'temp_' + Date.now(),
      senderId: user.id,
      senderName: user.name,
      receiverId: partner.id,
      receiverName: partner.name,
      message: messageText,
      type: messageType,
      createdAt: new Date(),
      isPending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const messageData = {
        senderId: user.id,
        senderName: user.name,
        receiverId: partner.id,
        receiverName: partner.name,
        message: messageText,
        type: messageType,
        createdAt: serverTimestamp()
      };

      console.log('📝 Message data:', messageData);
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('✅ MESSAGE SAVED TO FIRESTORE!');
      console.log('🆔 Document ID:', docRef.id);
      console.log('⏰ Saved at:', new Date().toLocaleTimeString());
      
      // Replace temp message with real one immediately
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...tempMessage, id: docRef.id, isPending: false }
          : msg
      ));
      
      console.log('✅ Message displayed in UI');
      
    } catch (error) {
      console.error('❌ SEND MESSAGE ERROR:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageText);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      // Remove from UI immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'messages', messageId));
      console.log('✅ Message deleted from Firestore');
      
    } catch (error) {
      console.error('❌ Delete message error:', error);
      alert('Failed to delete message: ' + error.message);
      // Refresh messages to restore if delete failed
      // The onSnapshot listener will restore it
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'achievement':
        return 'border-l-4 border-green-500 bg-green-900/20';
      case 'update':
        return 'border-l-4 border-blue-500 bg-blue-900/20';
      default:
        return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'achievement':
        return '🎉';
      case 'update':
        return '📢';
      default:
        return '';
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const dateKey = formatDate(msg.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!partner) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Daily Chat</h2>
          <p className="text-gray-400">Share your progress and stay connected</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
            <Send size={32} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Partner Connected</h3>
          <p className="text-gray-400 mb-6">Connect with a partner to start chatting</p>
          <button 
            onClick={() => window.location.href = '/?page=partner'}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            Find Partner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Daily Chat</h2>
        <p className="text-gray-400">
          Chatting with <span className="text-white font-semibold">{partner.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col" style={{ height: '600px' }}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="animate-spin text-indigo-400" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Send size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                        {date}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {msgs.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4 group`}>
                        <div className={`max-w-md ${msg.senderId === user.id ? 'order-2' : 'order-1'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.senderId !== user.id && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                {partner.name?.[0]?.toUpperCase() || 'P'}
                              </div>
                            )}
                            <span className="text-sm text-gray-400 font-medium">
                              {msg.senderId === user.id ? 'You' : partner.name}
                            </span>
                            <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                            {msg.senderId === user.id && !msg.isPending && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
                                title="Delete message"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className={`p-4 rounded-lg ${
                            msg.senderId === user.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-100'
                          } ${getMessageStyle(msg.type)} ${msg.isPending ? 'opacity-70' : ''}`}>
                            {getTypeIcon(msg.type) && <span className="mr-2">{getTypeIcon(msg.type)}</span>}
                            {msg.message}
                            {msg.isPending && <span className="ml-2 text-xs opacity-50">⏳</span>}
                          </div>
                        </div>
                        {msg.senderId === user.id && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ml-2 order-3">
                            {user.name?.[0]?.toUpperCase() || 'Y'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-800 p-4">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setMessageType('message')} 
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${messageType === 'message' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    Message
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setMessageType('update')} 
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${messageType === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    📢 Update
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setMessageType('achievement')} 
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${messageType === 'achievement' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    🎉 Achievement
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type your message..." 
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Chat Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Total Messages</span>
                <span className="text-white font-semibold">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Your Messages</span>
                <span className="text-white font-semibold">
                  {messages.filter(m => m.senderId === user.id).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Partner's Messages</span>
                <span className="text-white font-semibold">
                  {messages.filter(m => m.senderId === partner.id).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Message Types</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>🎉</span>
                  <span className="text-sm text-green-400 font-medium">Achievements</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {messages.filter(m => m.type === 'achievement').length}
                </p>
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>📢</span>
                  <span className="text-sm text-blue-400 font-medium">Updates</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {messages.filter(m => m.type === 'update').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">💡 Tip</h3>
            <p className="text-sm text-gray-300">Share your daily wins and challenges to keep each other motivated and accountable!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
