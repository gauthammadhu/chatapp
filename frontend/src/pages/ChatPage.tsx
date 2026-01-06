import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { socketService } from '../services/socket';
import { threadAPI } from '../services/api';
import ThreadList from '../components/ThreadList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import NewChatModal from '../components/NewChatModal';

export default function ChatPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { activeThreadId, addMessage, setMessages, setThreads, clearAllMessages } = useChatStore();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Load threads on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const loadThreads = async () => {
      try {
        const response = await threadAPI.getThreads();
        setThreads(response.threads);
      } catch (error) {
        console.error('Failed to load threads:', error);
      }
    };

    loadThreads();
  }, [isAuthenticated, navigate, setThreads]);

  // Set up socket listeners and rejoin active thread
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    socketService.onThreadHistory((data) => {
      setMessages(data.threadId, data.messages);
    });

    socketService.onNewMessage((data) => {
      addMessage(data.message);
    });

    // Rejoin active thread if exists (after refresh)
    if (activeThreadId && socketService.isConnected()) {
      console.log('Rejoining thread:', activeThreadId);
      socketService.joinThread(activeThreadId);
    }

    return () => {
      socketService.offThreadHistory();
      socketService.offNewMessage();
    };
  }, [isAuthenticated, addMessage, setMessages, activeThreadId]);

  const handleLogout = () => {
    clearAllMessages();
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
              <p className="text-sm text-gray-600">@{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Thread List */}
        <ThreadList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThreadId ? (
          <>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-lg font-medium">No chat selected</h3>
              <p className="text-sm mt-2">Select a thread or create a new one to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
}
