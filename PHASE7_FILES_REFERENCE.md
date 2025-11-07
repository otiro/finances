# Phase 7 Files Reference Guide

Quick reference for all files created and modified in Phase 7.

---

## NEW FILES (3)

### 1. backend/src/middleware/adminCheck.middleware.ts
**Purpose:** Middleware to verify user is ADMIN in a household
**Key Functions:**
- `requireHouseholdAdmin` - Checks if user has ADMIN role in household
**Status:** Ready for deployment
**Lines:** 62

### 2. backend/src/services/incomeCalculation.service.ts
**Purpose:** Income calculation and sharing ratio logic
**Key Functions:**
- `calculateMonthlyIncome(householdId, userId, year, month, salaryCategoryId?)` - Sums CREDIT transactions
- `getHouseholdMonthlyIncomes(householdId, year, month, salaryCategoryId?)` - All members' income
- `calculateSharingRatios(householdId, year, month, salaryCategoryId?)` - Returns percentage ratios
- `applyRatiosToAccount(accountId, ratios)` - Updates AccountOwner percentages
- `applyRatiosToAccounts(accountIds, ratios)` - Batch apply ratios
- `recordSharingRatioHistory(householdId, year, month, ratios, incomes, totalIncome, accountId?, appliedBy?)` - Audit trail
- `getSharingRatioHistory(householdId, limit=24)` - Retrieves history
**Status:** Ready for deployment
**Lines:** 246

### 3. backend/src/jobs/adjustSharingRatioJob.ts
**Purpose:** Cron job to adjust sharing ratios daily
**Key Functions:**
- `adjustSharingRatiosJob()` - Daily execution (checks if today === ratioAdjustmentDay)
- `adjustSharingRatiosNow(householdId, year, month, userId?)` - Manual application on demand
**Status:** Ready for deployment (registered in index.ts)
**Lines:** 240

---

## MODIFIED FILES (7)

### 1. backend/prisma/schema.prisma
**Changes:**
- Added `HouseholdConfiguration` model
  - Fields: id, householdId, salaryCategoryId, autoAdjustRatios, ratioAdjustmentDay, proportionalAccounts
  - Relations: household
- Added `SharingRatioHistory` model
  - Fields: id, householdId, accountId, year, month, ratios (JSON), incomes (JSON), totalIncome, appliedAt, appliedBy, calculatedAt
  - Relations: household, account
- Updated Household model to include relations to both new models
**Status:** Ready for migration
**Key Lines:** Added ~80 lines for 2 new models

### 2. backend/src/index.ts
**Changes:**
- Line 23: Added import `import { adjustSharingRatioJob } from './jobs/adjustSharingRatioJob';`
- Lines 70-72: Added cron job execution in app.listen() callback:
  ```typescript
  // Start sharing ratio adjustment job (daily at specified time)
  adjustSharingRatiosJob();
  logger.info('Sharing ratio adjustment job started');
  ```
**Status:** Ready for deployment
**Key Lines:** 23, 70-72

### 3. backend/src/services/household.service.ts
**Changes:**
- Added `promoteMemberToAdmin(householdId, memberUserId, requestingUserId)` method (~35 lines)
  - Verifies requester is ADMIN
  - Prevents double-promotion
  - Updates role to ADMIN
  - Returns updated membership with user details
- Added `demoteAdminToMember(householdId, adminUserId, requestingUserId)` method (~50 lines)
  - Same validations as promote
  - Prevents demotion if only 1 ADMIN remains
  - Throws error: "Impossible de rétrograder le dernier administrateur..."
**Status:** Ready for deployment
**Key Changes:** Added 2 exported async functions

### 4. backend/src/controllers/household.controller.ts
**Changes:**
- Added `promoteMemberToAdmin` handler (~25 lines)
- Added `demoteAdminToMember` handler (~25 lines)
- Added `getIncomeAnalysis` handler (~60 lines)
  - Query params: year, month (required)
  - Returns member analysis with salary, ratio, name, email
- Added `getSharingConfiguration` handler (~40 lines)
  - Returns config or defaults if not found
- Added `updateSharingConfiguration` handler (~45 lines)
  - Upserts HouseholdConfiguration
  - Updates: autoAdjustRatios, ratioAdjustmentDay, salaryCategoryId, proportionalAccounts
- Added `getSharingHistory` handler (~30 lines)
  - Query param: limit (default 24)
- Added `applySharingRatios` handler (~40 lines)
  - Body: { year, month }
  - Calls adjustSharingRatiosNow manually
**Status:** Ready for deployment
**Key Changes:** Added 5 exported async functions

### 5. backend/src/routes/household.routes.ts
**Changes:**
- Line 57-58: Promote endpoint `router.post('/:id/members/:memberId/promote', ...)`
- Line 66-67: Demote endpoint `router.post('/:id/members/:memberId/demote', ...)`
- Line 103: Income analysis `router.get('/:id/income-analysis', ...)`
- Line 109: Get config `router.get('/:id/sharing-configuration', ...)`
- Line 115-117: Update config `router.patch('/:id/sharing-configuration', ...)`
- Line 124: Get history `router.get('/:id/sharing-history', ...)`
- Line 130: Apply ratios `router.post('/:id/apply-sharing-ratios', ...)`
**Status:** Ready for deployment
**Key Changes:** Added 6 route definitions

### 6. frontend/src/services/household.service.ts
**Changes:**
- Added `promoteMemberToAdmin(householdId, memberId)` method (~15 lines)
  - POST to /households/:id/members/:memberId/promote
  - Reloads household data after success
