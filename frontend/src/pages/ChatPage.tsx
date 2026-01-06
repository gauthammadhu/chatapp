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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-80 sm:w-96 lg:w-80 xl:w-96
          bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Chat App</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">@{user?.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
              >
                Logout
              </button>
              {/* Close button for mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Thread List */}
        <ThreadList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeThreadId ? (
          <>
            {/* Chat Header with Hamburger Menu */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center gap-3">
              {/* Hamburger Menu (Mobile) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                Active Chat
              </h2>
            </div>

            <MessageList />
            <MessageInput />
          </>
        ) : (
          <>
            {/* Header for No Chat Selected */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Chat App</h2>
            </div>

            <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
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
                <h3 className="text-base sm:text-lg font-medium">No chat selected</h3>
                <p className="text-xs sm:text-sm mt-2 max-w-xs mx-auto">
                  Select a thread or create a new one to start messaging
                </p>
              </div>
            </div>
          </>
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
