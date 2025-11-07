# Phase 6C - Dashboard Widgets Testing Guide

**Phase**: 6C - Dashboard Widgets & Analytics Cards
**Status**: Ready for Testing
**Date**: 2024-11-07
**Components**: 7 new dashboard widgets + updated Dashboard page

---

## Pre-Testing Checklist

Before starting tests, ensure:

- [ ] Latest code pulled: `git pull origin main`
- [ ] Frontend restarted: `npm run dev` or `pm2 restart finances-frontend`
- [ ] Backend running and accessible
- [ ] At least one household created with some transactions
- [ ] At least one budget configured (for BudgetStatusWidget testing)
- [ ] Multiple accounts in the household (for AccountsStatusWidget testing)
- [ ] Browser cache cleared

---

## Test Categories

### 1. Dashboard Page Load

**Test 1.1**: Dashboard loads without errors
```
Steps:
1. Navigate to http://localhost:5173/dashboard
2. Wait for page to fully load
3. Check browser console (F12) for errors

Expected Result:
✅ Page loads without errors
✅ No red errors in console
✅ All widgets render (not blank)
```

**Test 1.2**: Household selector appears
```
Steps:
1. On Dashboard page
2. Look for "Sélectionner un foyer" dropdown

Expected Result:
✅ Dropdown visible
✅ Lists all user's households
✅ First household auto-selected
```

---

### 2. MonthlyBalanceWidget Tests

**Test 2.1**: Monthly balance widget displays data
```
Steps:
1. Dashboard loaded with household selected
2. Look for "💰 Bilan du Mois" card

Expected Result:
✅ Widget visible and not loading
✅ Shows "Revenus" with amount (green text)
✅ Shows "Dépenses" with amount (red text)
✅ Shows "Net" with total balance
```

**Test 2.2**: Monthly balance compares with previous month
```
Steps:
1. Look at "Bilan du Mois" widget
2. Check if previous month data shown below values

Expected Result:
✅ Shows previous month amounts
✅ Shows percentage change with arrow (↑ or ↓)
✅ Arrow color matches trend (green up, red down)
```

**Test 2.3**: Net balance color changes based on value
```
Steps:
1. Look at "Net" row in Monthly Balance widget
2. Check color:
   - Positive: Green
   - Negative: Red
   - Zero: Blue

Expected Result:
✅ Color matches balance value
✅ Text is bold and easy to read
```

---

### 3. TopCategoriesWidget Tests

**Test 3.1**: Top categories widget displays data
```
Steps:
1. Look for "📊 Top Catégories de Dépenses" card
2. Verify categories listed

Expected Result:
✅ Widget shows top 5 categories (or fewer if less than 5)
✅ Each category shows:
   - Colored dot (category color)
   - Category name
   - Amount in €
   - Percentage bar
   - Percentage text
```

**Test 3.2**: Categories sorted correctly
```
Steps:
1. Look at "Top Catégories de Dépenses"
2. Check order of categories

Expected Result:
✅ Categories listed from highest to lowest spending
✅ Percentages add up to 100%
✅ Bar widths proportional to percentages
```

**Test 3.3**: Category colors match
```
Steps:
1. Look at colored dots in Top Categories
2. Compare with colors in other parts of app

Expected Result:
✅ Colors consistent with category colors elsewhere
✅ All dots clearly visible
```

---

### 4. BudgetStatusWidget Tests

**Test 4.1**: Budget widget displays (if budgets exist)
```
Steps:
1. Ensure household has at least 1 budget configured
2. Look for "📋 État des Budgets" card

Expected Result:
✅ Shows "Aucun budget configuré" if no budgets
✅ OR shows budget list if budgets exist
```

**Test 4.2**: Budget progress bars display correctly
```
Steps:
1. Look at budget entries
2. Check progress bar for each budget

Expected Result:
✅ Progress bar shows spending vs budget amount
✅ Color green if < 80%
✅ Color orange if 80-99%
✅ Color red if > 100%
✅ Percentage and amounts shown (e.g., "45 / 200 €")
```

**Test 4.3**: Budget status icons appear
```
Steps:
1. Look at budgets in widget
2. Check for icon on right side

Expected Result:
✅ Green checkmark if under 80%
✅ Orange warning icon if 80%+
```

