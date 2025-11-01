import { useState, useEffect } from 'react';
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
import * as categoryService from '../services/category.service';
import { Category } from '../services/category.service';

interface EditTransactionDialogProps {
  open: boolean;
  accountId: string;
  householdId: string;
  transaction: transactionService.Transaction | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTransactionDialog({
  open,
  accountId,
  householdId,
  transaction,
  onClose,
  onSuccess,
}: EditTransactionDialogProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (open && transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId || '');
      setTransactionDate(new Date(transaction.transactionDate).toISOString().slice(0, 16));
      setNotes(transaction.notes || '');
      loadCategories();
    }
  }, [open, transaction]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const result = await categoryService.getAllAvailableCategories(householdId);
      const allCategories = [...(result.system || []), ...(result.household || [])];
      setCategories(allCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

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

    if (!transaction) {
      setError('Erreur : transaction introuvable');
      return;
    }

    try {
      setIsLoading(true);
      await transactionService.updateTransaction(accountId, transaction.id, {
        amount: parsedAmount,
        type,
        description: description.trim(),
        categoryId: categoryId || undefined,
        transactionDate: new Date(transactionDate).toISOString(),
        notes: notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de la modification de la transaction'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier la transaction</DialogTitle>
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

          <FormControl fullWidth disabled={categoriesLoading || isLoading}>
            <InputLabel>Catégorie (optionnel)</InputLabel>
            <Select
              value={categoryId}
              label="Catégorie (optionnel)"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">Aucune catégorie</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cat.color && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                        }}
                      />
                    )}
                    {cat.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date et heure"
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().slice(0, 16) }}
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
            Enregistrer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
