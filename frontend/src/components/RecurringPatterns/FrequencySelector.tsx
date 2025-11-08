import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Box,
  Typography,
  Paper,
} from '@mui/material';

interface FrequencySelectorProps {
  value: string;
  onChange: (frequency: string) => void;
}

interface FrequencyOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const frequencyOptions: FrequencyOption[] = [
  {
    value: 'DAILY',
    label: 'Quotidien',
    description: 'Chaque jour',
    icon: '📅',
  },
  {
    value: 'WEEKLY',
    label: 'Hebdomadaire',
    description: 'Chaque semaine',
    icon: '📆',
  },
  {
    value: 'BIWEEKLY',
    label: 'Bi-hebdomadaire',
    description: 'Toutes les 2 semaines',
    icon: '📋',
  },
  {
    value: 'MONTHLY',
    label: 'Mensuel',
    description: 'Chaque mois',
    icon: '📊',
  },
  {
    value: 'QUARTERLY',
    label: 'Trimestriel',
    description: 'Chaque trimestre',
    icon: '📈',
  },
  {
    value: 'YEARLY',
    label: 'Annuel',
    description: 'Chaque année',
    icon: '📍',
  },
];

/**
 * Sélecteur de fréquence pour les transactions récurrentes
 * Affiche toutes les options disponibles avec descriptions
 */
const FrequencySelector: React.FC<FrequencySelectorProps> = ({ value, onChange }) => {
  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2, fontWeight: 600, fontSize: '0.95rem' }}>
        Fréquence de répétition
      </FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ gap: 1.5 }}
      >
        {frequencyOptions.map((option) => (
          <Paper
            key={option.value}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: value === option.value ? 'primary.main' : 'transparent',
              backgroundColor: value === option.value ? 'primary.lighter' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Radio
                value={option.value}
                checked={value === option.value}
                sx={{ mr: 2 }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {option.icon} {option.label}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {option.description}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default FrequencySelector;
