# Phase 6B - Analytics Testing Guide

## Overview
Phase 6B adds comprehensive analytics and reporting capabilities to the application. This guide covers all testing procedures for the backend and frontend implementations.

---

## Prerequisites

### Backend Setup
1. Apply the database migration on Raspberry Pi:
```bash
cd /path/to/backend
npx prisma migrate deploy
```

2. Verify database schema:
```bash
psql finances_db -c "\dt analytics_snapshots analytics_details export_logs"
```

3. Restart backend service if running

### Frontend Setup
1. Frontend changes are automatically loaded (hot reload)
2. No additional dependencies needed (Recharts already installed)

---

## Part 1: Backend API Testing

### 1.1 Health Check
Verify the backend is running and analytics routes are registered:
```bash
curl http://moneypi.local:3030/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 1.2 Test Analytics Endpoints

**Setup**: You'll need:
- A valid JWT token (get from login)
- A household ID with transactions
- A category ID

Export token as variable:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MjQ1NTgwNiwiZXhwIjoxNzYyNTQyMjA2fQ.xrOIT2jRRCymjmXALMtTq7DOO39ISUWkZfMrdJnILZg"
HOUSEHOLD_ID="ea433d78-6001-464c-8071-21d3565b5da3"
CATEGORY_ID="6d8a5c84-2ada-4bb3-8f2b-4264d987621f"
```

#### 1.2.1 Get Category Breakdown (Current Month)
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/breakdown" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "categoryId": "...",
      "categoryName": "Alimentation",
      "categoryColor": "#ff9800",
      "amount": 150.50,
      "type": "EXPENSE",
      "percentage": 35.2,
      "transactionCount": 5
    }
  ]
}
```

**Test Cases**:
- [ ] Response includes all categories with transactions
- [ ] Percentages add up to ~100%
- [ ] Amounts are positive numbers
- [ ] Transaction counts match reality

#### 1.2.2 Get Monthly Spendings (Last 12 Months)
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/monthly?months=12" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "month": "2024-11",
      "income": 2500.00,
      "expense": 1850.75,
      "netCashFlow": 649.25
    }
  ]
}
```

**Test Cases**:
- [ ] Data includes last 12 months
- [ ] All months are in YYYY-MM format
- [ ] netCashFlow = income - expense
- [ ] Numbers are reasonable (positive)

#### 1.2.3 Get Category Trends (12 Months)
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/trends/$CATEGORY_ID?months=12" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "month": "2024-11",
      "amount": 150.50
    }
  ]
}
```

**Test Cases**:
- [ ] Returns 12 data points (or fewer if category has no transactions that month)
- [ ] Months are in order from oldest to newest
- [ ] Amounts are non-negative

#### 1.2.4 Compare Two Periods
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/compare?startDate1=2024-10-01&endDate1=2024-10-31&startDate2=2024-11-01&endDate2=2024-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "period1": {
      "label": "01/10/2024 - 31/10/2024",
      "income": 2500.00,
      "expense": 1800.00,
      "netCashFlow": 700.00
    },
    "period2": {
      "label": "01/11/2024 - 30/11/2024",
      "income": 2500.00,
      "expense": 1850.75,
      "netCashFlow": 649.25
    },
    "differences": {
      "incomeChange": 0.00,
      "incomeChangePercent": 0.0,
      "expenseChange": 50.75,
      "expenseChangePercent": 2.8
    }
  }
}
```

**Test Cases**:
- [ ] Period labels are correctly formatted
- [ ] Calculations are accurate (income/expense)
- [ ] Percentage changes are correctly calculated
- [ ] Difference values are correct

