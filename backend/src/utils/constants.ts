// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  UNAUTHORIZED: 'Non autorisé',
  INVALID_TOKEN: 'Token invalide ou expiré',

  // General
  INTERNAL_ERROR: 'Une erreur interne est survenue',
  VALIDATION_ERROR: 'Erreur de validation',
  NOT_FOUND: 'Ressource non trouvée',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'Utilisateur créé avec succès',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
} as const;
