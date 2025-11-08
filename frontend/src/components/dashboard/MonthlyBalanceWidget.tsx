import { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAnalyticsStore } from '@/store/slices/analyticsSlice';
import { DashboardCard } from './DashboardCard';

interface MonthlyBalanceWidgetProps {
  householdId: string;
}

export const MonthlyBalanceWidget: React.FC<MonthlyBalanceWidgetProps> = ({ householdId }) => {
  const { monthlySpendings, isLoading, error, fetchMonthlySpendings } = useAnalyticsStore();
  const [currentMonth, setCurrentMonth] = useState<any>(null);
  const [previousMonth, setpreviousMonth] = useState<any>(null);

  useEffect(() => {
    if (householdId) {
      fetchMonthlySpendings(householdId);
    }
  }, [householdId, fetchMonthlySpendings]);

  useEffect(() => {
    if (monthlySpendings && monthlySpendings.length > 0) {
      const sorted = [...monthlySpendings].sort((a, b) =>
        new Date(b.month).getTime() - new Date(a.month).getTime()
      );
      setCurrentMonth(sorted[0]);
      setpreviousMonth(sorted[1]);
    }
  }, [monthlySpendings]);

  if (!currentMonth) {
    return (
      <DashboardCard
        title="💰 Bilan du Mois"
        isLoading={isLoading}
        error={error}
      >
        <Typography variant="body2" color="text.secondary">
          Aucune donnée disponible
        </Typography>
      </DashboardCard>
    );
  }

  const netCashFlow = currentMonth.income - currentMonth.expense;
  const previousNetCashFlow = previousMonth ? (previousMonth.income - previousMonth.expense) : 0;
  const netCashFlowChange = previousMonth
    ? parseFloat((((netCashFlow - previousNetCashFlow) / Math.abs(previousNetCashFlow)) * 100).toFixed(1))
    : 0;

  const getNetCashFlowColor = () => {
    if (netCashFlow > 0) return '#4caf50'; // green
    if (netCashFlow < 0) return '#f44336'; // red
    return '#2196f3'; // blue
  };

  return (
    <DashboardCard title="💰 Bilan du Mois" isLoading={isLoading || isLoadingIncome} error={error}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Revenus
            </Typography>
            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              +{currentMonth.income?.toFixed(2)} €
            </Typography>
            {previousMonth && (
              <Typography variant="caption" color="text.secondary">
                {previousMonth.income?.toFixed(2)} € le mois dernier
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dépenses
            </Typography>
            <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              -{currentMonth.expense?.toFixed(2)} €
            </Typography>
            {previousMonth && (
              <Typography variant="caption" color="text.secondary">
                {previousMonth.expense?.toFixed(2)} € le mois dernier
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Net
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: getNetCashFlowColor(), fontWeight: 'bold' }}
            >
              {netCashFlow > 0 ? '+' : ''}{netCashFlow?.toFixed(2)} €
            </Typography>
            {previousMonth && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {netCashFlowChange > 0 ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: '#4caf50' }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: '#f44336' }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  {netCashFlowChange > 0 ? '+' : ''}{netCashFlowChange}%
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </DashboardCard>
  );
};
