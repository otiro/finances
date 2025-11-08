import { useMemo, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useAnalyticsStore } from '@/store/slices/analyticsSlice';
import { DashboardCard } from './DashboardCard';

interface TopCategoriesWidgetProps {
  householdId: string;
}

export const TopCategoriesWidget: React.FC<TopCategoriesWidgetProps> = ({ householdId }) => {
  const { categoryBreakdown, isLoading, error, fetchCategoryBreakdown } = useAnalyticsStore();

  useEffect(() => {
    if (householdId) {
      fetchCategoryBreakdown(householdId);
    }
  }, [householdId, fetchCategoryBreakdown]);

  const topExpenses = useMemo(() => {
    if (!categoryBreakdown || !Array.isArray(categoryBreakdown)) return [];
    return [...categoryBreakdown]
      .filter(cat => cat.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [categoryBreakdown]);

  if (!categoryBreakdown || topExpenses.length === 0) {
    return (
      <DashboardCard
        title="📊 Top Catégories de Dépenses"
        isLoading={isLoading}
        error={error}
      >
        <Typography variant="body2" color="text.secondary">
          Aucune donnée disponible
        </Typography>
      </DashboardCard>
    );
  }

  const totalExpense = topExpenses.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <DashboardCard title="📊 Top Catégories de Dépenses" isLoading={isLoading} error={error}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topExpenses.map((category) => (
          <Box key={category.categoryId}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: category.color || '#999',
                  }}
                />
                <Typography variant="body2">{category.categoryName}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                {category.amount?.toFixed(2)} €
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(category.amount / totalExpense) * 100}
                sx={{ flex: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: '40px', textAlign: 'right' }}>
                {((category.amount / totalExpense) * 100).toFixed(0)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardCard>
  );
};
