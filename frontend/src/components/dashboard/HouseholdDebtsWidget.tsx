import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as debtService from '@/services/debt.service';
import { DashboardCard } from './DashboardCard';

interface HouseholdDebtsWidgetProps {
  householdId: string;
}

interface Debt {
  id: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  status: string;
}

export const HouseholdDebtsWidget: React.FC<HouseholdDebtsWidgetProps> = ({ householdId }) => {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (householdId) {
      loadDebts();
    }
  }, [householdId]);

  const loadDebts = async () => {
    try {
      setIsLoading(true);
      const data = await debtService.calculateDebts(householdId);
      if (data && Array.isArray(data)) {
        setDebts(data.filter((d: any) => d.amount > 0));
      }
    } catch (err: any) {
      // Silently fail if debts endpoint not available
      console.error('Error loading debts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (debts.length === 0) {
    return (
      <DashboardCard title="💳 Dettes du Foyer" isLoading={isLoading} error={error}>
        <Typography variant="body2" color="text.secondary">
          Aucune dette en attente
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="💳 Dettes du Foyer"
      isLoading={isLoading}
      error={error}
      action={
        <Button size="small" onClick={() => navigate(`/debts`)}>
          Voir plus
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {debts.slice(0, 3).map((debt) => (
          <Box
            key={debt.id}
            sx={{
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              borderLeft: '4px solid #ff9800',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>{debt.fromUserName}</strong> doit <strong>{debt.toUserName}</strong>
              </Typography>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {debt.amount.toFixed(2)} €
              </Typography>
            </Box>
            {debt.status && (
              <Chip
                label={debt.status}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        ))}
        {debts.length > 3 && (
          <Button
            size="small"
            onClick={() => navigate(`/debts`)}
          >
            Voir {debts.length - 3} dettes supplémentaires
          </Button>
        )}
      </Box>
    </DashboardCard>
  );
};
