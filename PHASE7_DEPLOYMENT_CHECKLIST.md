# Phase 7 Deployment Checklist (RPi)

## Current Status
All backend code is complete and ready for deployment. TypeScript compilation errors have been fixed.

## Files Changed/Created

### New Files:
1. `backend/src/middleware/adminCheck.middleware.ts` - Admin permission middleware
2. `backend/src/services/incomeCalculation.service.ts` - Income calculation logic
3. `backend/src/jobs/adjustSharingRatioJob.ts` - Cron job for ratio adjustments

### Modified Files:
1. `backend/prisma/schema.prisma` - Added HouseholdConfiguration and SharingRatioHistory models
2. `backend/src/index.ts` - Added sharing ratio job import and startup
3. `backend/src/services/household.service.ts` - Added promoteMemberToAdmin, demoteAdminToMember
4. `backend/src/controllers/household.controller.ts` - Added 5 new handlers
5. `backend/src/routes/household.routes.ts` - Added 6 new API routes
6. `frontend/src/services/household.service.ts` - Added 2 methods for promote/demote
7. `frontend/src/pages/HouseholdDetails.tsx` - Added admin buttons to member list

## RPi Deployment Steps

### Step 1: Database Migration
```bash
cd /home/pi/finances/backend
npx prisma migrate dev --name add_household_configuration_and_sharing_ratio_history
```

This will:
- Create migration file in `prisma/migrations/`
- Apply schema changes to PostgreSQL
- Regenerate Prisma client

### Step 2: Build Backend
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate output in `dist/` directory
- Should complete with NO ERRORS

### Step 3: Start Backend Server
```bash
npm run dev
```

This will:
- Start Express server on port 3000
- Initialize database connection
- Start both cron jobs:
  - Recurring transaction job (existing)
  - Sharing ratio adjustment job (NEW)

### Step 4: Frontend Build and Deploy
```bash
cd /home/pi/finances/frontend
npm run build
```

Then restart your frontend server (Nginx or similar).

## New API Endpoints (Backend)

All endpoints require authentication (Bearer token in Authorization header)

### Member Role Management
- `POST /api/households/:id/members/:memberId/promote` - Promote member to admin
- `POST /api/households/:id/members/:memberId/demote` - Demote admin to member

### Income Analysis
- `GET /api/households/:id/income-analysis?year=2025&month=11` - Get monthly incomes and ratios

### Sharing Configuration
- `GET /api/households/:id/sharing-configuration` - Get current config
- `PATCH /api/households/:id/sharing-configuration` - Update config
  - Body: `{ autoAdjustRatios, ratioAdjustmentDay, salaryCategoryId, proportionalAccounts }`

### Sharing History
- `GET /api/households/:id/sharing-history?limit=24` - Get past ratio adjustments
- `POST /api/households/:id/apply-sharing-ratios` - Apply ratios manually
  - Body: `{ year, month }`

## Database Schema Changes

### HouseholdConfiguration Table
```
- householdId (unique)
- salaryCategoryId (optional)
- autoAdjustRatios (boolean, default: true)
- ratioAdjustmentDay (int, default: 1, range: 1-31)
- proportionalAccounts (array of account IDs)
- createdAt, updatedAt
```

### SharingRatioHistory Table
```
- householdId
- accountId (nullable)
- year, month
- ratios (JSON: userId -> percentage)
- incomes (JSON: userId -> amount)
- totalIncome (decimal)
- appliedAt, appliedBy
- calculatedAt
```

## Cron Job Details

### Sharing Ratio Adjustment Job
- **Execution**: Daily (checks at each request to /health)
- **Logic**: 
  1. Find all households with `autoAdjustRatios: true`
  2. Check if today matches `ratioAdjustmentDay`
  3. If yes: Calculate ratios for previous month based on income
  4. Apply ratios to configured proportional accounts
  5. Record history with "SYSTEM" as appliedBy

## Testing Checklist

After deployment:

1. **Database Migration**
   - [ ] Migration completes successfully
   - [ ] No PostgreSQL errors
   - [ ] New tables visible in database

2. **Backend Build**
   - [ ] `npm run build` completes with no errors
   - [ ] `dist/` directory created
   - [ ] All .js files compiled from .ts sources

3. **Server Startup**
   - [ ] Server starts without errors
   - [ ] Health check works: `curl http://localhost:3000/health`
   - [ ] Both cron jobs logged as started
   - [ ] Database connection established

4. **Authentication**
   - [ ] Existing auth endpoints still work
   - [ ] Token validation working

5. **Admin Features (Frontend)**
   - [ ] Open HouseholdDetails for a multi-member household
   - [ ] See SecurityIcon button for members (if user is ADMIN)
   - [ ] Click promote -> member role changes to ADMIN
   - [ ] SecurityIcon hidden, KeyOffIcon appears
   - [ ] Click demote -> role changes back to MEMBER
   - [ ] Cannot demote if only 1 ADMIN remains (error message)
   - [ ] Cannot promote/demote if user is not ADMIN

6. **Income Analysis** (if frontend UI implemented)
   - [ ] GET /api/households/:id/income-analysis returns member data with incomes and ratios
   - [ ] Query params: year and month (required)

7. **Sharing Configuration** (if frontend UI implemented)
   - [ ] Get and update configuration
   - [ ] Proportion accounts list saved correctly
   - [ ] Auto-adjust day saved (1-31)

8. **Manual Ratio Application**
   - [ ] POST /api/households/:id/apply-sharing-ratios with year/month
   - [ ] Ratios applied to configured accounts
   - [ ] History recorded with user ID as appliedBy

## Troubleshooting

### Build Errors
If you see TypeScript errors:
1. Verify all files are in correct locations (see "Files Changed/Created" above)
2. Check for syntax errors in modified files
3. All fixes from previous session should be applied (see error fixes in summary)

### Migration Errors
If Prisma migration fails:
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify database credentials in `.env`
3. Check disk space: `df -h`

### Cron Job Not Starting
If sharing ratio job doesn't log:
1. Check that adjustSharingRatioJob is imported in index.ts
2. Verify function is called in app.listen() callback
3. Check server logs for errors

## Important Notes

- The sharing ratio cron job runs continuously, checking daily against `config.ratioAdjustmentDay`
- Ratios calculate based on CREDIT transactions in specified salary category for the PREVIOUS month
- If no salary transactions found, equal shares are applied (50/50 for 2 members, etc.)
- Frontend UI for income analysis and sharing configuration NOT yet implemented (backend ready)
- All admin operations are properly permission-checked (requires ADMIN role in household)

## Rollback Plan

If something breaks:
1. Stop server: `Ctrl+C` or `sudo systemctl restart finances-backend`
2. Revert database: `npx prisma migrate resolve --rolled-back add_household_configuration_and_sharing_ratio_history`
3. Revert code changes: `git checkout HEAD~1` (or specific commit)

---

Next Phase: Phase 7.3 - Frontend UI for Income Analysis and Sharing Configuration pages
