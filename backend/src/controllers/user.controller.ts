import { Response } from 'express';
import prisma from '../config/database';
import { validateUsername } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export const setUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = req.user!.userId;

    // Validate username
    const validation = await validateUsername(username, userId);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Set username error:', error);
    res.status(500).json({ error: 'Failed to set username' });
  }
};

export const updateUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = req.user!.userId;

    // Validate username
    const validation = await validateUsername(username, userId);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const userId = req.user!.userId;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    if (q.trim().length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    // Search users by username or name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId, // Exclude current user
            },
          },
          {
            username: {
              not: null, // Only users with usernames
            },
          },
          {
            OR: [
              {
                username: {
                  contains: q.trim(),
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: q.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        username: true,
      },
      take: 20, // Limit results
    });

    res.json({
      success: true,
      users,
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};