---

### 5. AccountsStatusWidget Tests

**Test 5.1**: Accounts widget displays
```
Steps:
1. Look for "🏦 Comptes" card
2. Should show table of accounts

Expected Result:
✅ Widget visible
✅ Shows all accounts user owns in household
✅ Table has columns: Nom | Solde | Type
```

**Test 5.2**: Account balances display correctly
```
Steps:
1. Check account soldes in widget
2. Compare with AccountDetails page

Expected Result:
✅ Soldes match AccountDetails page
✅ Green color if positive
✅ Red color if negative
✅ Bold font for emphasis
```

**Test 5.3**: Total balance calculation
```
Steps:
1. Look at "Total" row in accounts table
2. Manual calculate: sum of all balances

Expected Result:
✅ Total matches manual calculation
✅ Highlighted with gray background
✅ Color matches total (green/red)
```

---

### 6. HouseholdDebtsWidget Tests

**Test 6.1**: Debts widget displays (if applicable)
```
Steps:
1. Household might have debts (if accounts are shared)
2. Look for "💳 Dettes du Foyer" card

Expected Result:
✅ Shows "Aucune dette en attente" if no debts
✅ OR shows debt list if debts exist
✅ Shows: "Person A doit Person B" format
```

**Test 6.2**: Debt amounts and styling
```
Steps:
1. Check debt entries (if any)
2. Verify amount display

Expected Result:
✅ Orange left border on debt cards
✅ Orange amount displayed on right
✅ Bold font for amounts
✅ Status chip shown (if applicable)
```

**Test 6.3**: "Voir plus" link works
```
Steps:
1. If debts shown, look for "Voir plus" button
2. Click it

Expected Result:
✅ Navigates to /debts page
✅ Full debts list displayed on that page
```

---

### 7. Household Selector Tests

**Test 7.1**: Selector dropdown works
```
Steps:
1. Click on "Sélectionner un foyer" dropdown
2. List appears with all households

Expected Result:
✅ Dropdown opens
✅ All households listed
✅ Currently selected highlighted
```

**Test 7.2**: Changing household updates widgets
```
Steps:
1. Select first household
2. Note the values in widgets
3. Select different household
4. Check if values change

Expected Result:
✅ All widgets update with new household data
✅ No loading errors
✅ Data changes appropriately
```

**Test 7.3**: First household auto-selected
```
Steps:
1. Refresh page (F5)
2. Look at dropdown value

Expected Result:
✅ First household is selected
✅ Its data is displayed in widgets
```

---

### 8. Loading States Tests

**Test 8.1**: Widgets show loading spinner while fetching
```
Steps:
1. Open Network tab in DevTools
2. Throttle network to "Slow 3G"
3. Switch between households
4. Watch widgets while loading

Expected Result:
✅ Loading spinner appears
✅ Spinner centered in widget
✅ No data visible while loading
✅ Data appears when loaded
```

**Test 8.2**: Widgets handle errors gracefully
```
Steps:
1. Ensure backend is running
2. Make a request
3. If error occurs, widget should show error

Expected Result:
✅ Error message displayed in widget
✅ Error is descriptive
✅ Loading spinner removed
✅ Widget doesn't crash
```

---

### 9. Responsive Design Tests

**Test 9.1**: Desktop layout (1200px+)
```
Steps:
1. Open DevTools (F12)
2. Set viewport to 1200px width
3. Check widget layout

Expected Result:
✅ Widgets in 2-column layout (2 per row)
✅ All widgets fully visible
✅ No horizontal scrolling
✅ Spacing looks good
```

**Test 9.2**: Tablet layout (768px)
```
Steps:
1. Set viewport to 768px
2. Check layout

Expected Result:
✅ Widgets still in 2-column layout
✅ Widgets slightly narrower but readable
✅ No content cut off
```

**Test 9.3**: Mobile layout (360px)
```
Steps:
1. Set viewport to 360px
2. Check layout

Expected Result:
✅ Widgets stack to single column
✅ All content readable
✅ No horizontal scrolling
✅ Fonts readable at this size
✅ Tables scroll horizontally if needed
```

---

### 10. Data Consistency Tests

