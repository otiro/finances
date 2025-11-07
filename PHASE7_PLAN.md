# Phase 7 - Multi-Admin & Proportional Sharing by Income

**Status**: 📋 Planning Phase
**Date**: 2025-11-07
**Estimated Duration**: 4-5 days total
**Priority**: HIGH - Core financial feature

---

## 🎯 Overview

Two interconnected features for smarter household financial management:

### Feature 1: Multi-Admin Support
Allow multiple administrators in a household, each with ability to manage accounts, budgets, and members.

### Feature 2: Proportional Sharing by Income
Automatically calculate and adjust expense sharing ratios for shared accounts based on actual monthly salaries received.

---

## 📊 Current State Analysis

### What Already Exists ✅

**Database Model** - Schema already supports both features:
```prisma
enum HouseholdRole {
  ADMIN   // ← Already exists
  MEMBER  // ← Already exists
}

enum SharingMode {
  EQUAL       // 50/50
  PROPORTIONAL // ← Already exists (but not fully implemented)
  CUSTOM      // Personnalisé
}

model UserHousehold {
  role HouseholdRole @default(MEMBER)
}

model AccountOwner {
  ownershipPercentage Decimal @default(100)
}
```

**Backend Services**:
- ✅ `household.service.ts` - Handles member management
- ✅ `account.service.ts` - Handles account owners
- ✅ User authentication middleware
- ✅ Permission checks for household access

**Frontend**:
- ✅ HouseholdDetails page (already shows members)
- ✅ Dashboard with household selector
- ✅ Responsive MUI components

### What Needs Implementation 🔧

**Backend**:
- [ ] Admin-only operations for member management
- [ ] Income calculation from transactions (CREDIT type, "Salary" category)
- [ ] Proportional ratio calculation algorithm
- [ ] Automatic ownership percentage adjustment
- [ ] History tracking for ratio changes

**Frontend**:
- [ ] UI to promote MEMBER → ADMIN
- [ ] UI to demote ADMIN → MEMBER
- [ ] Display current sharing mode and ratios
- [ ] Income calculation view
- [ ] Ratio adjustment history

**Database**:
- [ ] New table: `IncomeHistory` or `SharingRatioHistory`
- [ ] Migration to add history tracking

---

## 🏗️ Implementation Plan

### **Phase 7.1: Multi-Admin Support** (1.5-2 days)

#### Backend Changes

**1. Admin Permission Middleware** `backend/src/middleware/adminCheck.ts` [NEW]
```typescript
export const requireHouseholdAdmin = (req, res, next) => {
  // Check if user is ADMIN in this household
  // Middleware to be used on protected routes
}
```

**2. Update Household Service** `backend/src/services/household.service.ts`
- Add `promoteToAdmin(householdId, userId)` method
- Add `demoteToMember(householdId, userId)` method
- Add validation: at least 1 admin must exist in household
- Ensure only admins can manage members

**3. Update Household Controller** `backend/src/controllers/household.controller.ts`
- Add `promoteMember()` endpoint: `PATCH /api/households/:householdId/members/:memberId/promote`
- Add `demoteMember()` endpoint: `PATCH /api/households/:householdId/members/:memberId/demote`
- Add permission checks in all member management endpoints

**4. Update Routes** `backend/src/routes/household.routes.ts`
```
POST   /api/households/:householdId/members/:userId/promote
POST   /api/households/:householdId/members/:userId/demote
```

#### Frontend Changes

**1. Update HouseholdDetails Page** `frontend/src/pages/HouseholdDetails.tsx`
- Add role display next to member names (ADMIN badge)
- Add action buttons for role management (if current user is admin)
- Show "You don't have permission to manage members" if MEMBER

**2. Create Member Management Dialog** `frontend/src/components/Dialogs/ManageMemberDialog.tsx` [NEW]
```typescript
// Allow promote/demote with confirmation
// Show current admin count (min 1 must exist)
```

**3. Update Service** `frontend/src/services/household.service.ts`
```typescript
export const promoteMember = (householdId, memberId) => {...}
export const demoteMember = (householdId, memberId) => {...}
```

#### Testing Checklist
- [ ] Only ADMIN can promote/demote members
- [ ] Cannot demote if it leaves household with 0 admins
- [ ] MEMBER cannot see promotion UI
- [ ] Non-member cannot access household endpoints
- [ ] Role persists across sessions

---

### **Phase 7.2: Proportional Sharing by Income** (2.5-3 days)

