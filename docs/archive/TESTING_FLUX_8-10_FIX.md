# Testing Guide: Flux 8-10 Debt Payment Tracking (Fixed)

## Overview

This guide walks through testing the Flux 8-10 functionality after the `householdId` undefined fix.

## Prerequisites

- Two or more household members
- At least one shared account (SAVING, CHECKING_SHARED, or similar - NOT personal CHECKING)
- One or more transactions in the shared account
- Multiple members should have different ownership percentages or have made different payments

## Test Data Setup

### Example Test Scenario

**Household**: "Test Household"
- Member 1: "Alice" (admin)
- Member 2: "Bob" (member)

**Account**: "Shared Apartment Expenses" (Type: SAVING)
- Initial Balance: €100
- Ownership: Alice 50%, Bob 50%
- Transactions:
  - Alice adds €50 credit (paid for utilities)
  - Bob adds €30 debit (withdrew for groceries)

**Expected Debts**:
- Bob owes Alice €25
  - Total balance: €100 + €50 - €30 = €120
  - Alice's share: €120 × 50% = €60
  - Alice paid: €50 (credit)
  - Alice's debt: €60 - €50 = €10 (receives €10)
  - Bob's share: €120 × 50% = €60
  - Bob paid: €30 (debit)
  - Bob's debt: €60 - €30 = €30 (owes €30)
  - Net: Bob owes Alice €20 (from remaining debt after Alice's €10 credit)

## Backend Testing

### Test 1: Verify BalancingRecords Are Created

**Endpoint**: `GET /api/households/{householdId}/debts`

**Expected Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-...",           // ✅ MUST have valid UUID, not placeholder
      "creditor": {
        "id": "alice-uuid",
        "firstName": "Alice",
        "lastName": "Smith",
        "email": "alice@example.com"
      },
      "debtor": {
        "id": "bob-uuid",
        "firstName": "Bob",
        "lastName": "Jones",
        "email": "bob@example.com"
      },
      "amount": 20,
      "isPaid": false,
      "paidAt": null
    }
  ]
}
```

**Verification Checklist**:
- ✅ Response contains debts array
- ✅ Each debt has valid UUID `id` (not "householdId-0" or placeholder)
- ✅ `creditor` and `debtor` objects are populated correctly
- ✅ `amount` is correctly calculated
- ✅ `isPaid` defaults to `false`
- ✅ `paidAt` is `null` when not paid
- ✅ No 404 error

### Test 2: Check Server Logs for Debug Output

**What to Look For**:
```
DEBUG: Creating new BalancingRecord with: {
  householdId: 'e1f2g3h4-5678-...',    // ✅ MUST be a valid UUID
  fromUserId: 'alice-uuid',
  toUserId: 'bob-uuid',
  amount: 20
}
```

**Verification Checklist**:
- ✅ `householdId` is a valid UUID (not undefined, not null)
- ✅ `fromUserId` matches creditor ID
- ✅ `toUserId` matches debtor ID
- ✅ `amount` is the correct calculated value

### Test 3: Database Verification (Optional)

**Using Prisma Studio**:
```bash
cd backend
npx prisma studio
```

Navigate to `BalancingRecord` table and verify:
- ✅ Records exist with correct householdId
- ✅ `isPaid` field exists and defaults to false
- ✅ `paidAt` field exists and is null by default
- ✅ `fromUserId` and `toUserId` are populated
- ✅ `amount` field has correct values

## Frontend Testing

### Test 4: Debts Page Loads Without Errors

1. Navigate to "Dettes et remboursements" page
2. Observe the page loads

**Verification Checklist**:
- ✅ Page loads without errors (check browser console)
- ✅ No 404 errors in network tab
- ✅ Debt entries are displayed
- ✅ Debt information shows correctly: "{Debtor} doit {Amount}€ à {Creditor}"

### Test 5: Checkbox Click Marks Debt as Paid

1. On Debts page, locate a debt entry
2. Click the checkbox next to the debt amount

**Expected Behavior**:
- Checkbox shows loading state (disabled, spinner)
- After API response (2-3 seconds):
  - Checkbox becomes checked ✓
  - Debt box background changes to green (#e8f5e9)
  - Debt text becomes strikethrough
  - Debt opacity reduces to 0.7
  - Payment date appears below email: "Payée le 01/11/2025"

**Verification Checklist**:
- ✅ Checkbox can be clicked
- ✅ No 404 error in network tab
- ✅ API response has status "success"
- ✅ Checkbox updates UI immediately after response
- ✅ Green background applied
- ✅ Strikethrough text applied
- ✅ Payment date displays in correct format

### Test 6: Toggle Debt Back to Unpaid

1. Click the checkbox again on a marked-as-paid debt

**Expected Behavior**:
- Checkbox becomes unchecked
- Green background removed
- Strikethrough removed
- Opacity returns to 1
- Payment date disappears

**Verification Checklist**:
- ✅ Can toggle back to unpaid
- ✅ UI updates correctly

### Test 7: Filter by Payment Status

1. On Debts page, check "Afficher uniquement les payées"
2. Observe list of debts

**Expected Behavior**:
- Only paid debts (with checkmarks) are shown
- Unpaid debts are hidden
- Filter can be toggled on/off

**Verification Checklist**:
- ✅ Filter works correctly
- ✅ Can toggle on/off
- ✅ Paid debts show when filter is on
- ✅ All debts show when filter is off

### Test 8: Summary Per Person Section

1. Scroll to "Résumé par personne" section
2. Observe summary information

**Expected Behavior**:
For each person involved in debts:
- Name and email displayed
- Net balance shown:
  - Green if positive (owed money)
  - Red if negative (owes money)
  - Gray if zero
- Breakdown shows: "(doit €X • dû €Y)"

**Verification Checklist**:
- ✅ All users involved in any debt appear
- ✅ Colors applied correctly based on net balance
- ✅ Math is correct: net = owed - owes
- ✅ Amounts match debt entries

## Scenario Testing

### Scenario 1: Single Debt with Multiple Owners

**Setup**:
- Account: €1000 initial + €500 credit (Alice) - €200 debit (Bob)
- Ownership: Alice 60%, Bob 40%
- Total: €1300

**Expected**:
- Alice share: €1300 × 60% = €780, paid €500, debt -€280
- Bob share: €1300 × 40% = €520, paid €200, debt €320
- Bob owes Alice: €280

**Verification**:
- ✅ Correct amount calculated

### Scenario 2: Multiple Debts (More Than 2 Members)

**Setup**:
- Household with 3 members (Alice, Bob, Carol)
- Shared account with mixed transactions and ownership

**Expected**:
- Multiple debt entries created
- Each debt pair is unique (A→B, A→C, B→C, etc.)

**Verification**:
- ✅ All debt pairs are created
- ✅ No duplicate debts
- ✅ Summary correctly aggregates debts per person

### Scenario 3: Debt Already Exists (Update vs Create)

**Setup**:
1. Mark a debt as paid
2. Recalculate debts (new transaction or page refresh)
3. Same debt should reappear

**Expected**:
- Same BalancingRecord ID reused
- Amount may change but ID stays consistent
- `isPaid` status resets to false
- `paidAt` clears to null

**Verification**:
- ✅ BalancingRecord ID remains same
- ✅ Payment status resets properly

## Error Scenarios

### Error Test 1: Unauthorized User Tries to Mark Debt

**Setup**:
1. Log in as User A
2. Get debt ID that belongs to different household
3. Try to POST to mark that debt as paid

**Expected**:
- 403 Forbidden response
- Error message: "Vous ne faites pas partie de ce foyer" or "Vous ne pouvez pas marquer cette dette comme payée"

**Verification**:
- ✅ Cannot mark unrelated debts
- ✅ 403 error returned

### Error Test 2: Invalid Balancing Record ID

**Setup**:
1. Try to mark a debt with non-existent ID

**Expected**:
- 404 Not Found response
- Error message: "Enregistrement de bilan non trouvé"

**Verification**:
- ✅ 404 returned for invalid ID

### Error Test 3: Non-Involved User Cannot Mark Debt

**Setup**:
- Debt between Alice and Bob
- Carol (household member but not in debt) tries to mark debt as paid

**Expected**:
- 403 Forbidden response
- Error message about not being involved in the debt

**Verification**:
- ✅ 403 error returned
- ✅ Only involved parties can mark debt

## Regression Testing

### Regression Test 1: Existing Transactions Still Work

1. Add new transaction to shared account
2. Recalculate debts

**Verification**:
- ✅ Transaction creation still works
- ✅ Debts recalculate correctly
- ✅ No errors in API

### Regression Test 2: Other Pages Still Functional

1. Navigate to Dashboard, Accounts, Transactions pages
2. Perform normal operations

**Verification**:
- ✅ No errors
- ✅ Data displays correctly
- ✅ CRUD operations work

## Performance Testing

### Performance Test 1: Large Number of Debts

**Setup**:
- Household with many transactions (50+)
- Multiple members with complex ownership splits

**Verification**:
- ✅ Page loads within reasonable time (< 3 seconds)
- ✅ Checkbox clicks respond quickly (< 1 second)
- ✅ No browser freezing

### Performance Test 2: Multiple Households

**Setup**:
- User belongs to 5+ households
- Each has several debts

**Verification**:
- ✅ All debts load correctly
- ✅ Grouped by household
- ✅ Filtering works across all households

## Summary Checklist

- [ ] Backend returns valid debt IDs (not placeholders)
- [ ] Debug logs show valid householdId (not undefined)
- [ ] Frontend displays all debts correctly
- [ ] Checkbox click toggles payment status
- [ ] UI updates with paid/unpaid styling
- [ ] Filter "Afficher uniquement les payées" works
- [ ] Summary per person is accurate
- [ ] Authorization checks work (403 for unauthorized)
- [ ] Invalid IDs return 404
- [ ] No regression in other features
- [ ] Performance is acceptable
- [ ] Console has no errors

## Debugging Tips

If something fails:

1. **Check Network Tab**:
   - Look for actual API response
   - Check response status (200 vs 404/403)
   - Verify returned debt has valid `id` field

2. **Check Browser Console**:
   - Look for JavaScript errors
   - Check if API call was made
   - Look for missing fields in response

3. **Check Server Logs**:
   - Look for debug output showing householdId value
   - Look for Prisma errors
   - Verify calculation logic logged correctly

4. **Check Database**:
   - Use Prisma Studio to verify BalancingRecords exist
   - Check householdId values match
   - Verify isPaid and paidAt fields

## Next Steps

Once all tests pass:
- [ ] Remove debug console.log statements (lines 367-423, 483-488)
- [ ] Create changelog entry for v0.3.6
- [ ] Deploy to production
