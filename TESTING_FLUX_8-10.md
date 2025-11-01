# TESTING_FLUX_8-10: Debt Payment Marking (Flux 8-10)

## Overview

This document provides comprehensive testing guidance for Flux 8-10, which implements the ability to mark debts as paid/unpaid and filter debts by payment status. This feature completes the debt tracking system by allowing users to record when debts have been repaid.

**Flux 8-10 Features:**
- Flux 8: Mark a debt as paid
- Flux 9: Mark a debt as unpaid (cancel payment)
- Flux 10: Filter debts by payment status (show only unpaid/paid)

---

## Architecture Overview

### Database Schema Changes
- **BalancingRecord model** (Prisma):
  - `isPaid: Boolean @default(false)` - Flag indicating if debt is paid
  - `paidAt: DateTime?` - Timestamp of when debt was marked as paid

### Backend Implementation
- **Service Layer** (`backend/src/services/transaction.service.ts`):
  - `markDebtAsPaid(recordId, householdId, userId, isPaid)` - Updates debt payment status
  - Authorization: User must be debtor or creditor in the transaction
  - Sets `paidAt` to current timestamp when marking as paid, clears it when unmarking

- **Controller Layer** (`backend/src/controllers/transaction.controller.ts`):
  - `markDebtAsPaid(req, res)` - PATCH endpoint handler
  - Extracts userId, householdId, recordId from request
  - Returns updated BalancingRecord with user details

- **Routes** (`backend/src/routes/household.routes.ts`):
  - `PATCH /api/households/:id/balancing-records/:recordId/mark-paid`
  - Authenticated route (requires login)
  - Parameters: householdId (path), recordId (path), isPaid (body)

### Frontend Implementation
- **Service** (`frontend/src/services/transaction.service.ts`):
  - `markDebtAsPaid(householdId, recordId, isPaid)` - Calls API endpoint
  - `Debt` interface updated with: `isPaid?: boolean`, `paidAt?: string`

- **UI** (`frontend/src/pages/Debts.tsx`):
  - Checkbox on each debt row to mark as paid/unpaid
  - Visual indicators: Green background + strikethrough text for paid debts
  - Shows payment date for paid debts
  - Filter toggle: "Afficher uniquement les payées" checkbox
  - Disabled state for checkboxes while request is in progress

---

## Backend API Tests

### Test B1: Mark Debt as Paid (Success)
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** Mark an unpaid debt as paid
- [ ] Login as Member 1
- [ ] Retrieve household debts: `GET /api/households/{householdId}/debts`
- [ ] Get a debt where Member 1 is the debtor
- [ ] Send PATCH request with `{ "isPaid": true }`
- [ ] Verify response status: 200
- [ ] Verify response includes: `status: "success"`, message about payment
- [ ] Verify returned data:
  - [ ] `isPaid: true`
  - [ ] `paidAt: <current-timestamp>`
  - [ ] Other fields unchanged (amount, fromUser, toUser, etc.)

**cURL Example:**
```bash
curl -X PATCH http://localhost:3001/api/households/{householdId}/balancing-records/{recordId}/mark-paid \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true}'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Dette marquée comme payée",
  "data": {
    "id": "record-id",
    "householdId": "household-id",
    "fromUserId": "user1-id",
    "toUserId": "user2-id",
    "amount": "150.00",
    "isPaid": true,
    "paidAt": "2025-11-01T14:30:00.000Z",
    "fromUser": { "id": "...", "firstName": "...", "lastName": "...", "email": "..." },
    "toUser": { "id": "...", "firstName": "...", "lastName": "...", "email": "..." }
  }
}
```

---

### Test B2: Mark Debt as Unpaid (Success)
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** Mark a paid debt as unpaid (cancel payment)
- [ ] Complete Test B1 first (mark as paid)
- [ ] Send PATCH request with `{ "isPaid": false }`
- [ ] Verify response status: 200
- [ ] Verify message: "Statut de paiement annulé"
- [ ] Verify returned data:
  - [ ] `isPaid: false`
  - [ ] `paidAt: null`

---

