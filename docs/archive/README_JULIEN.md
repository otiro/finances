# 👤 Configuration Spécifique - Julien @ moneypi

Ce fichier contient la configuration spécifique pour votre setup.

## 🖥️ Votre Configuration

- **Machine :** Raspberry Pi (hostname: moneypi)
- **Utilisateur :** julien
- **Répertoire projet :** `/home/julien/finances`
- **Mode :** Développement et test direct sur le Raspberry Pi

## 📝 Ce qui a été fait

### 1. ✅ Dépendances mises à jour

Les warnings npm que vous avez vus ont été corrigés :
- ✅ ESLint 8 → ESLint 9
- ✅ Multer 1.4 → Multer 2.0
- ✅ Packages deprecated → versions actuelles
- ✅ Nouveau fichier de config ESLint créé (`eslint.config.mjs`)

### 2. ✅ Fichier .env créé et pré-configuré

Le fichier `backend/.env` a été créé avec des valeurs par défaut.

**⚠️ VOUS DEVEZ MODIFIER 3 CHOSES :**

#### a. Le mot de passe PostgreSQL (ligne 3)
```env
DATABASE_URL="postgresql://finances_user:VOTRE_MOT_DE_PASSE_ICI@localhost:5432/finances_db?schema=public"
```

#### b. JWT_SECRET (ligne 9)
Générez avec :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### c. JWT_REFRESH_SECRET (ligne 11)
Générez une AUTRE clé avec la même commande.

### 3. ✅ Documentation adaptée pour vous

- Toutes les références `/home/pi` → `/home/julien`
- Configuration CORS adaptée pour `moneypi.local`
- Guides spécifiques Raspberry Pi créés

## 🎯 SUIVEZ CE GUIDE DANS L'ORDRE

### Étape 1 : PostgreSQL

📄 **Fichier à suivre :** [NEXT_STEPS.md](NEXT_STEPS.md) - Section 1

Résumé rapide :
```bash
sudo -u postgres psql
```

Dans PostgreSQL :
```sql
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'MonMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\c finances_db
GRANT ALL ON SCHEMA public TO finances_user;
\q
```

### Étape 2 : Configurer .env

```bash
cd ~/finances/backend
nano .env
```

Modifiez les 3 paramètres mentionnés ci-dessus.

### Étape 3 : Prisma

```bash
cd ~/finances/backend
npm run prisma:generate
npm run prisma:migrate
# Tapez "init" comme nom de migration
```

### Étape 4 : Démarrer

**Terminal 1 :**
```bash
cd ~/finances/backend
npm run dev
```

**Terminal 2 :**
```bash
cd ~/finances/frontend
npm install
npm run dev
```

## 📚 Documentation Disponible

### Pour DÉMARRER MAINTENANT
1. **[NEXT_STEPS.md](NEXT_STEPS.md)** ⭐ COMMENCEZ ICI
   - Guide pas à pas de ce qu'il faut faire maintenant
   - Toutes les commandes dans l'ordre
   - 10 minutes pour tout configurer

### Pour CONFIGURATION DÉTAILLÉE
2. **[CONFIGURATION_RASPBERRY_PI.md](CONFIGURATION_RASPBERRY_PI.md)**
   - Guide complet spécifique Raspberry Pi
   - Dépannage détaillé
   - Configuration sécurité

### Pour COMPRENDRE LE PROJET
3. **[WELCOME.md](WELCOME.md)** - Vue d'ensemble
4. **[STRUCTURE.md](STRUCTURE.md)** - Architecture détaillée
5. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - État actuel et roadmap

### Pour RÉFÉRENCE
6. **[README.md](README.md)** - Documentation principale
7. **[INSTALLATION.md](INSTALLATION.md)** - Guide d'installation complet
8. **[QUICKSTART.md](QUICKSTART.md)** - Démarrage rapide général

## 🔑 Informations Importantes

### Mots de passe à créer et noter

1. **PostgreSQL User Password** (pour `finances_user`)
   - À définir dans : PostgreSQL lors de la création
   - À mettre dans : `backend/.env` → `DATABASE_URL`

