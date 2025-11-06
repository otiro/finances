import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Autocomplete,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBudgetSchema } from '../../utils/validators';
import { useBudgetStore } from '../../store/slices/budgetSlice';
import { useAccountStore } from '../../store/slices/accountSlice';
import { Budget, CreateBudgetInput } from '../../services/budget.service';

interface BudgetFormDialogProps {
  open: boolean;
  onClose: () => void;
  householdId: string;
  editingBudget?: Budget | null;
}

interface BudgetFormData extends CreateBudgetInput {
  categoryId: string;
}

// TODO: Import from a unified categories service when available
const MOCK_CATEGORIES = [
  { id: '1', name: 'Alimentation', color: '#FF6B6B' },
  { id: '2', name: 'Transport', color: '#4ECDC4' },
  { id: '3', name: 'Loisirs', color: '#45B7D1' },
  { id: '4', name: 'Santé', color: '#FFA07A' },
  { id: '5', name: 'Logement', color: '#98D8C8' },
  { id: '6', name: 'Éducation', color: '#F7DC6F' },
];

export default function BudgetFormDialog({
  open,
  onClose,
  householdId,
  editingBudget,
}: BudgetFormDialogProps) {
  const createBudget = useBudgetStore((state) => state.createBudget);
  const updateBudget = useBudgetStore((state) => state.updateBudget);
  const isLoading = useBudgetStore((state) => state.isLoading);
  const error = useBudgetStore((state) => state.error);

  const [categories] = useState(MOCK_CATEGORIES);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: editingBudget ? {
      categoryId: editingBudget.categoryId,
      name: editingBudget.name,
      description: editingBudget.description || '',
      amount: parseFloat(editingBudget.amount.toString()),
      period: editingBudget.period,
      startDate: editingBudget.startDate.split('T')[0],
      endDate: editingBudget.endDate?.split('T')[0] || '',
      alertThreshold: editingBudget.alertThreshold,
      alertEnabled: editingBudget.alertEnabled,
    } : {
      categoryId: '',
      name: '',
      description: '',
      amount: undefined,
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      alertThreshold: 80,
      alertEnabled: true,
    },
  });

  const selectedCategory = watch('categoryId');
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  useEffect(() => {
    if (open) {
      setLocalError(null);
    }
  }, [open]);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      setLocalError(null);

      if (editingBudget) {
        await updateBudget(householdId, editingBudget.id, {
          name: data.name,
          description: data.description,
          amount: data.amount,
          period: data.period,
          endDate: data.endDate,
          alertThreshold: data.alertThreshold,
          alertEnabled: data.alertEnabled,
        });
      } else {
        await createBudget(householdId, data);
      }

      reset();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du budget';
      setLocalError(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    setLocalError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingBudget ? 'Éditer le budget' : 'Créer un nouveau budget'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
            {localError || error}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Category Selection */}
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={selectedCategoryObj || null}
                onChange={(e, value) => {
                  field.onChange(value?.id || '');
                }}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    {...props}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: option.color,
                      }}
                    />
                    {option.name}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Catégorie"
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                  />
                )}
                disabled={!!editingBudget}
              />
            )}
          />

          {/* Budget Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nom du budget"
                placeholder="ex: Budget Alimentation"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description (optionnel)"
                placeholder="Description du budget"
                fullWidth
                multiline
                rows={2}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          {/* Amount */}
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Montant"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? undefined : parseFloat(value));
                }}
              />
            )}
          />

          {/* Period */}
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.period}>
                <InputLabel>Période</InputLabel>
                <Select {...field} label="Période">
                  <MenuItem value="MONTHLY">Mensuel</MenuItem>
                  <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
                  <MenuItem value="YEARLY">Annuel</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Start Date */}
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date de début"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />
            )}
          />

          {/* End Date */}
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date de fin (optionnel)"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
              />
            )}
          />

          {/* Alert Threshold */}
          <Controller
            name="alertThreshold"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Seuil d'alerte (%)"
                type="number"
                inputProps={{ min: '0', max: '100' }}
                fullWidth
                error={!!errors.alertThreshold}
                helperText={errors.alertThreshold?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? undefined : parseInt(value));
                }}
              />
            )}
          />

          {/* Alert Enabled */}
          <Controller
            name="alertEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value || false} />}
                label="Activer les alertes"
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {editingBudget ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
