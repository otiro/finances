import { useEffect, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  CircularProgress,
  Box,
  Alert,
  Button,
  Dialog as MuiDialog,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as recurringTransactionService from '../../services/recurringTransaction.service';
import type { RecurringPattern } from '../../services/recurringTransaction.service';

interface GenerationLogsModalProps {
  open: boolean;
  onClose: () => void;
  pattern: RecurringPattern;
  householdId: string;
}

/**
 * Modal affichant l'historique de génération des transactions
 */
const GenerationLogsModal: React.FC<GenerationLogsModalProps> = ({
  open,
  onClose,
  pattern,
  householdId,
}) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, pattern.id, householdId]);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringTransactionService.getGenerationLogs(
        householdId,
        pattern.id,
        50
      );
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Chip label="✅ Succès" size="small" color="success" variant="outlined" />;
      case 'FAILED':
        return <Chip label="❌ Échoué" size="small" color="error" variant="outlined" />;
      case 'SKIPPED':
        return <Chip label="⏭️ Ignoré" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ fontWeight: 600 }}>Historique de génération</Box>
          <Box sx={{ fontSize: '0.875rem', color: 'textSecondary', fontWeight: 400 }}>
            {pattern.name}
          </Box>
        </Box>
        <Button onClick={onClose} startIcon={<CloseIcon />} />
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      {format(new Date(log.generatedDate), 'dd/MM/yyyy HH:mm', {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.generatedTransactionId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <code style={{ fontSize: '0.85rem' }}>
                            {log.generatedTransactionId.slice(0, 8)}...
                          </code>
                          <Button
                            size="small"
                            onClick={() => handleCopyId(log.generatedTransactionId)}
                            title={copiedId === log.generatedTransactionId ? 'Copié!' : 'Copier'}
                          >
                            <FileCopyIcon sx={{ fontSize: '1rem' }} />
                          </Button>
                        </Box>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.errorMessage ? (
                        <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>
                          {log.errorMessage}
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: 'textSecondary' }}>
            Aucun historique de génération trouvé
          </Box>
        )}
      </DialogContent>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </Box>
    </MuiDialog>
  );
};

export default GenerationLogsModal;
