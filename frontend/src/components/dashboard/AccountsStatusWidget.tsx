import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as accountService from '@/services/account.service';
import { DashboardCard } from './DashboardCard';

interface AccountsStatusWidgetProps {
  householdId: string;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  initialBalance: number;
  currentBalance: number;
  owners: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

export const AccountsStatusWidget: React.FC<AccountsStatusWidgetProps> = ({ householdId }) => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (householdId) {
      loadAccounts();
    }
  }, [householdId]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await accountService.getHouseholdBalances(householdId);
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des comptes');
      console.error('Account loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard
      title="🏦 Comptes"
      isLoading={isLoading}
      error={error}
      action={
        <Button size="small" onClick={() => navigate('/accounts')}>
          Voir tous
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {accounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucun compte associé
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {accounts.map((account) => (
                <Box
                  key={account.accountId}
                  sx={{
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                    borderLeft: '3px solid #2196f3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {account.accountName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.accountType}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: account.currentBalance >= 0 ? '#4caf50' : '#f44336',
                      }}
                    >
                      {account.currentBalance >= 0 ? '+' : ''}
                      {account.currentBalance.toFixed(2)} €
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      initial: {account.initialBalance.toFixed(2)} €
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/accounts')}
              fullWidth
              sx={{ mt: 2 }}
            >
              Voir les comptes détaillés
            </Button>
          </>
        )}
      </Box>
    </DashboardCard>
  );
};
