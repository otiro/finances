import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateRecurringPattern, selectError, selectLoading } from '../../store/slices/recurringTransactionSlice';
import RecurringPatternForm from '../RecurringPatterns/RecurringPatternForm';
import type {
  RecurringPattern,
  UpdateRecurringPatternData,
} from '../../services/recurringTransaction.service';
import { useHousehold } from '../../hooks/useHousehold';
import * as categoryService from '../../services/category.service';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface EditRecurringPatternDialogProps {
  open: boolean;
  onClose: () => void;
  pattern: RecurringPattern;
  householdId: string;
  onPatternUpdated: () => void;
}

/**
 * Dialog pour éditer une transaction récurrente existante
 */
const EditRecurringPatternDialog: React.FC<EditRecurringPatternDialogProps> = ({
  open,
  onClose,
  pattern,
  householdId,
  onPatternUpdated,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const { accounts } = useHousehold(householdId);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (open && householdId) {
      loadCategories();
    } else {
      setSubmitError(null);
      setCategories([]);
    }
  }, [open, householdId]);

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAllAvailableCategories(householdId);
      const allCategories = [...(result.system || []), ...(result.household || [])];
      setCategories(allCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitError(null);

      const updateData: UpdateRecurringPatternData = {
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        type: data.type,
        amount: data.amount,
        categoryId: data.categoryId || null,
        endDate: data.endDate ? data.endDate : null,
        dayOfMonth: data.dayOfMonth ? Number(data.dayOfMonth) : null,
        dayOfWeek: data.dayOfWeek ? Number(data.dayOfWeek) : null,
      };

      await dispatch(
        updateRecurringPattern({
          householdId,
          patternId: pattern.id,
          data: updateData,
        })
      ).unwrap();

      onPatternUpdated();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Don't close on any external trigger
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onBackdropClick={() => {}} // Prevent closing on backdrop click
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Éditer une transaction récurrente
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Modifiez les paramètres de votre transaction récurrente.
        </DialogContentText>

        {/* Loading state */}
        {loading && !accounts.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Error message */}
            {(error || submitError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || submitError}
              </Alert>
            )}

            {/* Form */}
            {accounts.length > 0 ? (
              <RecurringPatternForm
                initialData={{
                  accountId: pattern.accountId,
                  name: pattern.name,
                  description: pattern.description,
                  frequency: pattern.frequency,
                  type: pattern.type,
                  amount: pattern.amount as any,
                  categoryId: pattern.categoryId,
                  startDate: pattern.startDate,
                  endDate: pattern.endDate,
                  dayOfMonth: pattern.dayOfMonth,
                  dayOfWeek: pattern.dayOfWeek,
                }}
                accounts={accounts}
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={loading}
                onCancel={handleCancel}
              />
            ) : (
              <Alert severity="info">
                Erreur lors du chargement des comptes.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditRecurringPatternDialog;