#### Algorithm Overview

```
Goal: Calculate expense sharing ratios based on monthly salary

Example:
Month October:
  - User A: 2000€ salary
  - User B: 1500€ salary
  - Total: 3500€
  - Ratio: A=57.14%, B=42.86%

Month November:
  - User A: 1500€ salary
  - User B: 1400€ salary
  - Total: 2900€
  - Ratio: A=51.72%, B=48.28%

Monthly Bills (shared account):
  - Rent: 1000€
  - Utilities: 200€
  - Total: 1200€

Assignment October:
  - A pays: 1200 × 57.14% = 685.68€
  - B pays: 1200 × 42.86% = 514.32€

Assignment November:
  - A pays: 1200 × 51.72% = 620.64€
  - B pays: 1200 × 48.28% = 579.36€
```

#### Implementation Steps

**1. Create Income Calculation Service** `backend/src/services/incomeCalculation.service.ts` [NEW]

```typescript
/**
 * Calculate monthly income for user in household
 * Looks for all CREDIT transactions in specified month
 * For "Salary" category (configurable)
 */
export const calculateMonthlyIncome = async (
  householdId: string,
  userId: string,
  year: number,
  month: number
): Promise<Decimal>

/**
 * Get all members' income for a month
 * Returns { memberId: income, ... }
 */
export const getHouseholdMonthlyIncomes = async (
  householdId: string,
  year: number,
  month: number
): Promise<Record<string, Decimal>>

/**
 * Calculate sharing ratios from incomes
 * Returns { memberId: percentage, ... } (sums to 100%)
 */
export const calculateSharingRatios = async (
  householdId: string,
  year: number,
  month: number
): Promise<Record<string, number>>
```

**2. Create Sharing Ratio History Model** `backend/prisma/schema.prisma`

```prisma
model SharingRatioHistory {
  id            String   @id @default(uuid())
  householdId   String   @map("household_id")
  accountId     String?  @map("account_id")  // NULL = household-wide

  year          Int
  month         Int     // 1-12

  // For each owner, store their ratio
  ratios        Json    // { "userId-1": 57.14, "userId-2": 42.86 }

  // Source data for audit
  incomes       Json    // { "userId-1": 2000, "userId-2": 1500 }
  totalIncome   Decimal @db.Decimal(12, 2)

  // Tracking
  calculatedAt  DateTime @default(now()) @map("calculated_at")
  appliedAt     DateTime? @map("applied_at")
  appliedBy     String?  @map("applied_by")

  household     Household @relation(fields: [householdId], references: [id], onDelete: Cascade)

  @@unique([householdId, accountId, year, month])
  @@map("sharing_ratio_histories")
}
```

**3. Add Configuration** `backend/prisma/schema.prisma`

```prisma
model HouseholdConfiguration {
  id                      String   @id @default(uuid())
  householdId             String   @unique @map("household_id")
  salaryCategoryId        String?  @map("salary_category_id")  // Where to look for salaries
  autoAdjustRatios        Boolean  @default(true) @map("auto_adjust_ratios")
  ratioAdjustmentDay      Int      @default(1)  @map("ratio_adjustment_day")  // Day of month (1-31)
  proportionalAccounts    String[] @map("proportional_accounts")  // Account IDs to apply ratios to

  household               Household @relation(fields: [householdId], references: [id], onDelete: Cascade)

  @@map("household_configurations")
}
```

**4. Update Account Owners** `backend/src/services/account.service.ts`

```typescript
/**
 * Update ownership percentages for all owners of an account
 * based on current month's income ratios
 */
export const updateOwnershipRatios = async (
  accountId: string,
  ratios: Record<string, number>  // userId → percentage
): Promise<void>

/**
 * Get current effective ownership ratios
 * (Takes into account latest sharing ratio history)
 */
export const getEffectiveOwnershipRatios = async (
  accountId: string
): Promise<Record<string, number>>
```

**5. Create Cron Job** `backend/src/jobs/adjustSharingRatioJob.ts` [NEW]

```typescript
/**
 * Runs daily at configured time
 * Checks which households need ratio adjustment (if autoAdjustRatios = true)
 * Calculates new ratios
 * Applies them to AccountOwner records
 * Logs changes in SharingRatioHistory
 */
export const adjustSharingRatiosJob = async ()
```

**6. Update Household Controller** `backend/src/controllers/household.controller.ts`

