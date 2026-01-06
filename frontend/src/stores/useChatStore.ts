import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Thread, Message } from '../types';
import { socketService } from '../services/socket';

interface ChatState {
  threads: Thread[];
  messages: Record<string, Message[]>;
  activeThreadId: string | null;
  typingUsers: Record<string, Set<string>>;

  // Actions
  setThreads: (threads: Thread[]) => void;
  addThread: (thread: Thread) => void;
  setActiveThread: (threadId: string | null) => void;
  setMessages: (threadId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  sendMessage: (threadId: string, content: string) => void;
  setUserTyping: (threadId: string, userId: string) => void;
  clearUserTyping: (threadId: string, userId: string) => void;
  clearAllMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      activeThreadId: null,
      typingUsers: {},

      setThreads: (threads) => set({ threads }),

      addThread: (thread) =>
        set((state) => ({
          threads: [thread, ...state.threads],
        })),

      setActiveThread: (threadId) => {
        const { activeThreadId } = get();

        // Leave previous thread
        if (activeThreadId && activeThreadId !== threadId) {
          socketService.leaveThread(activeThreadId);
        }

        // Join new thread only if socket is connected
        if (threadId && socketService.isConnected()) {
          socketService.joinThread(threadId);
        }

        set({ activeThreadId: threadId });
      },

  setMessages: (threadId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      // Update messages
      const updatedMessages = {
        ...state.messages,
        [message.threadId]: [
          ...(state.messages[message.threadId] || []),
          message,
        ],
      };

      // Update thread list - move thread to top and set lastMessage
      const updatedThreads = state.threads.map((thread) =>
        thread.id === message.threadId
          ? { ...thread, lastMessage: message, updatedAt: message.createdAt }
          : thread
      );

      // Sort threads by updatedAt (most recent first)
      updatedThreads.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return {
        messages: updatedMessages,
        threads: updatedThreads,
      };
    }),

  sendMessage: (threadId, content) => {
    // Send via socket
    socketService.sendMessage(threadId, content);

    // Note: We don't add optimistic update here because
    // the socket will broadcast the message back to all clients including sender
    // This ensures consistency across all devices
  },

  setUserTyping: (threadId, userId) =>
    set((state) => {
      const threadTyping = new Set(state.typingUsers[threadId] || []);
      threadTyping.add(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [threadId]: threadTyping,
        },
      };
    }),

  clearUserTyping: (threadId, userId) =>
    set((state) => {
      const threadTyping = new Set(state.typingUsers[threadId] || []);
      threadTyping.delete(userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [threadId]: threadTyping,
        },
      };
    }),

      clearAllMessages: () => set({ messages: {}, activeThreadId: null }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        activeThreadId: state.activeThreadId,
        messages: state.messages,
      }),
    }
  )
);
