# Phase 6B - Analytics Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests in PHASE6B_TESTING.md have passed
- [ ] No console errors in frontend
- [ ] No errors in backend logs
- [ ] Code is committed to git
- [ ] Working tree is clean: `git status`
- [ ] Latest changes are pushed to main branch

---

## Deployment Steps

### Step 1: Backend Deployment

#### 1.1 SSH into Raspberry Pi
```bash
ssh pi@moneypi.local
# or
ssh pi@192.168.x.x
```

#### 1.2 Navigate to backend directory
```bash
cd /path/to/backend
# or typically
cd ~/finances/backend
```

#### 1.3 Pull latest code
```bash
git pull origin main
```

**Expected output**:
```
From github.com:...
   d4a7b2c  v0.6.1h
 + 521821c  Phase 6B: Implement frontend analytics pages...
 * branch      main     -> FETCH_HEAD
Updating d4a7b2c..521821c
Fast-forward
 backend/src/controllers/analyticsController.ts    | 450 +++++++++++++++++++++
 backend/src/routes/analyticsRoutes.ts             |  45 +++
 backend/src/services/analyticsService.ts          | 400 +++++++++++++++++++
 backend/src/services/projectionService.ts         | 250 ++++++++++++
 backend/src/services/reportService.ts             | 200 ++++++++++
 backend/prisma/schema.prisma                      |  80 ++++
 backend/prisma/migrations/2_add_analytics_models/ | 120 ++++++
 7 files changed, 1545 insertions(+)
```

#### 1.4 Apply database migration
```bash
cd backend
npx prisma migrate deploy
```

**Expected output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "finances_db", schema "public" at localhost:5432

1 migration found in prisma/migrations

Applying migration `20241107_add_analytics_models`

Migration applied successfully.
```

**Troubleshooting**:
- If migration fails, check database connection in .env
- If tables already exist, run: `npx prisma migrate resolve --applied 2_add_analytics_models`
- If database is disconnected: `psql finances_db -c "SELECT version();"`

#### 1.5 Verify database schema
```bash
psql finances_db -c "\dt analytics_snapshots analytics_details export_logs"
```

**Expected output**:
```
                      List of relations
 Schema |            Name             | Type  | Owner
--------+-----------------------------+-------+-------
 public | analytics_details           | table | postgres
 public | analytics_snapshots         | table | postgres
 public | export_logs                 | table | postgres
(3 rows)
```

#### 1.6 Regenerate Prisma Client
```bash
npx prisma generate
```

**Expected output**:
```
Environment variables loaded from .env

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 218ms
```

#### 1.7 Restart backend service
```bash
# If using PM2
pm2 restart finances-backend

# If using systemd
sudo systemctl restart finances-backend

# If running manually
# Stop the current process (Ctrl+C) and restart
npm start
```

#### 1.8 Verify backend is running
```bash
curl http://moneypi.local:3030/health
```

**Expected output**:
```json
{"status":"ok","timestamp":"2024-11-07T10:30:00.000Z"}
```

#### 1.9 Check backend logs for analytics endpoint registration
```bash
# Check PM2 logs
pm2 logs finances-backend | grep -i analytics

# Or check application startup logs
# Should see "Server is running on port 3030"
```

---

### Step 2: Frontend Deployment

#### 2.1 Navigate to frontend directory
```bash
cd /path/to/frontend
# or typically
cd ~/finances/frontend
```

#### 2.2 Pull latest code
```bash
git pull origin main
```

**Expected output**:
```
From github.com:...
   d4a7b2c  v0.6.1h
 + 521821c  Phase 6B: Implement frontend analytics pages...
Updating d4a7b2c..521821c
Fast-forward
 frontend/src/pages/Analytics.tsx                  | 250 ++++++++++++++++++
 frontend/src/pages/Reports.tsx                    | 200 +++++++++++++++
 frontend/src/services/analyticsService.ts         | 200 ++++++++++++++++
 frontend/src/store/slices/analyticsSlice.ts       | 220 ++++++++++++++++
 frontend/src/components/analytics/Charts/...      | 500 ++++++++++++++
 frontend/src/App.tsx                              | 12 +-
 6 files changed, 1382 insertions(+)
```

#### 2.3 Install dependencies (if any new packages)
```bash
npm install
# Check if Recharts is already installed
npm ls recharts
```

**Expected**: Recharts ^2.10.3 should be already installed

#### 2.4 Build frontend (if using build step)
```bash
npm run build
```

**Expected output**:
```
✓ 1234 modules transformed
 ✓ built in 45.32s
```

#### 2.5 Restart frontend service
```bash
# If using PM2
pm2 restart finances-frontend

# If using systemd
sudo systemctl restart finances-frontend

# If running dev server (hot reload automatic)
# Changes are automatically served
```

#### 2.6 Verify frontend is accessible
```bash
curl http://moneypi.local:5173
```

**Expected**: HTML response (development app)

---

### Step 3: Post-Deployment Verification

#### 3.1 Test Backend Connectivity
```bash
# Test Analytics endpoint
TOKEN="your_jwt_token"
HOUSEHOLD_ID="your_household_id"

curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/breakdown" \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

**Expected**: JSON response with status: "success"

#### 3.2 Test Frontend Access
1. Open browser to: `http://moneypi.local:5173`
2. Log in with test account
3. Select a household
4. Navigate to `/analytics`
5. **Expected**: Page loads without errors

