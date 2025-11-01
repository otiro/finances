import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useHouseholdStore } from '../store/slices/householdSlice';
import * as transactionService from '../services/transaction.service';

interface GroupedDebts {
  [householdId: string]: {
    householdName: string;
    debts: transactionService.Debt[];
  };
}

export default function Debts() {
  const navigate = useNavigate();
  const { households } = useHouseholdStore();
  const [allDebts, setAllDebts] = useState<GroupedDebts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllDebts();
  }, []);

  const loadAllDebts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const debtsByHousehold: GroupedDebts = {};

      for (const household of households) {
        try {
          const debts = await transactionService.getHouseholdDebts(household.id);
          debtsByHousehold[household.id] = {
            householdName: household.name,
            debts: debts || [],
          };
        } catch (err) {
          console.error(`Error loading debts for household ${household.id}:`, err);
        }
      }

      setAllDebts(debtsByHousehold);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dettes');
    } finally {
      setIsLoading(false);
    }
  };

  const totalDebtAmount = Object.values(allDebts).reduce(
    (sum, household) =>
      sum + household.debts.reduce((hSum, debt) => hSum + debt.amount, 0),
    0
  );

  const getTotalUserDebts = (userId: string) => {
    return Object.values(allDebts).reduce((sum, household) => {
      return (
        sum +
        household.debts
          .filter((d) => d.debtor.id === userId)
          .reduce((dSum, debt) => dSum + debt.amount, 0)
      );
    }, 0);
  };

  const getTotalUserCredits = (userId: string) => {
    return Object.values(allDebts).reduce((sum, household) => {
      return (
        sum +
        household.debts
          .filter((d) => d.creditor.id === userId)
          .reduce((dSum, debt) => dSum + debt.amount, 0)
      );
    }, 0);
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/households')}
        sx={{ mb: 2 }}
      >
        Retour aux foyers
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dettes et remboursements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualisez qui doit combien à qui dans tous vos foyers
        </Typography>
      </Box>

      {totalDebtAmount === 0 ? (
        <Card>
          <CardContent>
            <Alert severity="success">
              Aucune dette détectée ! Tout est en ordre.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(allDebts).map(([householdId, householdData]) => (
            <Grid item xs={12} key={householdId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {householdData.householdName}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {householdData.debts.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucune dette dans ce foyer
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {householdData.debts.map((debt, index) => (
                        <Box
                          key={index}
                          sx={{
                            padding: 2,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">
                              <strong>{debt.debtor.firstName} {debt.debtor.lastName}</strong>
                              {' doit '}
                              <strong>{debt.amount.toFixed(2)} €</strong>
                              {' à '}
                              <strong>{debt.creditor.firstName} {debt.creditor.lastName}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {debt.debtor.email} → {debt.creditor.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${debt.amount.toFixed(2)} €`}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Résumé par personne
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.values(allDebts)
                    .flatMap((h) => h.debts)
                    .reduce(
                      (users: Map<string, { name: string; email: string }>, debt) => {
                        if (
                          !users.has(debt.debtor.id) &&
                          !users.has(debt.creditor.id)
                        ) {
                          users.set(debt.debtor.id, {
                            name: `${debt.debtor.firstName} ${debt.debtor.lastName}`,
                            email: debt.debtor.email,
                          });
                          users.set(debt.creditor.id, {
                            name: `${debt.creditor.firstName} ${debt.creditor.lastName}`,
                            email: debt.creditor.email,
                          });
                        }
                        return users;
                      },
                      new Map()
                    )
                    .entries()
                    .map(([userId, user]) => {
                      const owes = getTotalUserDebts(userId);
                      const owed = getTotalUserCredits(userId);
                      const net = owed - owes;

                      return (
                        <Box
                          key={userId}
                          sx={{
                            padding: 2,
                            backgroundColor: net > 0 ? '#e8f5e9' : net < 0 ? '#ffebee' : '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="body1">
                              <strong>{user.name}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body2"
                              color={net > 0 ? 'success.main' : net < 0 ? 'error.main' : 'text.secondary'}
                            >
                              <strong>
                                {net > 0 ? '+' : ''}{net.toFixed(2)} €
                              </strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({owes > 0 ? `doit ${owes.toFixed(2)} €` : ''} {owes > 0 && owed > 0 ? '• ' : ''} {owed > 0 ? `dû ${owed.toFixed(2)} €` : ''})
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
