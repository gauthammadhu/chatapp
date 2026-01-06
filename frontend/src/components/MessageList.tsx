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
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50">
      {threadMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center px-4">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {threadMessages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${isOwnMessage ? 'justify-start' : 'justify-end'}`}
              >
                {/* Avatar for own messages (left side) */}
                {isOwnMessage && (
                  <div className="flex-shrink-0 mt-1">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isOwnMessage ? 'items-start' : 'items-end'}`}>
                  {/* Sender name */}
                  <p className={`text-xs font-semibold mb-1 px-1 ${
                    isOwnMessage ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {isOwnMessage ? 'You' : message.sender.name}
                  </p>

                  {/* Message Bubble */}
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-green-600 text-white rounded-bl-sm'
                        : 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>

                    {/* Time inside bubble */}
                    <p className={`text-[10px] mt-1 ${
                      isOwnMessage ? 'text-green-100' : 'text-blue-100'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Avatar for other user messages (right side) */}
                {!isOwnMessage && (
                  <div className="flex-shrink-0 mt-1">
                    {message.sender.avatar ? (
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
