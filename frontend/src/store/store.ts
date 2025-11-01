import { configureStore } from '@reduxjs/toolkit';
import recurringTransactionReducer from './slices/recurringTransactionSlice';

/**
 * Configuration du store Redux
 */
export const store = configureStore({
  reducer: {
    recurringTransaction: recurringTransactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
