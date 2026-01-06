import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'ID token is required' });
      return;
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { sub: googleSub, email, name, picture: avatar } = payload;

    if (!email || !name) {
      res.status(401).json({ error: 'Missing required user information' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleSub }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleSub,
          email,
          name,
          avatar: avatar || null,
          username: null  // User will set this separately
        }
      });
    }

    // Generate internal JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        username: user.username,
        needsUsername: !user.username  // Frontend checks this
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid token or authentication failed' });
  }
};
