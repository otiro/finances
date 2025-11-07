import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MonthlySpendings } from '@/services/analyticsService';

interface MonthlySpendingsChartProps {
  data: MonthlySpendings[];
  loading?: boolean;
  height?: number;
}

export const MonthlySpendingsChart: React.FC<MonthlySpendingsChartProps> = ({
  data,
  loading = false,
  height = 400,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography color="textSecondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => `€${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#4caf50" name="Revenu" />
        <Line type="monotone" dataKey="expense" stroke="#f44336" name="Dépense" />
        <Line type="monotone" dataKey="netCashFlow" stroke="#2196f3" name="Flux Net" />
      </LineChart>
    </ResponsiveContainer>
  );
};
