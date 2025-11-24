# Phase 6A - Testing and Deployment Guide

## Current Status

Phase 6A (Budgets) has been fully implemented and merged to main branch:
- Backend: Complete (Budget service, controller, routes)
- Frontend: Complete (Budgets page, components, Redux)
- Database: Prisma schema with Budget, BudgetTransaction, BudgetAlert models
- Migrations: 2 migration files (0_init, 1_enhance_budget_models)

**Key Changes in Latest Commits:**
- Added Budgets tab to HouseholdDetails page
- Fixed Decimal type handling in budget statistics
- Fixed missing return statements in budget controller
- Fixed budget routes configuration (from `/households/:householdId/budgets` to `/:householdId/budgets`)

## Critical Information

### API Port Configuration
- **Development**: Typically runs on port 3000
- **Raspberry Pi**: Runs on port 3030 (as verified in testing)
- Update your test commands accordingly

### Database Location
- Database runs on the Raspberry Pi (moneypi.local)
- Local development machine cannot directly connect to the remote database
- Migrations must be applied on the Raspberry Pi during deployment

## Phase 1: Pre-Deployment Verification (Local Dev)

### 1.1 Verify Code Integrity

```bash
# Verify all files are in place
cd e:\GoogleDrive\Webapps\finances

# Check routes are correctly configured
grep -n "/:householdId/budgets" backend/src/routes/budget.routes.ts

# Check controller exists and is imported
grep -n "budget.controller" backend/src/index.ts
```

**Expected:**
- All budget routes use `/:householdId/budgets` format (not `/households/...`)
- budget routes are registered with `app.use('/api/households', budgetRoutes)`
- This creates correct final path: `/api/households/:householdId/budgets`

### 1.2 Verify Prisma Schema

```bash
# Check Prisma schema for Budget model
grep -A 30 "^model Budget" backend/prisma/schema.prisma
```

**Expected fields:**
- id, householdId, categoryId
- name, description, amount, period
- startDate, endDate
- alertThreshold, alertEnabled, isActive
- createdAt, updatedAt

### 1.3 Verify Migrations Exist

```bash
# List migration files
ls -la backend/prisma/migrations/

# Expected structure:
# 0_init/migration.sql - Initial schema
# 1_enhance_budget_models/migration.sql - Budget enhancements
```

### 1.4 Build and TypeScript Check

```bash
cd backend
npm install
npx tsc --noEmit
```

**Expected:** No TypeScript errors

## Phase 2: Deployment to Raspberry Pi

### 2.1 Copy Changes to Raspberry Pi

```bash
# Option A: Using SSH/SCP
scp -r backend/src/routes/budget.routes.ts user@moneypi.local:/path/to/finances/backend/src/routes/
scp -r backend/src/controllers/budget.controller.ts user@moneypi.local:/path/to/finances/backend/src/controllers/
scp -r backend/src/services/budget.service.ts user@moneypi.local:/path/to/finances/backend/src/services/
scp -r backend/prisma/schema.prisma user@moneypi.local:/path/to/finances/backend/prisma/
scp -r backend/prisma/migrations/1_enhance_budget_models/ user@moneypi.local:/path/to/finances/backend/prisma/migrations/

# Option B: Using git
cd /path/to/finances
git pull origin main
```

### 2.2 Install Dependencies and Generate Prisma Client

```bash
cd /path/to/finances/backend
npm install
npx prisma generate
```

### 2.3 Apply Database Migrations

**CRITICAL STEP:** This adds the new columns to the budgets table.

```bash
cd /path/to/finances/backend

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Verify the migration was applied
npx prisma db execute --stdin < prisma/migrations/1_enhance_budget_models/migration.sql
```

**If using PostgreSQL directly:**
```bash
psql -U finances_user -d finances_db -h localhost -c "
  -- Check if columns exist
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'budgets'
  ORDER BY ordinal_position;
"
```

**Expected columns after migration:**
- id, household_id, category_id
- name, description
- amount, period
- start_date, end_date
- alert_threshold, alert_enabled
- is_active
- created_at, updated_at
- Plus budget_transactions and budget_alerts tables

