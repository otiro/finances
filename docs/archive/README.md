# 📚 Archive Documentation

Cette dossier contient les documents de travail et tests des phases complétées.

**Ces fichiers ne sont plus actifs**, mais conservés pour référence historique.

---

## 🏁 Phase 1-3 Tests (Obsolète)

Fichiers de test pour les phases initiales:
- `TESTING_PHASE2.md` - Tests phase 2 (authentification)
- `TESTING_PHASE3.md` - Tests phase 3 (foyers/comptes)
- `PHASE3_PROGRESS.md` - Progression phase 3

---

## 🔧 Setup Initial (Obsolète)

Configuration initiale du projet (maintenant dans INSTALLATION.md et CONFIGURATION_RASPBERRY_PI.md):
- `NEXT_STEPS.md` - Étapes de setup (replacé par INSTALLATION.md)
- `README_JULIEN.md` - Notes personnelles
- `guide.md` - Guide ancien

---

## ⚡ Flux 8-10 (Complété & Fixé en v0.4.9g2)

Implémentation du marquage de dettes comme payées. **Maintenant en production!**

Documents de travail:
- `FLUX_8-10_DOCUMENTATION_INDEX.md` - Index de la doc Flux 8-10
- `FLUX_8-10_EXECUTIVE_SUMMARY.md` - Vue executive
- `FLUX_8-10_FIX_SUMMARY.md` - Explication du bug fix
- `FLUX_8-10_IMPLEMENTATION_STATUS.md` - Status implémentation
- `FLUX_8-10_QUICK_START.md` - Démarrage rapide
- `FLUX_8-10_VISUAL_GUIDE.md` - Diagrammes et flows
- `README_FLUX_8-10.md` - README Flux 8-10
- `TESTING_FLUX_8-10.md` - Tests Flux 8-10
- `TESTING_FLUX_8-10_FIX.md` - Tests du fix

**Statut**: ✅ **Complété et déployé en v0.4.9g2**

---

## 📝 Session Work (Intermédiaire)

Documents générés pendant les sessions de travail:
- `CONTINUATION_SUMMARY.md` - Résumé continuation session
- `CRITICAL_BUG_FIX_REQUIRED.md` - Report du bug critique
- `DEPLOYMENT_STATUS.md` - Status de déploiement
- `SESSION_COMPLETION_REPORT.md` - Report de session
- `PHASE4_TRANSACTIONS.md` - Notes phase 4 transactions
- `TESTING_PHASE4.5.md` - Tests phase 4.5 (catégories)
- `CLEANUP_PLAN.md` - Plan de nettoyage (utilisé pour créer ce dossier)

---

## 📖 Documents à Consulter

Pour l'historique:
- Voir les commits git: `git log --grep="Phase 2\|Phase 3\|Flux 8-10"`
- Voir les releases: `git tag`

Pour l'état actuel:
- 📍 **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** - État du projet
- 📍 **[ROADMAP_PHASE5_AND_BEYOND.md](../ROADMAP_PHASE5_AND_BEYOND.md)** - Prochaines phases
- 📍 **[WHAT_IS_NEXT.md](../WHAT_IS_NEXT.md)** - Guide Phase 5

---

## 🔍 Comment Rechercher un Document

Si tu cherches un ancien document:

```bash
# Lister tous les fichiers archive
ls docs/archive/

# Chercher un fichier spécifique
ls docs/archive/ | grep "FLUX"
ls docs/archive/ | grep "TESTING"
ls docs/archive/ | grep "PHASE"

# Voir le contenu
cat docs/archive/FLUX_8-10_FIX_SUMMARY.md
```

---

## 📌 Repères par Phase

### Phase 2 (Authentification)
- Tests: `TESTING_PHASE2.md`
- Status: ✅ Complété (v0.2.x)

### Phase 3 (Foyers/Comptes)
- Tests: `TESTING_PHASE3.md`
- Progress: `PHASE3_PROGRESS.md`
- Status: ✅ Complété (v0.3.x)

### Phase 4 (Transactions)
- Tests: `TESTING_PHASE4.md` (racine, toujours valide)
- Transactions: `PHASE4_TRANSACTIONS.md`
- Catégories: `TESTING_PHASE4.5.md`
- Status: ✅ Complété (v0.4.x)

### Flux 8-10 (Paiement Dettes)
- Docs complets: Tous les fichiers `FLUX_8-10_*.md`
- Status: ✅ Complété et fixé (v0.4.9g2)

### Phase 5 (Suivante)
- Roadmap: `../ROADMAP_PHASE5_AND_BEYOND.md`
- Guide: `../WHAT_IS_NEXT.md`

---

## ✅ Raison de l'Archivage

Les documents ici ont été archivés pour:

✅ Garder la racine du projet **propre et focalisée**
✅ Conserver l'**historique** pour référence
✅ Améliorer la **navigation** (moins de fichiers = plus clair)
✅ Préparer le projet pour **Phase 5** sur base propre
✅ Suivre les **meilleures pratiques** (archive docs anciennes)

---

**Besoin d'un ancien document?** C'est ici! 📂
