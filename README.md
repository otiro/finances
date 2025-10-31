# Application de Gestion Budgétaire Familiale

Application web full-stack permettant à un couple de suivre, catégoriser et équilibrer leurs dépenses communes en fonction de leurs revenus respectifs.

## 🏗️ Architecture

### Stack Technique

**Backend:**
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT pour l'authentification

**Frontend:**
- React 18 + TypeScript
- Vite
- Material-UI (MUI)
- Zustand (state management)
- Axios
- Recharts (graphiques)

## 📁 Structure du Projet

```
finances/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── config/         # Configuration (DB, auth, server)
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares (auth, validation, errors)
│   │   ├── services/       # Logique métier
│   │   ├── utils/          # Utilitaires
│   │   └── index.ts        # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   ├── tests/              # Tests
│   └── package.json
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   │   ├── common/    # Composants réutilisables
│   │   │   ├── layout/    # Layout (Header, Sidebar, Footer)
│   │   │   ├── auth/      # Composants d'authentification
│   │   │   ├── dashboard/ # Composants du tableau de bord
│   │   │   ├── transactions/
│   │   │   ├── analytics/
│   │   │   └── accounts/
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── store/         # State management (Zustand)
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilitaires
│   │   ├── types/         # Types TypeScript
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── CLAUDE.md              # Cahier des charges complet
└── README.md              # Ce fichier
```

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+
- Git

### Installation sur Raspberry Pi 4

#### 1. Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Installer Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Vérifier l'installation
```

#### 3. Installer PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 4. Configurer PostgreSQL

```bash
sudo -u postgres psql

# Dans le shell PostgreSQL :
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_sécurisé';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\q
```

#### 5. Cloner et configurer le projet

```bash
cd /home/julien
git clone <votre-repo> finances
cd finances
```

### Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
nano .env  # Éditer avec vos paramètres

# Générer le client Prisma
npm run prisma:generate

# Créer les tables de la base de données
npm run prisma:migrate

# Démarrer le serveur en développement
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`

### Configuration Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 🔒 Configuration de la Sécurité

### Variables d'environnement (.env)

**Backend (.env):**
```env
DATABASE_URL="postgresql://finances_user:votre_mot_de_passe@localhost:5432/finances_db?schema=public"
PORT=3000
NODE_ENV=production
JWT_SECRET=générer_une_clé_secrète_forte
JWT_REFRESH_SECRET=générer_une_autre_clé_secrète_forte
CORS_ORIGIN=http://votre-domaine.com
```

**Générer des clés secrètes sécurisées:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Sécurisation du Raspberry Pi

```bash
# Installer le firewall
sudo apt install ufw -y

# Autoriser SSH, HTTP et HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Installer fail2ban (protection brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

## 🚢 Déploiement en Production

### Avec PM2 (recommandé)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Build du backend
cd backend
npm run build

# Démarrer avec PM2
pm2 start dist/index.js --name finances-api

# Build du frontend
cd ../frontend
npm run build

# Servir le frontend avec un serveur HTTP (exemple avec serve)
npm install -g serve
pm2 start "serve -s dist -l 5173" --name finances-frontend

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### Avec Nginx (reverse proxy)

```bash
# Installer Nginx
sudo apt install nginx -y

# Créer la configuration
sudo nano /etc/nginx/sites-available/finances
```

**Configuration Nginx:**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/finances /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Le renouvellement automatique est configuré par défaut
```

## 🗃️ Gestion de la Base de Données

### Migrations Prisma

```bash
# Créer une nouvelle migration
npm run prisma:migrate

# Réinitialiser la base de données (ATTENTION : efface toutes les données)
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status

# Interface graphique pour explorer la DB
npm run prisma:studio
```

### Sauvegardes

**Script de sauvegarde automatique:**

```bash
#!/bin/bash
# Créer le fichier: /home/julien/backup-db.sh

BACKUP_DIR="/home/julien/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
pg_dump -U finances_user finances_db > $BACKUP_DIR/finances_db_$DATE.sql

# Garder seulement les 30 dernières sauvegardes
ls -t $BACKUP_DIR/finances_db_*.sql | tail -n +31 | xargs rm -f

echo "Backup completed: finances_db_$DATE.sql"
```

**Automatiser avec cron:**
```bash
chmod +x /home/julien/backup-db.sh
crontab -e

# Ajouter cette ligne pour une sauvegarde quotidienne à 2h du matin :
0 2 * * * /home/julien/backup-db.sh >> /home/julien/backup.log 2>&1
```

## 🧪 Tests

```bash
# Backend
cd backend
npm test
npm run test:watch

# Frontend
cd frontend
npm test
npm run test:ui
```

## 📊 Monitoring

### Logs avec PM2

```bash
# Voir les logs en temps réel
pm2 logs finances-api

# Logs du frontend
pm2 logs finances-frontend

# Monitoring en temps réel
pm2 monit
```

### Surveillance système

```bash
# Installer htop
sudo apt install htop -y
htop

# Température du CPU
vcgencmd measure_temp
```

## 🔧 Scripts NPM Disponibles

### Backend

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Compiler le TypeScript
- `npm start` - Démarrer en production
- `npm test` - Lancer les tests
- `npm run lint` - Vérifier le code
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Créer/appliquer les migrations
- `npm run prisma:studio` - Interface graphique DB

### Frontend

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build
- `npm test` - Lancer les tests
- `npm run lint` - Vérifier le code

## 📝 Fonctionnalités Principales

- ✅ **Gestion des utilisateurs** - Authentification, profils, foyers
- ✅ **Comptes bancaires** - Multi-comptes, soldes en temps réel
- ✅ **Transactions** - Ajout manuel, import CSV, catégorisation
- ✅ **Catégories** - Personnalisables, règles automatiques
- ✅ **Budgets** - Par catégorie, alertes de dépassement
- ✅ **Analytics** - Graphiques, statistiques, tendances
- ✅ **Récurrences** - Détection automatique, rappels
- ✅ **Répartition** - Équilibrage selon revenus
- ✅ **Exports** - CSV, PDF, rapports

## 🎯 Roadmap

### Phase 1 - MVP (Semaines 1-6) ✅
- [x] Configuration projet
- [x] Structure backend/frontend
- [x] Schéma base de données
- [ ] Authentification
- [ ] Gestion comptes
- [ ] Gestion transactions basiques

### Phase 2 - Fonctionnalités principales (Semaines 7-10)
- [ ] Catégorisation avancée
- [ ] Budgets et alertes
- [ ] Dashboard et analytics
- [ ] Dépenses récurrentes

### Phase 3 - Optimisation (Semaines 11-13)
- [ ] Tests complets
- [ ] Optimisation performances
- [ ] Documentation
- [ ] Déploiement production

## 🤝 Contribution

Ce projet est privé et destiné à un usage familial. Pour toute question ou amélioration, créer une issue ou une pull request.

## 📄 Licence

Propriétaire - Tous droits réservés

## 📞 Support

Pour toute question sur l'installation ou l'utilisation :
- Consulter le [cahier des charges](CLAUDE.md)
- Vérifier les logs avec `pm2 logs`
- Consulter les issues GitHub

## 🙏 Remerciements

- React et l'écosystème React
- Material-UI pour les composants
- Prisma pour l'ORM
- La communauté open-source

---

**Développé avec ❤️ pour la gestion budgétaire familiale**
