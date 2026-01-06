import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinThread(threadId: string) {
    this.socket?.emit('join_thread', { threadId });
  }

  leaveThread(threadId: string) {
    this.socket?.emit('leave_thread', { threadId });
  }

  sendMessage(threadId: string, content: string) {
    this.socket?.emit('send_message', { threadId, content });
  }

  sendTyping(threadId: string) {
    this.socket?.emit('typing', { threadId });
  }

  onThreadHistory(callback: (data: { threadId: string; messages: Message[] }) => void) {
    this.socket?.on('thread_history', callback);
  }

  onNewMessage(callback: (data: { message: Message }) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserTyping(callback: (data: { userId: string; username: string | null; threadId: string }) => void) {
    this.socket?.on('user_typing', callback);
  }

  offThreadHistory() {
    this.socket?.off('thread_history');
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  offUserTyping() {
    this.socket?.off('user_typing');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
