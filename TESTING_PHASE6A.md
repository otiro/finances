# Phase 6A - Budgets - Testing & Verification Plan

## 📌 Overview

Complete testing plan for Phase 6A (Budgets) implementation covering backend API endpoints, frontend functionality, and integration scenarios.

**Status**: ✅ Ready for Testing
**Estimated Duration**: 3-4 hours
**Test Cases**: ~55 backend + frontend

---

## 🔌 Backend API Testing

### Prerequisites
- Backend server running (port 3000)
- Database with test data (household, users, categories)
- Postman or curl commands
- Valid authentication token

### 1. Budget CRUD Operations

#### Test 1.1: Create Budget (POST /api/households/:householdId/budgets)
**Endpoint**: `POST /api/households/{householdId}/budgets`
**Auth**: Required
**Payload**:
```json
{
  "categoryId": "cat-123",
  "name": "Budget Alimentation",
  "description": "Budget pour l'épicerie",
  "amount": 500,
  "period": "MONTHLY",
  "startDate": "2025-11-01",
  "alertThreshold": 80,
  "alertEnabled": true
}
```

**Expected Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "budget-123",
    "householdId": "household-1",
    "categoryId": "cat-123",
    "name": "Budget Alimentation",
    "amount": 500.00,
    "period": "MONTHLY",
    "alertThreshold": 80,
    "alertEnabled": true,
    "isActive": true,
    "createdAt": "2025-11-06T...",
    "updatedAt": "2025-11-06T..."
  },
  "message": "Budget créé avec succès"
}
```

**Test Cases**:
- ✅ Create with all fields
- ✅ Create with minimal fields (defaults applied)
- ✅ Create with negative amount (should fail)
- ✅ Create with invalid period (should fail)
- ✅ Create for non-existent category (should return 404)
- ✅ Create without authentication (should return 401)
- ✅ Create for household where user is not member (should return 403)
- ✅ Create with invalid date format (should fail validation)

---

#### Test 1.2: List Budgets (GET /api/households/:householdId/budgets)
**Endpoint**: `GET /api/households/{householdId}/budgets`
**Auth**: Required
**Expected Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": "budget-1",
      "name": "Budget Alimentation",
      "amount": 500.00,
      "period": "MONTHLY",
      "category": {
        "id": "cat-1",
        "name": "Alimentation",
        "color": "#FF6B6B"
      },
      "alerts": [
        {
          "id": "alert-1",
          "percentageUsed": 75.5,
          "thresholdReached": false
        }
      ]
    },
    {...}
  ]
}
```

**Test Cases**:
- ✅ List all budgets for household
- ✅ List budgets (empty list when no budgets)
- ✅ Verify includes category information
- ✅ Verify includes latest alert
- ✅ Non-member user gets 403
- ✅ Budgets sorted by creation date (newest first)

---

#### Test 1.3: Get Budget Details (GET /api/households/:householdId/budgets/:budgetId)
**Endpoint**: `GET /api/households/{householdId}/budgets/{budgetId}`
**Auth**: Required
**Expected Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "budget": {...},
    "currentSpent": 375.50,
    "percentageUsed": 75.1,
    "thresholdReached": false,
    "remaining": 124.50,
    "status": "active"
  }
}
```

**Test Cases**:
- ✅ Get budget with spending calculation
- ✅ Get budget that doesn't exist (404)
- ✅ Get budget from different household (403)
- ✅ Verify percentage calculations correct
- ✅ Verify "exceeded" status when spent > budget
- ✅ Verify "not_started" status for future budgets

---

#### Test 1.4: Get Budget Summary (GET /api/households/:householdId/budgets/summary)
**Endpoint**: `GET /api/households/{householdId}/budgets/summary`
**Auth**: Required
**Expected Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "budgets": [
      {
        "budget": {...},
        "currentSpent": 300,
        "percentageUsed": 60.0,
        "thresholdReached": false,
        "remaining": 200,
        "status": "active"
      }
    ],
    "statistics": {
      "totalBudgeted": 1500.00,
      "totalSpent": 1050.00,
      "percentageUsed": 70.0,
      "budgetsExceeded": 1,
      "budgetsNearThreshold": 2,
      "activeCount": 5
    }
  }
}
```