### 2.4 Restart Backend Service

```bash
# Stop the current backend process
pkill -f "node.*backend"

# Navigate to backend directory
cd /path/to/finances/backend

# Start the backend (adjust for your setup)
npm start
# OR use PM2 if configured
pm2 restart finances-backend

# Verify it's running
curl http://localhost:3030/health
```

## Phase 3: Manual Testing - Backend Endpoints

### 3.1 Authentication Setup

First, obtain a valid JWT token:

```bash
# Login to get token
curl -X POST http://moneypi.local:3030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Save the token from response (without "Bearer " prefix)
export TOKEN="your_jwt_token_here"
export HOUSEHOLD_ID="your_household_id_here"
```

### 3.2 Test Get All Budgets

```bash
curl -X GET "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected response (200 OK):
# {
#   "status": "success",
#   "data": [] // or array of budgets if any exist
# }
```

### 3.3 Test Create Budget

```bash
# First, get a category ID
curl -X GET "http://moneypi.local:3030/api/categories" \
  -H "Authorization: Bearer $TOKEN"

# Save a category ID
export CATEGORY_ID="your_category_id_here"

# Create a budget
curl -X POST "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "'$CATEGORY_ID'",
    "name": "Grocery Budget",
    "description": "Monthly grocery spending limit",
    "amount": 500,
    "period": "MONTHLY",
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": null,
    "alertThreshold": 80,
    "alertEnabled": true
  }'

# Expected response (201 CREATED):
# {
#   "status": "success",
#   "message": "Budget créé avec succès",
#   "data": {
#     "id": "budget_id",
#     "householdId": "...",
#     "categoryId": "...",
#     "name": "Grocery Budget",
#     ... other fields
#   }
# }

# Save the budget ID
export BUDGET_ID="returned_budget_id"
```

### 3.4 Test Get Budget by ID

```bash
curl -X GET "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200 OK):
# {
#   "status": "success",
#   "data": {
#     "id": "...",
#     "name": "Grocery Budget",
#     ...
#   }
# }
```

### 3.5 Test Get Budget Summary

```bash
curl -X GET "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets/summary" \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200 OK):
# {
#   "status": "success",
#   "data": [
#     {
#       "id": "...",
#       "name": "...",
#       "amount": 500,
#       "spent": 0,
#       "remaining": 500,
#       "percentageUsed": 0,
#       "status": "on_track",
#       ...
#     }
#   ]
# }
```

### 3.6 Test Update Budget

```bash
curl -X PATCH "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600,
    "alertThreshold": 75,
    "isActive": true
  }'

# Expected response (200 OK):
# {
#   "status": "success",
#   "message": "Budget mis à jour avec succès",
#   "data": { ... updated budget ... }
# }
```

### 3.7 Test Get Budget Alerts

```bash
curl -X GET "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets/$BUDGET_ID/alerts" \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200 OK):
# {
#   "status": "success",
#   "data": [] // or array of alerts if threshold reached
# }
```

### 3.8 Test Delete Budget

```bash
curl -X DELETE "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200 OK):
# {
#   "status": "success",
#   "data": { "success": true }
# }
```

## Phase 4: Frontend Testing

### 4.1 Access the Budgets Page

1. Open browser to: `http://moneypi.local:5173`
2. Login with your credentials
3. Navigate to a household
4. Look for "Budgets" tab or navigation link
5. Click to go to `/households/{householdId}/budgets` page

### 4.2 Test Frontend Features

- [ ] Page loads without errors
- [ ] "Create Budget" button is visible
- [ ] Budget list displays (empty or with budgets)
- [ ] Budget tabs work (Overview, List, Statistics)
- [ ] Create budget dialog opens
- [ ] Form validation works (required fields, numeric amounts)
- [ ] Create budget submission works
- [ ] Budget appears in list after creation
- [ ] Budget edit works
- [ ] Budget delete works
- [ ] Budget alerts display correctly
- [ ] Progress bars show correct percentages
- [ ] Responsive design works on mobile/tablet

