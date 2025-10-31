import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/slices/authSlice';
import * as authService from '../services/auth.service';

interface LoginData {
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

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setLoading, clearAuth } = useAuthStore();

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setLoading(true);
        await authService.login(data);
        navigate('/dashboard');
      } catch (error: any) {
        setLoading(false);
        throw new Error(error.response?.data?.message || 'Erreur de connexion');
      }
    },
    [navigate, setLoading]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setLoading(true);
        await authService.register(data);
        navigate('/dashboard');
      } catch (error: any) {
        setLoading(false);
        throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
      }
    },
    [navigate, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      navigate('/login');
    }
  }, [navigate, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};
