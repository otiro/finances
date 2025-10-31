import api from './api';
import { useAuthStore } from '../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  monthlyIncome?: number;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      monthlyIncome: number;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

/**
 * Connexion d'un utilisateur
 */
export const login = async (credentials: LoginCredentials) => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  const { user, tokens } = response.data.data;

  // Sauvegarder dans le store
  useAuthStore.getState().setAuth(user, tokens.accessToken, tokens.refreshToken);

  return response.data;
};

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (data: RegisterData) => {
  const response = await api.post<AuthResponse>('/auth/register', data);

  const { user, tokens } = response.data.data;

  // Sauvegarder dans le store
  useAuthStore.getState().setAuth(user, tokens.accessToken, tokens.refreshToken);

  return response.data;
};

/**
 * Déconnexion
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Toujours nettoyer le store local
    useAuthStore.getState().clearAuth();
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
