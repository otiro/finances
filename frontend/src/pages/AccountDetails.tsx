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
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useAccountStore } from '../store/slices/accountSlice';
import * as accountService from '../services/account.service';
import * as transactionService from '../services/transaction.service';
import * as categoryService from '../services/category.service';
import UpdateAccountOwnersDialog from '../components/UpdateAccountOwnersDialog';
import AddTransactionDialog from '../components/AddTransactionDialog';
import EditTransactionDialog from '../components/EditTransactionDialog';
import TransactionFilters, { TransactionFiltersState } from '../components/TransactionFilters';

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAccount, isLoading } = useAccountStore();
  const [balance, setBalance] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [updateOwnersDialogOpen, setUpdateOwnersDialogOpen] = useState(false);
  const [addTransactionDialogOpen, setAddTransactionDialogOpen] = useState(false);
  const [editTransactionDialogOpen, setEditTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<transactionService.Transaction | null>(null);
  const [transactions, setTransactions] = useState<transactionService.Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [categories, setCategories] = useState<categoryService.Category[]>([]);
  const [filters, setFilters] = useState<TransactionFiltersState>({
    type: 'ALL',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

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
        loadTransactions();
        loadCategories();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    }
  };

  const loadCategories = async () => {
    try {
      if (currentAccount?.household?.id) {
        const result = await categoryService.getAllAvailableCategories(
          currentAccount.household.id
        );
        const allCategories = [...(result.system || []), ...(result.household || [])];
        setCategories(allCategories);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
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

  const loadTransactions = async () => {
    if (!id) return;
    setLoadingTransactions(true);
    try {
      const result = await transactionService.getAccountTransactions(id, 10, 0);
      setTransactions(result.transactions);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleEditTransaction = (transaction: transactionService.Transaction) => {
    setEditingTransaction(transaction);
    setEditTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!id) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return;

    try {
      await transactionService.deleteTransaction(id, transactionId);
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      loadBalance();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      // Filter by type
      if (filters.type !== 'ALL' && transaction.type !== filters.type) {
        return false;
      }

      // Filter by category
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      // Filter by start date
      if (filters.startDate) {
        const txDate = new Date(transaction.transactionDate);
        const startDate = new Date(filters.startDate);
        if (txDate < startDate) {
          return false;
        }
      }

      // Filter by end date
      if (filters.endDate) {
        const txDate = new Date(transaction.transactionDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (txDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Propriétaires
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setUpdateOwnersDialogOpen(true)}
                >
                  Gérer
                </Button>
              </Box>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Transactions
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddTransactionDialogOpen(true)}
                  size="small"
                >
                  Ajouter
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Filters Section */}
              <TransactionFilters
                filters={filters}
                categories={categories}
                onFiltersChange={setFilters}
              />

              {loadingTransactions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : transactions && transactions.length > 0 ? (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} sur {transactions.length}
                  </Typography>
                  <List>
                    {filteredTransactions.map((transaction: any, index: number) => {
                      const categoryName = transaction.category?.name;
                      return (
                        <Box key={transaction.id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                <Typography
                                  variant="body1"
                                  color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                                  sx={{ minWidth: '90px', textAlign: 'right', mr: 1, fontWeight: 500 }}
                                >
                                  {transaction.type === 'CREDIT' ? '+' : '-'}
                                  {Number(transaction.amount).toFixed(2)} €
                                </Typography>
                                <IconButton
                                  edge="end"
                                  onClick={() => handleEditTransaction(transaction)}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <span>{transaction.description || 'Transaction'}</span>
                                  {categoryName && (
                                    <Chip
                                      label={categoryName}
                                      size="small"
                                      sx={{
                                        backgroundColor: transaction.category?.color || '#ccc',
                                        color: '#fff',
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={`${new Date(transaction.transactionDate).toLocaleDateString('fr-FR')} à ${new Date(transaction.transactionDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • ${transaction.user.firstName} ${transaction.user.lastName}`}
                            />
                          </ListItem>
                        </Box>
                      );
                    })}
                  </List>
                </>
              ) : (
                <Alert severity="info">
                  Aucune transaction enregistrée. Cliquez sur "Ajouter" pour en créer une.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {currentAccount && currentAccount.household && (
        <UpdateAccountOwnersDialog
          open={updateOwnersDialogOpen}
          accountId={currentAccount.id}
          currentOwners={currentAccount.owners}
          household={currentAccount.household as any}
          onClose={() => setUpdateOwnersDialogOpen(false)}
          onSuccess={loadAccountData}
        />
      )}

      <AddTransactionDialog
        open={addTransactionDialogOpen}
        accountId={id || ''}
        householdId={currentAccount?.household?.id || ''}
        onClose={() => setAddTransactionDialogOpen(false)}
        onSuccess={() => {
          setAddTransactionDialogOpen(false);
          loadTransactions();
          loadBalance();
        }}
      />

      <EditTransactionDialog
        open={editTransactionDialogOpen}
        accountId={id || ''}
        householdId={currentAccount?.household?.id || ''}
        transaction={editingTransaction}
        onClose={() => {
          setEditTransactionDialogOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          setEditTransactionDialogOpen(false);
          setEditingTransaction(null);
          loadTransactions();
          loadBalance();
        }}
      />
    </Container>
  );
}
