import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

// Pages (à créer)
// import Login from '@pages/Login'
// import Dashboard from '@pages/Dashboard'
// import Transactions from '@pages/Transactions'
// import Analytics from '@pages/Analytics'
// import Budgets from '@pages/Budgets'
// import Accounts from '@pages/Accounts'
// import Settings from '@pages/Settings'

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Temporary landing page */}
        <Route path="/" element={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <h1>Finances Familiales</h1>
            <p>Application en cours de développement...</p>
          </Box>
        } />

        {/* Routes à implémenter */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/transactions" element={<Transactions />} /> */}
        {/* <Route path="/analytics" element={<Analytics />} /> */}
        {/* <Route path="/budgets" element={<Budgets />} /> */}
        {/* <Route path="/accounts" element={<Accounts />} /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  )
}

export default App