**Test 10.1**: Dashboard data matches Analytics page
```
Steps:
1. Note Monthly Balance from Dashboard
2. Navigate to /households/{id}/analytics
3. Check "Tendances Mensuelles" tab for current month

Expected Result:
✅ Income values match
✅ Expense values match
✅ Net cash flow matches
```

**Test 10.2**: Dashboard data matches Budgets page
```
Steps:
1. Note budget statuses on Dashboard
2. Navigate to household budgets page
3. Compare percentages

Expected Result:
✅ Percentages match
✅ Spent amounts match
✅ Budget limits match
```

**Test 10.3**: Accounts balance matches AccountDetails
```
Steps:
1. Note account balances on Dashboard
2. Click on account (if possible) or navigate to AccountDetails
3. Compare current balances

Expected Result:
✅ Balances match exactly
✅ Currency consistent (€)
```

---

## Performance Tests

**Test P.1**: Widgets load within reasonable time
```
Expected: < 3 seconds total for all widgets to load
Measure: Use Network tab in DevTools
```

**Test P.2**: Switching households is smooth
```
Expected: Widgets update within 1-2 seconds
Measure: Visual inspection
```

**Test P.3**: No memory leaks
```
Steps:
1. Open DevTools Memory tab
2. Switch households 10 times
3. Check memory usage

Expected: Memory stable (not continuously increasing)
```

---

## Browser Compatibility Tests

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected Result**: ✅ All widgets render correctly on all browsers

---

## Accessibility Tests

**Test A.1**: Color contrast
```
Expected: Text readable on widget backgrounds
- White text on dark backgrounds
- Dark text on light backgrounds
```

**Test A.2**: Keyboard navigation
```
Steps:
1. Use Tab key to navigate
2. Try selecting household from dropdown

Expected: ✅ All interactive elements accessible via keyboard
```

**Test A.3**: Screen reader friendly
```
Steps:
1. Use browser's accessibility inspector
2. Check element labels

Expected: ✅ Widgets have proper labels/titles
```

---

## Edge Cases

**Test E.1**: No households
```
Steps:
1. Create user with no households
2. Go to Dashboard

Expected: ✅ Dashboard shows empty state message
✅ Widgets not shown
```

**Test E.2**: Household with no transactions
```
Steps:
1. Create new household
2. Don't add any transactions
3. Go to Dashboard

Expected: ✅ Widgets show "Aucune donnée" or 0 values
✅ No errors
```

**Test E.3**: Household with no budgets
```
Steps:
1. Use household without budgets
2. Look at Budget widget

Expected: ✅ Shows "Aucun budget configuré"
✅ Other widgets still work
```

**Test E.4**: Very large numbers
```
Steps:
1. Create transaction for 999,999.99 €
2. Check widget display

Expected: ✅ Numbers display correctly
✅ No overflow or truncation
✅ Currency formatting correct
```

---

## Test Execution Checklist

### Quick Test (15 minutes)
- [ ] Dashboard loads
- [ ] Household selector works
- [ ] All 5 widgets visible
- [ ] Data displays correctly
- [ ] Switch households updates data
- [ ] No console errors

### Full Test (45 minutes)
- [ ] All tests in categories 1-7
- [ ] Responsive design on desktop
- [ ] Error handling works
- [ ] Data consistency checks

### Complete Test (2 hours)
- [ ] All tests in all categories
- [ ] Performance tests
- [ ] Browser compatibility
- [ ] Accessibility checks
- [ ] Edge cases

---

## Known Issues / Limitations

Currently, RecentTransactionsWidget may not load if transaction endpoint not available. This is OK - other widgets will still work.

---

## Reporting Results

When testing, note:

1. **What was tested**: Which tests you ran
2. **Results**: What worked, what didn't
3. **Environment**: Browser, device, OS
4. **Screenshots**: If possible, attach screenshots of issues
5. **Steps to reproduce**: If you find bugs

---

## Success Criteria

Phase 6C testing is COMPLETE when:

✅ All 5 main widgets display data correctly
✅ Household selector works smoothly
✅ Data updates when switching households
✅ No console errors
✅ Responsive on mobile/tablet/desktop
✅ Performance is acceptable (< 3 sec load)
✅ Data matches other pages (Analytics, Budgets, etc.)

---

**Last Updated**: 2024-11-07
**Status**: Ready for Testing
