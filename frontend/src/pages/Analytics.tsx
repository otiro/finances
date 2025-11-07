import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { useAnalyticsStore } from '@/store/slices/analyticsSlice';
import { useHouseholdStore } from '@/store/slices/householdSlice';
import { CategoryBreakdownChart } from '@/components/analytics/Charts/CategoryBreakdownChart';
import { MonthlySpendingsChart } from '@/components/analytics/Charts/MonthlySpendings';
import { CategoryTrendsChart } from '@/components/analytics/Charts/CategoryTrendsChart';
import { ComparisonChart } from '@/components/analytics/Charts/ComparisonChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Analytics: React.FC = () => {
  const { householdId: householdIdParam } = useParams<{ householdId?: string }>();
  const selectedHousehold = useHouseholdStore((state) => state.selectedHousehold);
  const {
    categoryBreakdown,
    monthlySpendings,
    categoryTrends,
    periodComparison,
    isLoading,
    error,
    selectedCategory,
    fetchCategoryBreakdown,
    fetchMonthlySpendings,
    fetchCategoryTrends,
    fetchComparison,
    setSelectedCategory,
    clearError,
  } = useAnalyticsStore();

  const [tabValue, setTabValue] = useState(0);
  const [compareStartDate1, setCompareStartDate1] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
  );
  const [compareEndDate1, setCompareEndDate1] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
  );
  const [compareStartDate2, setCompareStartDate2] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0]
  );
  const [compareEndDate2, setCompareEndDate2] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).toISOString().split('T')[0]
  );

  // Use householdId from URL params if available, otherwise use selected household
  const householdId = householdIdParam || selectedHousehold?.id;

  useEffect(() => {
    if (!householdId) return;

    // Load initial data
    fetchCategoryBreakdown(householdId);
    fetchMonthlySpendings(householdId);
  }, [householdId, fetchCategoryBreakdown, fetchMonthlySpendings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (householdId) {
      fetchCategoryTrends(householdId, categoryId);
    }
  };

  const handleCompare = () => {
    if (householdId) {
      fetchComparison(
        householdId,
        new Date(compareStartDate1),
        new Date(compareEndDate1),
        new Date(compareStartDate2),
        new Date(compareEndDate2)
      );
    }
  };

  if (!householdId) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">Veuillez sélectionner un foyer pour voir les analytics</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <h1>📊 Analytics du Foyer</h1>

        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="analytics tabs"
          >
            <Tab label="Répartition" id="analytics-tab-0" aria-controls="analytics-tabpanel-0" />
            <Tab label="Tendances Mensuelles" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
            <Tab label="Catégories" id="analytics-tab-2" aria-controls="analytics-tabpanel-2" />
            <Tab label="Comparaison" id="analytics-tab-3" aria-controls="analytics-tabpanel-3" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Répartition par Catégorie" />
                <CardContent>
                  <CategoryBreakdownChart data={categoryBreakdown} loading={isLoading} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Revenu vs Dépenses" />
                <CardContent>
                  <MonthlySpendingsChart data={monthlySpendings} loading={isLoading} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Sélectionner une Catégorie" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {categoryBreakdown.map((cat) => (
                      <Button
                        key={cat.categoryId}
                        variant={selectedCategory === cat.categoryId ? 'contained' : 'outlined'}
                        onClick={() => handleCategorySelect(cat.categoryId)}
                        size="small"
                      >
                        {cat.categoryName}
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {selectedCategory && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title={`Tendances - ${categoryBreakdown.find((c) => c.categoryId === selectedCategory)?.categoryName}`}
                  />
                  <CardContent>
                    {categoryTrends.length > 0 ? (
                      <CategoryTrendsChart data={categoryTrends} />
                    ) : (
                      <CircularProgress />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Comparer Deux Périodes" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <h4>Période 1</h4>
                      <TextField
                        label="Date de début"
                        type="date"
                        value={compareStartDate1}
                        onChange={(e) => setCompareStartDate1(e.target.value)}
                        fullWidth
                        slotProps={{ input: { inputProps: { min: '' } } }}
                      />
                      <TextField
                        label="Date de fin"
                        type="date"
                        value={compareEndDate1}
                        onChange={(e) => setCompareEndDate1(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        slotProps={{ input: { inputProps: { min: '' } } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <h4>Période 2</h4>
                      <TextField
                        label="Date de début"
                        type="date"
                        value={compareStartDate2}
                        onChange={(e) => setCompareStartDate2(e.target.value)}
                        fullWidth
                        slotProps={{ input: { inputProps: { min: '' } } }}
                      />
                      <TextField
                        label="Date de fin"
                        type="date"
                        value={compareEndDate2}
                        onChange={(e) => setCompareEndDate2(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        slotProps={{ input: { inputProps: { min: '' } } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleCompare}
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} /> : 'Comparer'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {periodComparison && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Résultats de Comparaison" />
                  <CardContent>
                    <ComparisonChart data={periodComparison} />
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Analytics;
