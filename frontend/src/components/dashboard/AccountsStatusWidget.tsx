import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/store/slices/accountSlice';
import { useAuth } from '@/hooks/useAuth';
import { DashboardCard } from './DashboardCard';

interface AccountsStatusWidgetProps {
  householdId: string;
}

export const AccountsStatusWidget: React.FC<AccountsStatusWidgetProps> = ({ householdId }) => {
  const navigate = useNavigate();
  const { accounts } = useAccountStore();
  const { user } = useAuth();

  const householdAccounts = React.useMemo(() => {
    return accounts.filter((account) => {
      return account.owners?.some((owner: any) => owner.userId === user?.id);
    });
  }, [accounts, user?.id]);

  return (
    <DashboardCard
      title="🏦 Comptes"
      action={
        <Button size="small" onClick={() => navigate('/accounts')}>
          Voir tous
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {householdAccounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucun compte associé
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Comptes disponibles:
              </Typography>
              {householdAccounts.map((account) => (
                <Box
                  key={account.id}
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
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {account.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.type}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Solde initial: {(account.initialBalance || 0).toFixed(2)} €
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
              Pour voir le solde actuel (avec transactions), consultez la page Comptes
            </Typography>

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