### Test B3: Authorization - Cannot Mark Others' Debts
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** Non-involved user tries to mark a debt as paid
- [ ] Login as Member 3 (not involved in the debt)
- [ ] Get a debt between Member 1 and Member 2
- [ ] Send PATCH request to mark as paid
- [ ] Verify response status: 403 (Forbidden)
- [ ] Verify error message: "Vous ne pouvez pas marquer cette dette comme payée"

**cURL Example:**
```bash
curl -X PATCH http://localhost:3001/api/households/{householdId}/balancing-records/{recordId}/mark-paid \
  -H "Authorization: Bearer {token-member3}" \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true}'
```

---

### Test B4: Invalid Record ID
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** Record doesn't exist
- [ ] Send PATCH request with non-existent recordId
- [ ] Verify response status: 404 (Not Found)
- [ ] Verify error message: "Enregistrement de bilan non trouvé"

---

### Test B5: Invalid Household ID
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** User is not member of household
- [ ] Login as Member 1
- [ ] Create debt in Household A
- [ ] Send PATCH request with wrong householdId
- [ ] Verify response status: 403 (Forbidden)
- [ ] Verify error message: "Vous ne faites pas partie de ce foyer"

---

### Test B6: Unauthenticated Request
**Endpoint:** `PATCH /api/households/:householdId/balancing-records/:recordId/mark-paid`

**Scenario:** No authentication token provided
- [ ] Send PATCH request without Authorization header
- [ ] Verify response status: 401 (Unauthorized)
- [ ] Verify error handling

---

## Frontend Integration Tests

### Test F1: Display Unpaid Debts with Checkbox
**Location:** `Debts.tsx` page

