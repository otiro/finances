import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import * as householdService from '../services/household.service';

interface CreateHouseholdDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateHouseholdDialog({
  open,
  onClose,
  onSuccess,
}: CreateHouseholdDialogProps) {
  const [name, setName] = useState('');
  const [sharingMode, setSharingMode] = useState<'EQUAL' | 'PROPORTIONAL' | 'CUSTOM'>('EQUAL');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom du foyer est requis');
      return;
    }

    try {
      setIsLoading(true);
      await householdService.createHousehold({ name, sharingMode });
      setName('');
      setSharingMode('EQUAL');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du foyer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setSharingMode('EQUAL');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Créer un nouveau foyer</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Nom du foyer"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Famille Dupont, Colocation Paris..."
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Mode de partage</InputLabel>
            <Select
              value={sharingMode}
              label="Mode de partage"
              onChange={(e) => setSharingMode(e.target.value as any)}
              disabled={isLoading}
            >
              <MenuItem value="EQUAL">Parts égales</MenuItem>
              <MenuItem value="PROPORTIONAL">Proportionnel aux revenus</MenuItem>
              <MenuItem value="CUSTOM">Personnalisé</MenuItem>
            </Select>
          </FormControl>

          {sharingMode === 'EQUAL' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Les dépenses seront partagées à parts égales entre tous les membres.
            </Alert>
          )}
          {sharingMode === 'PROPORTIONAL' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Les dépenses seront partagées proportionnellement aux revenus de chacun.
            </Alert>
          )}
          {sharingMode === 'CUSTOM' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Vous pourrez définir des parts personnalisées pour chaque compte.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
