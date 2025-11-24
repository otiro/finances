# ⚡ Quick Start - Autostart en 5 Minutes

**Pour ceux qui veulent juste que ça marche rapidement.**

---

## 🎯 Le Plan

1. Se connecter au RPi
2. Exécuter UN script de setup
3. Done! ✅

---

## 🚀 Exécution

### Sur votre PC (Windows/Mac)
```bash
# 1. Copier les scripts sur le RPi
scp setup-autostart.sh julien@moneypi.local:~/finances/
scp manage-app.sh julien@moneypi.local:~/finances/
```

### Sur le Raspberry Pi (via SSH)
```bash
# 2. Se connecter
ssh julien@moneypi.local

# 3. Aller dans le répertoire
cd ~/finances

# 4. Rendre les scripts exécutables
chmod +x setup-autostart.sh
chmod +x manage-app.sh

# 5. EXÉCUTER LE SETUP (c'est tout!)
bash setup-autostart.sh

# 📝 Note: Le script demandera sudo password pour installer PM2 globalement
# C'est normal et nécessaire (pour les permissions /usr/lib/node_modules)
```

**C'est fini!** ✅

---

## ✅ Vérification

```bash
# Vérifier que l'app tourne
bash manage-app.sh status

# Voir les logs
bash manage-app.sh logs

# Test santé
bash manage-app.sh health
```

---

## 🔄 Commandes Au Quotidien

Depuis le RPi:

```bash
# Voir le statut
bash manage-app.sh status

# Redémarrer
bash manage-app.sh restart

# Voir les logs
bash manage-app.sh logs

# Vérifier la santé
bash manage-app.sh health

# Compiler et redémarrer
bash manage-app.sh rebuild
```

---

## 🧪 Test Autostart

```bash
# Redémarrer le RPi
sudo reboot

# Attendre 30 secondes et se reconnecter
ssh julien@moneypi.local

# Vérifier que l'app a démarré
bash manage-app.sh status

# Doit afficher: online avec CPU et mémoire en utilisation
```

---

## 🌐 Accéder à l'App

```
Backend API:   http://moneypi.local:3030/api
Frontend:      http://moneypi.local
```

---

## 📚 Plus de Détails?

Lire: [AUTOSTART_GUIDE.md](AUTOSTART_GUIDE.md)

---

**C'est tout!** 🎉
