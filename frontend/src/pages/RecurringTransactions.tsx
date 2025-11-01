import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectRecurringPatterns,
  selectLoading,
  selectError,
  fetchRecurringPatterns
} from '../store/slices/recurringTransactionSlice';
import RecurringPatternsList from '../components/RecurringPatterns/RecurringPatternsList';
import AddRecurringPatternDialog from '../components/Dialogs/AddRecurringPatternDialog';

/**
 * Page pour gérer les transactions récurrentes
 * Affiche la liste des patterns et permet de créer/éditer/supprimer
 */
const RecurringTransactionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const householdId = id;
  const dispatch = useAppDispatch();
  const patterns = useAppSelector(selectRecurringPatterns);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Charger les patterns au montage
  useEffect(() => {
    if (householdId) {
      dispatch(fetchRecurringPatterns(householdId));
    }
  }, [householdId, dispatch]);

  const handleRefresh = async () => {
    if (householdId) {
      await dispatch(fetchRecurringPatterns(householdId));
    }
  };

  const handleAddPattern = () => {
    setOpenAddDialog(true);
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
  };

  const handlePatternAdded = () => {
    handleDialogClose();
    // La liste se mettra à jour via Redux
    if (householdId) {
      dispatch(fetchRecurringPatterns(householdId));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Transactions Récurrentes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gérez vos transactions automatiques (loyer, salaire, etc.)
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPattern}
            color="primary"
          >
            Ajouter
          </Button>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && !patterns.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* List of patterns */}
          {patterns.length > 0 ? (
            <RecurringPatternsList
              patterns={patterns}
              householdId={householdId!}
              onRefresh={handleRefresh}
            />
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                Aucune transaction récurrente
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Créez une transaction récurrente pour automatiser vos paiements réguliers
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPattern}
              >
                Créer ma première transaction
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Add Pattern Dialog */}
      {householdId && (
        <AddRecurringPatternDialog
          open={openAddDialog}
          onClose={handleDialogClose}
          householdId={householdId}
          onPatternAdded={handlePatternAdded}
        />
      )}
    </Container>
  );
};

export default RecurringTransactionsPage;
