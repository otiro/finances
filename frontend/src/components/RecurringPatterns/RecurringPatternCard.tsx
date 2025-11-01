import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Stack,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RecurringPattern } from '../../services/recurringTransaction.service';

interface RecurringPatternCardProps {
  pattern: RecurringPattern;
  onEdit: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
  onViewLogs: () => void;
  isLoading?: boolean;
}

/**
 * Carte affichant les détails d'une transaction récurrente
 */
const RecurringPatternCard: React.FC<RecurringPatternCardProps> = ({
  pattern,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onViewLogs,
  isLoading = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete();
  };

  const handlePause = () => {
    handleMenuClose();
    onPause();
  };

  const handleResume = () => {
    handleMenuClose();
    onResume();
  };

  const handleViewLogs = () => {
    handleMenuClose();
    onViewLogs();
  };

  // Format frequency
  const frequencyLabels: Record<string, string> = {
    DAILY: '📅 Quotidien',
    WEEKLY: '📆 Hebdomadaire',
    BIWEEKLY: '📋 Bi-hebdomadaire',
    MONTHLY: '📊 Mensuel',
    QUARTERLY: '📈 Trimestriel',
    YEARLY: '📍 Annuel',
  };

  // Format amount with sign
  const formattedAmount = `${pattern.type === 'DEBIT' ? '-' : '+'} ${pattern.amount.toFixed(2)} €`;
  const amountColor = pattern.type === 'DEBIT' ? '#d32f2f' : '#388e3c';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        opacity: !pattern.isActive ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {pattern.name}
            </Typography>
            {pattern.isPaused && (
              <Chip label="Pausé" size="small" color="warning" variant="outlined" />
            )}
            {!pattern.isActive && (
              <Chip label="Inactif" size="small" color="default" variant="outlined" />
            )}
          </Box>
        }
        action={
          <>
            <IconButton
              aria-label="options"
              onClick={handleMenuOpen}
              disabled={isLoading}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ mr: 1 }} /> Éditer
              </MenuItem>
              <MenuItem onClick={handleViewLogs}>
                <HistoryIcon sx={{ mr: 1 }} /> Historique
              </MenuItem>
              <Divider />
              <MenuItem onClick={pattern.isPaused ? handleResume : handlePause}>
                {pattern.isPaused ? (
                  <>
                    <PlayArrowIcon sx={{ mr: 1 }} /> Reprendre
                  </>
                ) : (
                  <>
                    <PauseIcon sx={{ mr: 1 }} /> Pause
                  </>
                )}
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ mr: 1 }} /> Supprimer
              </MenuItem>
            </Menu>
          </>
        }
      />

      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={2}>
          {/* Amount */}
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              Montant
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: amountColor }}
            >
              {formattedAmount}
            </Typography>
          </Box>

          {/* Frequency and Description */}
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              Fréquence
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {frequencyLabels[pattern.frequency]}
            </Typography>
          </Box>

          {/* Description */}
          {pattern.description && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                {pattern.description}
              </Typography>
            </Box>
          )}

          {/* Category */}
          {pattern.category && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                Catégorie
              </Typography>
              <Chip
                label={pattern.category.name}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: pattern.category.color + '20',
                  borderColor: pattern.category.color,
                }}
              />
            </Box>
          )}

          <Divider />

          {/* Next Generation Date */}
          <Box>
            <Typography variant="caption" color="textSecondary">
              Prochaine génération
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {format(new Date(pattern.nextGenerationDate), 'dd MMMM yyyy', { locale: fr })}
            </Typography>
          </Box>

          {/* Last Generated Date */}
          {pattern.lastGeneratedDate && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Dernière génération
              </Typography>
              <Typography variant="body2">
                {format(new Date(pattern.lastGeneratedDate), 'dd MMMM yyyy à HH:mm', {
                  locale: fr,
                })}
              </Typography>
            </Box>
          )}

          {/* Date Range */}
          {pattern.endDate && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Valide jusqu'au
              </Typography>
              <Typography variant="body2">
                {format(new Date(pattern.endDate), 'dd MMMM yyyy', { locale: fr })}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Footer Actions */}
      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        <Button
          size="small"
          startIcon={<HistoryIcon />}
          onClick={handleViewLogs}
          disabled={isLoading}
        >
          Logs
        </Button>
        <Box>
          {pattern.isPaused ? (
            <Button
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleResume}
              disabled={isLoading}
            >
              Reprendre
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<PauseIcon />}
              onClick={handlePause}
              disabled={isLoading}
            >
              Pause
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default RecurringPatternCard;
