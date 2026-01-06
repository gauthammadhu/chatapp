export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  username: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User & {
    needsUsername: boolean;
  };
}

export interface Thread {
  id: string;
  isDm: boolean;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  members: ThreadMember[];
  lastMessage?: Message;
}

export interface ThreadMember {
  id: string;
  userId: string;
  threadId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  threadId: string;
  senderId: string;
  createdAt: string;
  sender: User;
}

export interface SendMessageData {
  threadId: string;
  content: string;
}

export interface SocketEvents {
  // Client to Server
  join_thread: (data: { threadId: string }) => void;
  leave_thread: (data: { threadId: string }) => void;
  send_message: (data: SendMessageData) => void;
  typing: (data: { threadId: string }) => void;

  // Server to Client
  thread_history: (data: { threadId: string; messages: Message[] }) => void;
  new_message: (data: { message: Message }) => void;
  user_typing: (data: { userId: string; username: string | null; threadId: string }) => void;
  error: (data: { message: string }) => void;
}
