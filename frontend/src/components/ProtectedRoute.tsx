import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useAuthStore();

  // Si on a un token mais pas encore vérifié l'authentification
  if (accessToken && !isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si authentifié, afficher le contenu protégé
  return <>{children}</>;
}