2. **JWT Secret** (pour les tokens d'authentification)
   - À générer avec : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - À mettre dans : `backend/.env` → `JWT_SECRET`

3. **JWT Refresh Secret** (pour les refresh tokens)
   - À générer avec la même commande (DIFFÉRENT du JWT_SECRET)
   - À mettre dans : `backend/.env` → `JWT_REFRESH_SECRET`

### URLs à retenir

- **Frontend :** http://moneypi.local:5173 (ou http://localhost:5173)
- **Backend API :** http://moneypi.local:3000 (ou http://localhost:3000)
- **API Health Check :** http://localhost:3000/health
- **Prisma Studio :** http://localhost:5555

### Ports utilisés

- `3000` - Backend API (Express)
- `5173` - Frontend (Vite dev server)
- `5432` - PostgreSQL
- `5555` - Prisma Studio (quand lancé)

## ⚡ Commandes Rapides

### Démarrer tout
```bash
# Terminal 1
cd ~/finances/backend && npm run dev

# Terminal 2
cd ~/finances/frontend && npm run dev
```

### Voir la base de données
```bash
cd ~/finances/backend && npm run prisma:studio
```

### Générer les secrets JWT
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Vérifier le statut
```bash
# Backend
curl http://localhost:3000/health

# PostgreSQL
sudo systemctl status postgresql

# Ports ouverts
ss -tulpn | grep -E ':(3000|5173|5432)'
```

### Logs
```bash
# Logs backend (dans le terminal où npm run dev tourne)
# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🐛 Résolution de Problèmes Rapide

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Tester connexion DB
psql -U finances_user -d finances_db -h localhost

# Vérifier le .env
cd ~/finances/backend
cat .env | grep -E "(DATABASE_URL|JWT_SECRET)"
```

### Port déjà utilisé
```bash
# Port 3000
lsof -ti:3000 | xargs kill -9

# Port 5173
lsof -ti:5173 | xargs kill -9
```

### Prisma erreur
```bash
cd ~/finances/backend
rm -rf node_modules
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Frontend erreur de connexion
Vérifiez `frontend/.env` :
```env
VITE_API_URL=http://localhost:3000/api
```

## 📊 Checklist de Démarrage

Cochez au fur et à mesure :

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `finances_db` créée
- [ ] Utilisateur `finances_user` créé avec mot de passe
- [ ] Fichier `backend/.env` édité avec le bon mot de passe
- [ ] JWT secrets générés et ajoutés dans `.env`
- [ ] `npm run prisma:generate` réussi
- [ ] `npm run prisma:migrate` réussi (migration "init")
- [ ] Backend démarre sans erreur (`npm run dev`)
- [ ] Frontend installé (`npm install` dans frontend/)
- [ ] Frontend démarre sans erreur (`npm run dev`)
- [ ] `curl http://localhost:3000/health` retourne OK
- [ ] Page frontend accessible dans le navigateur

✅ **Tout est coché ?** Vous êtes prêt pour la Phase 2 !

## 🚀 Phase 2 : Authentification (Prochaine Étape)

Une fois la Phase 1 terminée (checklist ci-dessus), vous pourrez développer :

**Backend à créer :**
- `src/services/auth.service.ts` - Logique login/register/JWT
- `src/controllers/auth.controller.ts` - Endpoints d'authentification
- `src/routes/auth.routes.ts` - Routes `/api/auth/*`
- `src/middleware/auth.middleware.ts` - Vérification JWT
- `src/middleware/validation.middleware.ts` - Validation Zod

**Frontend à créer :**
- `src/store/slices/authSlice.ts` - State management auth
- `src/services/auth.service.ts` - Appels API
- `src/hooks/useAuth.ts` - Hook personnalisé
- `src/components/auth/LoginForm.tsx` - Formulaire login
- `src/components/auth/RegisterForm.tsx` - Formulaire register
- `src/pages/Login.tsx` et `src/pages/Register.tsx`

Détails dans [PROJECT_STATUS.md](PROJECT_STATUS.md).

## 💡 Conseils

1. **Gardez 2 terminaux ouverts** pour backend et frontend
2. **Utilisez Prisma Studio** régulièrement pour voir les données
3. **Consultez les logs** en cas d'erreur
4. **Testez l'API avec curl** avant de faire le frontend
5. **Faites des commits Git réguliers** (une fois que tout marche)

## 📞 Support

Si vous êtes bloqué :

1. **Regardez les logs** dans les terminaux
2. **Testez chaque composant** séparément (DB → Backend → Frontend)
3. **Consultez** [CONFIGURATION_RASPBERRY_PI.md](CONFIGURATION_RASPBERRY_PI.md)
4. **Vérifiez** que tous les services sont démarrés

## 🎓 Ressources

- **Node.js :** https://nodejs.org/docs/
- **Express :** https://expressjs.com/
- **Prisma :** https://www.prisma.io/docs
- **React :** https://react.dev/
- **TypeScript :** https://www.typescriptlang.org/docs/
- **Material-UI :** https://mui.com/

---

**👤 Configuration pour :** julien@moneypi
**📅 Créé le :** $(date)
**✅ Statut :** Phase 1 - Configuration terminée

**🎯 ACTION IMMÉDIATE :** Lisez [NEXT_STEPS.md](NEXT_STEPS.md) et suivez les étapes !
