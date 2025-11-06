import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../store/slices/budgetSlice';
import { useAccountStore } from '../store/slices/accountSlice';
import BudgetFormDialog from '../components/Budgets/BudgetFormDialog';
import BudgetProgressCard from '../components/Budgets/BudgetProgressCard';
import BudgetAlertDialog from '../components/Budgets/BudgetAlertDialog';
import { BudgetStatus } from '../services/budget.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Budgets() {
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();

  // Store
  const budgets = useBudgetStore((state) => state.budgets);
  const budgetsSummary = useBudgetStore((state) => state.budgetsSummary);
  const isLoading = useBudgetStore((state) => state.isLoading);
  const error = useBudgetStore((state) => state.error);
  const fetchHouseholdBudgets = useBudgetStore((state) => state.fetchHouseholdBudgets);
  const fetchHouseholdBudgetsSummary = useBudgetStore((state) => state.fetchHouseholdBudgetsSummary);
  const deleteBudget = useBudgetStore((state) => state.deleteBudget);
  const clearSelectedBudget = useBudgetStore((state) => state.clearSelectedBudget);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAlertsDialog, setOpenAlertsDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetStatus | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Load budgets on mount
  useEffect(() => {
    if (householdId) {
      fetchHouseholdBudgets(householdId);
      fetchHouseholdBudgetsSummary(householdId);
    }
  }, [householdId, fetchHouseholdBudgets, fetchHouseholdBudgetsSummary]);

  // Handle create budget
  const handleCreateBudget = () => {
    setEditingBudgetId(null);
    setOpenFormDialog(true);
  };

  // Handle edit budget
  const handleEditBudget = async (budget: BudgetStatus) => {
    setSelectedBudget(budget);
    setEditingBudgetId(budget.budget.id);
    setOpenFormDialog(true);
  };

  // Handle delete budget
  const handleDeleteClick = (budget: BudgetStatus) => {
    setSelectedBudget(budget);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (selectedBudget && householdId) {
      try {
        await deleteBudget(householdId, selectedBudget.budget.id);
        setOpenDeleteDialog(false);
        setSelectedBudget(null);
      } catch (err) {
        console.error('Erreur lors de la suppression du budget:', err);
      }
    }
  };

  // Handle view alerts
  const handleViewAlerts = (budget: BudgetStatus) => {
    setSelectedBudget(budget);
    setOpenAlertsDialog(true);
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage: number): 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'info';
    return 'success';
  };

  // Get status badge
  const getStatusBadge = (status: BudgetStatus) => {
    if (!status.budget.isActive) {
      return <Chip label="Inactif" size="small" color="default" />;
    }
    if (status.status === 'exceeded') {
      return <Chip label="Dépassé" size="small" color="error" />;
    }
    if (status.thresholdReached) {
      return <Chip label="Alerte" size="small" color="warning" />;
    }
    return <Chip label="Normal" size="small" color="success" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Retour au foyer">
            <IconButton
              onClick={() => navigate(`/households/${householdId}`)}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            Budgets
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBudget}
          disabled={isLoading}
        >
          Nouveau Budget
        </Button>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => clearSelectedBudget()} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          aria-label="budget tabs"
        >
          <Tab label="Vue d'ensemble" id="budget-tab-0" aria-controls="budget-tabpanel-0" />
          <Tab label="Liste" id="budget-tab-1" aria-controls="budget-tabpanel-1" />
          <Tab label="Statistiques" id="budget-tab-2" aria-controls="budget-tabpanel-2" />
        </Tabs>
      </Paper>

      {isLoading && tabValue === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            {budgetsSummary ? (
              <Grid container spacing={3}>
                {/* Statistics Cards */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Budget Total
                      </Typography>
                      <Typography variant="h5">
                        €{budgetsSummary.statistics.totalBudgeted.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Dépensé
                      </Typography>
                      <Typography variant="h5">
                        €{budgetsSummary.statistics.totalSpent.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {budgetsSummary.statistics.percentageUsed.toFixed(1)}% utilisé
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Budgets Actifs
                      </Typography>
                      <Typography variant="h5">
                        {budgetsSummary.statistics.activeCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Alertes
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`Dépassés: ${budgetsSummary.statistics.budgetsExceeded}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                        <Chip
                          label={`Seuil: ${budgetsSummary.statistics.budgetsNearThreshold}`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Budgets Grid */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Budgets par Catégorie
                  </Typography>
                  <Grid container spacing={2}>
                    {budgetsSummary.budgets.map((budgetStatus) => (
                      <Grid item xs={12} sm={6} md={4} key={budgetStatus.budget.id}>
                        <BudgetProgressCard
                          budgetStatus={budgetStatus}
                          onEdit={() => handleEditBudget(budgetStatus)}
                          onDelete={() => handleDeleteClick(budgetStatus)}
                          onViewAlerts={() => handleViewAlerts(budgetStatus)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Typography>Aucun budget créé</Typography>
            )}
          </TabPanel>

          {/* List Tab */}
          <TabPanel value={tabValue} index={1}>
            {budgets.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Catégorie</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell align="center">Période</TableCell>
                      <TableCell align="right">Dépensé</TableCell>
                      <TableCell align="center">%</TableCell>
                      <TableCell align="center">État</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => {
                      const budgetStatus = budgetsSummary?.budgets.find(
                        (b) => b.budget.id === budget.id
                      );
                      return (
                        <TableRow key={budget.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {budget.category?.color && (
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: budget.category.color,
                                  }}
                                />
                              )}
                              {budget.name}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            €{parseFloat(budget.amount.toString()).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            {budget.period === 'MONTHLY' && 'Mensuel'}
                            {budget.period === 'QUARTERLY' && 'Trimestriel'}
                            {budget.period === 'YEARLY' && 'Annuel'}
                          </TableCell>
                          <TableCell align="right">
                            {budgetStatus ? `€${budgetStatus.currentSpent.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell align="center">
                            {budgetStatus ? `${budgetStatus.percentageUsed.toFixed(1)}%` : '—'}
                          </TableCell>
                          <TableCell align="center">
                            {budgetStatus && getStatusBadge(budgetStatus)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Éditer">
                              <IconButton
                                size="small"
                                onClick={() => budgetStatus && handleEditBudget(budgetStatus)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => budgetStatus && handleDeleteClick(budgetStatus)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Aucun budget créé</Typography>
            )}
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={2}>
            {budgetsSummary && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Utilisation Globale
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budgetsSummary.statistics.percentageUsed, 100)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {budgetsSummary.statistics.percentageUsed.toFixed(1)}% des budgets utilisés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {budgetsSummary.budgets.map((budgetStatus) => (
                  <Grid item xs={12} sm={6} key={budgetStatus.budget.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {budgetStatus.budget.name}
                        </Typography>
                        <Stack sx={{ mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(budgetStatus.percentageUsed, 100)}
                            color={getProgressColor(budgetStatus.percentageUsed) as any}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            €{budgetStatus.currentSpent.toFixed(2)} / €{parseFloat(budgetStatus.budget.amount.toString()).toFixed(2)}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          color={budgetStatus.status === 'exceeded' ? 'error' : 'textSecondary'}
                        >
                          {budgetStatus.percentageUsed >= 100
                            ? `Dépassé de €${Math.abs(budgetStatus.remaining).toFixed(2)}`
                            : `Restant: €${budgetStatus.remaining.toFixed(2)}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </>
      )}

      {/* Dialogs */}
      <BudgetFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setEditingBudgetId(null);
          setSelectedBudget(null);
        }}
        householdId={householdId!}
        editingBudget={editingBudgetId ? budgets.find((b) => b.id === editingBudgetId) : null}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le budget "{selectedBudget?.budget.name}" ?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <BudgetAlertDialog
        open={openAlertsDialog}
        onClose={() => setOpenAlertsDialog(false)}
        budgetStatus={selectedBudget}
        householdId={householdId!}
      />
    </Box>
  );
}