#### 1.2.5 Generate Snapshot (Current Month)
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/snapshot/2024-11" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "householdId": "...",
    "period": "2024-11",
    "periodType": "MONTHLY",
    "totalIncome": 2500.00,
    "totalExpense": 1850.75,
    "netCashFlow": 649.25,
    "createdAt": "2024-11-07T10:30:00.000Z",
    "updatedAt": "2024-11-07T10:30:00.000Z"
  }
}
```

**Test Cases**:
- [ ] Snapshot is created/updated in database
- [ ] Totals match calculated values
- [ ] Period format is correct (YYYY-MM)

#### 1.2.6 Get Snapshot History
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/snapshots?limit=12" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    { "period": "2024-10", "totalIncome": 2500, ... },
    { "period": "2024-11", "totalIncome": 2500, ... }
  ]
}
```

**Test Cases**:
- [ ] Returns up to limit snapshots
- [ ] Ordered by creation date (newest first, then reversed)
- [ ] Includes all snapshot data

#### 1.2.7 Get Projections (6 Months)
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/projections?months=6" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "month": "2024-12",
      "projectedExpense": 1890.77,
      "confidence": 85,
      "trend": "increasing"
    }
  ]
}
```

**Test Cases**:
- [ ] Returns 6 months of projections
- [ ] Months are in future
- [ ] Confidence decreases with distance (85, 75, 65, 55, 45, 35)
- [ ] Trend is one of: increasing, decreasing, stable

#### 1.2.8 Detect Anomalies
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/anomalies?sensitivity=medium" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "transactionId": "...",
      "description": "Unusual purchase",
      "amount": 500.00,
      "category": "Other",
      "date": "2024-11-05T10:00:00.000Z",
      "severity": "high",
      "reason": "Dépassement de 150.5% par rapport à la moyenne (150.25 €)"
    }
  ]
}
```

**Test Cases**:
- [ ] Returns up to 10 anomalies (sorted by amount, highest first)
- [ ] Severity is one of: low, medium, high
- [ ] Reason explains the anomaly percentage
- [ ] Only includes transactions from last 90 days

#### 1.2.9 Get Budget Suggestions
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/suggestions/budgets" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "categoryId": "...",
      "categoryName": "Alimentation",
      "suggestedBudget": 165.55,
      "currentBudget": 150.00,
      "averageSpending": 150.50,
      "maxSpending": 200.00,
      "confidence": 95
    }
  ]
}
```

**Test Cases**:
- [ ] suggestedBudget ≈ averageSpending × 1.1 (10% buffer)
- [ ] currentBudget matches existing budget (or null)
- [ ] maxSpending >= averageSpending
- [ ] Confidence is between 50 and 95
- [ ] Sorted by suggestedBudget (highest first)

### 1.3 Test Report Generation

#### 1.3.1 Generate CSV Report
```bash
curl -X POST \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/reports/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-11-01",
    "endDate": "2024-11-30",
    "format": "CSV"
  }' \
  --output report.csv
```

**Test Cases**:
- [ ] File downloads successfully
- [ ] File contains CSV headers
- [ ] Data is properly formatted with commas
- [ ] All sections present: Summary, Category Breakdown, Monthly Spendings

#### 1.3.2 Generate JSON Report
```bash
curl -X POST \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/reports/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-11-01",
    "endDate": "2024-11-30",
    "format": "JSON"
  }' \
  --output report.json
```

**Test Cases**:
- [ ] Valid JSON returned
- [ ] Can parse with `jq report.json`
- [ ] Contains all required fields

#### 1.3.3 Generate TEXT Report
```bash
curl -X POST \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/reports/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-11-01",
    "endDate": "2024-11-30",
    "format": "TEXT"
  }' \
  --output report.txt
