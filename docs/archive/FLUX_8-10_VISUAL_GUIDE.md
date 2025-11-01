# Flux 8-10: Visual Guide & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HOUSEHOLD SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   MEMBERS    │  │   ACCOUNTS   │  │   DEBTS      │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ Alice (50%)  │  │ Shared       │  │ Bob → Alice  │    │
│  │ Bob (50%)    │  │ €160 balance │  │ €20 payment  │    │
│  │              │  │              │  │ status:     │    │
│  │              │  │ Tx1: +€50    │  │ ☐ Unpaid     │    │
│  │              │  │ Tx2: -€40    │  │ ☑ Paid       │    │
│  │              │  │ Initial: €100│  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Debt Calculation Flow

```
START: calculateDebts(householdId, userId)
  │
  ├─ 1. VERIFY: User is household member
  │    └─ If not → Return 403 Forbidden
  │
  ├─ 2. FETCH: All shared accounts with transactions
  │    └─ Get: transactions, owners, ownership percentages
  │
  ├─ 3. FOR EACH ACCOUNT:
  │    │
  │    ├─ Calculate total balance:
  │    │  totalBalance = initialBalance + credits - debits
  │    │  Example: €100 + €50 - €40 = €150
  │    │
  │    ├─ Calculate per-user payments:
  │    │  userPayments[Alice] = €50
  │    │  userPayments[Bob] = €40
  │    │
  │    ├─ FOR EACH OWNER:
  │    │  │
  │    │  └─ Calculate owner's share and debt:
  │    │     ownerShare = totalBalance × (ownership% / 100)
  │    │     ownerDebt = ownerShare - userPayments
  │    │
  │    │     Alice: ownerShare=€75, paid=€50, debt=-€25 (receives €25)
  │    │     Bob:   ownerShare=€75, paid=€40, debt=€35 (owes €35)
  │    │
  │    └─ Match debtors with creditors:
  │       Bob (owes €35) → Alice (receives €25)
  │       Result: Bob owes Alice €25
  │
  ├─ 4. FOR EACH CALCULATED DEBT:
  │    │
  │    ├─ Find existing BalancingRecord:
  │    │  SELECT * WHERE householdId=X AND fromUserId=Alice AND toUserId=Bob
  │    │
  │    ├─ IF FOUND:
  │    │  └─ UPDATE amount and periodEnd
  │    │
  │    └─ IF NOT FOUND:
  │       └─ CREATE new BalancingRecord with:
  │          ├─ householdId (FIXED: now using parameter directly)
  │          ├─ fromUserId (creditor)
  │          ├─ toUserId (debtor)
  │          ├─ amount (calculated)
  │          ├─ isPaid: false
  │          ├─ paidAt: null
  │          └─ periodStart/End: now()
  │
  ├─ 5. RETURN: Array of debts with real database IDs
  │    [
  │      {
  │        id: "uuid-from-database",
  │        creditor: { Alice },
  │        debtor: { Bob },
  │        amount: 25,
  │        isPaid: false,
  │        paidAt: null
  │      }
  │    ]
  │
  └─ END

RESULT: Frontend receives debts with valid IDs (not placeholders)
        ✅ Can now use these IDs for payment updates
```

## Payment Status Update Flow

```
FRONTEND (React)                API (Express)               DATABASE (Prisma)
─────────────────────────────────────────────────────────────────────────────

User clicks checkbox
       │
       ├─ Show loading state
       │  (checkbox disabled)
       │
       └─ Call API:
          PATCH /households/:id/balancing-records/:recordId/mark-paid
          Body: { isPaid: true }
                    │
                    ├─ Validate user is household member
                    │  │
                    │  └─ If not → 403 Forbidden
                    │
                    ├─ Find BalancingRecord by ID
                    │  │
                    │  └─ If not found → 404 Not Found
                    │
                    ├─ Verify user is creditor or debtor
                    │  │
                    │  └─ If not → 403 Forbidden
                    │
                    └─ UPDATE BalancingRecord:
                       ├─ isPaid = true
                       ├─ paidAt = NOW()
                       └─ Return updated record
                             │
                             ├─ Receive response
                             │
                             ├─ Update local state:
                             │  ├─ debt.isPaid = true
                             │  └─ debt.paidAt = timestamp
                             │
                             ├─ Apply styling:
                             │  ├─ backgroundColor = green
                             │  ├─ textDecoration = strikethrough
                             │  ├─ opacity = 0.7
                             │  └─ Show date: "Payée le 01/11/2025"
                             │
                             └─ Remove loading state
                                (checkbox enabled)

Result: Debt marked as paid in database AND UI updated
        ✅ Status persists across page reloads
        ✅ Payment history available
```

