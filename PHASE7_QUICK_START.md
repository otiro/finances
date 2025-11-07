# Phase 7 Quick Start - RPi Commands

## Copy & Paste Commands for RPi Deployment

### Step 1: SSH into RPi and Navigate to Backend
```bash
cd /home/pi/finances/backend
```

### Step 2: Pull Latest Code
```bash
git pull origin main
```

### Step 3: Run Database Migration
```bash
npx prisma migrate dev --name add_household_configuration_and_sharing_ratio_history
```
When prompted "Do you want to continue? (Y/n)" → Press **Y**

### Step 4: Install Dependencies (if needed)
```bash
npm install
```

### Step 5: Build Backend
```bash
npm run build
```

### Step 6: Test Build Output
```bash
ls -la dist/
```
Should show JavaScript files in `dist/` directory

### Step 7: Start Backend Server
```bash
npm run dev
```

You should see:
```
Server is running on port 3000
Starting background jobs...
Recurring transaction cron job started
Sharing ratio adjustment job started
```

### Step 8: Test Health Endpoint (in another terminal)
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-07T12:34:56.789Z"}
```

---

## Frontend Deployment (Optional)

### Navigate to Frontend
```bash
cd /home/pi/finances/frontend
```

### Pull Latest Code
```bash
git pull origin main
```

### Build Frontend
```bash
npm run build
```

### Restart Frontend Server
```bash
# If using systemd service
sudo systemctl restart finances-frontend

# Or if running manually
npm run preview
```

---

## Troubleshooting

### If Migration Fails

**Error: "Error: Inaccessible host: 'localhost'..."**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- If stopped, start it: `sudo systemctl start postgresql`

**Error: "P1017"**
- Database doesn't exist or credentials wrong
- Check `.env` DATABASE_URL is correct
- Verify PostgreSQL credentials

### If Build Fails

**Error: "TS7030: Not all code paths return a value"**
- All TypeScript errors should be fixed
- Verify you pulled the latest code: `git log --oneline -1`
- Should show commit: "Phase 7: Register adjustSharingRatiosJob..."

**Error: "Cannot find module..."**
- Run: `npm install`
- Try build again: `npm run build`

### If Server Won't Start

**Error: "EADDRINUSE: address already in use"**
- Port 3000 already in use
- Kill previous process: `lsof -i :3000` then `kill -9 <PID>`
- Or change port in `.env` PORT variable

**Error: Cron job not logging**
- Check that adjustSharingRatiosJob is imported in index.ts
- Verify it's called in app.listen() callback
- Check server logs for errors above the startup messages

---

## Verification Checklist

After starting server:
- [ ] Health endpoint responds
- [ ] No TypeScript errors in logs
- [ ] Both cron jobs logged as "started"
- [ ] Database connection successful
- [ ] No crashes in first 30 seconds

---

## Rolling Back (if needed)

### Stop Server
```bash
# If running in terminal
Ctrl+C

# If running as service
sudo systemctl stop finances-backend
```

### Revert Database
```bash
npx prisma migrate resolve --rolled-back add_household_configuration_and_sharing_ratio_history
```

### Revert Code
```bash
git checkout HEAD~1
npm install
npm run build
```

---

## What Was Changed

**3 New Files:**
- `backend/src/middleware/adminCheck.middleware.ts`
- `backend/src/services/incomeCalculation.service.ts`
- `backend/src/jobs/adjustSharingRatioJob.ts`

**7 Modified Files:**
- Database schema (2 new tables)
- index.ts (cron job registration)
- household.service.ts (+2 methods)
- household.controller.ts (+5 handlers)
- household.routes.ts (+6 routes)
- frontend files (promote/demote buttons)

**2 Documentation Files:**
- PHASE7_DEPLOYMENT_CHECKLIST.md
- PHASE7_IMPLEMENTATION_SUMMARY.md

---

## Database Schema Added

```sql
-- HouseholdConfiguration table
CREATE TABLE IF NOT EXISTS "HouseholdConfiguration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "householdId" TEXT NOT NULL UNIQUE,
  "salaryCategoryId" TEXT,
  "autoAdjustRatios" BOOLEAN NOT NULL DEFAULT true,
  "ratioAdjustmentDay" INTEGER NOT NULL DEFAULT 1,
  "proportionalAccounts" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("householdId") REFERENCES "Household"("id")
);

-- SharingRatioHistory table
CREATE TABLE IF NOT EXISTS "SharingRatioHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "householdId" TEXT NOT NULL,
  "accountId" TEXT,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "ratios" JSONB NOT NULL,
  "incomes" JSONB NOT NULL,
  "totalIncome" DECIMAL(12, 2) NOT NULL,
  "appliedAt" TIMESTAMP(3),
  "appliedBy" TEXT,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("householdId") REFERENCES "Household"("id"),
  FOREIGN KEY ("accountId") REFERENCES "Account"("id"),
  UNIQUE ("householdId", "accountId", "year", "month")
);
```

---

## New API Endpoints

All require Bearer token authentication.

### Admin Operations
- `POST /api/households/:id/members/:memberId/promote` - Promote to admin
- `POST /api/households/:id/members/:memberId/demote` - Demote from admin

### Income & Ratios
- `GET /api/households/:id/income-analysis?year=2025&month=11`
- `GET /api/households/:id/sharing-configuration`
- `PATCH /api/households/:id/sharing-configuration`
- `GET /api/households/:id/sharing-history?limit=24`
- `POST /api/households/:id/apply-sharing-ratios`

---

## Next Steps After Deployment

1. Test promote/demote buttons in frontend (HouseholdDetails page)
2. Add salary transactions for testing
3. Query income-analysis endpoint with year/month params
4. Configure a shared account for proportional sharing
5. Trigger manual ratio application or wait for automatic daily run

---

**Estimated Deployment Time: 5-10 minutes**
**Estimated Test Time: 10-15 minutes**

Good luck! 🚀
