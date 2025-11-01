import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './store/slices/authSlice';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import HouseholdDetails from './pages/HouseholdDetails';
import Accounts from './pages/Accounts';
import AccountDetails from './pages/AccountDetails';
import Debts from './pages/Debts';
import RecurringTransactions from './pages/RecurringTransactions';
import ProtectedRoute from './components/ProtectedRoute';

// Pages à créer dans les prochaines phases
// import Transactions from '@pages/Transactions'
// import Analytics from '@pages/Analytics'
// import Budgets from '@pages/Budgets'
// import Settings from '@pages/Settings'

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Page d'accueil - redirige selon l'état d'authentification */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Routes publiques (accessibles uniquement si NON authentifié) */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        {/* Routes protégées (accessibles uniquement si authentifié) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Phase 3 - Foyers et comptes */}
        <Route
          path="/households"
          element={
            <ProtectedRoute>
              <Households />
            </ProtectedRoute>
          }
        />
        <Route
          path="/households/:id"
          element={
            <ProtectedRoute>
              <HouseholdDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/:id"
          element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          }
        />

        {/* Phase 4 - Transactions */}
        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <Debts />
            </ProtectedRoute>
          }
        />

        {/* Phase 5 - Transactions Récurrentes */}
        <Route
          path="/households/:id/recurring-transactions"
          element={
            <ProtectedRoute>
              <RecurringTransactions />
            </ProtectedRoute>
          }
        />

        {/* Routes à implémenter dans les prochaines phases */}
        {/* <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} /> */}
        {/* <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} /> */}
        {/* <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} /> */}
        {/* <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> */}

        {/* Catch all - redirige vers l'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App
