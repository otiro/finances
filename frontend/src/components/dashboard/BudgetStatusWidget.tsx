import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Grid } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as budgetService from '@/services/budget.service';
import { DashboardCard } from './DashboardCard';

interface BudgetStatusWidgetProps {
  householdId: string;
}

interface BudgetWithSpent {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  spent: number;
  percentageUsed: number;
}

export const BudgetStatusWidget: React.FC<BudgetStatusWidgetProps> = ({ householdId }) => {
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (householdId) {
      loadBudgets();
    }
  }, [householdId]);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use summary endpoint which includes spent amounts
      const summary = await budgetService.getHouseholdBudgetsSummary(householdId);
      if (summary?.budgets && Array.isArray(summary.budgets)) {
        // Map to BudgetWithSpent format
        const mappedBudgets = summary.budgets.map((bs: any) => ({
          id: bs.budget?.id || bs.id,
          categoryId: bs.budget?.categoryId || bs.categoryId,
          categoryName: bs.budget?.category?.name || 'Sans catégorie',
          categoryColor: bs.budget?.category?.color || '#999',
          amount: Number(bs.budget?.amount || bs.amount || 0),
          spent: Number(bs.currentSpent || 0),
          percentageUsed: Number(bs.percentageUsed || 0),
        }));
        setBudgets(mappedBudgets.slice(0, 5)); // Top 5 budgets
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des budgets');
      console.error('Budget loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (budgets.length === 0) {
    return (
      <DashboardCard
        title="📋 État des Budgets"
        isLoading={isLoading}
        error={error}
      >
        <Typography variant="body2" color="text.secondary">
          Aucun budget configuré
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="📋 État des Budgets" isLoading={isLoading} error={error}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {budgets.map((budget) => (
          <Box key={budget.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: budget.categoryColor || '#999',
                  }}
                />
                <Typography variant="body2">{budget.categoryName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {budget.percentageUsed >= 80 ? (
                  <WarningIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  {budget.percentageUsed.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(budget.percentageUsed, 100)}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      budget.percentageUsed >= 100
                        ? '#f44336'
                        : budget.percentageUsed >= 80
                          ? '#ff9800'
                          : '#4caf50',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: '70px', textAlign: 'right' }}>
                {budget.spent?.toFixed(2)} / {budget.amount?.toFixed(2)} €
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardCard>
  );
};
