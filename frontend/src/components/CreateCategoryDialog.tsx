import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import * as categoryService from '../services/category.service';

interface CreateCategoryDialogProps {
  open: boolean;
  householdId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCategoryDialog({
  open,
  householdId,
  onClose,
  onSuccess,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3357FF');
  const [isSalaryCategory, setIsSalaryCategory] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    try {
      setIsLoading(true);
      await categoryService.createCategory(householdId, {
        name: name.trim(),
        color,
        isSalaryCategory,
      });

      // Reset form
      setName('');
      setColor('#3357FF');
      setIsSalaryCategory(false);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de la création de la catégorie'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setName('');
      setColor('#3357FF');
      setIsSalaryCategory(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Créer une catégorie</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nom de la catégorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
            fullWidth
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Couleur :</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading}
                style={{ width: 50, height: 40, cursor: 'pointer' }}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {color}
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={isSalaryCategory}
                onChange={(e) => setIsSalaryCategory(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Marquer comme catégorie de salaire"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !name}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            Créer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
