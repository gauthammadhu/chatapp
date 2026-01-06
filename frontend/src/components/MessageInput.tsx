import { useState, FormEvent, KeyboardEvent } from 'react';
import { useChatStore } from '../stores/useChatStore';

export default function MessageInput() {
  const { activeThreadId, sendMessage } = useChatStore();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!activeThreadId || !message.trim()) {
      return;
    }

    sendMessage(activeThreadId, message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!activeThreadId) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white p-2 sm:p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>

      <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 px-1 hidden sm:block">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