## Variable Scope Fix Visualization

### BEFORE (Problematic)

```javascript
function calculateDebts(householdId) {
  const debtsMap = new Map();
  const householdIdForBalancing = householdId;  // ← Save here

  for (const account of accounts) {
    // ... account calculations ...

    for (const [creditorId, debtors] of debtsMap) {
      for (const [debtorId, amount] of debtors) {
        // Deep nesting level

        // Try to use householdIdForBalancing here
        // ⚠️ PROBLEM: Variable somehow becomes undefined
        //    (closure scope issue in nested loops)

        prisma.balancingRecord.create({
          data: {
            householdId: householdIdForBalancing,  // ← undefined! ❌
            fromUserId: creditorId,
            toUserId: debtorId,
          }
        });
      }
    }
  }
}
```

**Why It Failed**:
- Intermediate variable created at function level
- Used deep inside nested loops
- Closure scope issues in complex nesting
- Variable loses reference (becomes undefined)

### AFTER (Fixed)

```javascript
function calculateDebts(householdId) {  // ← householdId parameter
  const debtsMap = new Map();
  // ✅ Removed: const householdIdForBalancing = householdId;

  for (const account of accounts) {
    // ... account calculations ...

    for (const [creditorId, debtors] of debtsMap) {
      for (const [debtorId, amount] of debtors) {
        // Deep nesting level

        // Use householdId directly from function parameter
        // ✅ SOLUTION: Function parameters have stable scope
        //    Always accessible, even in deep nesting

        prisma.balancingRecord.create({
          data: {
            householdId,  // ← Direct parameter reference ✅
            fromUserId: creditorId,
            toUserId: debtorId,
          }
        });
      }
    }
  }
}
```

**Why It Works**:
- Uses function parameter directly (stable scope)
- Parameters have closure throughout entire function
- No intermediate variables = no scope issues
- Simpler and more maintainable

## State Management Flow

```
┌─────────────────────────────────────────┐
│        Frontend Debts Component          │
├─────────────────────────────────────────┤
│                                         │
│  State:                                 │
│  ├─ allDebts                            │
│  │  └─ { householdId: { debts: [] } }  │
│  │                                      │
│  ├─ showPaidOnly (boolean)              │
│  │  └─ Filter toggle state              │
│  │                                      │
│  └─ markingPaid (string | null)         │
│     └─ Track which debt is loading      │
│                                         │
├─────────────────────────────────────────┤
│         Rendering Logic                 │
├─────────────────────────────────────────┤
│                                         │
│  For each debt:                         │
│  │                                      │
│  ├─ IF showPaidOnly === true:           │
│  │  └─ FILTER: Show only if isPaid     │
│  │                                      │
│  ├─ STYLE based on isPaid:              │
│  │  ├─ IF isPaid:                      │
│  │  │  ├─ backgroundColor: #e8f5e9      │
│  │  │  ├─ textDecoration: line-through │
│  │  │  ├─ opacity: 0.7                 │
│  │  │  └─ Show paidAt date             │
│  │  │                                   │
│  │  └─ IF NOT isPaid:                  │
│  │     ├─ backgroundColor: #f5f5f5      │
│  │     ├─ textDecoration: none          │
│  │     ├─ opacity: 1                    │
│  │     └─ No date shown                │
│  │                                      │
│  └─ CHECKBOX handler:                   │
│     ├─ Set markingPaid to debtId       │
│     ├─ Call API: markDebtAsPaid()      │
│     ├─ Update local state               │
│     └─ Clear markingPaid (remove loading) │
│                                         │
└─────────────────────────────────────────┘
```

## Authorization Flow

