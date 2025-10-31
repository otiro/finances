import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useHouseholdStore } from '../store/slices/householdSlice';
import * as householdService from '../services/household.service';
import * as accountService from '../services/account.service';

export default function Accounts() {
  const navigate = useNavigate();
  const { households, isLoading } = useHouseholdStore();
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await householdService.getUserHouseholds();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    if (households.length > 0) {
      loadAllAccounts();
    }
  }, [households]);

  const loadAllAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const accountPromises = households.map((household) =>
        accountService.getHouseholdAccounts(household.id)
      );
      const accountsArrays = await Promise.all(accountPromises);
      const flatAccounts = accountsArrays.flat();
      setAllAccounts(flatAccounts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des comptes');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return 'Personnel';
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
      case 'PERSONAL':
        return 'primary';
      case 'JOINT':
        return 'secondary';
      case 'SAVINGS':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading || loadingAccounts) {
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
      <Typography variant="h4" component="h1" gutterBottom>
        Tous les comptes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {allAccounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun compte trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez un foyer et ajoutez des comptes pour commencer.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom du compte</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Foyer</TableCell>
                <TableCell>Propriétaires</TableCell>
                <TableCell align="right">Solde initial</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="body1">{account.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(account.type)}
                      color={getTypeColor(account.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {account.household?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {account.owners.map((owner: any, index: number) => (
                      <Box key={owner.id}>
                        {owner.user.firstName} {owner.user.lastName}
                        {owner.ownershipShare && ` (${owner.ownershipShare}%)`}
                        {index < account.owners.length - 1 && ', '}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">
                      {account.initialBalance.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/accounts/${account.id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
