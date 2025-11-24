# 🚀 Guide Autostart - Démarrage Automatique Application

**Objectif:** Faire démarrer automatiquement votre application Finances quand le Raspberry Pi s'allume, SANS avoir besoin de lancer des commandes manuelles.

**Temps de configuration:** ~15 minutes

---

## 📋 Situation Actuelle vs Cible

### Avant (Situation actuelle)
```
RPi allumé → Vous connectez SSH → Vous lancez commandes manuelles
                                    (cd ~/finances, npm run dev, etc.)
                                    → Terminal SSH ouvert en permanence
```

### Après (Objective)
```
RPi allumé → Application démarre AUTOMATIQUEMENT en background
             → Accessible immédiatement à moneypi.local
             → Aucune intervention manuelle nécessaire
             → Redémarrage auto si crash
```

---

## 🛠️ Solution: PM2 (Process Manager)

PM2 est un gestionnaire de processus Node.js qui permet de:
- ✅ Démarrer auto au boot du Raspberry Pi
- ✅ Relancer automatiquement si l'app crash
- ✅ Gérer les logs
- ✅ Monitorer la santé de l'app

### Avantages
- Simple à configurer
- Standard de l'industrie
- Produit aucune surcharge RPi
- Intégration facile avec systemd

---

## 🔧 ÉTAPE 1: Installation PM2

**Sur le Raspberry Pi (via SSH):**

```bash
# Se connecter au RPi
ssh -i path/to/key julien@moneypi.local

# Installer PM2 globalement (avec sudo pour les permissions)
sudo npm install -g pm2

# Vérifier l'installation
pm2 --version
```

⚠️ **Si vous avez une erreur EACCES:**
```bash
# Utilisez sudo:
sudo npm install -g pm2

# Puis vérifiez
pm2 --version
```

---

## 📁 ÉTAPE 2: Structure du Projet

Assurez-vous que votre projet a cette structure:

```
~/finances/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── dist/              ← Fichiers compilés
│   └── .env              ← Variables d'environnement
│
└── frontend/
    ├── package.json
    └── dist/             ← Build React optimisé
```

---

## 🏗️ ÉTAPE 3: Créer le Fichier de Configuration PM2

**Sur le RPi, créer:** `~/finances/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    // Application Backend
    {
      name: 'finances-backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/julien/finances/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      // Redémarrage auto
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      max_memory_restart: '500M',

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/julien/finances/logs/backend-error.log',
      out_file: '/home/julien/finances/logs/backend-out.log',

      // Attendre le démarrage
      wait_ready: true,
      listen_timeout: 10000,
    },

    // Server Nginx (optionnel, si vous l'utilisez)
    {
      name: 'nginx',
      script: 'sh',
      args: '-c "sudo nginx -g \'daemon off;\'"',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      error_file: '/home/julien/finances/logs/nginx-error.log',
      out_file: '/home/julien/finances/logs/nginx-out.log',
    },
  ],
};
```

---

## 📝 ÉTAPE 4: Préparer le Build Production

**Sur le RPi:**

```bash
cd ~/finances/backend

# Compiler TypeScript
npm run build

# Vérifier que dist/ est créé
ls dist/
```

**Assurez-vous que `package.json` a:**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts"
  }
}
```

---

## 🚀 ÉTAPE 5: Démarrer avec PM2

**Sur le RPi:**

```bash
cd ~/finances

# Créer les répertoires de logs
mkdir -p logs

# Démarrer les processus
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status

# Voir les logs en live
pm2 logs finances-backend

# Arrêter un processus
pm2 stop finances-backend

# Redémarrer
pm2 restart finances-backend

# Arrêter tous
pm2 stop all

# Relancer tous
pm2 restart all

# Afficher les détails complets
pm2 show finances-backend
```

---

## 🔄 ÉTAPE 6: Configurer le Autostart au Boot

**Sur le RPi, faire en sorte que PM2 démarre automatiquement:**

```bash
# Générer le script systemd pour PM2
pm2 startup systemd -u julien --hp /home/julien

# Sauvegarder la configuration PM2 actuelle
pm2 save

# Vérifier que le service systemd est créé
systemctl status pm2-julien
```

**Après ces commandes:**
- ✅ PM2 se lancera automatiquement au démarrage du RPi
- ✅ Tous les processus définis se relanceront
- ✅ Si l'app crash, elle redémarre auto

---

## ✅ ÉTAPE 7: Vérification Complète

**Sur le RPi:**

```bash
# Voir tous les processus PM2
pm2 list

# Voir le log d'un processus spécifique
pm2 logs finances-backend --lines 100

# Voir les erreurs
pm2 logs finances-backend --err

# Monitorer en temps réel
pm2 monit

# Voir les métriques
pm2 status
```

---

## 🧪 ÉTAPE 8: Test du Autostart

**Pour tester le autostart:**

```bash
# Arrêter tous les processus
pm2 stop all

# Redémarrer le Raspberry Pi
sudo reboot

