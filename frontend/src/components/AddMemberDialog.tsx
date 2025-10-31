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

interface AddMemberDialogProps {
  open: boolean;
  householdId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddMemberDialog({
  open,
  householdId,
  onClose,
  onSuccess,
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    try {
      setIsLoading(true);
      await householdService.addMemberToHousehold(householdId, { email, role });
      setEmail('');
      setRole('MEMBER');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du membre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setRole('MEMBER');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un membre au foyer</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            L'utilisateur doit déjà avoir un compte sur l'application.
          </Alert>

          <TextField
            autoFocus
            margin="dense"
            label="Email de l'utilisateur"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="exemple@email.com"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={role}
              label="Rôle"
              onChange={(e) => setRole(e.target.value as any)}
              disabled={isLoading}
            >
              <MenuItem value="MEMBER">Membre</MenuItem>
              <MenuItem value="ADMIN">Administrateur</MenuItem>
            </Select>
          </FormControl>

          {role === 'ADMIN' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Les administrateurs peuvent ajouter/retirer des membres et modifier les paramètres du foyer.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