**Test Cases**:
- ✅ Summary includes all active budgets
- ✅ Statistics accurately calculated
- ✅ Percentage calculations correct
- ✅ Budget exceeded count accurate
- ✅ Near threshold count accurate (≥80%)
- ✅ Active count matches filtered budgets

---

#### Test 1.5: Update Budget (PATCH /api/households/:householdId/budgets/:budgetId)
**Endpoint**: `PATCH /api/households/{householdId}/budgets/{budgetId}`
**Auth**: Required (Admin only)
**Payload**:
```json
{
  "name": "Updated Budget Name",
  "amount": 600,
  "alertThreshold": 75
}
```

**Test Cases**:
- ✅ Update name only
- ✅ Update amount only
- ✅ Update multiple fields
- ✅ Update budget to inactive
- ✅ Cannot update category (immutable)
- ✅ Non-admin cannot update (403)
- ✅ Non-existent budget (404)
- ✅ Invalid amount (negative) fails validation

---

#### Test 1.6: Delete Budget (DELETE /api/households/:householdId/budgets/:budgetId)
**Endpoint**: `DELETE /api/households/{householdId}/budgets/{budgetId}`
**Auth**: Required (Admin only)
**Expected Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "message": "Budget supprimé avec succès"
  }
}
```

**Test Cases**:
- ✅ Delete existing budget
- ✅ Verify budget removed from list
- ✅ Verify associated alerts deleted (cascade)
- ✅ Non-admin cannot delete (403)
- ✅ Non-existent budget (404)
- ✅ Cannot delete from different household (403)

---

### 2. Budget Status & Calculations

#### Test 2.1: Budget Spending Calculation
**Test Scenario**: Create budget for Alimentation, add transactions, verify spending

**Steps**:
1. Create budget: Alimentation, €500/month
2. Add transaction: -€200 to Alimentation
3. GET budget status
4. Verify: currentSpent = 200, percentageUsed = 40%

**Expected**:
- ✅ Spending correctly calculates DEBIT transactions only
- ✅ CREDIT transactions ignored
- ✅ Only current period transactions counted
- ✅ Only category-matched transactions counted

---

#### Test 2.2: Period Boundary Handling
**Test Scenario**: Test different budget periods

**Monthly Budget**:
- Budget: Jan 1 - Jan 31
- Transaction: Jan 15 (counted)
- Transaction: Feb 1 (not counted)

**Quarterly Budget**:
- Budget: Q1 (Jan 1 - Mar 31)
- Transaction: Feb 15 (counted)
- Transaction: Apr 1 (not counted)

**Yearly Budget**:
- Budget: Full year
- Transaction: Dec 1 (counted)
- Transaction: Next Jan (not counted)

---

#### Test 2.3: Alert Threshold Triggering
**Test Scenario**: Verify alerts created when threshold reached

**Steps**:
1. Create budget: €500, alertThreshold=80%
2. Add transaction: -€350 (70%)
3. Verify: thresholdReached = false
4. Add transaction: -€150 (100%)
5. Verify: thresholdReached = true, alert created

---

### 3. Permission & Authorization Tests

#### Test 3.1: Member vs Admin Permissions
- ✅ Regular member can view budgets (GET)
- ✅ Regular member cannot create (POST) → 403
- ✅ Regular member cannot update (PATCH) → 403
- ✅ Regular member cannot delete (DELETE) → 403
- ✅ Admin can perform all operations

#### Test 3.2: Household Isolation
- ✅ User cannot view household-B budgets
- ✅ User cannot modify household-B budgets
- ✅ Each household has independent budget namespace

---

### 4. Validation Tests

#### Test 4.1: Input Validation
- ✅ categoryId required
- ✅ name required, max 255 chars
- ✅ amount required, positive, max 999999.99
- ✅ period enum validation (MONTHLY|QUARTERLY|YEARLY)
- ✅ startDate ISO format validation
- ✅ endDate optional but must be valid format
- ✅ alertThreshold 0-100 range
- ✅ description max 1000 chars

#### Test 4.2: Business Logic Validation
- ✅ Category must exist in household
- ✅ Category cannot be changed after creation
- ✅ Cannot create budget for non-existent household
- ✅ Budget amount must be positive

---

## 🎨 Frontend Testing

### Prerequisites
- Frontend running (port 5173)
- Logged in to household
- Created test budgets or using existing data

### 1. Navigation & Routing

#### Test 1.1: Navigation to Budgets Page
**Steps**:
1. Go to Household Details
2. Click "Budgets" button/link
3. Verify URL: `/households/{id}/budgets`
4. Verify page loads

**Expected**:
- ✅ Page loads without errors
- ✅ Three tabs visible (Overview, List, Statistics)
- ✅ "Create New Budget" button visible
- ✅ Back button works

---

### 2. List View Testing

#### Test 2.1: Display All Budgets
**Test Case**: Verify all budgets displayed in table

**Steps**:
1. Navigate to Budgets page
2. Click "List" tab
3. Verify all budgets appear in table

**Expected Columns**:
- ✅ Category (with color indicator)
- ✅ Amount (€X.XX format)
- ✅ Period (Mensuel/Trimestriel/Annuel)
- ✅ Spent (€X.XX)
- ✅ % (XX.X%)
- ✅ Status (chip: Normal/Alerte/Dépassé/Inactif)
- ✅ Actions (edit/delete buttons)

#### Test 2.2: Table Sorting & Filtering
- ✅ Can sort by amount
- ✅ Can sort by category
- ✅ Can filter by status
- ✅ Pagination works (if >10 budgets)

---

### 3. Overview Tab Testing

#### Test 3.1: Summary Cards
**Expected Cards**:
- ✅ "Budget Total": Shows sum of all budgets
- ✅ "Dépensé": Shows total spent + percentage
- ✅ "Budgets Actifs": Shows count
- ✅ "Alertes": Shows exceeded + near-threshold counts

**Calculation Verification**:
- ✅ Budget Total = sum(all budget.amount)
- ✅ Dépensé = sum(all currentSpent)
- ✅ % = (Dépensé / Budget Total) * 100

---

#### Test 3.2: Budget Cards Grid
**Expected for Each Budget**:
- ✅ Budget name as title
- ✅ Category color indicator
- ✅ Status chip (Normal/Alerte/Dépassé)
- ✅ Progress bar (color-coded)
- ✅ "Dépensé €X.XX / €Y.YY"
- ✅ "X.X% utilisé"
- ✅ "Restant €X.XX" or "Dépassé de €X.XX"
- ✅ Period indicator (📅 Mensuel, 📊 Trimestriel, 📈 Annuel)
- ✅ Alert indicator if enabled
- ✅ Edit button
- ✅ Delete button
- ✅ Info button (view alerts)

**Color Coding**:
- ✅ <60%: Green
- ✅ 60-80%: Blue
- ✅ 80-95%: Orange
- ✅ >95%: Red

---

### 4. Create Budget Dialog

#### Test 4.1: Open Dialog
**Steps**:
1. Click "Nouveau Budget" button
2. Dialog opens
3. Form appears with all fields

**Fields Present**:
- ✅ Category dropdown (Autocomplete)
- ✅ Budget name input
- ✅ Description textarea
- ✅ Amount input (number)
- ✅ Period select (dropdown)
- ✅ Start date picker
- ✅ End date picker (optional)
- ✅ Alert threshold input
- ✅ Alert enabled checkbox

---

#### Test 4.2: Form Validation
**Test Case**: Test all validation rules

**Invalid Scenarios**:
- ✅ Submit with empty category → Error
- ✅ Submit with empty name → Error
- ✅ Submit with negative amount → Error
- ✅ Submit with invalid amount format → Error
- ✅ Submit with past start date → Works (allowed)
- ✅ Submit with end date before start date → Error
- ✅ Submit with threshold > 100 → Error
- ✅ Submit with threshold < 0 → Error

**Valid Submission**:
- ✅ Submit with all required fields
- ✅ Dialog closes
- ✅ Budget appears in list
- ✅ Success message shown (if applicable)

---

#### Test 4.3: Default Values
- ✅ Period defaults to MONTHLY
- ✅ Alert threshold defaults to 80
- ✅ Alert enabled defaults to true
- ✅ Start date defaults to today

---

### 5. Edit Budget Dialog

#### Test 5.1: Edit Existing Budget
**Steps**:
1. Click edit button on budget card
2. Dialog opens with current values
3. Modify a field
4. Click "Mettre à jour"
5. Verify changes applied

**Edit Tests**:
- ✅ Edit name
- ✅ Edit amount
- ✅ Edit period
- ✅ Edit alert threshold
- ✅ Toggle alert enabled
- ✅ Deactivate budget (isActive = false)

**Immutable Fields**:
- ✅ Category cannot be changed (should be disabled)

---

### 6. Delete Budget

#### Test 6.1: Delete Confirmation
**Steps**:
1. Click delete button on budget card
2. Confirmation dialog appears
3. Click "Supprimer"
4. Budget removed from list

**Expected**:
- ✅ Confirmation dialog shows budget name
- ✅ "Confirmer la suppression" title
- ✅ Warning message: "Cette action est irréversible"
- ✅ After deletion, budget removed from UI
- ✅ Summary statistics updated

---

### 7. View Alerts Dialog

#### Test 7.1: Alert History
**Steps**:
1. Click "Info" button on budget card
2. Alert dialog opens
3. Show alert history table

**Expected**:
- ✅ Current status summary shows
- ✅ Alert table shows:
  - Date/time
  - Amount spent
  - Percentage used
  - Alert type (Dépassé/Alerte/Info)
- ✅ Latest alerts first (desc by date)
- ✅ Properly formatted dates

---

### 8. Statistics Tab

#### Test 8.1: Overall Usage Chart
- ✅ Shows global progress bar
- ✅ Shows percentage of total budgets used
- ✅ Visual representation clear

#### Test 8.2: Individual Budget Stats
- ✅ One card per budget
- ✅ Shows budget name
- ✅ Shows progress bar with color coding
- ✅ Shows €spent / €budget
- ✅ Shows remaining or exceeded amount

---

### 9. Responsive Design

#### Test 9.1: Mobile Layout (375px width)
- ✅ Layout stacks vertically
- ✅ Cards full width
- ✅ Table scrollable horizontally
- ✅ Buttons accessible
- ✅ Dialogs full screen / modal

#### Test 9.2: Tablet Layout (768px width)
- ✅ 2 columns for budget cards
- ✅ Table readable
- ✅ All controls accessible

#### Test 9.3: Desktop Layout (1920px width)
- ✅ 3+ columns for budget cards
- ✅ Full table visible
- ✅ Proper spacing

---

### 10. Loading & Error States

#### Test 10.1: Loading State
- ✅ Show spinner while fetching budgets
- ✅ Buttons disabled while loading
- ✅ Smooth transition when data loads

#### Test 10.2: Error Handling
- ✅ Show error alert if fetch fails
- ✅ Show error if create fails
- ✅ Show error if delete fails
- ✅ Offer retry option

---

## 🔗 Integration Testing

### Test 1: Create Budget + Add Transaction → Verify Spending
**Scenario**: End-to-end budget tracking

**Steps**:
1. Create budget: Alimentation, €500, alertThreshold=80%
2. Go to Transactions page
3. Add transaction: -€200 to Alimentation
4. Go back to Budgets
5. Verify budget shows: €200 / €500 (40%)

**Expected**:
- ✅ Budget spending updates immediately
- ✅ Status = "active" (not thresholdReached)

---

### Test 2: Multiple Transactions → Threshold Alert
**Scenario**: Trigger alert by exceeding threshold

**Steps**:
1. Create budget: Transport, €300, threshold=80%
2. Add transaction: -€150 (50%)
3. Verify status = "active"
4. Add transaction: -€100 (67%)
5. Verify status = "active"
6. Add transaction: -€50 (83%)
7. Verify status = "alert" (thresholdReached=true)

**Expected**:
- ✅ Alert triggered at 83% (>80%)
- ✅ Visual indicators update
- ✅ Alert recorded in alerts history

---

### Test 3: Exceed Budget
**Scenario**: Spend more than budgeted amount

**Steps**:
1. Create budget: €100
2. Add transaction: -€150
3. Verify currentSpent = €150
4. Verify percentageUsed = 150%
5. Verify status = "exceeded"

**Expected**:
- ✅ "Dépassé de €50" message shows
- ✅ Red progress bar (>100%)
- ✅ Status chip = "Dépassé"

---

### Test 4: Multiple Budgets Summary
**Scenario**: Verify summary statistics with multiple budgets

**Create Budgets**:
- Budget 1: Alimentation, €500
- Budget 2: Transport, €300
- Budget 3: Loisirs, €200

**Add Transactions**:
- -€250 to Alimentation (50%)
- -€300 to Transport (100%)
- -€50 to Loisirs (25%)

**Verify Summary**:
- ✅ Total Budgeted = €1,000
- ✅ Total Spent = €600
- ✅ % Used = 60%
- ✅ Exceeded Count = 0
- ✅ Near Threshold = 1 (Transport at 100%)
- ✅ Active Count = 3

---

### Test 5: Delete Budget → Verify Removal
**Scenario**: Delete budget and verify it's gone

**Steps**:
1. Create budget: Test Budget, €100
2. Verify appears in list
3. Delete budget
4. Verify removed from list
5. Verify removed from summary
6. GET endpoint returns 404

---

## 📋 Test Execution Checklist

### Backend Tests
- [ ] All CRUD operations working
- [ ] Spending calculations accurate
- [ ] Period boundaries correct
- [ ] Alerts triggering correctly
- [ ] Permissions enforced
- [ ] Validation working
- [ ] 404s for non-existent resources
- [ ] 403s for unauthorized access
- [ ] 401s for missing auth

### Frontend Tests
- [ ] Navigation working
- [ ] All tabs rendering
- [ ] Create dialog form working
- [ ] Edit dialog form working
- [ ] Delete confirmation working
- [ ] Alerts dialog showing history
- [ ] List view rendering correctly
- [ ] Cards rendering with correct data
- [ ] Statistics calculating correctly
- [ ] Loading states showing
- [ ] Error messages displaying
- [ ] Responsive on mobile/tablet/desktop

### Integration Tests
- [ ] Create budget → view transactions → budget updates
- [ ] Add transaction → spending calculation updates
- [ ] Multiple transactions → alert threshold triggers
- [ ] Exceed budget → status changes to "exceeded"
- [ ] Delete budget → removed from all views
- [ ] Summary statistics accurate with multiple budgets

---

## 🚀 Performance Benchmarks

### Target Performance
- Budget list load: < 1 second
- Create budget: < 2 seconds
- Update budget: < 1 second
- Summary calculations: < 500ms
- UI render: < 200ms

### Testing Tools
- Chrome DevTools Network tab
- React Profiler
- Backend response timing logs

---

## ✅ Sign-Off

**Backend Tests**: ___________ (Tester Name)
**Frontend Tests**: ___________ (Tester Name)
**Integration Tests**: ___________ (Tester Name)
**Performance Tests**: ___________ (Tester Name)

**Date**: ___________
**Status**: ✅ Ready for Production / ❌ Issues Found

---

**Next Phase**: Phase 6B - Analytics & Reports

