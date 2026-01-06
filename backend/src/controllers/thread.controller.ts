import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipientUsername } = req.body;
    const userId = req.user!.userId;

    if (!recipientUsername) {
      res.status(400).json({ error: 'Recipient username is required' });
      return;
    }

    // Find recipient by username
    const recipient = await prisma.user.findUnique({
      where: { username: recipientUsername },
    });

    if (!recipient) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (recipient.id === userId) {
      res.status(400).json({ error: 'Cannot create thread with yourself' });
      return;
    }

    // Check if DM thread already exists between these two users
    const existingThread = await prisma.thread.findFirst({
      where: {
        isDm: true,
        members: {
          every: {
            OR: [
              { userId: userId },
              { userId: recipient.id },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (existingThread) {
      res.json({
        success: true,
        thread: existingThread,
        existed: true,
      });
      return;
    }

    // Create new DM thread
    const thread = await prisma.thread.create({
      data: {
        isDm: true,
        members: {
          create: [
            { userId: userId },
            { userId: recipient.id },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      thread,
      existed: false,
    });

  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
};

export const getThreads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const threads = await prisma.thread.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to include lastMessage
    const threadsWithLastMessage = threads.map((thread) => ({
      ...thread,
      lastMessage: thread.messages[0] || null,
      messages: undefined,
    }));

    res.json({
      success: true,
      threads: threadsWithLastMessage,
    });

  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Failed to get threads' });
  }
};
