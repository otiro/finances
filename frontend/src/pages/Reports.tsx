import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAnalyticsStore } from '@/store/slices/analyticsSlice';
import { useHouseholdStore } from '@/store/slices/householdSlice';
import { analyticsService } from '@/services/analyticsService';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { householdId: householdIdParam } = useParams<{ householdId?: string }>();
  const selectedHousehold = useHouseholdStore((state) => state.selectedHousehold);
  const {
    reportHistory,
    isLoading,
    error,
    fetchReportHistory,
    generateReport,
    clearError,
  } = useAnalyticsStore();

  // Use householdId from URL params if available, otherwise use selected household
  const householdId = householdIdParam || selectedHousehold?.id;

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<'CSV' | 'JSON' | 'TEXT'>('CSV');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (householdId) {
      fetchReportHistory(householdId);
    }
  }, [householdId, fetchReportHistory]);

  const handleGenerateReport = async () => {
    if (!householdId) return;

    setGenerating(true);
    try {
      const blob = await generateReport(
        householdId,
        new Date(startDate),
        new Date(endDate),
        format
      );

      // Download the file
      const fileName = `rapport_${selectedHousehold?.name || 'foyer'}_${Date.now()}.${format.toLowerCase()}`;
      analyticsService.downloadFile(blob, fileName);
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
    } finally {
      setGenerating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!householdId) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">Veuillez sélectionner un foyer pour générer des rapports</Alert>
        </Box>
      </Container>
    );
  }

  const handleGoBack = () => {
    if (householdIdParam) {
      navigate(`/households/${householdIdParam}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Retour
        </Button>
        <h1>📄 Génération de Rapports</h1>

        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Générer un Nouveau Rapport" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date de début"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      fullWidth
                      slotProps={{ input: { inputProps: { min: '' } } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date de fin"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      fullWidth
                      slotProps={{ input: { inputProps: { min: '' } } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Format</InputLabel>
                      <Select
                        value={format}
                        label="Format"
                        onChange={(e) => setFormat(e.target.value as 'CSV' | 'JSON' | 'TEXT')}
                      >
                        <MenuItem value="CSV">CSV</MenuItem>
                        <MenuItem value="JSON">JSON</MenuItem>
                        <MenuItem value="TEXT">Texte</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateReport}
                      disabled={generating || isLoading}
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      {generating ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Génération...
                        </>
                      ) : (
                        <>
                          <DownloadIcon sx={{ mr: 1 }} />
                          Générer et Télécharger
                        </>
                      )}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info">
                      Formats disponibles:
                      <ul>
                        <li><strong>CSV</strong> - Compatible avec Excel et Calc</li>
                        <li><strong>JSON</strong> - Format structuré pour applications</li>
                        <li><strong>Texte</strong> - Rapport formaté lisible</li>
                      </ul>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title={`Historique des Exports (${reportHistory.length})`} />
              <CardContent>
                {reportHistory.length === 0 ? (
                  <Alert severity="info">Aucun rapport exporté pour le moment</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Format</TableCell>
                          <TableCell>Période</TableCell>
                          <TableCell>Taille</TableCell>
                          <TableCell>Exporté par</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportHistory.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{formatDate(report.createdAt)}</TableCell>
                            <TableCell>
                              <strong>{report.format}</strong>
                            </TableCell>
                            <TableCell>
                              {new Date(report.periodStart).toLocaleDateString('fr-FR')} -{' '}
                              {new Date(report.periodEnd).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>{formatFileSize(report.fileSize)}</TableCell>
                            <TableCell>
                              {report.user
                                ? `${report.user.firstName} ${report.user.lastName}`
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Reports;
