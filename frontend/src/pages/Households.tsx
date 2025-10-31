import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useHouseholdStore } from '../store/slices/householdSlice';
import * as householdService from '../services/household.service';
import CreateHouseholdDialog from '../components/CreateHouseholdDialog';

export default function Households() {
  const navigate = useNavigate();
  const { households, isLoading, error } = useHouseholdStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadHouseholds();
  }, []);

  const loadHouseholds = async () => {
    try {
      await householdService.getUserHouseholds();
    } catch (err) {
      console.error('Error loading households:', err);
    }
  };

  const getSharingModeLabel = (mode: string) => {
    switch (mode) {
      case 'EQUAL':
        return 'Parts égales';
      case 'PROPORTIONAL':
        return 'Proportionnel';
      case 'CUSTOM':
        return 'Personnalisé';
      default:
        return mode;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mes Foyers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Créer un foyer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {households.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun foyer trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Créez votre premier foyer pour commencer à gérer vos finances en famille ou en colocation.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Créer mon premier foyer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {households.map((household) => (
            <Grid item xs={12} sm={6} md={4} key={household.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {household.name}
                    </Typography>
                    <Chip
                      label={household.userRole}
                      color={household.userRole === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Chip
                    label={getSharingModeLabel(household.sharingMode)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {household.members.length} membre{household.members.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {household._count?.accounts || 0} compte{(household._count?.accounts || 0) > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/households/${household.id}`)}
                    fullWidth
                  >
                    Voir les détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateHouseholdDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadHouseholds}
      />
    </Container>
  );
}