```typescript
// New endpoints:
// GET /api/households/:householdId/income-analysis
// PATCH /api/households/:householdId/sharing-configuration
// GET /api/households/:householdId/sharing-history
```

**7. New Service Methods** `backend/src/services/household.service.ts`

```typescript
export const getIncomeAnalysis = async (householdId: string, year: number, month: number)
export const updateSharingConfiguration = async (householdId: string, config: {...})
export const getSharingHistory = async (householdId: string, limit: number = 12)
export const applySharingRatios = async (householdId: string, year: number, month: number)
```

#### Frontend Changes

**1. Create Income Analysis Component** `frontend/src/components/IncomeAnalysis.tsx` [NEW]

```typescript
// Shows:
// - Monthly salaries for each member
// - Calculated ratios
// - Visual breakdown (pie chart)
// - History timeline
```

**2. Create Sharing Configuration Page** `frontend/src/pages/SharingConfiguration.tsx` [NEW]

```typescript
// Shows:
// - Selected accounts (checkboxes)
// - Salary category selector
// - Auto-adjustment toggle
// - Adjustment day picker
// - Apply ratios button
// - History of adjustments
```

**3. Update HouseholdDetails** `frontend/src/pages/HouseholdDetails.tsx`

```typescript
// Add section showing:
// - Current sharing mode
// - Current ratios (if PROPORTIONAL)
// - Income analysis link
// - Configuration link (if admin)
```

**4. Update Account Details** `frontend/src/pages/AccountDetails.tsx`

```typescript
// Show ownership percentages
// Show if account uses PROPORTIONAL sharing
// Show last ratio adjustment date
```

**5. Create Services** `frontend/src/services/sharingRatio.service.ts` [NEW]

```typescript
export const getIncomeAnalysis = (householdId, year, month) => {...}
export const updateSharingConfiguration = (householdId, config) => {...}
export const getSharingHistory = (householdId, limit) => {...}
export const applySharingRatios = (householdId, year, month) => {...}
```

#### Testing Checklist
- [ ] Income calculation correctly sums CREDIT transactions
- [ ] Ratios sum to 100%
- [ ] Ratios update correctly for each month
- [ ] Cron job runs automatically
- [ ] Manual ratio adjustment works
- [ ] History is logged correctly
- [ ] Only admins can configure sharing
- [ ] Non-proportional accounts unaffected
- [ ] Zero-income member handled (0% ratio? Error?)

---

## 🗄️ Database Schema Changes

### New Tables
1. `SharingRatioHistory` - Track ratio changes
2. `HouseholdConfiguration` - Sharing preferences

### Modified Tables
- `AccountOwner` - Already has `ownershipPercentage` ✅

### Migrations
```bash
npx prisma migrate dev --name add_sharing_ratio_tracking
```

---

## 📋 API Endpoints (Phase 7.2)

### Income & Sharing Analysis
```
GET  /api/households/:householdId/income-analysis?year=2025&month=11
  Returns: {
    month: "2025-11",
    members: [
      { userId, name, email, salary: 1500, ratio: 51.72 },
      { userId, name, email, salary: 1400, ratio: 48.28 }
    ],
    totalIncome: 2900
  }

GET  /api/households/:householdId/sharing-history
  Returns: [
    { year: 2025, month: 11, ratios: {...}, appliedAt: ... },
    { year: 2025, month: 10, ratios: {...}, appliedAt: ... }
  ]
```

### Configuration
```
GET  /api/households/:householdId/sharing-configuration
  Returns: {
    autoAdjustRatios: true,
    ratioAdjustmentDay: 1,
    salaryCategoryId: "...",
    proportionalAccounts: ["account-1", "account-2"]
  }

PATCH /api/households/:householdId/sharing-configuration
  Body: { autoAdjustRatios, ratioAdjustmentDay, salaryCategoryId, proportionalAccounts }

POST /api/households/:householdId/apply-ratios
  Body: { year: 2025, month: 11 }
  Apply calculated ratios immediately
```

### Member Management (Phase 7.1)
```
PATCH /api/households/:householdId/members/:userId/promote
  Only admins, fails if no other admins

PATCH /api/households/:householdId/members/:userId/demote
  Only admins, fails if no other admins remain
```

---

## 🎨 UI/UX Considerations

### Multi-Admin
- Show admin badge/crown icon next to admin names
- Only show management buttons to admins
- Prevent accidental last-admin removal with confirmation

