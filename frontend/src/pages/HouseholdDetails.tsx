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
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../hooks/useAuth';
import { useHouseholdStore } from '../store/slices/householdSlice';
import { useAccountStore } from '../store/slices/accountSlice';
import * as householdService from '../services/household.service';
import * as accountService from '../services/account.service';
import * as categoryService from '../services/category.service';
import AddMemberDialog from '../components/AddMemberDialog';
import CreateAccountDialog from '../components/CreateAccountDialog';
import UpdateSharingModeDialog from '../components/UpdateSharingModeDialog';
import CreateCategoryDialog from '../components/CreateCategoryDialog';
import EditCategoryDialog from '../components/EditCategoryDialog';
import RecurringPatternWidget from '../components/RecurringPatterns/RecurringPatternWidget';

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
  const { user } = useAuth();
  const { currentHousehold, isLoading } = useHouseholdStore();
  const { accounts } = useAccountStore();
  const [tabValue, setTabValue] = useState(0);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [updateSharingModeDialogOpen, setUpdateSharingModeDialogOpen] = useState(false);
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<categoryService.Category | null>(null);
  const [categories, setCategories] = useState<categoryService.Category[]>([]);
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
        await loadCategories(id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    }
  };

  const loadCategories = async (householdId: string) => {
    try {
      const result = await categoryService.getAllAvailableCategories(householdId);
      const allCategories = [...(result.system || []), ...(result.household || [])];
      setCategories(allCategories);
    } catch (err: any) {
      console.error('Error loading categories:', err);
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

  const handleEditCategory = (category: categoryService.Category) => {
    if (category.isSystem) return; // Cannot edit system categories
    setEditingCategory(category);
    setEditCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category: categoryService.Category) => {
    if (!id || category.isSystem) return; // Cannot delete system categories
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) return;

    try {
      await categoryService.deleteCategory(id, category.id);
      await loadHouseholdData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la catégorie');
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
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Retour au tableau de bord
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={getSharingModeLabel(currentHousehold.sharingMode)} />
          {isAdmin && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setUpdateSharingModeDialogOpen(true)}
            >
              Modifier
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Aperçu" />
          <Tab label="Membres" />
          <Tab label="Comptes" />
          <Tab label="Catégories" />
          <Tab label="Transactions Récurrentes" />
          <Tab label="Budgets" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RecurringPatternWidget householdId={id!} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations du foyer
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mode de partage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={getSharingModeLabel(currentHousehold.sharingMode)} />
                      {isAdmin && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setUpdateSharingModeDialogOpen(true)}
                        >
                          Modifier
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Statistiques
                    </Typography>
                    <Typography variant="body2">
                      Membres : <strong>{currentHousehold.members.length}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Comptes : <strong>{accounts.length}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Catégories : <strong>{categories.length}</strong>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
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

      <TabPanel value={tabValue} index={2}>
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
            {accounts
              .filter((account) => {
                // Ne montrer que les comptes dont l'utilisateur est propriétaire
                return account.owners.some((owner: any) => owner.userId === user?.id);
              })
              .map((account) => (
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

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Catégories du foyer</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateCategoryDialogOpen(true)}
            >
              Créer une catégorie
            </Button>
          )}
        </Box>

        {categories.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Aucune catégorie créée pour ce foyer
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <List>
              {categories.map((category, index) => (
                <Box key={category.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      !category.isSystem && isAdmin ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            edge="end"
                            onClick={() => handleEditCategory(category)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCategory(category)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : undefined
                    }
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={category.name}
                      secondary={category.isSystem ? 'Catégorie système' : 'Catégorie personnalisée'}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transactions Récurrentes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/households/${id}/recurring-transactions`)}
          >
            Gérer les transactions récurrentes
          </Button>
        </Box>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Cliquez sur le bouton ci-dessus pour gérer vos transactions récurrentes
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Budgets</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/households/${id}/budgets`)}
          >
            Gérer les budgets
          </Button>
        </Box>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Cliquez sur le bouton ci-dessus pour gérer vos budgets par catégorie
            </Typography>
          </CardContent>
        </Card>
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

      {isAdmin && (
        <UpdateSharingModeDialog
          open={updateSharingModeDialogOpen}
          householdId={currentHousehold.id}
          currentMode={currentHousehold.sharingMode}
          onClose={() => setUpdateSharingModeDialogOpen(false)}
          onSuccess={loadHouseholdData}
        />
      )}

      {isAdmin && (
        <CreateCategoryDialog
          open={createCategoryDialogOpen}
          householdId={currentHousehold.id}
          onClose={() => setCreateCategoryDialogOpen(false)}
          onSuccess={loadHouseholdData}
        />
      )}

      {isAdmin && (
        <EditCategoryDialog
          open={editCategoryDialogOpen}
          householdId={currentHousehold.id}
          category={editingCategory}
          onClose={() => {
            setEditCategoryDialogOpen(false);
            setEditingCategory(null);
          }}
          onSuccess={loadHouseholdData}
        />
      )}
    </Container>
  );
}
