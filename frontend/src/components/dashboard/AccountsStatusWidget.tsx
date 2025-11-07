import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useAccountStore } from '@/store/slices/accountSlice';
import { useAuth } from '@/hooks/useAuth';
import { DashboardCard } from './DashboardCard';

interface AccountsStatusWidgetProps {
  householdId: string;
}

export const AccountsStatusWidget: React.FC<AccountsStatusWidgetProps> = ({ householdId }) => {
  const { accounts } = useAccountStore();
  const { user } = useAuth();

  const householdAccounts = React.useMemo(() => {
    return accounts.filter((account) => {
      // Filter accounts where user is an owner
      return account.owners?.some((owner: any) => owner.userId === user?.id);
    });
  }, [accounts, user?.id]);

  const totalBalance = React.useMemo(() => {
    return householdAccounts.reduce((sum, account) => sum + (account.initialBalance || 0), 0);
  }, [householdAccounts]);

  if (householdAccounts.length === 0) {
    return (
      <DashboardCard title="🏦 Comptes">
        <Typography variant="body2" color="text.secondary">
          Aucun compte associé
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="🏦 Comptes">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell align="right">Solde</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {householdAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Typography variant="body2">{account.name}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: (account.initialBalance || 0) >= 0 ? '#4caf50' : '#f44336',
                    }}
                  >
                    {(account.initialBalance || 0).toFixed(2)} €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={account.type} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: totalBalance >= 0 ? '#4caf50' : '#f44336',
                  }}
                >
                  {totalBalance.toFixed(2)} €
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};