```

**Test Cases**:
- [ ] Text file is readable
- [ ] Contains formatted headers and sections
- [ ] Numbers are properly formatted with € symbol

#### 1.3.4 Get Export History
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/reports/history?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "householdId": "...",
      "userId": "...",
      "format": "CSV",
      "periodStart": "2024-11-01T00:00:00.000Z",
      "periodEnd": "2024-11-30T23:59:59.000Z",
      "fileName": "report_..._123456.csv",
      "fileSize": 2048,
      "downloadUrl": null,
      "createdAt": "2024-11-07T10:35:00.000Z",
      "user": {
        "id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Test Cases**:
- [ ] Returns reports in reverse chronological order
- [ ] Includes user information
- [ ] File sizes are reasonable (>0 bytes)
- [ ] Dates are valid ISO format

### 1.4 Test Error Cases

#### Missing Authentication
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/breakdown"
```
Expected: 401 Unauthorized

#### Invalid Household Access
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/invalid-id/analytics/breakdown" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 403 Forbidden

#### Invalid Date Format
```bash
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/snapshot/2024-13" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 400 Bad Request with error message

---

## Part 2: Frontend Testing

### 2.1 Navigation to Analytics Pages

#### Test 1: Access Analytics Page
1. Log in to the application
2. Select a household from the household selector
3. Navigate to `/analytics`
4. **Expected**: Page loads without errors

**Verification**:
- [ ] Page title shows "📊 Analytics du Foyer"
- [ ] Tab bar with 4 tabs visible
- [ ] No console errors
- [ ] Charts are responsive (resize window)

#### Test 2: Access Reports Page
1. Navigate to `/reports`
2. **Expected**: Page loads with report generation form

**Verification**:
- [ ] Form with date inputs visible
- [ ] Format selector shows CSV, JSON, TEXT
- [ ] Generate button is clickable
- [ ] Export history table visible (empty or with data)

### 2.2 Analytics Tab Tests

#### Tab 1: Répartition (Category Breakdown)

**Test 2.2.1: Load Data**
1. Click "Répartition" tab
2. Wait for data to load
3. **Expected**: Pie chart displays with all categories

**Verification**:
- [ ] Chart renders without errors
- [ ] All categories from current month are shown
- [ ] Colors match category colors
- [ ] Legend displays category names
- [ ] Percentages add to 100%

**Test 2.2.2: Chart Interaction**
1. Hover over pie chart slices
2. **Expected**: Tooltip shows amount and percentage

**Verification**:
- [ ] Tooltip appears on hover
- [ ] Shows category name, amount (€X.XX), and percentage
- [ ] Tooltip is readable (good contrast)

#### Tab 2: Tendances Mensuelles (Monthly Spendings)

**Test 2.2.3: Load Monthly Data**
1. Click "Tendances Mensuelles" tab
2. **Expected**: Line chart with 3 lines (Income, Expense, Net)

**Verification**:
- [ ] Chart shows last 12 months of data
- [ ] Green line = Income
- [ ] Red line = Expense
- [ ] Blue line = Net Cash Flow
- [ ] X-axis shows month labels (YYYY-MM)
- [ ] Y-axis shows amounts in €

**Test 2.2.4: Chart Interaction**
1. Click on data points or hover
2. **Expected**: Tooltip shows exact values

**Verification**:
- [ ] Tooltip shows all 3 values
- [ ] Values match backend response
- [ ] Formatted as €X.XX

#### Tab 3: Catégories (Category Trends)

**Test 2.2.5: Select Category**
1. Click "Catégories" tab
2. Click on a category button
3. **Expected**: Bar chart loads showing that category's trend

**Verification**:
- [ ] Selected button is highlighted
- [ ] Chart appears below
- [ ] Chart shows last 12 months
- [ ] No error messages
- [ ] Category name displayed in chart title

**Test 2.2.6: Switch Between Categories**
1. Click different category buttons
2. **Expected**: Chart updates to show new category

**Verification**:
- [ ] Chart updates without full page reload
- [ ] Data changes correctly
- [ ] Chart title updates
- [ ] Previous selection shows in button style

**Test 2.2.7: Multiple Categories**
1. Verify all categories from breakdown appear as buttons
2. **Expected**: Can select all categories

**Verification**:
- [ ] All categories have buttons
- [ ] All buttons are clickable
- [ ] No buttons are disabled

#### Tab 4: Comparaison (Period Comparison)

**Test 2.2.8: Set Date Ranges**
1. Click "Comparaison" tab
2. Set Period 1: 2024-10-01 to 2024-10-31
3. Set Period 2: 2024-11-01 to 2024-11-30
4. Click "Comparer" button
5. **Expected**: Comparison chart appears

**Verification**:
- [ ] Date pickers accept valid dates
- [ ] "Comparer" button is enabled when dates are set
- [ ] Chart renders after button click
- [ ] Chart shows bars for both periods

**Test 2.2.9: Chart Data Accuracy**
1. Compare displayed values with backend
2. **Expected**: Values match exactly

**Verification**:
- [ ] Income bars show correct values
- [ ] Expense bars show correct values
- [ ] Net Cash Flow bars show correct values
- [ ] Period labels are readable
- [ ] Legend shows both period labels

### 2.3 Reports Page Tests

#### Test 2.3.1: Generate CSV Report
1. Set start date: 2024-11-01
2. Set end date: 2024-11-30
3. Select format: CSV
4. Click "Générer et Télécharger"
5. **Expected**: CSV file downloads

**Verification**:
- [ ] Button shows loading state during generation
- [ ] File downloads to default download location
- [ ] Filename includes household name and timestamp
- [ ] File size is > 0 bytes
- [ ] File can be opened in text editor
- [ ] Contains comma-separated values

#### Test 2.3.2: Generate JSON Report
1. Select format: JSON
2. Click "Générer et Télécharger"
3. **Expected**: JSON file downloads

**Verification**:
- [ ] File downloads successfully
- [ ] Valid JSON syntax (can open in VS Code)
- [ ] Contains all expected fields
- [ ] Numbers are properly formatted

#### Test 2.3.3: Generate TEXT Report
1. Select format: Texte
2. Click "Générer et Télécharger"
3. **Expected**: Text file downloads

**Verification**:
- [ ] File downloads successfully
- [ ] File is readable as plain text
- [ ] Contains formatted report with headers
- [ ] Money values formatted with € symbol

#### Test 2.3.4: Export History
1. Generate at least 2 different reports
2. Scroll to "Historique des Exports" table
3. **Expected**: Table shows all exports

**Verification**:
- [ ] New exports appear in table
- [ ] Table shows: Date, Format, Period, Size, User
- [ ] Dates are readable (French format)
- [ ] File sizes are accurate (check file properties)
- [ ] User names are correct

#### Test 2.3.5: Date Validation
1. Set end date before start date
2. Try to generate report
3. **Expected**: Error message or disabled button

**Verification**:
- [ ] Invalid date range is caught
- [ ] Error message is helpful
- [ ] Cannot submit form with invalid dates

### 2.4 Responsive Design Tests

#### Test 2.4.1: Desktop (>1200px)
1. Open analytics page on desktop
2. Resize window to 1920px width
3. **Expected**: Full layout with all elements visible

**Verification**:
- [ ] Charts render with optimal size
- [ ] All tabs visible and clickable
- [ ] No horizontal scrolling needed
- [ ] Text is readable

#### Test 2.4.2: Tablet (768px - 1200px)
1. Open analytics page on tablet or resize window
2. **Expected**: Layout adapts to tablet size

**Verification**:
- [ ] Charts are readable at tablet width
- [ ] Tabs may stack but all accessible
- [ ] No overlapping elements
- [ ] Buttons are touch-friendly (min 44px)

#### Test 2.4.3: Mobile (<768px)
1. Open analytics page on mobile or resize window to 375px
2. **Expected**: Mobile-optimized layout

**Verification**:
- [ ] Charts are stacked vertically
- [ ] All elements are readable without horizontal scroll
- [ ] Buttons are touchable
- [ ] Text doesn't overlap

### 2.5 State Management Tests

#### Test 2.5.1: State Persistence
1. Load analytics page
2. Navigate to another page (e.g., Budgets)
3. Return to Analytics
4. **Expected**: Previous tab selection preserved

**Verification**:
- [ ] Same tab is still active
- [ ] Chart data still visible
- [ ] No data refetch (loading spinner doesn't appear)

#### Test 2.5.2: Error Handling
1. Simulate network error (DevTools → Network → Offline)
2. Try to load analytics page
3. **Expected**: Error message displayed

**Verification**:
- [ ] Error alert appears
- [ ] Error message is descriptive
- [ ] "Retry" or manual refresh option available
- [ ] User can recover from error

#### Test 2.5.3: Loading States
1. Slow down network (DevTools → Network → Slow 3G)
2. Click to generate report
3. **Expected**: Loading spinner visible

**Verification**:
- [ ] Spinner shows during request
- [ ] Button text changes (e.g., "Génération...")
- [ ] User cannot click button multiple times
- [ ] Spinner disappears when done

### 2.6 Household Isolation Tests

#### Test 2.6.1: Data Isolation
1. Log in with user who has access to 2 households
2. Select Household A, note the data values
3. Switch to Household B
4. **Expected**: Different data is shown

**Verification**:
- [ ] Charts update with Household B data
- [ ] Category breakdown changes
- [ ] Monthly spendings are different
- [ ] Export history shows only Household B exports

#### Test 2.6.2: Unauthorized Access
1. Try to access analytics for a household you don't have access to
2. **Expected**: Error or redirect

**Verification**:
- [ ] Cannot see data from other households
- [ ] 403 Forbidden error in network tab
- [ ] User is informed of access denial

### 2.7 Data Validation Tests

#### Test 2.7.1: Empty Data Handling
1. Create a household with no transactions
2. Go to Analytics
3. **Expected**: Appropriate empty state message

**Verification**:
- [ ] Message says "Aucune donnée disponible"
- [ ] Charts don't render (no confusing empty charts)
- [ ] Page is still usable
- [ ] No console errors

#### Test 2.7.2: Extreme Values
1. Add a very large transaction (€10,000)
2. Add a very small transaction (€0.01)
3. Go to Analytics
4. **Expected**: Charts handle extreme values

**Verification**:
- [ ] Scale adjusts appropriately
- [ ] Large value doesn't break chart
- [ ] Small value is still visible/readable
- [ ] Tooltips show correct amounts

---

## Part 3: Integration Tests

### 3.1 End-to-End Flow

#### Test 3.1.1: Create Budget → View Analytics
1. Create a new budget for a category
2. Go to Budgets page and add transactions
3. Go to Analytics
4. **Expected**: New category appears in breakdown

**Verification**:
- [ ] Category appears in pie chart
- [ ] Percentage is calculated correctly
- [ ] Amount matches transaction totals

#### Test 3.1.2: Recurring Transactions → Analytics
1. Create a recurring transaction pattern
2. Let pattern generate 3 transactions
3. Go to Analytics
4. **Expected**: All transactions are included

**Verification**:
- [ ] Monthly spendings increases correctly
- [ ] Category breakdown includes pattern amounts
- [ ] No transactions are counted twice

#### Test 3.1.3: Export → Reopen in Excel
1. Export report as CSV
2. Open in Excel/LibreOffice
3. **Expected**: Properly formatted spreadsheet

**Verification**:
- [ ] All columns align correctly
- [ ] No broken formatting
- [ ] Numbers are recognized as numbers (not text)
- [ ] Currency formatting preserved

### 3.2 Performance Tests

#### Test 3.2.1: Large Dataset
1. Create household with 500+ transactions
2. Go to Analytics
3. **Expected**: Charts load within 3 seconds

**Verification**:
- [ ] Page loads in reasonable time
- [ ] No "Not Responding" warnings
- [ ] Charts render smoothly
- [ ] Interactions are responsive

#### Test 3.2.2: Multiple Comparisons
1. Generate 5 different period comparisons quickly
2. **Expected**: No data corruption

**Verification**:
- [ ] Each comparison shows correct data
- [ ] No mixing of data between comparisons
- [ ] Memory usage doesn't increase indefinitely

---

## Part 4: Browser Compatibility Tests

Test in the following browsers:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on macOS)
- [ ] Edge (latest)

For each browser:
- [ ] Charts render correctly
- [ ] All interactions work
- [ ] No console errors
- [ ] Date pickers work
- [ ] Downloads work

---

## Testing Checklist Summary

### Backend API
- [ ] All 11 endpoints return correct data
- [ ] Error handling works (403, 400, 401)
- [ ] Household isolation is enforced
- [ ] Report generation works for all formats
- [ ] Export history is logged correctly

### Frontend Pages
- [ ] Analytics page loads and displays data
- [ ] All 4 tabs work and display correct charts
- [ ] Reports page generates files correctly
- [ ] Export history shows accurate data
- [ ] Responsive design works on all screen sizes

### Integration
- [ ] Analytics data matches actual transactions
- [ ] Budget suggestions are reasonable
- [ ] Anomalies are detected correctly
- [ ] Reports contain accurate summaries

### User Experience
- [ ] Error messages are helpful
- [ ] Loading states are clear
- [ ] No page crashes or infinite loops
- [ ] Household selection works
- [ ] All text is readable and properly formatted

---

## Known Limitations & TODOs

- [ ] PDF export requires additional library setup (pdfkit)
- [ ] XLSX export requires additional library setup (xlsx)
- [ ] Projection accuracy improves with more historical data (6+ months)
- [ ] Anomaly detection uses statistical methods (may need tuning)
- [ ] Charts don't support dragging/selection (future enhancement)
- [ ] No dashboard widgets yet (future enhancement)

---

## Troubleshooting

### Backend Issues

**Problem**: `ECONNREFUSED` on localhost:3030
**Solution**:
```bash
# Check if backend is running
ps aux | grep node
# Restart backend
cd /path/to/backend && npm start
```

**Problem**: Database migration fails
**Solution**:
```bash
# Check migration status
npx prisma migrate status
# Reset (WARNING: loses data)
npx prisma migrate reset
```

### Frontend Issues

**Problem**: Charts not rendering
**Solution**:
- Check browser console for errors
- Clear cache: `Ctrl+Shift+Delete` (Chrome)
- Verify Recharts is installed: `npm ls recharts`

**Problem**: Reports not downloading
**Solution**:
- Check browser download settings
- Try in incognito mode
- Verify backend is returning blob data

### Network Issues

**Problem**: API returns 403 Forbidden
**Solution**:
- Verify user has access to household
- Check JWT token is valid
- Verify household ID is correct

**Problem**: Slow analytics loading
**Solution**:
- Check database performance: `EXPLAIN ANALYZE` on queries
- Add indexes if needed
- Consider caching snapshots

---

## Sign-off Checklist

Before marking Phase 6B as complete:

- [ ] All backend endpoints tested and working
- [ ] All frontend pages tested and working
- [ ] Responsive design verified on 3+ screen sizes
- [ ] Household isolation verified
- [ ] Error handling verified
- [ ] Database migration applied successfully
- [ ] No console errors
- [ ] Code is committed and deployed

---

## Next Steps After Testing

1. **Deploy to Production**:
   ```bash
   git push origin main
   # On Raspberry Pi
   git pull origin main
   npx prisma migrate deploy
   npm restart
   ```

2. **Update Documentation**:
   - Add Analytics to user guide
   - Document report formats
   - Add troubleshooting section

3. **Phase 6C Planning**:
   - Dashboard widgets
   - Advanced filtering
   - Custom report templates

---

**Last Updated**: 2024-11-07
**Status**: Ready for Testing
**Assigned To**: QA Team