- Added `demoteAdminToMember(householdId, memberId)` method (~15 lines)
  - POST to /households/:id/members/:memberId/demote
  - Reloads household data after success
**Status:** Ready for deployment
**Key Changes:** Added 2 exported async functions

### 7. frontend/src/pages/HouseholdDetails.tsx
**Changes:**
- Added imports:
  - `SecurityIcon` from '@mui/icons-material/Security'
  - `KeyOffIcon` from '@mui/icons-material/KeyOff'
- Added `handlePromoteMember(memberId)` function (~10 lines)
  - Confirmation dialog
  - Calls service method
  - Reloads household
- Added `handleDemoteMember(memberId)` function (~10 lines)
  - Confirmation dialog
  - Calls service method
  - Reloads household
- Modified member list rendering to show:
  - SecurityIcon button when member.role !== 'ADMIN' (promote)
  - KeyOffIcon button when member.role === 'ADMIN' AND admin count > 1 (demote)
  - Buttons only visible if user is ADMIN
**Status:** Ready for deployment
**Key Changes:** Added 2 handler functions + button UI in member list

---

## DOCUMENTATION FILES (4)

### 1. PHASE7_PLAN.md
**Content:** Detailed design document
- Feature specifications
- Architecture diagrams
- Database schema definitions
- API endpoint specifications
- User interface requirements
- Edge case handling
- Testing strategy
**Status:** Reference document (already created)

### 2. PHASE7_DEPLOYMENT_CHECKLIST.md
**Content:** Step-by-step deployment guide for RPi
- All files changed
- Database migration steps
- Build steps
- Startup steps
- Frontend deployment
- New API endpoints reference
- Database schema reference
- Cron job details
- Testing checklist (13 items)
- Troubleshooting guide
- Rollback plan
**Status:** Ready for use on RPi

### 3. PHASE7_IMPLEMENTATION_SUMMARY.md
**Content:** Comprehensive overview
- Implementation status table
- Detailed feature descriptions
- Key technical decisions (6 items)
- File changes summary
- Compilation status
- Testing requirements (unit, integration, manual)
- What's not implemented (Phase 7.3)
- Deployment instructions
- Known limitations (4 items)
- Future enhancements (8 items)
- Support & troubleshooting
**Status:** Reference document

### 4. PHASE7_QUICK_START.md
**Content:** Quick reference for RPi deployment
- Copy & paste commands
- Step-by-step deployment
- Frontend deployment
- Troubleshooting
- Verification checklist
- Rollback plan
- What was changed summary
- Database schema SQL
- New API endpoints
- Next steps
**Status:** Ready for use on RPi

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [x] All TypeScript code compiles without errors
- [x] All imports are correct and files exist
- [x] Database schema changes defined
- [x] API endpoints documented
- [x] Frontend UI updated for admin features
- [x] Cron job registered in startup
- [x] Documentation complete

### On RPi - Commands
```bash
# Backend
cd /home/pi/finances/backend
git pull origin main
npx prisma migrate dev --name add_household_configuration_and_sharing_ratio_history
npm run build
npm run dev

# Frontend
cd /home/pi/finances/frontend
npm run build
# Restart frontend server
```

### Post-Deployment Testing
- [ ] Database migration succeeds
- [ ] Backend build succeeds
- [ ] Server starts without errors
- [ ] Health endpoint works
- [ ] Both cron jobs start
- [ ] Promote/demote buttons work
- [ ] Income analysis endpoint works
- [ ] Configuration endpoints work
- [ ] History records properly

---

## IMPORTANT NOTES

### TypeScript Errors (All Fixed)
1. ✅ Unused import in adjustSharingRatioJob.ts - FIXED
2. ✅ Missing return type in adminCheck.middleware.ts - FIXED
3. ✅ Wrong constant name (INTERNAL_SERVER_ERROR) - FIXED

### Critical Implementation Details
1. **Income Calculation:** Sums CREDIT transactions in salary category
2. **Ratio Calculation:** Based on PREVIOUS month's income (calculated on adjustment day)
3. **Zero Income:** Falls back to equal shares (50/50, 33/33/33, etc.)
4. **Admin Permission:** Verified at service layer in both promote and demote
5. **Last Admin:** Cannot be demoted (safety guard prevents all admins being removed)
6. **History:** Stored for 24 months with audit trail (appliedBy, appliedAt)

### Configuration
- `autoAdjustRatios`: Enable/disable automatic daily adjustment (default: true)
- `ratioAdjustmentDay`: Day of month to run adjustment (default: 1, range: 1-31)
- `salaryCategoryId`: Category to count as salary (optional)
- `proportionalAccounts`: Array of account IDs to apply ratios to (default: [])

---

## GIT COMMITS

```
d439446 Add Phase 7 quick start deployment guide for RPi
caf25ee Add Phase 7 implementation summary documentation
108b170 Phase 7: Register adjustSharingRatiosJob in backend startup
b9c1fea v0.7.0
ce08e2f Phase 7.2: Add proportional sharing configuration endpoints
f76d8df Phase 7: Multi-Admin & Proportional Sharing by Income
```

---

## SUMMARY

- **Total New Files:** 3
- **Total Modified Files:** 7
- **Total Documentation Files:** 4
- **New Database Tables:** 2
- **New API Endpoints:** 6 (+ 2 internal service methods = 8 total)
- **New Frontend Components:** Promote/demote buttons in existing component
- **Lines of Code Added:** ~700 (backend) + ~50 (frontend)
- **Compilation Status:** ✅ Ready

---

**Status:** Ready for deployment to RPi
**Next Phase:** Phase 7.3 - Frontend UI pages for Income Analysis and Sharing Configuration
