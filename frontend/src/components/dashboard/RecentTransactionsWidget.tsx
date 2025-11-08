import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import * as transactionService from '@/services/transaction.service';
import { DashboardCard } from './DashboardCard';

interface RecentTransactionsWidgetProps {
  householdId: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  transactionDate: string;
  categoryName?: string;
  categoryColor?: string;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ householdId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (householdId) {
      loadRecentTransactions();
    }
  }, [householdId]);

  const loadRecentTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getHouseholdTransactionsSummary(householdId);
      if (data && Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      // Don't show error if transactions endpoint is not available yet
    } finally {
      setIsLoading(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <DashboardCard title="📝 Transactions Récentes" isLoading={isLoading}>
        <Typography variant="body2" color="text.secondary">
          Aucune transaction
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="📝 Transactions Récentes" isLoading={isLoading}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Montant</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(transaction.transactionDate).toLocaleDateString('fr-FR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{transaction.description}</Typography>
                </TableCell>
                <TableCell>
                  {transaction.categoryName ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: transaction.categoryColor || '#999',
                        }}
                      />
                      <Typography variant="caption">{transaction.categoryName}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: transaction.type === 'CREDIT' ? '#4caf50' : '#f44336',
                    }}
                  >
                    {transaction.type === 'CREDIT' ? '+' : '-'}{Math.abs(transaction.amount).toFixed(2)} €
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};
