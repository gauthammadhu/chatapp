import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userEmail: string;
  username: string | null;
}

export const setupChatSocket = (io: Server): void => {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    (socket as AuthenticatedSocket).userId = decoded.userId;
    (socket as AuthenticatedSocket).userEmail = decoded.email;
    (socket as AuthenticatedSocket).username = decoded.username;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User connected: ${authSocket.userId} (${authSocket.username || authSocket.userEmail})`);

    // Join thread room
    socket.on('join_thread', async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        // Verify user is member of thread
        const membership = await prisma.threadMember.findFirst({
          where: {
            userId: authSocket.userId,
            threadId: threadId
          }
        });

        if (!membership) {
          socket.emit('error', { message: 'Not a member of this thread' });
          return;
        }

        socket.join(threadId);
        console.log(`User ${authSocket.userId} joined thread ${threadId}`);

        // Load recent messages
        const messages = await prisma.message.findMany({
          where: { threadId },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 50  // Last 50 messages
        });

        socket.emit('thread_history', { threadId, messages });

      } catch (error) {
        console.error('Join thread error:', error);
        socket.emit('error', { message: 'Failed to join thread' });
      }
    });

    // Leave thread room
    socket.on('leave_thread', (data: { threadId: string }) => {
      const { threadId } = data;
      socket.leave(threadId);
      console.log(`User ${authSocket.userId} left thread ${threadId}`);
    });

    // Send message
    socket.on('send_message', async (data: { threadId: string; content: string }) => {
      try {
        const { threadId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify user is member of thread
        const membership = await prisma.threadMember.findFirst({
          where: {
            userId: authSocket.userId,
            threadId: threadId
          }
        });

        if (!membership) {
          socket.emit('error', { message: 'Not a member of this thread' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            threadId,
            senderId: authSocket.userId
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        });

        // Broadcast to all clients in the thread room
        io.to(threadId).emit('new_message', {
          message: {
            id: message.id,
            content: message.content,
            threadId: message.threadId,
            createdAt: message.createdAt,
            sender: message.sender
          }
        });

        console.log(`Message sent in thread ${threadId} by user ${authSocket.userId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', async (data: { threadId: string }) => {
      try {
        const { threadId } = data;

        // Verify membership
        const membership = await prisma.threadMember.findFirst({
          where: {
            userId: authSocket.userId,
            threadId: threadId
          }
        });

        if (membership) {
          socket.to(threadId).emit('user_typing', {
            userId: authSocket.userId,
            username: authSocket.username,
            threadId
          });
        }

      } catch (error) {
        console.error('Typing indicator error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${authSocket.userId}`);
    });
  });
};
