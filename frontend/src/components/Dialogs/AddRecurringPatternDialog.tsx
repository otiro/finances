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
import { createRecurringPattern, clearError } from '../../store/slices/recurringTransactionSlice';
import { selectError, selectLoading } from '../../store/slices/recurringTransactionSlice';
import RecurringPatternForm from '../RecurringPatterns/RecurringPatternForm';
import type { CreateRecurringPatternData } from '../../services/recurringTransaction.service';
import { useHousehold } from '../../hooks/useHousehold';

interface AddRecurringPatternDialogProps {
  open: boolean;
  onClose: () => void;
  householdId: string;
  onPatternAdded: () => void;
}

/**
 * Dialog pour ajouter une nouvelle transaction récurrente
 */
const AddRecurringPatternDialog: React.FC<AddRecurringPatternDialogProps> = ({
  open,
  onClose,
  householdId,
  onPatternAdded,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const { accounts, categories } = useHousehold(householdId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      dispatch(clearError());
    }
  }, [open, dispatch]);

  const handleSubmit = async (data: CreateRecurringPatternData) => {
    try {
      setSubmitError(null);
      await dispatch(
        createRecurringPattern({
          householdId,
          data,
        })
      ).unwrap();

      onPatternAdded();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Créer une transaction récurrente
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Créez une nouvelle transaction qui se répétera automatiquement selon la fréquence choisie.
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
                accounts={accounts}
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={loading}
                onCancel={handleClose}
              />
            ) : (
              <Alert severity="info">
                Vous devez créer un compte avant de créer une transaction récurrente.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddRecurringPatternDialog;
