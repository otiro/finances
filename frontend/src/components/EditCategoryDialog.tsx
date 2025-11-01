import { useState, useEffect } from 'react';
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
} from '@mui/material';
import * as categoryService from '../services/category.service';

interface EditCategoryDialogProps {
  open: boolean;
  householdId: string;
  category: categoryService.Category | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditCategoryDialog({
  open,
  householdId,
  category,
  onClose,
  onSuccess,
}: EditCategoryDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3357FF');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setColor(category.color);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom de la catégorie est requis');
      return;
    }

    if (!category) {
      setError('Erreur : catégorie introuvable');
      return;
    }

    try {
      setIsLoading(true);
      await categoryService.updateCategory(householdId, category.id, {
        name: name.trim(),
        color,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de la modification de la catégorie'
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
      <DialogTitle>Modifier la catégorie</DialogTitle>
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
            Enregistrer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
