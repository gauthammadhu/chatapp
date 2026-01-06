import jwt, { SignOptions } from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  username: string | null;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRY as string) || '7d'
  } as SignOptions);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
