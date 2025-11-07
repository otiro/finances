import { Card, CardContent, CardHeader, Box, CircularProgress, Alert } from '@mui/material';
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  action?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  isLoading = false,
  error = null,
  action,
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <CardHeader
          title={title}
          action={action}
          sx={{ pb: 1 }}
        />
      )}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
