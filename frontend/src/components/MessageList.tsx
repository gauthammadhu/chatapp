import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';

export default function MessageList() {
  const { messages, activeThreadId } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  if (!activeThreadId) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {threadMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {threadMessages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <div className="flex-shrink-0">
                      {message.sender.avatar ? (
                        <img
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        isOwnMessage ? 'text-right' : 'text-left'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
