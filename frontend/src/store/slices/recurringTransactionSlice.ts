import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as recurringTransactionService from '../../services/recurringTransaction.service';
import type { RecurringPattern } from '../../services/recurringTransaction.service';
import type { RootState } from '../store';

/**
 * État de la slice recurring transactions
 */
interface RecurringTransactionState {
  patterns: RecurringPattern[];
  selectedPattern: RecurringPattern | null;
  loading: boolean;
  error: string | null;
}

// État initial
const initialState: RecurringTransactionState = {
  patterns: [],
  selectedPattern: null,
  loading: false,
  error: null,
};

/**
 * Async thunks
 */

// Récupérer les patterns d'un foyer
export const fetchRecurringPatterns = createAsyncThunk(
  'recurringTransaction/fetchPatterns',
  async (householdId: string, { rejectWithValue }) => {
    try {
      const patterns = await recurringTransactionService.getHouseholdRecurringPatterns(
        householdId,
        false
      );
      return patterns;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la récupération des patterns'
      );
    }
  }
);

// Récupérer un pattern spécifique
export const fetchRecurringPattern = createAsyncThunk(
  'recurringTransaction/fetchPattern',
  async ({ householdId, patternId }: { householdId: string; patternId: string }, { rejectWithValue }) => {
    try {
      const pattern = await recurringTransactionService.getRecurringPattern(householdId, patternId);
      return pattern;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la récupération du pattern'
      );
    }
  }
);

// Créer un pattern
export const createRecurringPattern = createAsyncThunk(
  'recurringTransaction/createPattern',
  async (
    {
      householdId,
      data,
    }: {
      householdId: string;
      data: Parameters<typeof recurringTransactionService.createRecurringPattern>[1];
    },
    { rejectWithValue }
  ) => {
    try {
      const pattern = await recurringTransactionService.createRecurringPattern(householdId, data);
      return pattern;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la création du pattern'
      );
    }
  }
);

// Mettre à jour un pattern
export const updateRecurringPattern = createAsyncThunk(
  'recurringTransaction/updatePattern',
  async (
    {
      householdId,
      patternId,
      data,
    }: {
      householdId: string;
      patternId: string;
      data: Parameters<typeof recurringTransactionService.updateRecurringPattern>[2];
    },
    { rejectWithValue }
  ) => {
    try {
      const pattern = await recurringTransactionService.updateRecurringPattern(
        householdId,
        patternId,
        data
      );
      return pattern;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour du pattern'
      );
    }
  }
);

// Supprimer un pattern
export const deleteRecurringPattern = createAsyncThunk(
  'recurringTransaction/deletePattern',
  async (
    { householdId, patternId }: { householdId: string; patternId: string },
    { rejectWithValue }
  ) => {
    try {
      await recurringTransactionService.deleteRecurringPattern(householdId, patternId);
      return patternId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la suppression du pattern'
      );
    }
  }
);

// Pause un pattern
export const pauseRecurringPattern = createAsyncThunk(
  'recurringTransaction/pausePattern',
  async (
    { householdId, patternId }: { householdId: string; patternId: string },
    { rejectWithValue }
  ) => {
    try {
      const pattern = await recurringTransactionService.pauseRecurringPattern(
        householdId,
        patternId
      );
      return pattern;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la pause du pattern'
      );
    }
  }
);

// Reprend un pattern
export const resumeRecurringPattern = createAsyncThunk(
  'recurringTransaction/resumePattern',
  async (
    { householdId, patternId }: { householdId: string; patternId: string },
    { rejectWithValue }
  ) => {
    try {
      const pattern = await recurringTransactionService.resumeRecurringPattern(
        householdId,
        patternId
      );
      return pattern;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la reprise du pattern'
      );
    }
  }
);

/**
 * Slice
 */
const recurringTransactionSlice = createSlice({
  name: 'recurringTransaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPattern: (state) => {
      state.selectedPattern = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch patterns
    builder
      .addCase(fetchRecurringPatterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringPatterns.fulfilled, (state, action) => {
        state.loading = false;
        state.patterns = action.payload;
        state.error = null;
      })
      .addCase(fetchRecurringPatterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single pattern
    builder
      .addCase(fetchRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPattern = action.payload;
        state.error = null;
      })
      .addCase(fetchRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create pattern
    builder
      .addCase(createRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        state.patterns.push(action.payload);
        state.error = null;
      })
      .addCase(createRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update pattern
    builder
      .addCase(updateRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patterns.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.patterns[index] = action.payload;
        }
        if (state.selectedPattern?.id === action.payload.id) {
          state.selectedPattern = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete pattern
    builder
      .addCase(deleteRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        state.patterns = state.patterns.filter((p) => p.id !== action.payload);
        if (state.selectedPattern?.id === action.payload) {
          state.selectedPattern = null;
        }
        state.error = null;
      })
      .addCase(deleteRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Pause pattern
    builder
      .addCase(pauseRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pauseRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patterns.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.patterns[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(pauseRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Resume pattern
    builder
      .addCase(resumeRecurringPattern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resumeRecurringPattern.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patterns.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.patterns[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(resumeRecurringPattern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

/**
 * Selectors
 */
export const selectRecurringPatterns = (state: RootState) => state.recurringTransaction.patterns;
export const selectSelectedPattern = (state: RootState) => state.recurringTransaction.selectedPattern;
export const selectLoading = (state: RootState) => state.recurringTransaction.loading;
export const selectError = (state: RootState) => state.recurringTransaction.error;

export const selectActivePatterns = (state: RootState) =>
  state.recurringTransaction.patterns.filter((p) => p.isActive && !p.isPaused);

export const selectPausedPatterns = (state: RootState) =>
  state.recurringTransaction.patterns.filter((p) => p.isPaused);

// Actions
export const { clearError, clearSelectedPattern } = recurringTransactionSlice.actions;

// Reducer
export default recurringTransactionSlice.reducer;
