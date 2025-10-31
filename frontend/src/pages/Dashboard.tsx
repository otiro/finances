import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de Bord
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Bienvenue, {user?.firstName} {user?.lastName} !
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Email : {user?.email}
          </Typography>
          <Typography variant="body1" paragraph>
            Revenu mensuel : {user?.monthlyIncome} €
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button variant="outlined" color="error" onClick={logout}>
            Se déconnecter
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            🎉 Authentification fonctionnelle ! La Phase 2 est terminée.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Prochaine étape : Phase 3 - Gestion des comptes et transactions
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
