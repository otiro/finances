# Démarrage Rapide - 5 Minutes

Ce guide vous permet de démarrer le projet en quelques minutes.

## Installation Automatique

### Windows
```bash
setup.bat
```

### Linux / macOS / Raspberry Pi
```bash
chmod +x setup.sh
./setup.sh
```

## Installation Manuelle

### 1. Installer les dépendances (2 min)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurer l'environnement (1 min)

```bash
# Backend
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres

# Frontend
cd ../frontend
cp .env.example .env
```

### 3. Créer la base de données (1 min)

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Exécuter ces commandes SQL :
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\q
```

### 4. Initialiser Prisma (1 min)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
✅ Backend démarré sur `http://localhost:3000`

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
✅ Frontend démarré sur `http://localhost:5173`

## Ouvrir l'application

Ouvrez votre navigateur et accédez à :
```
http://localhost:5173
```

## Commandes Utiles

### Voir la base de données
```bash
cd backend
npm run prisma:studio
```
Interface graphique accessible sur `http://localhost:5555`

### Logs en temps réel
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## En cas de problème

### Port 3000 déjà utilisé
```bash
# Trouver le processus
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Changer le port dans backend/.env
PORT=3001
```

### Erreur de connexion à la base de données
Vérifiez dans `backend/.env` :
```env
DATABASE_URL="postgresql://finances_user:votre_mot_de_passe@localhost:5432/finances_db?schema=public"
```

### Les migrations Prisma échouent
```bash
cd backend
# Réinitialiser la base de données (ATTENTION : efface les données)
npx prisma migrate reset
```

## Vérifier que tout fonctionne

1. **Backend** : `http://localhost:3000/health`
   - Devrait retourner `{"status":"ok", "timestamp":"..."}`

2. **Frontend** : `http://localhost:5173`
   - Devrait afficher la page "Finances Familiales"

3. **Base de données** : `npm run prisma:studio`
   - Devrait ouvrir l'interface Prisma Studio

## Prochaines étapes

Maintenant que le projet est configuré :

1. Consultez [STRUCTURE.md](STRUCTURE.md) pour comprendre l'architecture
2. Consultez [PROJECT_STATUS.md](PROJECT_STATUS.md) pour voir l'avancement
3. Consultez [CLAUDE.md](CLAUDE.md) pour le cahier des charges complet
4. Commencez à développer la Phase 2 (Authentification)

## Support Rapide

| Problème | Solution |
|----------|----------|
| Port occupé | Changer PORT dans .env |
| DB non trouvée | Vérifier DATABASE_URL dans .env |
| Prisma error | Lancer `npm run prisma:generate` |
| Import error | Supprimer node_modules et réinstaller |
| Types error | Vérifier tsconfig.json |

## Scripts NPM Disponibles

### Backend
```bash
npm run dev              # Mode développement
npm run build            # Compiler TypeScript
npm start                # Mode production
npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Créer migration
npm run prisma:studio    # Interface DB
npm test                 # Lancer tests
npm run lint             # Vérifier le code
```

### Frontend
```bash
npm run dev      # Mode développement
npm run build    # Build production
npm run preview  # Prévisualiser build
npm test         # Lancer tests
npm run lint     # Vérifier le code
```

---

🎉 **Vous êtes prêt à développer !**

Pour plus de détails, consultez [README.md](README.md) et [INSTALLATION.md](INSTALLATION.md).
