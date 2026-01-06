import { useState, FormEvent, useEffect } from 'react';
import { userAPI, threadAPI } from '../services/api';
import { useChatStore } from '../stores/useChatStore';
import type { User } from '../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const { addThread, setActiveThread } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setError('');
    }
  }, [isOpen]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.users);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setLoading(true);
    setError('');

    try {
      const response = await threadAPI.createThread(user.username!);

      if (!response.existed) {
        addThread(response.thread);
      }

      setActiveThread(response.thread.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || searchQuery.trim().length < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Search for users to start a chat</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {/* Avatar */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">@{user.username}</p>
                  </div>

                  {/* Arrow Icon */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
