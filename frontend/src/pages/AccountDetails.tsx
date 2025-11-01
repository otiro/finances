import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAccountStore } from '../store/slices/accountSlice';
import * as accountService from '../services/account.service';

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAccount, isLoading } = useAccountStore();
  const [balance, setBalance] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (id) {
      loadAccountData();
    }
  }, [id]);

  const loadAccountData = async () => {
    try {
      if (id) {
        await accountService.getAccountById(id);
        loadBalance();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    }
  };

  const loadBalance = async () => {
    if (!id) return;
    setLoadingBalance(true);
    try {
      const balanceData = await accountService.getAccountBalance(id);
      setBalance(balanceData);
    } catch (err: any) {
      console.error('Error loading balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return 'Compte courant';
      case 'JOINT':
        return 'Joint';
      case 'SAVINGS':
        return 'Épargne';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'success' => {
    switch (type) {
      case 'CHECKING':
        return 'primary';
      case 'JOINT':
        return 'secondary';
      case 'SAVINGS':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading && !currentAccount) {
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

  if (!currentAccount) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Compte non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/accounts')}
        sx={{ mb: 2 }}
      >
        Retour aux comptes
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {currentAccount.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={getTypeLabel(currentAccount.type)} color={getTypeColor(currentAccount.type)} />
          {currentAccount.household && (
            <Chip label={currentAccount.household.name} variant="outlined" />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du compte
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Solde initial
                </Typography>
                <Typography variant="h5">
                  {currentAccount.initialBalance.toFixed(2)} €
                </Typography>
              </Box>

              {balance && !loadingBalance && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Solde actuel
                  </Typography>
                  <Typography variant="h5" color={balance.currentBalance >= 0 ? 'success.main' : 'error.main'}>
                    {balance.currentBalance.toFixed(2)} €
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {balance.transactionCount} transaction{balance.transactionCount > 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}

              {loadingBalance && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Propriétaires
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {currentAccount.owners.map((owner, index) => (
                  <Box key={owner.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={`${owner.user.firstName} ${owner.user.lastName}`}
                        secondary={owner.user.email}
                      />
                      <Chip
                        label={`${owner.ownershipPercentage}%`}
                        color="primary"
                        size="small"
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transactions récentes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {currentAccount.transactions && currentAccount.transactions.length > 0 ? (
                <List>
                  {currentAccount.transactions.map((transaction: any) => (
                    <ListItem key={transaction.id}>
                      <ListItemText
                        primary={transaction.description || 'Transaction'}
                        secondary={new Date(transaction.transactionDate).toLocaleDateString('fr-FR')}
                      />
                      <Typography
                        variant="body1"
                        color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'CREDIT' ? '+' : '-'}
                        {transaction.amount} €
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Aucune transaction enregistrée. Les transactions seront disponibles dans la Phase 4.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
