import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import { PeriodComparison } from '@/services/analyticsService';

interface ComparisonChartProps {
  data: PeriodComparison | null;
  loading?: boolean;
  height?: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
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

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography color="textSecondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  const chartData = [
    {
      name: 'Revenu',
      [data.period1.label]: data.period1.income,
      [data.period2.label]: data.period2.income,
    },
    {
      name: 'Dépense',
      [data.period1.label]: data.period1.expense,
      [data.period2.label]: data.period2.expense,
    },
    {
      name: 'Flux Net',
      [data.period1.label]: data.period1.netCashFlow,
      [data.period2.label]: data.period2.netCashFlow,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
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
        <Bar dataKey={data.period1.label} fill="#2196f3" />
        <Bar dataKey={data.period2.label} fill="#f44336" />
      </BarChart>
    </ResponsiveContainer>
  );
};
