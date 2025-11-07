import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../hooks/useAuth';
import { useHouseholdStore } from '../store/slices/householdSlice';
import * as householdService from '../services/household.service';
import { MonthlyBalanceWidget } from '../components/dashboard/MonthlyBalanceWidget';
import { TopCategoriesWidget } from '../components/dashboard/TopCategoriesWidget';
import { BudgetStatusWidget } from '../components/dashboard/BudgetStatusWidget';
import { AccountsStatusWidget } from '../components/dashboard/AccountsStatusWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { households, isLoading } = useHouseholdStore();
  const [stats, setStats] = useState({ totalHouseholds: 0, totalAccounts: 0 });
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('');

  useEffect(() => {
    loadHouseholds();
  }, []);

  useEffect(() => {
    if (households.length > 0) {
      const totalAccounts = households.reduce(
        (sum, h) => sum + (h._count?.accounts || 0),
        0
      );
      setStats({
        totalHouseholds: households.length,
        totalAccounts,
      });
      // Auto-select first household if none selected
      if (!selectedHouseholdId) {
        setSelectedHouseholdId(households[0].id);
      }
    }
  }, [households, selectedHouseholdId]);

  const loadHouseholds = async () => {
    try {
      await householdService.getUserHouseholds();
    } catch (err) {
      console.error('Error loading households:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de Bord
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Bienvenue, {user?.firstName} {user?.lastName} !
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Mes Foyers
              </Typography>
              <Typography variant="h3">
                {isLoading ? <CircularProgress size={32} /> : stats.totalHouseholds}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Mes Comptes
              </Typography>
              <Typography variant="h3">
                {isLoading ? <CircularProgress size={32} /> : stats.totalAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Revenu Mensuel
              </Typography>
              <Typography variant="h5">
                {user?.monthlyIncome} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Actions Rapides
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexDirection: 'column' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/households')}
                >
                  Voir les foyers
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/accounts')}
                >
                  Voir les comptes
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/debts')}
                >
                  Voir les dettes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Household Selector & Analytics Widgets */}
      {households.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <FormControl sx={{ minWidth: 300, mb: 3 }}>
            <InputLabel>Sélectionner un foyer</InputLabel>
            <Select
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              label="Sélectionner un foyer"
            >
              {households.map((household) => (
                <MenuItem key={household.id} value={household.id}>
                  {household.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Analytics Widgets */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MonthlyBalanceWidget householdId={selectedHouseholdId} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopCategoriesWidget householdId={selectedHouseholdId} />
            </Grid>
            <Grid item xs={12} md={6}>
              <BudgetStatusWidget householdId={selectedHouseholdId} />
            </Grid>
            <Grid item xs={12} md={6}>
              <AccountsStatusWidget householdId={selectedHouseholdId} />
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Mes Foyers</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/households')}
              >
                Nouveau
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : households.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                Aucun foyer. Créez-en un pour commencer !
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {households.slice(0, 3).map((household) => (
                  <Card key={household.id} variant="outlined">
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">{household.name}</Typography>
                        <Chip
                          label={household.userRole}
                          size="small"
                          color={household.userRole === 'ADMIN' ? 'primary' : 'default'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {household.members.length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalanceIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {household._count?.accounts || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/households/${household.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </CardActions>
                  </Card>
                ))}
                {households.length > 3 && (
                  <Button size="small" onClick={() => navigate('/households')}>
                    Voir tous les foyers ({households.length})
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profil
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.email}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Nom complet
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Revenu mensuel
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.monthlyIncome} €
              </Typography>

              <Button
                variant="outlined"
                color="error"
                onClick={logout}
                sx={{ mt: 3 }}
                fullWidth
              >
                Se déconnecter
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          ✅ Phase 3 terminée ! Vous pouvez maintenant gérer vos foyers et comptes.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Prochaine étape : Phase 4 - Gestion des transactions
        </Typography>
      </Box>
    </Container>
  );
}
