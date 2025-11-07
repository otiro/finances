import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CategoryBreakdown } from '@/services/analyticsService';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  loading?: boolean;
  height?: number;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
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

  // Transform data for Recharts
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    color: item.categoryColor,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `€${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
