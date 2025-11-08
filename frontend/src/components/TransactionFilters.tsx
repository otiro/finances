import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Category } from '../services/category.service';

export interface TransactionFiltersState {
  type: 'ALL' | 'DEBIT' | 'CREDIT';
  categoryId: string;
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  categories: Category[];
  onFiltersChange: (filters: TransactionFiltersState) => void;
}

export default function TransactionFilters({
  filters,
  categories,
  onFiltersChange,
}: TransactionFiltersProps) {
  const handleTypeChange = (value: any) => {
    onFiltersChange({ ...filters, type: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, categoryId: value });
  };

  const handleStartDateChange = (value: string) => {
    onFiltersChange({ ...filters, startDate: value });
  };

  const handleEndDateChange = (value: string) => {
    onFiltersChange({ ...filters, endDate: value });
  };

  const handleReset = () => {
    onFiltersChange({
      type: 'ALL',
      categoryId: '',
      startDate: '',
      endDate: '',
    });
  };

  const isFiltered =
    filters.type !== 'ALL' ||
    filters.categoryId !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="DEBIT">Dépenses</MenuItem>
              <MenuItem value="CREDIT">Revenus</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={filters.categoryId}
              label="Catégorie"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <MenuItem value="">Toutes</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Du"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            label="Au"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleReset}
            disabled={!isFiltered}
            fullWidth
          >
            Réinitialiser
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
