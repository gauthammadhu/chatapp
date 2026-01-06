import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';

export default function ThreadList() {
  const { threads, activeThreadId, setActiveThread } = useChatStore();
  const { user } = useAuthStore();

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-2">
            Thread creation feature coming soon!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {threads.map((thread) => {
            // Get the other user in the DM
            const otherMember = thread.members.find((m) => m.userId !== user?.id);
            const displayName = thread.isDm
              ? otherMember?.user.name || 'Unknown User'
              : thread.name || 'Group Chat';

            return (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                  activeThreadId === thread.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {otherMember?.user.avatar ? (
                      <img
                        src={otherMember.user.avatar}
                        alt={displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Thread Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                      {thread.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      @{otherMember?.user.username || 'unknown'}
                    </p>
                    {thread.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {thread.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
