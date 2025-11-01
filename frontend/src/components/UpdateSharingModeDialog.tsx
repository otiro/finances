import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import * as householdService from '../services/household.service';

interface UpdateSharingModeDialogProps {
  open: boolean;
  householdId: string;
  currentMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM';
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdateSharingModeDialog({
  open,
  householdId,
  currentMode,
  onClose,
  onSuccess,
}: UpdateSharingModeDialogProps) {
  const [sharingMode, setSharingMode] = useState<'EQUAL' | 'PROPORTIONAL' | 'CUSTOM'>(currentMode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (sharingMode === currentMode) {
      setError('Le nouveau mode est identique au mode actuel');
      return;
    }

    try {
      setIsLoading(true);
      await householdService.updateHouseholdSharingMode(householdId, sharingMode);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du mode de partage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSharingMode(currentMode);
      setError('');
      onClose();
    }
  };

  const getModeDescription = (mode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM') => {
    switch (mode) {
      case 'EQUAL':
        return 'Parts égales pour tous les propriétaires (50/50, 33/33/33, etc.)';
      case 'PROPORTIONAL':
        return 'Parts calculées proportionnellement aux revenus mensuels de chacun';
      case 'CUSTOM':
        return 'Parts personnalisées (à définir manuellement)';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier le mode de partage</DialogTitle>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            Mode actuel: <strong>{getModeDescription(currentMode)}</strong>
          </Alert>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nouveau mode de partage</InputLabel>
            <Select
              value={sharingMode}
              label="Nouveau mode de partage"
              onChange={(e) => setSharingMode(e.target.value as any)}
              disabled={isLoading}
            >
              <MenuItem value="EQUAL">Parts égales</MenuItem>
              <MenuItem value="PROPORTIONAL">Proportionnel aux revenus</MenuItem>
              <MenuItem value="CUSTOM">Personnalisé</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="warning">
            <strong>Attention:</strong> {getModeDescription(sharingMode)}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading || sharingMode === currentMode}>
            {isLoading ? <CircularProgress size={24} /> : 'Modifier'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
