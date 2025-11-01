import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHouseholdStore } from '../store/slices/householdSlice';
import { useAccountStore } from '../store/slices/accountSlice';
import * as householdService from '../services/household.service';
import * as accountService from '../services/account.service';
import AddMemberDialog from '../components/AddMemberDialog';
import CreateAccountDialog from '../components/CreateAccountDialog';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HouseholdDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentHousehold, isLoading } = useHouseholdStore();
  const { accounts } = useAccountStore();
  const [tabValue, setTabValue] = useState(0);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadHouseholdData();
    }
  }, [id]);

  const loadHouseholdData = async () => {
    try {
      if (id) {
        await householdService.getHouseholdById(id);
        await accountService.getHouseholdAccounts(id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre du foyer ?')) return;

    try {
      await householdService.removeMemberFromHousehold(id, memberId);
      await loadHouseholdData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du membre');
    }
  };

  const getSharingModeLabel = (mode: string) => {
    switch (mode) {
      case 'EQUAL':
        return 'Parts égales';
      case 'PROPORTIONAL':
        return 'Proportionnel aux revenus';
      case 'CUSTOM':
        return 'Personnalisé';
      default:
        return mode;
    }
  };

  const isAdmin = currentHousehold?.userRole === 'ADMIN';

  if (isLoading && !currentHousehold) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentHousehold) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Foyer non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/households')}
        sx={{ mb: 2 }}
      >
        Retour aux foyers
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {currentHousehold.name}
          </Typography>
          <Chip
            label={currentHousehold.userRole}
            color={currentHousehold.userRole === 'ADMIN' ? 'primary' : 'default'}
          />
        </Box>
        <Chip label={getSharingModeLabel(currentHousehold.sharingMode)} />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Membres" />
          <Tab label="Comptes" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Membres du foyer</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMemberDialogOpen(true)}
            >
              Ajouter un membre
            </Button>
          )}
        </Box>

        <Card>
          <List>
            {currentHousehold.members.map((member, index) => (
              <Box key={member.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={`${member.user.firstName} ${member.user.lastName}`}
                    secondary={
                      <>
                        {member.user.email}
                        {member.user.monthlyIncome > 0 && (
                          <> • Revenu mensuel : {member.user.monthlyIncome} €</>
                        )}
                      </>
                    }
                  />
                  <Chip
                    label={member.role}
                    color={member.role === 'ADMIN' ? 'primary' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {isAdmin && currentHousehold.members.length > 1 && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(member.userId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Comptes du foyer</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateAccountDialogOpen(true)}
          >
            Créer un compte
          </Button>
        </Box>

        {accounts.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Aucun compte créé pour ce foyer
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {accounts.map((account) => (
              <Grid item xs={12} sm={6} key={account.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {account.name}
                    </Typography>
                    <Chip label={account.type} size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Solde initial : {account.initialBalance} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Propriétaires : {account.owners.map(o => o.user.firstName).join(', ')}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate(`/accounts/${account.id}`)}
                      sx={{ mt: 1 }}
                    >
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {isAdmin && (
        <AddMemberDialog
          open={addMemberDialogOpen}
          householdId={currentHousehold.id}
          onClose={() => setAddMemberDialogOpen(false)}
          onSuccess={loadHouseholdData}
        />
      )}

      <CreateAccountDialog
        open={createAccountDialogOpen}
        household={currentHousehold}
        onClose={() => setCreateAccountDialogOpen(false)}
        onSuccess={loadHouseholdData}
      />
    </Container>
  );
}