**Scenario:** View unpaid debts with payment checkboxes
- [ ] Navigate to `/debts` page
- [ ] See debts listed for all households
- [ ] For each debt, verify:
  - [ ] Checkbox is visible and unchecked
  - [ ] Debt text is normal (not strikethrough)
  - [ ] Background is gray (#f5f5f5)
  - [ ] Payee information displayed correctly
  - [ ] Amount displayed correctly
  - [ ] Email addresses shown
  - [ ] No "Payée le" date displayed

**Visual Check:**
```
[ ] Member 1 doit 150.00 € à Member 2
    member1@email.com → member2@email.com
    [150.00 €] [checkbox: empty]
```

---

### Test F2: Mark Debt as Paid (Checkbox Click)
**Location:** `Debts.tsx` page

**Scenario:** Click checkbox to mark debt as paid
- [ ] Complete Test F1
- [ ] Click checkbox on an unpaid debt
- [ ] Verify loading state:
  - [ ] Checkbox becomes disabled
  - [ ] API request is sent to backend
- [ ] Wait for response (should be ~1-2 seconds)
- [ ] Verify updated UI:
  - [ ] Checkbox is now checked
  - [ ] Background color changes to green (#e8f5e9)
  - [ ] Text becomes strikethrough
  - [ ] Opacity reduces to 0.7
  - [ ] Payment date appears: "Payée le 01/11/2025"
  - [ ] No error alert shown

**Visual Check After Payment:**
```
[✓] Member 1 doit 150.00 € à Member 2
    member1@email.com → member2@email.com
    • Payée le 01/11/2025
    [150.00 €] [checkbox: checked]
    (strikethrough, green background, reduced opacity)
```

---

### Test F3: Mark Debt as Unpaid (Toggle Checkbox)
**Location:** `Debts.tsx` page

**Scenario:** Click checkbox on paid debt to mark as unpaid
- [ ] Complete Test F2 (debt is marked as paid)
- [ ] Click checkbox again
- [ ] Verify loading state with disabled checkbox
- [ ] Wait for response
- [ ] Verify reverted to unpaid state:
  - [ ] Checkbox is unchecked
  - [ ] Background returns to gray (#f5f5f5)
  - [ ] Text no longer strikethrough
  - [ ] Opacity returns to 1.0
  - [ ] Payment date disappears
  - [ ] No error alert shown

---

### Test F4: Filter - Show Only Paid Debts
**Location:** `Debts.tsx` page

**Scenario:** Use checkbox filter to show only paid debts
- [ ] Navigate to `/debts` page
- [ ] Create mixed state: some paid, some unpaid debts
- [ ] Uncheck "Afficher uniquement les payées" checkbox (default)
- [ ] Verify ALL debts are visible (both paid and unpaid)
- [ ] Click checkbox: "Afficher uniquement les payées"
- [ ] Verify only PAID debts are displayed
  - [ ] Paid debts visible with checkmarks
  - [ ] Unpaid debts hidden
  - [ ] Count matches paid debts only

**Example:**
```
Before filter:
- Debt 1 (unpaid) ✓ visible
- Debt 2 (paid) ✓ visible
- Debt 3 (unpaid) ✓ visible

After filter "Show only paid":
- Debt 1 (unpaid) ✗ hidden
- Debt 2 (paid) ✓ visible
- Debt 3 (unpaid) ✗ hidden
```

---

### Test F5: Filter - Show All Debts (Toggle Off)
**Location:** `Debts.tsx` page

**Scenario:** Toggle filter off to show all debts again
- [ ] Complete Test F4 (filter is ON, showing only paid)
- [ ] Click checkbox: "Afficher uniquement les payées" to uncheck
- [ ] Verify ALL debts reappear immediately
- [ ] Both paid and unpaid debts displayed
- [ ] No page reload needed

---

### Test F6: Error Handling - Checkbox Click Fails
**Location:** `Debts.tsx` page

**Scenario:** API request fails when marking debt
- [ ] Navigate to `/debts` page
- [ ] Simulate network error (use DevTools throttling to "offline")
- [ ] Click checkbox to mark as paid
- [ ] Wait for timeout
- [ ] Verify error alert appears:
  - [ ] "Erreur lors de la mise à jour du statut de paiement"
  - [ ] Checkbox returns to disabled state
  - [ ] Original data unchanged
- [ ] Checkbox remains unchecked

---

### Test F7: Multiple Households - Separate Debts
**Location:** `Debts.tsx` page

**Scenario:** Mark debts as paid in different households
- [ ] User is member of 2+ households with debts
- [ ] Navigate to `/debts` page
- [ ] Verify debts grouped by household
  - [ ] Household A debts separated
  - [ ] Household B debts separated
- [ ] Mark debt as paid in Household A
- [ ] Verify it only affects Household A
- [ ] Mark different debt as paid in Household B
- [ ] Verify both changes reflected correctly
- [ ] No cross-household interference

---

### Test F8: Refresh After Marking Paid
**Location:** `Debts.tsx` page

**Scenario:** Refresh page and verify payment status persists
- [ ] Navigate to `/debts` page
- [ ] Mark a debt as paid
- [ ] Wait for success response
- [ ] Verify checkbox is checked and debt is styled as paid
- [ ] Refresh page (F5 or Cmd+R)
- [ ] Wait for debts to reload
- [ ] Verify marked debt is STILL showing as paid
- [ ] Status persisted to database and reloaded correctly

---

### Test F9: User Summary - Paid Debts Still Counted
**Location:** `Debts.tsx` page - Summary Section

**Scenario:** Verify paid debts are counted in user summary
- [ ] Navigate to `/debts` page
- [ ] Note current user balance (e.g., "Doit 500€ • Dû 200€")
- [ ] Mark one debt as paid (removes from calculation)
- [ ] Note the updated summary
- [ ] Verify marked debt is EXCLUDED from totals:
  - [ ] "Amount owed" decreases
  - [ ] Or "Amount owed to them" increases
  - [ ] Net balance updates accordingly

---

### Test F10: Concurrent Checkbox Clicks
**Location:** `Debts.tsx` page

**Scenario:** Click multiple checkboxes rapidly
- [ ] Navigate to `/debts` page with 3+ unpaid debts
- [ ] Rapidly click checkboxes on different debts
- [ ] Verify proper queueing/handling:
  - [ ] Each request completes before next
  - [ ] Or requests are properly parallelized with state management
  - [ ] No race conditions in state updates
  - [ ] All debts reach correct final state

---

## End-to-End (E2E) Scenarios

### Scenario E1: Complete Debt Payment Workflow
**Steps:**
1. [ ] Create Household with 2 members
2. [ ] Create shared account with both as owners
3. [ ] Member 1 adds expense: 300€ (groceries)
4. [ ] Member 2 adds expense: 100€ (utilities)
5. [ ] Navigate to `/debts`
6. [ ] Verify debt calculation: Member 2 owes Member 1 some amount
7. [ ] Mark debt as paid via checkbox
8. [ ] Verify UI updates (checkbox, styling, date)
9. [ ] Verify summary section updates
10. [ ] Filter to show only paid debts
11. [ ] Verify correct debt displayed
12. [ ] Uncheck filter, verify all debts show again
13. [ ] Toggle paid status back to unpaid
14. [ ] Verify complete revert to original state

---

### Scenario E2: Multi-Household Debt Management
**Steps:**
1. [ ] Create 2 households with overlapping members
   - Household A: Member 1, Member 2
   - Household B: Member 2, Member 3
2. [ ] Create debts in both households
3. [ ] Navigate to `/debts`
4. [ ] Mark one debt in Household A as paid
5. [ ] Verify Household A debt is marked, others unchanged
6. [ ] Mark one debt in Household B as paid
7. [ ] Verify summary shows both payments
8. [ ] Filter to paid debts, verify both are shown
9. [ ] Verify debt calculations don't cross household boundaries

---

### Scenario E3: Member Authorization for Payment Marking
**Steps:**
1. [ ] Create Household with 3 members
2. [ ] Create debt: Member 1 owes Member 2
3. [ ] Login as Member 3 (not involved)
4. [ ] Navigate to `/debts`
5. [ ] Try to mark debt as paid
6. [ ] Verify error: Cannot mark (not creditor/debtor)
7. [ ] Login as Member 1 (debtor)
8. [ ] Navigate to `/debts`
9. [ ] Mark debt as paid - should succeed
10. [ ] Logout, login as Member 2 (creditor)
11. [ ] Navigate to `/debts`
12. [ ] Verify debt shows as paid
13. [ ] Toggle to unpaid - should succeed
14. [ ] Logout, login as Member 3
15. [ ] Try to toggle back to paid
16. [ ] Verify still cannot (not involved)

---

## Data Validation Tests

### Test D1: isPaid Default Value
**Scenario:** New debt should default to unpaid

**Steps:**
1. [ ] Create new household and shared account
2. [ ] Add expense that creates a debt
3. [ ] Query database: `SELECT isPaid FROM balancing_records`
4. [ ] Verify `isPaid: false` for new records
5. [ ] Verify `paidAt: null` for new records

---

### Test D2: paidAt Timestamp Accuracy
**Scenario:** paidAt should be set to current time with proper timezone

**Steps:**
1. [ ] Note current UTC time
2. [ ] Mark debt as paid via API
3. [ ] Verify `paidAt` is set
4. [ ] Compare timestamp to current time:
   - [ ] Should be within 5 seconds of request time
   - [ ] Should be in ISO 8601 format
   - [ ] Should be in UTC timezone
5. [ ] Mark as unpaid
6. [ ] Verify `paidAt: null`

---

### Test D3: Database Persistence
**Scenario:** Payment status persists across server restarts

**Steps:**
1. [ ] Mark debt as paid
2. [ ] Verify in UI
3. [ ] Stop backend server
4. [ ] Wait 5 seconds
5. [ ] Restart backend server
6. [ ] Query database for payment status
7. [ ] Verify still marked as paid
8. [ ] Refresh frontend
9. [ ] Verify still shows as paid

---

### Test D4: Data Consistency Across Endpoints
**Scenario:** Payment status consistent whether fetched via debts endpoint or record query

**Steps:**
1. [ ] Mark debt as paid
2. [ ] Query `GET /api/households/{id}/debts`
3. [ ] Verify debt shows `isPaid: true`
4. [ ] Query database directly for BalancingRecord
5. [ ] Verify `isPaid: true` in database
6. [ ] Mark as unpaid
7. [ ] Repeat verification

---

## Performance Tests

### Test P1: Marking Large Number of Debts
**Scenario:** Mark 50+ debts as paid sequentially

**Steps:**
1. [ ] Create household with 10 members
2. [ ] Create 50+ debts through transactions
3. [ ] Navigate to `/debts` page
4. [ ] Measure load time: should be < 2 seconds
5. [ ] Mark 10 debts as paid sequentially
6. [ ] Verify each request completes in < 1 second
7. [ ] Verify UI remains responsive
8. [ ] No memory leaks or performance degradation

---

### Test P2: Filter Performance
**Scenario:** Toggling filter with large debt list

**Steps:**
1. [ ] Create 100+ debts
2. [ ] Toggle "Show only paid" filter on/off 10 times
3. [ ] Measure filter toggle response time: < 500ms
4. [ ] Verify no layout shifting
5. [ ] Verify no console errors

---

## Security Tests

### Test S1: SQL Injection on Record ID
**Scenario:** Attempt SQL injection via recordId parameter

**Steps:**
1. [ ] Send PATCH request with malicious recordId:
   ```
   recordId: "'; DROP TABLE balancing_records; --"
   ```
2. [ ] Verify request rejected with 404
3. [ ] Verify no SQL injection occurred
4. [ ] Verify table still intact

---

### Test S2: XSS Prevention in Payment Display
**Scenario:** Verify no XSS when user names contain HTML

**Steps:**
1. [ ] Create user with name: `<img src=x onerror="alert('xss')">`
2. [ ] Create debt with this user
3. [ ] Navigate to `/debts` page
4. [ ] Verify HTML rendered as text, not executed
5. [ ] Open DevTools console
6. [ ] Verify no JavaScript alerts or errors

---

### Test S3: CSRF Protection
**Scenario:** Verify CSRF token validation (if implemented)

**Steps:**
1. [ ] Send PATCH request without CSRF token (if required)
2. [ ] Verify request rejected with 403
3. [ ] Send with invalid CSRF token
4. [ ] Verify request rejected
5. [ ] Send with valid CSRF token
6. [ ] Verify request succeeds

---

## Edge Cases

### Test E1: Marking Debt with Zero Amount
**Scenario:** Edge case of debt with 0€ amount

**Steps:**
1. [ ] Manually create debt with amount = 0
2. [ ] Try to mark as paid via API
3. [ ] Verify succeeds (no validation error)
4. [ ] Verify `paidAt` is set despite zero amount

---

### Test E2: Extremely Large Debt Amount
**Scenario:** Mark very large debt as paid

**Steps:**
1. [ ] Create debt with amount = 999999999.99
2. [ ] Mark as paid
3. [ ] Verify succeeds
4. [ ] Verify correct timestamp and amount in response

---

### Test E3: Rapid Toggle (Paid ↔ Unpaid)
**Scenario:** Rapidly toggle payment status 10 times

**Steps:**
1. [ ] Start with unpaid debt
2. [ ] Send 10 rapid toggle requests:
   - isPaid: true
   - isPaid: false
   - isPaid: true
   - etc.
3. [ ] Verify final state is correct based on request order
4. [ ] Verify no race conditions
5. [ ] Verify only latest state persisted

---

## Browser Compatibility

### Test B1: Chrome/Chromium
- [ ] Mark debt as paid
- [ ] Verify checkbox state
- [ ] Verify styling applied
- [ ] Verify responsive layout

### Test B2: Firefox
- [ ] Repeat Test B1

### Test B3: Safari
- [ ] Repeat Test B1

### Test B4: Edge
- [ ] Repeat Test B1

---

## Accessibility Tests

### Test A1: Keyboard Navigation
**Scenario:** Mark debts as paid using only keyboard

**Steps:**
1. [ ] Navigate to `/debts` page
2. [ ] Use Tab to focus on checkbox
3. [ ] Press Space to toggle checkbox
4. [ ] Verify action executes
5. [ ] Verify visual feedback without mouse

---

### Test A2: Screen Reader Support
**Scenario:** Verify screen reader announces debt payment status

**Steps:**
1. [ ] Use screen reader (NVDA, JAWS, or VoiceOver)
2. [ ] Navigate to debt item
3. [ ] Verify screen reader announces:
   - [ ] Debtor name
   - [ ] Amount
   - [ ] Creditor name
   - [ ] "Checkbox, unchecked" or "Checkbox, checked"
4. [ ] Interact with checkbox
5. [ ] Verify state change announced

---

### Test A3: Color Contrast for Paid Debts
**Scenario:** Verify green background has sufficient contrast

**Steps:**
1. [ ] Mark debt as paid (green #e8f5e9 background)
2. [ ] Use contrast checker tool
3. [ ] Verify WCAG AA compliance (4.5:1 ratio)
4. [ ] Verify text readable with colorblindness simulator

---

## Regression Tests (Run after each update)

### R1: Existing Debts Still Calculate Correctly
- [ ] Create household and expenses as before
- [ ] Verify debt calculations unchanged
- [ ] Verify amounts correct

### R2: Unrelated Features Still Work
- [ ] Create transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] View account balance
- [ ] All unaffected by debt payment feature

### R3: Authentication Still Required
- [ ] Navigate to `/debts` without login
- [ ] Verify redirected to login page
- [ ] Login and verify access restored

---

## Test Checklist Summary

**Backend Tests:**
- [ ] B1: Mark as paid (success)
- [ ] B2: Mark as unpaid (success)
- [ ] B3: Authorization check (forbidden)
- [ ] B4: Invalid record ID (not found)
- [ ] B5: Invalid household (forbidden)
- [ ] B6: No authentication (unauthorized)

**Frontend Tests:**
- [ ] F1: Display unpaid debts
- [ ] F2: Mark as paid (UI updates)
- [ ] F3: Mark as unpaid (UI reverts)
- [ ] F4: Filter - show only paid
- [ ] F5: Filter - show all
- [ ] F6: Error handling
- [ ] F7: Multiple households
- [ ] F8: Refresh persistence
- [ ] F9: Summary updates
- [ ] F10: Concurrent clicks

**E2E Scenarios:**
- [ ] E1: Complete workflow
- [ ] E2: Multi-household
- [ ] E3: Authorization

**Data Validation:**
- [ ] D1: Default to unpaid
- [ ] D2: Timestamp accuracy
- [ ] D3: Database persistence
- [ ] D4: Data consistency

**Performance:**
- [ ] P1: Large number of debts
- [ ] P2: Filter performance

**Security:**
- [ ] S1: SQL injection
- [ ] S2: XSS prevention
- [ ] S3: CSRF protection

**Edge Cases:**
- [ ] E1: Zero amount debt
- [ ] E2: Large amounts
- [ ] E3: Rapid toggles

**Browser Compatibility:**
- [ ] B1: Chrome
- [ ] B2: Firefox
- [ ] B3: Safari
- [ ] B4: Edge

**Accessibility:**
- [ ] A1: Keyboard navigation
- [ ] A2: Screen reader
- [ ] A3: Color contrast

**Regression:**
- [ ] R1: Debt calculations
- [ ] R2: Other features
- [ ] R3: Authentication

---

## Notes for Testers

1. **Database Migrations**: Before testing, run:
   ```bash
   npm run prisma:migrate dev -- --name add_debt_payment_fields
   ```

2. **Test Data Setup**: Use existing test households and accounts from Phase 4.5 testing

3. **API Testing Tool**: Use Postman, Insomnia, or REST Client VSCode extension

4. **Frontend Testing**: Test in development mode for better error messages:
   ```bash
   npm run dev
   ```

5. **Browser DevTools**: Use Network tab to verify API calls and response times

6. **Debugging**: Check browser console and server logs for any errors

---

## Sign-off

**Feature Complete When:**
- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] All E2E scenarios complete
- [ ] No console errors
- [ ] Database persists data correctly
- [ ] No security vulnerabilities found

---

**Last Updated:** 2025-11-01
**Version:** 1.0
**Status:** Ready for Testing
