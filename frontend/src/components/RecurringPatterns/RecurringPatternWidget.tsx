import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MoreIcon from '@mui/icons-material/More';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PauseIcon from '@mui/icons-material/Pause';
import * as recurringTransactionService from '../../services/recurringTransaction.service';

interface RecurringPattern {
  id: string;
  name: string;
  amount: number | string;
  type: 'DEBIT' | 'CREDIT';
  frequency: string;
  nextGenerationDate: string;
  isActive: boolean;
  isPaused: boolean;
}

interface RecurringPatternWidgetProps {
  householdId: string;
}

/**
 * Widget affichant les prochaines transactions récurrentes
 * Affiche un résumé des patterns actifs et les 5 prochaines transactions
 */
const RecurringPatternWidget: React.FC<RecurringPatternWidgetProps> = ({
  householdId,
}) => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatterns();
  }, [householdId]);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      const data = await recurringTransactionService.getHouseholdRecurringPatterns(householdId);
      // Trier par date de prochaine génération
      const sorted = [...data].sort(
        (a, b) =>
          new Date(a.nextGenerationDate).getTime() -
          new Date(b.nextGenerationDate).getTime()
      );
      setPatterns(sorted);
      setError('');
    } catch (err: any) {
      console.error('Error loading patterns:', err);
      setError('Erreur lors du chargement des transactions récurrentes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate(`/households/${householdId}/recurring-transactions`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number | string, type: 'DEBIT' | 'CREDIT') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const sign = type === 'DEBIT' ? '-' : '+';
    return `${sign} ${num.toFixed(2)} €`;
  };

  // Calculer les statistiques
  const activePatterns = patterns.filter((p) => p.isActive && !p.isPaused);
  const pausedPatterns = patterns.filter((p) => p.isPaused);
  const nextPatterns = patterns
    .filter((p) => p.isActive && !p.isPaused)
    .slice(0, 5);

  const monthlyDebits = activePatterns
    .filter((p) => p.type === 'DEBIT')
    .reduce((sum, p) => {
      const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
      // Approximation : divisé par la fréquence
      return sum + amount;
    }, 0);

  const monthlyCredits = activePatterns
    .filter((p) => p.type === 'CREDIT')
    .reduce((sum, p) => {
      const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
      return sum + amount;
    }, 0);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transactions Récurrentes
          </Typography>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Aucune transaction récurrente configurée
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate(`/households/${householdId}/recurring-transactions`)
              }
            >
              Créer une transaction
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Transactions Récurrentes"
        subheader={`${activePatterns.length} actif${activePatterns.length > 1 ? 's' : ''}${pausedPatterns.length > 0 ? `, ${pausedPatterns.length} en pause` : ''}`}
      />

      {error && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      <CardContent>
        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="h6">{monthlyDebits.toFixed(2)}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Dépenses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6">{monthlyCredits.toFixed(2)}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Revenus
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{activePatterns.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Actifs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{pausedPatterns.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                En pause
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Prochaines transactions */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Prochaines transactions
        </Typography>

        {nextPatterns.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucune transaction récurrente prévue
          </Typography>
        ) : (
          <List disablePadding>
            {nextPatterns.map((pattern, index) => (
              <Box key={pattern.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 1.5, px: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {pattern.name}
                    </Typography>
                    {pattern.isPaused && (
                      <PauseIcon
                        fontSize="small"
                        sx={{ color: 'warning.main' }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 0.5,
                      width: '100%',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(pattern.nextGenerationDate)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color:
                          pattern.type === 'DEBIT'
                            ? 'error.main'
                            : 'success.main',
                      }}
                    >
                      {formatAmount(pattern.amount, pattern.type)}
                    </Typography>
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        <Button size="small" onClick={loadPatterns}>
          Rafraîchir
        </Button>
        {patterns.length > 0 && (
          <Button
            size="small"
            endIcon={<MoreIcon />}
            onClick={handleViewAll}
          >
            Voir tous
          </Button>
        )}
        {activePatterns.length === 0 && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate(`/households/${householdId}/recurring-transactions`)
            }
          >
            Créer
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default RecurringPatternWidget;
