import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from './DashboardCard';

interface HouseholdDebtsWidgetProps {
  householdId: string;
}

export const HouseholdDebtsWidget: React.FC<HouseholdDebtsWidgetProps> = () => {
  const navigate = useNavigate();

  return (
    <DashboardCard
      title="💳 Dettes du Foyer"
      action={
        <Button size="small" onClick={() => navigate(`/debts`)}>
          Voir détails
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            p: 3,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            textAlign: 'center',
            borderLeft: '4px solid #ff9800',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pour voir le détail des dettes du foyer
          </Typography>
          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold', mt: 1 }}>
            Consultez la page Dettes
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Qui doit combien à qui dans le foyer
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate(`/debts`)}
          fullWidth
        >
          Voir les dettes du foyer
        </Button>
      </Box>
    </DashboardCard>
  );
};
