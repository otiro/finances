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
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import * as accountService from '../services/account.service';
import { Household } from '../store/slices/householdSlice';

interface CreateAccountDialogProps {
  open: boolean;
  household: Household;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAccountDialog({
  open,
  household,
  onClose,
  onSuccess,
}: CreateAccountDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'PERSONAL' | 'JOINT' | 'SAVINGS'>('PERSONAL');
  const [initialBalance, setInitialBalance] = useState('0');
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom du compte est requis');
      return;
    }

    if (selectedOwners.length === 0) {
      setError('Vous devez sélectionner au moins un propriétaire');
      return;
    }

    try {
      setIsLoading(true);
      await accountService.createAccount({
        name,
        type,
        householdId: household.id,
        initialBalance: parseFloat(initialBalance) || 0,
        ownerIds: selectedOwners,
      });
      setName('');
      setType('PERSONAL');
      setInitialBalance('0');
      setSelectedOwners([]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setType('PERSONAL');
      setInitialBalance('0');
      setSelectedOwners([]);
      setError('');
      onClose();
    }
  };

  const toggleOwner = (userId: string) => {
    setSelectedOwners((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Créer un nouveau compte</DialogTitle>
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
            label="Nom du compte"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Compte courant, Livret A..."
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type de compte</InputLabel>
            <Select
              value={type}
              label="Type de compte"
              onChange={(e) => setType(e.target.value as any)}
              disabled={isLoading}
            >
              <MenuItem value="PERSONAL">Personnel</MenuItem>
              <MenuItem value="JOINT">Joint</MenuItem>
              <MenuItem value="SAVINGS">Épargne</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Solde initial"
            type="number"
            fullWidth
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            disabled={isLoading}
            inputProps={{ step: '0.01' }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Propriétaires du compte
            </Typography>
            {household.members.map((member) => (
              <FormControlLabel
                key={member.userId}
                control={
                  <Checkbox
                    checked={selectedOwners.includes(member.userId)}
                    onChange={() => toggleOwner(member.userId)}
                    disabled={isLoading}
                  />
                }
                label={`${member.user.firstName} ${member.user.lastName} (${member.user.email})`}
              />
            ))}
          </Box>

          {selectedOwners.length > 0 && (
            <Alert severity="info">
              Les parts de propriété seront calculées automatiquement selon le mode de partage du foyer ({household.sharingMode === 'EQUAL' ? 'Parts égales' : household.sharingMode === 'PROPORTIONAL' ? 'Proportionnel aux revenus' : 'Personnalisé'}).
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