### Proportional Sharing
- Show current month's ratios prominently
- Visualize with pie chart or percentages
- Timeline showing how ratios changed over time
- Clear explanation of how income is calculated
- Preview before applying ratios
- Show which accounts are affected

---

## 🧪 Testing Strategy

### Unit Tests
- Income calculation edge cases (0 income, missing salary categories)
- Ratio calculation (sums to 100%, handles 0 values)
- Permission checks (admin-only operations)

### Integration Tests
- Full flow: add member → income posted → ratio calculated → applied to account
- Household with mixed PROPORTIONAL and EQUAL accounts
- Multiple accounts with different proportional settings

### E2E Tests
- User journey: Configure sharing → Income posted → See updated ratios
- Admin removes self (should fail)
- Update salary category mid-month

---

## ⚠️ Edge Cases & Decisions

### Income Calculation
**Q: What if a member has 0 salary in a month?**
- Option A: 0% ratio (excluded from sharing)
- Option B: Minimum 5% to prevent exclusion
- Recommendation: Option A with warning notification

**Q: What category defines "Salary"?**
- Solution: Admin configurable via HouseholdConfiguration.salaryCategoryId
- Default: Look for category named "Salary" or "Revenu"
- Fallback: All CREDIT transactions if no salary category

**Q: When are ratios applied?**
- Option A: Manually on demand
- Option B: Automatically on first of month
- Recommendation: Option B (configurable day)

### Admin Management
**Q: What if all admins leave household?**
- Solution: Prevent demotion/removal if last admin
- Error message: "At least one admin must exist in household"

**Q: Can member invite new members without admin?**
- Solution: Only admins can invite
- Prevents abuse

---

## 📈 Implementation Roadmap

### Day 1-2: Phase 7.1 (Multi-Admin)
- [ ] Admin middleware
- [ ] Promote/demote endpoints
- [ ] Admin UI in HouseholdDetails
- [ ] Testing

### Day 3-4: Phase 7.2 (Proportional Sharing)
- [ ] Income calculation service
- [ ] Sharing configuration setup
- [ ] Ratio calculation algorithm
- [ ] Cron job

### Day 5: Phase 7.2 (Frontend & Polish)
- [ ] Income analysis UI
- [ ] Sharing configuration page
- [ ] History view
- [ ] Testing & bug fixes

---

## 🚀 Getting Started

```bash
# Create feature branch
git checkout -b feature/multi-admin-proportional-sharing

# Start with Phase 7.1
# 1. Create admin middleware
# 2. Add promote/demote endpoints
# 3. Update household service
# 4. Add UI components
# 5. Test thoroughly

# Then Phase 7.2
# 1. Create income calculation service
# 2. Add configuration table
# 3. Implement cron job
# 4. Create frontend pages
# 5. Test end-to-end
```

---

## 📚 Files to Create/Modify

### Backend - NEW
- `backend/src/middleware/adminCheck.ts`
- `backend/src/services/incomeCalculation.service.ts`
- `backend/src/jobs/adjustSharingRatioJob.ts`

### Backend - MODIFY
- `backend/prisma/schema.prisma` (2 new tables, add relations)
- `backend/src/services/household.service.ts`
- `backend/src/services/account.service.ts`
- `backend/src/controllers/household.controller.ts`
- `backend/src/routes/household.routes.ts`
- `backend/src/jobs/index.ts` (register cron job)

### Frontend - NEW
- `frontend/src/components/IncomeAnalysis.tsx`
- `frontend/src/components/SharingConfigurationForm.tsx`
- `frontend/src/pages/SharingConfiguration.tsx`
- `frontend/src/services/sharingRatio.service.ts`
- `frontend/src/components/Dialogs/ManageMemberDialog.tsx`

### Frontend - MODIFY
- `frontend/src/pages/HouseholdDetails.tsx`
- `frontend/src/pages/AccountDetails.tsx`

---

## ✨ Success Criteria

### Phase 7.1 (Multi-Admin)
- ✅ Multiple admins in household
- ✅ Only admins can manage members
- ✅ Cannot remove last admin
- ✅ UI shows admin badges
- ✅ MEMBER role has no management options

### Phase 7.2 (Proportional Sharing)
- ✅ Monthly income calculated from salary category
- ✅ Sharing ratios calculated and displayed
- ✅ Ratios update on configurable day
- ✅ History tracked and viewable
- ✅ Only PROPORTIONAL accounts affected
- ✅ Admin can configure and manually apply

---

**Status**: Ready for implementation
**Next Step**: Confirm requirements, then start Phase 7.1
