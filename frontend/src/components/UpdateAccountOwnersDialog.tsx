import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as accountService from '../services/account.service';

interface Owner {
  id: string;
  userId: string;
  ownershipPercentage: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Household {
  id: string;
  members: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

interface UpdateAccountOwnersDialogProps {
  open: boolean;
  accountId: string;
  currentOwners: Owner[];
  household: Household;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdateAccountOwnersDialog({
  open,
  accountId,
  currentOwners,
  household,
  onClose,
  onSuccess,
}: UpdateAccountOwnersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [owners, setOwners] = useState<Owner[]>(currentOwners);

  useEffect(() => {
    setOwners(currentOwners);
  }, [currentOwners]);

  // Récupérer les membres qui ne sont pas encore propriétaires
  const availableMembers = household.members.filter(
    (member) => !owners.some((owner) => owner.userId === member.userId)
  );

  const handleAddOwner = async () => {
    if (!selectedUserId) return;

    setError('');
    setIsLoading(true);

    try {
      await accountService.addAccountOwner(accountId, selectedUserId);
      setSelectedUserId('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erreur lors de l\'ajout du propriétaire'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveOwner = async (ownerUserId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce propriétaire ?'))
      return;

    setError('');
    setIsLoading(true);

    try {
      await accountService.removeAccountOwner(accountId, ownerUserId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de la suppression du propriétaire'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gérer les propriétaires du compte</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Propriétaires actuels ({owners.length})
        </Typography>

        {owners.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Aucun propriétaire
          </Typography>
        ) : (
          <List sx={{ mb: 3 }}>
            {owners.map((owner, index) => (
              <Box key={owner.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={`${owner.user.firstName} ${owner.user.lastName}`}
                    secondary={owner.user.email}
                  />
                  <ListItemSecondaryAction>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: '60px' }}>
                        {owner.ownershipPercentage}%
                      </Typography>
                      {owners.length > 1 && (
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveOwner(owner.userId)}
                          color="error"
                          disabled={isLoading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Ajouter un propriétaire
        </Typography>

        {availableMembers.length === 0 ? (
          <Alert severity="info">
            Tous les membres du foyer sont déjà propriétaires de ce compte
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Membre à ajouter</InputLabel>
            <Select
              value={selectedUserId}
              label="Membre à ajouter"
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isLoading}
            >
              {availableMembers.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  {member.user.firstName} {member.user.lastName} (
                  {member.user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Fermer
        </Button>
        {availableMembers.length > 0 && (
          <Button
            onClick={handleAddOwner}
            variant="contained"
            disabled={!selectedUserId || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Ajouter
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
