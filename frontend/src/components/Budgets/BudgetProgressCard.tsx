import {
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { BudgetStatus } from '../../services/budget.service';

interface BudgetProgressCardProps {
  budgetStatus: BudgetStatus;
  onEdit: () => void;
  onDelete: () => void;
  onViewAlerts: () => void;
}

export default function BudgetProgressCard({
  budgetStatus,
  onEdit,
  onDelete,
  onViewAlerts,
}: BudgetProgressCardProps) {
  const { budget, currentSpent, percentageUsed, remaining, status } = budgetStatus;

  const getProgressColor = (): 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (percentageUsed >= 100) return 'error';
    if (percentageUsed >= budget.alertThreshold) return 'warning';
    if (percentageUsed >= 60) return 'info';
    return 'success';
  };

  const getStatusColor = (): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!budget.isActive) return 'default';
    if (status === 'exceeded') return 'error';
    if (budgetStatus.thresholdReached) return 'warning';
    return 'success';
  };

  const getStatusLabel = (): string => {
    if (!budget.isActive) return 'Inactif';
    if (status === 'exceeded') return 'Dépassé';
    if (budgetStatus.thresholdReached) return 'Alerte';
    return 'Normal';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: `4px solid ${
          budget.category?.color || '#3f51b5'
        }`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header */}
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" component="div">
                {budget.name}
              </Typography>
            </Stack>
            {budget.description && (
              <Typography variant="body2" color="textSecondary">
                {budget.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={getStatusLabel()}
            size="small"
            color={getStatusColor()}
            variant={budget.isActive ? 'filled' : 'outlined'}
          />
        </Stack>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Dépensé
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              €{currentSpent.toFixed(2)} / €{parseFloat(budget.amount.toString()).toFixed(2)}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentageUsed, 100)}
            color={getProgressColor()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.disabledBackground',
            }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {percentageUsed.toFixed(1)}% utilisé
          </Typography>
        </Box>

        {/* Remaining or Exceeded */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: status === 'exceeded' ? 'error.light' : 'success.light',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            color={status === 'exceeded' ? 'error.dark' : 'success.dark'}
            fontWeight={500}
          >
            {status === 'exceeded'
              ? `Dépassé de €${Math.abs(remaining).toFixed(2)}`
              : `Restant: €${remaining.toFixed(2)}`}
          </Typography>
        </Box>

        {/* Budget Period Info */}
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            {budget.period === 'MONTHLY' && '📅 Mensuel'}
            {budget.period === 'QUARTERLY' && '📊 Trimestriel'}
            {budget.period === 'YEARLY' && '📈 Annuel'}
          </Typography>
          {budget.alertEnabled && (
            <Typography variant="caption" color="textSecondary">
              🔔 Alerte à {budget.alertThreshold}%
            </Typography>
          )}
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
        <Tooltip title="Voir les alertes">
          <IconButton
            size="small"
            onClick={onViewAlerts}
            color="info"
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Éditer">
          <IconButton
            size="small"
            onClick={onEdit}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            size="small"
            onClick={onDelete}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