### 4.3 Check Console for Errors

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Expected: No 404 or 500 errors

## Phase 5: Integration Testing

### 5.1 Test with Recurring Transactions

1. Create a recurring transaction in the Groceries category
2. Set to generate 10 transactions
3. Generate the transactions
4. Create a budget for the Groceries category
5. Verify the budget "spent" amount increases as transactions are linked

### 5.2 Test with Multiple Households

1. Log in with user that has multiple households
2. Navigate between households
3. Create budgets in different households
4. Verify budgets are isolated per household

### 5.3 Test Permission Isolation

1. Create user with MEMBER role in household
2. Login with that user
3. Should be able to view/create budgets
4. Should NOT be able to modify other users' household budgets (verify authorization)

## Phase 6: Common Issues and Troubleshooting

### Issue: 404 on Budget Endpoints

**Symptoms:**
- GET /api/households/{id}/budgets returns 404
- Routes are registered but not found

**Solution:**
- Verify route file has `/:householdId/budgets` format (not `/households/...`)
- Verify routes are mounted with `app.use('/api/households', budgetRoutes)`
- Restart backend service

### Issue: Prisma Column Not Found

**Symptoms:**
- Error: "The column `name` does not exist in the current database"
- Error: "column alert_threshold does not exist"

**Solution:**
- Run migrations: `npx prisma migrate deploy`
- Verify columns exist: Check database directly with psql
- If columns missing, manually apply migration file to database

### Issue: TypeError: Cannot read property 'name' of undefined

**Symptoms:**
- Budget creation fails with undefined fields
- Database save fails

**Solution:**
- Verify Prisma schema has correct field mappings
- Check @map decorators in schema.prisma
- Regenerate Prisma Client: `npx prisma generate`

### Issue: Authentication Errors (401)

**Symptoms:**
- All endpoints return 401 Unauthorized
- No "Bearer" prefix in Authorization header

**Solution:**
- Verify JWT token is valid
- Check token isn't expired
- Include "Bearer" prefix: `Authorization: Bearer {token}`
- Verify JWT_SECRET environment variable is set

## Deployment Checklist

Before considering Phase 6A complete:

- [ ] Code pushed to main branch
- [ ] All TypeScript errors resolved
- [ ] Migrations created and tested locally
- [ ] Backend deployed to Raspberry Pi
- [ ] Migrations applied to remote database
- [ ] Backend service restarted
- [ ] All 6 API endpoints tested and working
- [ ] Frontend page loads and displays correctly
- [ ] Create/Read/Update/Delete all working
- [ ] Responsive design verified
- [ ] Integration with Phase 5 verified
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Documentation complete

## Next Steps

Once Phase 6A is fully tested and deployed:

1. **Phase 6B - Analytics & Reports**: Implement budget analytics, charts, and export functionality
2. **Phase 6C - Reminders**: Implement reminder system for upcoming transactions

## Support and Debugging

### Logs to Check

**Backend logs:**
```bash
tail -f /path/to/finances/backend/logs/app.log
# or if using PM2:
pm2 logs finances-backend
```

**Database logs:**
```bash
tail -f /var/log/postgresql/postgresql.log
```

### Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# View database schema
npx prisma studio

# Check migration status
npx prisma migrate status

# Create new migration (if schema changes)
npx prisma migrate dev --name migration_name

# Reset database (CAUTION - deletes all data)
npx prisma migrate reset
```

### Testing Tools

- **Postman**: Import and test API endpoints
- **Insomnia**: Similar to Postman
- **curl**: Command-line testing (examples provided above)
- **Browser DevTools**: Network tab for real-time testing

## Conclusion

Phase 6A - Budgets is a critical feature that enables users to:
- Set spending limits per category
- Track spending vs budget
- Receive alerts when approaching limits
- View budget statistics and analysis

Proper testing ensures the feature works reliably before Phase 6B and 6C depend on it.

---

**Last Updated:** November 6, 2025
**Status:** Ready for Deployment Testing
