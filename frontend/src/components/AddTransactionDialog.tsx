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
  Box,
  Typography,
} from '@mui/material';
import * as transactionService from '../services/transaction.service';

interface AddTransactionDialogProps {
  open: boolean;
  accountId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTransactionDialog({
  open,
  accountId,
  onClose,
  onSuccess,
}: AddTransactionDialogProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!amount.trim()) {
      setError('Le montant est requis');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Le montant doit être un nombre positif');
      return;
    }

    if (!description.trim()) {
      setError('La description est requise');
      return;
    }

    if (!transactionDate) {
      setError('La date est requise');
      return;
    }

    try {
      setIsLoading(true);
      await transactionService.createTransaction(accountId, {
        amount: parsedAmount,
        type,
        description: description.trim(),
        transactionDate: new Date(transactionDate).toISOString(),
        notes: notes.trim() || undefined,
      });

      // Reset form
      setAmount('');
      setType('DEBIT');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de la création de la transaction'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setAmount('');
      setType('DEBIT');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter une transaction</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as 'DEBIT' | 'CREDIT')}
              disabled={isLoading}
            >
              <MenuItem value="DEBIT">
                <Typography>Dépense</Typography>
              </MenuItem>
              <MenuItem value="CREDIT">
                <Typography>Revenu</Typography>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Montant"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            multiline
            rows={2}
            required
          />

          <TextField
            label="Date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
          />

          <TextField
            label="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            multiline
            rows={2}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !amount || !description}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            Ajouter
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