#### 3.3 Check Console for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. **Expected**: No red errors

#### 3.4 Test Report Generation
1. Go to `/reports` page
2. Generate a CSV report
3. **Expected**: File downloads successfully

#### 3.5 Verify Database Tables Are Used
```bash
# Check if analytics_snapshots has data
psql finances_db -c "SELECT COUNT(*) FROM analytics_snapshots;"
```

If count is 0, generate a snapshot:
```bash
# Use curl to generate a snapshot
curl -X GET \
  "http://moneypi.local:3030/api/households/$HOUSEHOLD_ID/analytics/snapshot/2024-11" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rollback Procedure (If Needed)

### If Backend Deployment Fails

#### Rollback migration
```bash
npx prisma migrate resolve --rolled-back 2_add_analytics_models
```

#### Revert code
```bash
git revert 521821c
npm install
npx prisma generate
```

#### Restart
```bash
pm2 restart finances-backend
```

### If Frontend Deployment Fails

#### Revert code
```bash
git revert 521821c
npm install
npm run build
```

#### Restart
```bash
pm2 restart finances-frontend
```

---

## Monitoring After Deployment

### 1. Check Application Logs
```bash
# Backend logs
pm2 logs finances-backend | tail -100

# Frontend logs
pm2 logs finances-frontend | tail -100

# Or systemd logs
sudo journalctl -u finances-backend -n 100 -f
```

### 2. Monitor Database Performance
```bash
# Check slow queries
psql finances_db -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check table sizes
psql finances_db -c "\dt+ analytics_*"
```

### 3. Test Key User Flows
- [ ] Create a new transaction → Check Analytics updates
- [ ] Generate a report → Download and verify
- [ ] Switch households → Data changes correctly
- [ ] Create a budget → Suggestions appear

### 4. Monitor Server Resources
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU
top -bn1 | grep "Cpu(s)"
```

---

## Performance Optimization (Optional)

### 1. Add Database Indexes
Already included in migration, but verify:
```bash
psql finances_db -c "SELECT indexname FROM pg_indexes WHERE tablename LIKE 'analytics%';"
```

### 2. Pre-Generate Snapshots
Add a cron job to generate monthly snapshots:
```bash
# Add to crontab
0 1 1 * * curl -X GET "http://localhost:3030/api/households/*/analytics/snapshot/$(date +%Y-%m)" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Archive Old Data
If database grows large:
```bash
# Archive export_logs older than 1 year
psql finances_db -c "DELETE FROM export_logs WHERE created_at < NOW() - INTERVAL '1 year';"
```

---

## Health Check Commands

Run these commands periodically to ensure everything is working:

```bash
#!/bin/bash
# health_check.sh

echo "Checking Backend..."
curl -s http://moneypi.local:3030/health | jq .

echo "Checking Database..."
psql finances_db -c "SELECT 'Database OK'"

echo "Checking Analytics Tables..."
psql finances_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'analytics%';"

echo "Checking Frontend..."
curl -s http://moneypi.local:5173 | head -5

echo "All systems operational!"
```

Save and run:
```bash
chmod +x health_check.sh
./health_check.sh
```

---

## Deployment Timeline

**Estimated Total Time**: 10-15 minutes

- [ ] 2-3 min: Pull code on backend
- [ ] 3-5 min: Apply migrations
- [ ] 1-2 min: Restart backend
- [ ] 2-3 min: Pull code on frontend
- [ ] 1-2 min: Restart frontend
- [ ] 2-3 min: Verification and testing

---

## Post-Deployment Checklist

- [ ] Backend is running and logs show no errors
- [ ] Database migration applied successfully
- [ ] Frontend is accessible without errors
- [ ] Can navigate to `/analytics` page
- [ ] Can navigate to `/reports` page
- [ ] Analytics data loads correctly
- [ ] Report generation works
- [ ] All tests from PHASE6B_TESTING.md pass
- [ ] No new console errors
- [ ] Database tables exist and are being used
- [ ] Export history is being logged

---

## Troubleshooting Deployment

### Backend won't start
```bash
# Check Node.js version
node --version  # Should be 16+

# Check npm dependencies
npm install

# Check environment variables
cat .env | grep DATABASE_URL

# Check port 3030 is available
lsof -i :3030
```

### Database migration fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l | grep finances_db

# Check user permissions
psql -U postgres finances_db -c "SELECT version();"

# Check migration files exist
ls -la prisma/migrations/
```

### Frontend won't load Analytics page
```bash
# Check if route is registered
grep -n "analytics" src/App.tsx

# Check component imports
grep -n "Analytics" src/App.tsx

# Check store is working
# Open DevTools console and try:
# useAnalyticsStore((state) => state.categoryBreakdown)
```

### Charts not rendering
```bash
# Check Recharts is installed
npm ls recharts

# Check browser console for errors
# Look for "Recharts" error messages

# Try clearing cache
rm -rf node_modules/.vite
npm run build
```

---

## Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Run health checks: `./health_check.sh`
3. Check network: `ping moneypi.local`
4. Verify database: `psql finances_db -c "SELECT COUNT(*) FROM users;"`
5. Check git status: `git log --oneline | head -5`

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verification Completed**: _______________
**Status**: ☐ Success  ☐ Partial  ☐ Failed

**Notes**:
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

**Last Updated**: 2024-11-07
**Version**: 1.0
