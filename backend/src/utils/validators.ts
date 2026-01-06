import prisma from '../config/database';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateUsername = async (
  username: string,
  currentUserId: string | null = null
): Promise<ValidationResult> => {
  // Check format: alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  if (username.length < 3 || username.length > 20) {
    return {
      valid: false,
      error: 'Username must be between 3 and 20 characters'
    };
  }

  // Check uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser && existingUser.id !== currentUserId) {
    return { valid: false, error: 'Username already taken' };
  }

  return { valid: true };
};
