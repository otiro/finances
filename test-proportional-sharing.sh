#!/bin/bash

# Script de test pour le partage proportionnel - Phase 7.2
# Usage: ./test-proportional-sharing.sh <household-id> <token>

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <household-id> <token>"
  echo ""
  echo "Exemple:"
  echo "  $0 'clx1234567890abcd' 'eyJhbGciOiJIUzI1NiIs...'"
  echo ""
  echo "Récupère:"
  echo "  - household-id: ID du foyer (dans l'URL ou via GET /api/households)"
  echo "  - token: JWT token (copie depuis localStorage ou React DevTools)"
  exit 1
fi

HOUSEHOLD_ID=$1
TOKEN=$2
BASE_URL="http://localhost:3000/api"
ACCOUNT_ID=""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Script de Test - Partage Proportionnel (Phase 7.2)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Household ID: $HOUSEHOLD_ID"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Fonction pour afficher les résultats
show_result() {
  local endpoint=$1
  local response=$2
  echo -e "${YELLOW}→ $endpoint${NC}"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  echo ""
}

# Test 1: Récupérer la configuration
echo -e "${BLUE}[Test 1] Récupérer la configuration de partage${NC}"
CONFIG=$(curl -s -X GET "$BASE_URL/households/$HOUSEHOLD_ID/sharing-configuration" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
show_result "GET /households/:id/sharing-configuration" "$CONFIG"

# Extraire l'ID du premier compte du foyer pour le test
echo -e "${BLUE}[Test 2] Récupérer les comptes du foyer${NC}"
HOUSEHOLD=$(curl -s -X GET "$BASE_URL/households/$HOUSEHOLD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
ACCOUNT_ID=$(echo "$HOUSEHOLD" | jq -r '.data.accounts[0].id' 2>/dev/null)

if [ "$ACCOUNT_ID" != "null" ] && [ -n "$ACCOUNT_ID" ]; then
  echo -e "${GREEN}✓ Compte trouvé: $ACCOUNT_ID${NC}"
  echo ""
else
  echo -e "${RED}✗ Aucun compte trouvé. Crée un compte avant de continuer.${NC}"
  exit 1
fi

# Test 2: Mettre à jour la configuration
echo -e "${BLUE}[Test 3] Mettre à jour la configuration${NC}"
UPDATE_CONFIG=$(curl -s -X PATCH "$BASE_URL/households/$HOUSEHOLD_ID/sharing-configuration" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"autoAdjustRatios\": true,
    \"ratioAdjustmentDay\": 1,
    \"salaryCategoryId\": null,
    \"proportionalAccounts\": [\"$ACCOUNT_ID\"]
  }")
show_result "PATCH /households/:id/sharing-configuration" "$UPDATE_CONFIG"

# Test 3: Récupérer l'analyse des revenus pour octobre 2025
echo -e "${BLUE}[Test 4] Récupérer l'analyse des revenus (octobre 2025)${NC}"
INCOME_ANALYSIS=$(curl -s -X GET "$BASE_URL/households/$HOUSEHOLD_ID/income-analysis?year=2025&month=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
show_result "GET /households/:id/income-analysis?year=2025&month=10" "$INCOME_ANALYSIS"

# Test 4: Appliquer les ratios manuellement
echo -e "${BLUE}[Test 5] Appliquer les ratios manuellement (octobre 2025)${NC}"
APPLY_RATIOS=$(curl -s -X POST "$BASE_URL/households/$HOUSEHOLD_ID/apply-sharing-ratios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 10
  }')
show_result "POST /households/:id/apply-sharing-ratios" "$APPLY_RATIOS"

# Test 5: Récupérer l'historique
echo -e "${BLUE}[Test 6] Récupérer l'historique des ratios${NC}"
HISTORY=$(curl -s -X GET "$BASE_URL/households/$HOUSEHOLD_ID/sharing-history?limit=24" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
show_result "GET /households/:id/sharing-history?limit=24" "$HISTORY"

# Test 6: Appliquer pour un autre mois
echo -e "${BLUE}[Test 7] Appliquer pour novembre 2025${NC}"
APPLY_RATIOS_NOV=$(curl -s -X POST "$BASE_URL/households/$HOUSEHOLD_ID/apply-sharing-ratios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 11
  }')
show_result "POST /households/:id/apply-sharing-ratios (novembre)" "$APPLY_RATIOS_NOV"

# Test 7: Récupérer l'analyse pour novembre
echo -e "${BLUE}[Test 8] Récupérer l'analyse pour novembre 2025${NC}"
INCOME_ANALYSIS_NOV=$(curl -s -X GET "$BASE_URL/households/$HOUSEHOLD_ID/income-analysis?year=2025&month=11" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
show_result "GET /households/:id/income-analysis?year=2025&month=11" "$INCOME_ANALYSIS_NOV"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Tests complétés!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Résumé:"
echo "  1. Configuration mise à jour avec le compte: $ACCOUNT_ID"
echo "  2. Ratios appliqués pour octobre 2025"
echo "  3. Ratios appliqués pour novembre 2025"
echo "  4. Historique disponible"
echo ""
echo "Prochaines étapes:"
echo "  - Ajoute des transactions CREDIT (salaire) pour les membres"
echo "  - Réexécute ce script pour voir les ratios calculés"
echo "  - Vérifie l'historique dans la base de données:"
echo "    SELECT * FROM \"SharingRatioHistory\" WHERE \"householdId\" = '$HOUSEHOLD_ID';"
echo ""
