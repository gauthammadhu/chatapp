import { create } from 'zustand';
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
}

export const useChatStore = create<ChatState>()((set, get) => ({
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
    if (activeThreadId) {
      socketService.leaveThread(activeThreadId);
    }

    // Join new thread
    if (threadId) {
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
    set((state) => ({
      messages: {
        ...state.messages,
        [message.threadId]: [
          ...(state.messages[message.threadId] || []),
          message,
        ],
      },
    })),

  sendMessage: (threadId, content) => {
    socketService.sendMessage(threadId, content);
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
}));
