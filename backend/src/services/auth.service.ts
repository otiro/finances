import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/encryption';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import type { RegisterInput, LoginInput } from '../utils/validators';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    monthlyIncome: number;
  };
  tokens: AuthTokens;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }

  // Hasher le mot de passe
  const passwordHash = await hashPassword(data.password);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      monthlyIncome: data.monthlyIncome || 0,
    },
  });

  // Générer les tokens
  const tokens = {
    accessToken: generateAccessToken({ userId: user.id, email: user.email }),
    refreshToken: generateRefreshToken({ userId: user.id, email: user.email }),
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      monthlyIncome: Number(user.monthlyIncome),
    },
    tokens,
  };
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  // Générer les tokens
  const tokens = {
    accessToken: generateAccessToken({ userId: user.id, email: user.email }),
    refreshToken: generateRefreshToken({ userId: user.id, email: user.email }),
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      monthlyIncome: Number(user.monthlyIncome),
    },
    tokens,
  };
};

/**
 * Récupérer les informations d'un utilisateur par son ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      monthlyIncome: true,
      profilePictureUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return {
    ...user,
    monthlyIncome: Number(user.monthlyIncome),
  };
};
