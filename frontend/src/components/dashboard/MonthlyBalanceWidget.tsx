import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAnalyticsStore } from '@/store/slices/analyticsSlice';
import { useAuthStore } from '@/store/slices/authSlice';
import { useHouseholdStore } from '@/store/slices/householdSlice';
import { DashboardCard } from './DashboardCard';
import { getIncomeAnalysis, IncomeAnalysisResponse } from '@/services/household.service';

interface MonthlyBalanceWidgetProps {
  householdId: string;
}

interface CurrentMonthData {
  income: number;
  expense: number;
  month: string;
}

export const MonthlyBalanceWidget: React.FC<MonthlyBalanceWidgetProps> = ({ householdId }) => {
  const { monthlySpendings, isLoading, error, fetchMonthlySpendings } = useAnalyticsStore();
  const { user } = useAuthStore();
  const { currentHousehold } = useHouseholdStore();
  const [currentMonth, setCurrentMonth] = useState<CurrentMonthData | null>(null);
  const [previousMonth, setPreviousMonth] = useState<CurrentMonthData | null>(null);
  const [incomeAnalysis, setIncomeAnalysis] = useState<IncomeAnalysisResponse | null>(null);
  const [isLoadingIncome, setIsLoadingIncome] = useState(false);

  // Function to fetch income analysis - extracted to useCallback for reuse
  const fetchIncomeAnalysis = useCallback(() => {
    if (householdId) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      setIsLoadingIncome(true);
      getIncomeAnalysis(householdId, year, month)
        .then(setIncomeAnalysis)
        .catch((error) => {
          console.error('Error fetching income analysis:', error);
        })
        .finally(() => setIsLoadingIncome(false));
    }
  }, [householdId]);

  // Fetch household aggregate expenses and current month's income analysis
  useEffect(() => {
    if (householdId) {
      fetchMonthlySpendings(householdId);
      fetchIncomeAnalysis();
    }
  }, [householdId, fetchMonthlySpendings, fetchIncomeAnalysis]);

  // Refetch income analysis when household changes (e.g., when sharing ratios are updated)
  useEffect(() => {
    if (currentHousehold) {
      fetchIncomeAnalysis();
    }
  }, [currentHousehold, fetchIncomeAnalysis]);

  // Process monthly spendings and merge with user-specific income
  useEffect(() => {
    if (monthlySpendings && monthlySpendings.length > 0) {
      const sorted = [...monthlySpendings].sort((a, b) =>
        new Date(b.month).getTime() - new Date(a.month).getTime()
      );

      // Get current month data with household aggregate expense
      const current = sorted[0];

      // Get user-specific income if available, otherwise use household aggregate
      const userIncome = incomeAnalysis && user
        ? incomeAnalysis.members.find(m => m.userId === user.id)?.salary ?? current.income
        : current.income;

      setCurrentMonth({
        income: userIncome,
        expense: current.expense,
        month: current.month,
      });

      if (sorted[1]) {
        // For previous month, we use household aggregate since we're only fetching current month's income analysis
        // In a future enhancement, we could fetch previous month's income analysis for user-specific comparison
        setPreviousMonth({
          income: sorted[1].income,
          expense: sorted[1].expense,
          month: sorted[1].month,
        });
      }
    }
  }, [monthlySpendings, incomeAnalysis, user]);

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