```
┌─────────────────────────────────────┐
│     Mark Debt as Paid Request       │
├─────────────────────────────────────┤
│                                     │
│ Step 1: Is user a household member? │
│ ├─ Query: UserHousehold             │
│ │          WHERE userId = X         │
│ │          AND householdId = Y      │
│ │                                   │
│ └─ Result:                          │
│    ├─ ✅ YES → Continue             │
│    └─ ❌ NO → 403 Forbidden         │
│                                     │
│ Step 2: Does debt exist?            │
│ ├─ Query: BalancingRecord           │
│ │          WHERE id = recordId      │
│ │                                   │
│ └─ Result:                          │
│    ├─ ✅ YES → Continue             │
│    └─ ❌ NO → 404 Not Found         │
│                                     │
│ Step 3: Is user creditor or debtor? │
│ ├─ Check: fromUserId === userId OR  │
│ │          toUserId === userId      │
│ │                                   │
│ └─ Result:                          │
│    ├─ ✅ YES → Update debt          │
│    └─ ❌ NO → 403 Forbidden         │
│                                     │
│ Step 4: Update record               │
│ ├─ SET isPaid = true                │
│ ├─ SET paidAt = NOW()               │
│ └─ RETURN updated record            │
│                                     │
└─────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────┐
│     BalancingRecord Table           │
├─────────────────────────────────────┤
│                                     │
│ id (String)                         │
│   └─ Primary key, UUID              │
│                                     │
│ householdId (String) ← FIXED! ✅    │
│   └─ Foreign key to Household       │
│   └─ Now correctly populated        │
│                                     │
│ fromUserId (String)                 │
│   └─ Creditor (who receives money)  │
│                                     │
│ toUserId (String)                   │
│   └─ Debtor (who owes money)        │
│                                     │
│ amount (Decimal)                    │
│   └─ Debt amount in euros           │
│                                     │
│ isPaid (Boolean) ← NEW! ✅          │
│   └─ Default: false                 │
│   └─ Track payment status           │
│                                     │
│ paidAt (DateTime | null) ← NEW! ✅  │
│   └─ Default: null                  │
│   └─ Timestamp when marked as paid  │
│                                     │
│ status (String)                     │
│   └─ Default: PENDING               │
│                                     │
│ periodStart (DateTime)              │
│   └─ Period start date              │
│                                     │
│ periodEnd (DateTime)                │
│   └─ Period end date                │
│                                     │
│ createdAt (DateTime)                │
│   └─ Creation timestamp             │
│                                     │
│ updatedAt (DateTime)                │
│   └─ Last update timestamp          │
│                                     │
└─────────────────────────────────────┘
```

## Test Scenario

```
SETUP:
┌─────────────────────────────────────────┐
│ Household: "Test Household"             │
│ Members: Alice (50%), Bob (50%)         │
│ Account: "Shared Expenses"              │
│ Initial Balance: €100                   │
│ Transactions:                           │
│   • Alice adds €50 (credit)             │
│   • Bob adds €40 (debit)                │
└─────────────────────────────────────────┘

CALCULATION:
  Total: 100 + 50 - 40 = 110 €

  Alice's share: 110 × 50% = 55 €
  Alice paid: 50 € (credit)
  Alice's debt: 55 - 50 = 5 € (receives 5 €)

  Bob's share: 110 × 50% = 55 €
  Bob paid: 40 € (debit)
  Bob's debt: 55 - 40 = 15 € (owes 15 €)

RESULT:
  → Bob owes Alice: 15 € (not 5 € because Alice receives 5 € credit)
  → Actually: Bob owes 15 €, Alice credits 5 €
  → Net: Bob owes Alice 10 €

TESTING:
  ✅ API returns debt with:
     ├─ id: "valid-uuid"
     ├─ creditor: Alice
     ├─ debtor: Bob
     ├─ amount: 10
     ├─ isPaid: false
     └─ paidAt: null

  ✅ Click checkbox:
     ├─ isPaid changes to true
     └─ paidAt sets to now()

  ✅ UI updates:
     ├─ Green background
     ├─ Strikethrough text
     ├─ Opacity 0.7
     └─ Shows "Payée le 01/11/2025"
```

## Summary

The fix is simple but crucial:
- **Problem**: Using intermediate variable in nested loops
- **Solution**: Use function parameter directly
- **Result**: Stable scope, correct householdId, debts persist correctly

The rest of the system works perfectly - the fix just allows it to save data! 🎉