# Attendre ~30 secondes
# Se reconnecter et vérifier
pm2 status

# Accéder à l'application
# http://moneypi.local:3030/api/  (Backend)
# http://moneypi.local/           (Frontend via Nginx)
```

---

## 📊 Commandes PM2 Utiles

```bash
# Voir le statut
pm2 status

# Voir les logs en temps réel
pm2 logs

# Voir les logs d'une app spécifique
pm2 logs finances-backend

# Voir uniquement les erreurs
pm2 logs --err

# Voir les 50 dernières lignes
pm2 logs --lines 50

# Monitorer (comme top)
pm2 monit

# Informations détaillées
pm2 show finances-backend

# Supprimer une app
pm2 delete finances-backend

# Supprimer toutes les apps
pm2 delete all

# Redémarrer une app
pm2 restart finances-backend

# Recharger (zero-downtime)
pm2 reload finances-backend

# Arrêter une app
pm2 stop finances-backend

# Arrêter tout
pm2 stop all

# Sauvegarder la configuration
pm2 save

# Restaurer la configuration
pm2 resurrect
```

---

## 🔍 Troubleshooting

### L'app ne démarre pas

```bash
# Voir les erreurs
pm2 logs finances-backend --err

# Vérifier la config
cat ecosystem.config.js

# Relancer avec verbose
pm2 start ecosystem.config.js --verbose
```

### Erreur "command not found: pm2"

```bash
# PM2 peut ne pas être dans le PATH
npm list -g pm2

# Si non installé
npm install -g pm2
```

### L'app crash après le démarrage

```bash
# Voir les logs d'erreur
pm2 logs finances-backend --err --lines 100

# Vérifier que .env existe
cat ~/finances/backend/.env

# Vérifier que la base de données est accessible
npm test
```

### PM2 ne démarre pas au boot

```bash
# Vérifier le service systemd
systemctl status pm2-julien

# Voir les logs systemd
sudo journalctl -u pm2-julien -n 50

# Réinstaller le service
pm2 startup systemd -u julien --hp /home/julien
sudo systemctl enable pm2-julien
pm2 save
```

---

## 🌐 Configuration Nginx (Frontend)

Si vous utilisez Nginx pour servir le frontend React:

```nginx
server {
    listen 80;
    server_name moneypi.local;

    # Frontend React
    location / {
        root /home/julien/finances/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis ajouter à `ecosystem.config.js`:

```javascript
{
  name: 'nginx',
  script: 'bash',
  args: '-c "sudo systemctl restart nginx"',
  exec_mode: 'fork',
  autorestart: false,
}
```

---

## 📋 Checklist de Configuration Complète

- [ ] PM2 installé: `npm install -g pm2`
- [ ] Fichier `ecosystem.config.js` créé et personnalisé
- [ ] Backend compilé: `npm run build` ✅ dist/ existe
- [ ] `.env` configuré avec les bonnes variables
- [ ] Base de données PostgreSQL running et accessible
- [ ] `pm2 start ecosystem.config.js` exécuté
- [ ] `pm2 save` exécuté
- [ ] `pm2 startup` exécuté et systemd activé
- [ ] Test du autostart: RPi rebooté et app accessible
- [ ] Logs monitorés: `pm2 logs` affiche pas d'erreur
- [ ] Application accessible via `http://moneypi.local`

---

## 🎯 Alternative: Service Systemd Personnalisé

Si vous préférez ne pas utiliser PM2, vous pouvez créer un service systemd directement.

**Fichier:** `/etc/systemd/system/finances.service`

```ini
[Unit]
Description=Finances Family Budget Application
After=network.target postgresql.service

[Service]
Type=simple
User=julien
WorkingDirectory=/home/julien/finances/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/home/julien/finances/logs/finances.log
StandardError=append:/home/julien/finances/logs/finances.error.log

[Install]
WantedBy=multi-user.target
```

**Pour activer:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable finances
sudo systemctl start finances
sudo systemctl status finances
```

---

## 📞 Résumé des Commandes Essentielles

```bash
# Démarrer l'app
pm2 start ecosystem.config.js

# Voir le statut
pm2 status

# Voir les logs
pm2 logs

# Configurer autostart
pm2 startup
pm2 save

# Après reboot, vérifier
pm2 status

# Accéder à l'app
# http://moneypi.local
```

---

## 🎉 Résultat Final

**Après cette configuration:**

1. ✅ RPi s'allume → Application démarre automatiquement
2. ✅ Pas de terminal SSH ouvert nécessaire
3. ✅ Redémarrage automatique si crash
4. ✅ Application accessible à `http://moneypi.local`
5. ✅ Logs persistants pour debug
6. ✅ Commandes faciles pour contrôler l'app

---

**Généré:** 24 Novembre 2025
**Prochaine étape:** Suivre les 8 étapes ci-dessus sur le Raspberry Pi
**Temps estimé:** 15 minutes
**Complexité:** Simple ⭐⭐
