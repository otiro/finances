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
import { CategoryTrend } from '@/services/analyticsService';

interface CategoryTrendsChartProps {
  data: CategoryTrend[];
  categoryName?: string;
  loading?: boolean;
  height?: number;
}

export const CategoryTrendsChart: React.FC<CategoryTrendsChartProps> = ({
  data,
  categoryName = 'Catégorie',
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
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
        <Bar dataKey="amount" fill="#ff9800" name={categoryName} />
      </BarChart>
    </ResponsiveContainer>
  );
};
