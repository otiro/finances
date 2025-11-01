import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Stack,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FrequencySelector from './FrequencySelector';
import type { CreateRecurringPatternData } from '../../services/recurringTransaction.service';

/**
 * Schéma de validation Zod
 */
const recurringPatternSchema = z.object({
  accountId: z.string().min(1, 'Veuillez sélectionner un compte'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional().or(z.literal('')),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  type: z.enum(['DEBIT', 'CREDIT']),
  amount: z.union([
    z.number().positive('Le montant doit être positif'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Le montant doit être un nombre');
      return num;
    }).refine((num) => num > 0, 'Le montant doit être positif'),
  ]),
  categoryId: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().optional().or(z.literal('')),
  dayOfMonth: z.union([z.number().min(1).max(31), z.literal('')]).optional(),
  dayOfWeek: z.union([z.number().min(0).max(6), z.literal('')]).optional(),
}).refine(
  (data) => {
    // Validate dayOfMonth for MONTHLY frequency
    if (data.frequency === 'MONTHLY') {
      return data.dayOfMonth !== '' && data.dayOfMonth !== undefined;
    }
    return true;
  },
  {
    message: 'Le jour du mois est requis pour les transactions mensuelles',
    path: ['dayOfMonth'],
  }
).refine(
  (data) => {
    // Validate dayOfWeek for WEEKLY frequency
    if (data.frequency === 'WEEKLY') {
      return data.dayOfWeek !== '' && data.dayOfWeek !== undefined;
    }
    return true;
  },
  {
    message: 'Le jour de la semaine est requis pour les transactions hebdomadaires',
    path: ['dayOfWeek'],
  }
);

type RecurringPatternFormData = z.infer<typeof recurringPatternSchema>;

interface RecurringPatternFormProps {
  initialData?: Partial<CreateRecurringPatternData>;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateRecurringPatternData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

/**
 * Formulaire pour créer/éditer une transaction récurrente
 */
const RecurringPatternForm: React.FC<RecurringPatternFormProps> = ({
  initialData,
  accounts,
  categories,
  onSubmit,
  isLoading = false,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecurringPatternFormData>({
    resolver: zodResolver(recurringPatternSchema),
    defaultValues: {
      accountId: initialData?.accountId || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      frequency: initialData?.frequency || 'MONTHLY',
      type: initialData?.type || 'DEBIT',
      amount: initialData?.amount || 0,
      categoryId: initialData?.categoryId || '',
      startDate: initialData?.startDate || new Date().toISOString(),
      endDate: initialData?.endDate || '',
      dayOfMonth: initialData?.dayOfMonth || '',
      dayOfWeek: initialData?.dayOfWeek || '',
    },
  });

  const frequency = watch('frequency');
  const type = watch('type');
  const amount = watch('amount');

  const onSubmitForm = async (data: RecurringPatternFormData) => {
    // Convert datetime-local format to ISO string if needed
    const convertToISO = (dateStr: string): string => {
      if (!dateStr) return '';
      // datetime-local format: 2025-11-01T14:30
      // Need to convert to ISO: 2025-11-01T14:30:00Z
      if (dateStr.includes('T')) {
        // Check if it already has seconds
        const parts = dateStr.split('T');
        const timePart = parts[1];
        if (timePart && !timePart.includes(':00')) {
          // Add :00 for seconds if missing
          return `${dateStr}:00Z`;
        }
        return `${dateStr}Z`;
      }
      return dateStr;
    };

    const submitData: CreateRecurringPatternData = {
      ...data,
      amount: Number(amount),
      startDate: convertToISO(data.startDate),
      endDate: data.endDate ? convertToISO(data.endDate) : undefined,
      dayOfMonth: data.dayOfMonth && data.dayOfMonth !== '' ? Number(data.dayOfMonth) : undefined,
      dayOfWeek: data.dayOfWeek && data.dayOfWeek !== '' ? Number(data.dayOfWeek) : undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        {/* Account Selection */}
        <Controller
          name="accountId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.accountId}>
              <InputLabel>Compte</InputLabel>
              <Select
                {...field}
                label="Compte"
                disabled={isLoading}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.accountId && (
                <FormHelperText>{errors.accountId.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Name */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nom"
              placeholder="ex: Loyer"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
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
              label="Description"
              placeholder="Description optionnelle"
              fullWidth
              multiline
              rows={2}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isLoading}
            />
          )}
        />

        {/* Type (DEBIT/CREDIT) */}
        <FormControl>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Type de transaction
          </Typography>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                row
                sx={{ gap: 3 }}
              >
                <FormControlLabel
                  value="DEBIT"
                  control={<Radio />}
                  label="💰 Dépense (Débit)"
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="CREDIT"
                  control={<Radio />}
                  label="💵 Revenu (Crédit)"
                  disabled={isLoading}
                />
              </RadioGroup>
            )}
          />
        </FormControl>

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
              disabled={isLoading}
              InputProps={{
                startAdornment: type === 'DEBIT' ? '-' : '+',
              }}
            />
          )}
        />

        {/* Frequency */}
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => (
            <FrequencySelector
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Conditional: Day of Month for MONTHLY */}
        {frequency === 'MONTHLY' && (
          <Controller
            name="dayOfMonth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Jour du mois"
                type="number"
                inputProps={{ min: '1', max: '31' }}
                fullWidth
                helperText="Quel jour du mois ? (1-31)"
                error={!!errors.dayOfMonth}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? '' : parseInt(value, 10));
                }}
              />
            )}
          />
        )}

        {/* Conditional: Day of Week for WEEKLY */}
        {frequency === 'WEEKLY' && (
          <Controller
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.dayOfWeek}>
                <InputLabel>Jour de la semaine</InputLabel>
                <Select
                  {...field}
                  label="Jour de la semaine"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseInt(value as string, 10));
                  }}
                >
                  <MenuItem value="">Sélectionner un jour</MenuItem>
                  <MenuItem value={0}>Dimanche</MenuItem>
                  <MenuItem value={1}>Lundi</MenuItem>
                  <MenuItem value={2}>Mardi</MenuItem>
                  <MenuItem value={3}>Mercredi</MenuItem>
                  <MenuItem value={4}>Jeudi</MenuItem>
                  <MenuItem value={5}>Vendredi</MenuItem>
                  <MenuItem value={6}>Samedi</MenuItem>
                </Select>
                {errors.dayOfWeek && (
                  <FormHelperText>{errors.dayOfWeek.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}

        {/* Category */}
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Catégorie (optionnel)</InputLabel>
              <Select
                {...field}
                label="Catégorie (optionnel)"
                disabled={isLoading}
              >
                <MenuItem value="">Aucune catégorie</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
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
              type="datetime-local"
              fullWidth
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
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
              type="datetime-local"
              fullWidth
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default RecurringPatternForm;
