import { useState } from 'react';
import {
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAppDispatch } from '../../store/hooks';
import {
  deleteRecurringPattern,
  pauseRecurringPattern,
  resumeRecurringPattern,
} from '../../store/slices/recurringTransactionSlice';
import RecurringPatternCard from './RecurringPatternCard';
import EditRecurringPatternDialog from '../Dialogs/EditRecurringPatternDialog';
import DeleteConfirmDialog from '../Dialogs/DeleteConfirmDialog';
import GenerationLogsModal from '../Dialogs/GenerationLogsModal';
import type { RecurringPattern } from '../../services/recurringTransaction.service';

interface RecurringPatternsListProps {
  patterns: RecurringPattern[];
  householdId: string;
  onRefresh: () => void;
}

type FrequencyFilter = 'ALL' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
type StatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED' | 'INACTIVE';

/**
 * Liste de toutes les transactions récurrentes d'un foyer
 */
const RecurringPatternsList: React.FC<RecurringPatternsListProps> = ({
  patterns,
  householdId,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [editingPattern, setEditingPattern] = useState<RecurringPattern | null>(null);
  const [deletingPattern, setDeletingPattern] = useState<RecurringPattern | null>(null);
  const [viewingLogsPattern, setViewingLogsPattern] = useState<RecurringPattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter patterns
  const filteredPatterns = patterns.filter((pattern) => {
    // Frequency filter
    if (frequencyFilter !== 'ALL' && pattern.frequency !== frequencyFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE' && (!pattern.isActive || pattern.isPaused)) {
        return false;
      }
      if (statusFilter === 'PAUSED' && !pattern.isPaused) {
        return false;
      }
      if (statusFilter === 'INACTIVE' && pattern.isActive && !pattern.isPaused) {
        return false;
      }
    }

    return true;
  });

  // Handle pause
  const handlePause = async (pattern: RecurringPattern) => {
    if (pattern.isPaused) {
      setIsLoading(true);
      try {
        await dispatch(
          resumeRecurringPattern({ householdId, patternId: pattern.id })
        ).unwrap();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        await dispatch(
          pauseRecurringPattern({ householdId, patternId: pattern.id })
        ).unwrap();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle delete
  const handleDelete = async (pattern: RecurringPattern) => {
    setIsLoading(true);
    try {
      await dispatch(
        deleteRecurringPattern({ householdId, patternId: pattern.id })
      ).unwrap();
      setDeletingPattern(null);
      onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEditPattern = (pattern: RecurringPattern) => {
    setEditingPattern(pattern);
  };

  const handleEditClose = () => {
    setEditingPattern(null);
  };

  const handleEditSave = async () => {
    handleEditClose();
    onRefresh();
  };

  // Handle view logs
  const handleViewLogs = (pattern: RecurringPattern) => {
    setViewingLogsPattern(pattern);
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <FilterListIcon sx={{ color: 'textSecondary' }} />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Fréquence</InputLabel>
          <Select
            value={frequencyFilter}
            label="Fréquence"
            onChange={(e) => setFrequencyFilter(e.target.value as FrequencyFilter)}
          >
            <MenuItem value="ALL">Toutes les fréquences</MenuItem>
            <MenuItem value="DAILY">Quotidien</MenuItem>
            <MenuItem value="WEEKLY">Hebdomadaire</MenuItem>
            <MenuItem value="BIWEEKLY">Bi-hebdomadaire</MenuItem>
            <MenuItem value="MONTHLY">Mensuel</MenuItem>
            <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
            <MenuItem value="YEARLY">Annuel</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="ALL">Tous les statuts</MenuItem>
            <MenuItem value="ACTIVE">Actifs</MenuItem>
            <MenuItem value="PAUSED">Pausés</MenuItem>
            <MenuItem value="INACTIVE">Inactifs</MenuItem>
          </Select>
        </FormControl>

        {(frequencyFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setFrequencyFilter('ALL');
              setStatusFilter('ALL');
            }}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </Box>

      {/* Results count */}
      {filteredPatterns.length > 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {filteredPatterns.length} pattern{filteredPatterns.length > 1 ? 's' : ''} trouvé{filteredPatterns.length > 1 ? 's' : ''}
        </Typography>
      )}

      {/* Grid of cards */}
      {filteredPatterns.length > 0 ? (
        <Grid container spacing={2}>
          {filteredPatterns.map((pattern) => (
            <Grid item xs={12} sm={6} md={4} key={pattern.id}>
              <RecurringPatternCard
                pattern={pattern}
                onEdit={() => handleEditPattern(pattern)}
                onDelete={() => setDeletingPattern(pattern)}
                onPause={() => handlePause(pattern)}
                onResume={() => handlePause(pattern)}
                onViewLogs={() => handleViewLogs(pattern)}
                isLoading={isLoading}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <Typography color="textSecondary">
            Aucune transaction récurrente correspond à ces critères
          </Typography>
        </Box>
      )}

      {/* Edit Dialog */}
      {editingPattern && (
        <EditRecurringPatternDialog
          open={!!editingPattern}
          onClose={handleEditClose}
          pattern={editingPattern}
          householdId={householdId}
          onPatternUpdated={handleEditSave}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deletingPattern && (
        <DeleteConfirmDialog
          open={!!deletingPattern}
          patternName={deletingPattern.name}
          onConfirm={() => handleDelete(deletingPattern)}
          onCancel={() => setDeletingPattern(null)}
          isLoading={isLoading}
        />
      )}

      {/* View Logs Modal */}
      {viewingLogsPattern && (
        <GenerationLogsModal
          open={!!viewingLogsPattern}
          onClose={() => setViewingLogsPattern(null)}
          pattern={viewingLogsPattern}
          householdId={householdId}
        />
      )}
    </Box>
  );
};

export default RecurringPatternsList;
