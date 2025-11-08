import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { useBudgetStore } from '../../store/slices/budgetSlice';
import { BudgetStatus } from '../../services/budget.service';

interface BudgetAlertDialogProps {
  open: boolean;
  onClose: () => void;
  budgetStatus: BudgetStatus | null;
  householdId: string;
}

export default function BudgetAlertDialog({
  open,
  onClose,
  budgetStatus,
  householdId,
}: BudgetAlertDialogProps) {
  const selectedBudgetAlerts = useBudgetStore((state) => state.selectedBudgetAlerts);
  const isLoading = useBudgetStore((state) => state.isLoading);
  const fetchBudgetAlerts = useBudgetStore((state) => state.fetchBudgetAlerts);

  useEffect(() => {
    if (open && budgetStatus) {
      fetchBudgetAlerts(householdId, budgetStatus.budget.id);
    }
  }, [open, budgetStatus, householdId, fetchBudgetAlerts]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getAlertColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'error';
    if (percentageUsed >= 80) return 'warning';
    return 'info';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {budgetStatus ? `Historique des alertes - ${budgetStatus.budget.name}` : 'Alertes'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedBudgetAlerts.length > 0 ? (
          <Stack spacing={2}>
            {/* Current Status Summary */}
            {budgetStatus && (
              <Box sx={{ backgroundColor: 'action.hover', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Statut Actuel
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Dépensé
                    </Typography>
                    <Typography variant="h6">
                      €{budgetStatus.currentSpent.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Budget
                    </Typography>
                    <Typography variant="h6">
                      €{parseFloat(budgetStatus.budget.amount.toString()).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Pourcentage
                    </Typography>
                    <Typography
                      variant="h6"
                      color={
                        budgetStatus.percentageUsed >= 100
                          ? 'error'
                          : budgetStatus.percentageUsed >= 80
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {budgetStatus.percentageUsed.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      État
                    </Typography>
                    <Chip
                      label={
                        budgetStatus.status === 'exceeded'
                          ? 'Dépassé'
                          : budgetStatus.thresholdReached
                          ? 'Alerte'
                          : 'Normal'
                      }
                      size="small"
                      color={
                        budgetStatus.status === 'exceeded'
                          ? 'error'
                          : budgetStatus.thresholdReached
                          ? 'warning'
                          : 'success'
                      }
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Alerts Table */}
            <Typography variant="subtitle2">
              Historique ({selectedBudgetAlerts.length} alertes)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Dépensé</TableCell>
                    <TableCell align="right">Pourcentage</TableCell>
                    <TableCell align="center">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedBudgetAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{formatDate(alert.createdAt)}</TableCell>
                      <TableCell align="right">
                        €{alert.currentSpent.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={getAlertColor(alert.percentageUsed)}
                        >
                          {alert.percentageUsed.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            alert.percentageUsed >= 100
                              ? 'Dépassé'
                              : alert.thresholdReached
                              ? 'Alerte'
                              : 'Info'
                          }
                          size="small"
                          color={
                            alert.percentageUsed >= 100
                              ? 'error'
                              : alert.thresholdReached
                              ? 'warning'
                              : 'info'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : (
          <Typography color="textSecondary">
            Aucune alerte enregistrée pour ce budget
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
