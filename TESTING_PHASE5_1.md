# 🧪 Phase 5.1 Testing Guide - Recurring Transactions

**Date**: November 1, 2025
**Version**: v0.5.0
**Status**: Ready for Testing

---

## 📋 Test Plan Overview

This document provides comprehensive testing procedures for Phase 5.1 (Recurring Transactions) implementation.

**Testing Scope**:
- Backend API endpoints
- Service layer logic
- Database operations
- Cron job execution
- Error handling
- Edge cases

---

## 🔐 Prerequisites

### Required
- [ ] Backend server running: `npm run dev`
- [ ] PostgreSQL database running
- [ ] Prisma migration applied: `npx prisma migrate deploy`
- [ ] Valid JWT token for authentication
- [ ] Postman or curl installed
- [ ] Household with accounts already created

### Get Required IDs

```bash
# Get your households
curl -X GET http://localhost:3000/api/households \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get accounts for a household
curl -X GET http://localhost:3000/api/households/{householdId}/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Save these IDs for use in tests below:
- `HOUSEHOLD_ID` = ...
- `ACCOUNT_ID` = ...
- `JWT_TOKEN` = ...

---

## 🧪 Test Cases

### Test 1: Create Recurring Pattern - Basic

**Endpoint**: `POST /api/households/{householdId}/recurring-patterns`

**Request**:
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Monthly Rent",
    "description": "Apartment rent payment",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": 1000,
    "startDate": "2025-11-01T00:00:00Z",
    "dayOfMonth": 1
  }'
```

**Expected Response**: `201 Created`
```json
{
  "status": "success",
  "message": "Motif récurrent créé avec succès",
  "data": {
    "id": "pattern-id-uuid",
    "householdId": "HOUSEHOLD_ID",
    "accountId": "ACCOUNT_ID",
    "name": "Monthly Rent",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": 1000,
    "startDate": "2025-11-01T00:00:00Z",
    "dayOfMonth": 1,
    "isActive": true,
    "isPaused": false,
    "nextGenerationDate": "2025-12-01T00:00:00Z",
    "createdAt": "2025-11-01T...",
    "updatedAt": "2025-11-01T..."
  }
}
```

**Verification**:
- [ ] Status is 201
- [ ] Pattern ID is UUID
- [ ] nextGenerationDate is calculated correctly (Dec 1st)
- [ ] isActive is true
- [ ] isPaused is false

**Save Pattern ID**: `PATTERN_ID_1` = ...

---

### Test 2: Create Recurring Pattern - With Category

**Endpoint**: `POST /api/households/{householdId}/recurring-patterns`

**Request**:
```bash
# First get a category ID
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer JWT_TOKEN"

# Then create pattern with category
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Electricity Bill",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": 150,
    "categoryId": "CATEGORY_ID",
    "startDate": "2025-11-15T00:00:00Z",
    "dayOfMonth": 15
  }'
```

**Expected Response**: `201 Created` with category included

**Verification**:
- [ ] Pattern created with categoryId
- [ ] Category object included in response

---

### Test 3: Create Pattern - Different Frequencies

Test each frequency type:

#### 3a. DAILY
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Daily Expense",
    "frequency": "DAILY",
    "type": "DEBIT",
    "amount": 10,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Verify**: nextGenerationDate is tomorrow (Nov 2nd)

#### 3b. WEEKLY
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Weekly Check-in",
    "frequency": "WEEKLY",
    "type": "CREDIT",
    "amount": 500,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Verify**: nextGenerationDate is 7 days later (Nov 8th)

#### 3c. BIWEEKLY
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Biweekly Salary",
    "frequency": "BIWEEKLY",
    "type": "CREDIT",
    "amount": 2000,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Verify**: nextGenerationDate is 14 days later (Nov 15th)

#### 3d. QUARTERLY
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Quarterly Insurance",
    "frequency": "QUARTERLY",
    "type": "DEBIT",
    "amount": 300,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Verify**: nextGenerationDate is 3 months later (Feb 1st)

#### 3e. YEARLY
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Annual Subscription",
    "frequency": "YEARLY",
    "type": "DEBIT",
    "amount": 99,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Verify**: nextGenerationDate is 1 year later (Nov 1, 2026)

---

### Test 4: Get Household Recurring Patterns

**Endpoint**: `GET /api/households/{householdId}/recurring-patterns`

**Request**:
```bash
curl -X GET http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Expected Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Motifs récurrents récupérés avec succès",
  "data": [
    { /* pattern 1 */ },
    { /* pattern 2 */ }
  ]
}
```

**Verification**:
- [ ] Returns array of patterns
- [ ] All patterns belong to household
- [ ] Contains all previously created patterns

---

### Test 5: Get Household Patterns - Filter Active Only

**Request**:
```bash
curl -X GET "http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns?onlyActive=true" \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Verification**:
- [ ] Returns only patterns with isActive=true and isPaused=false

---

### Test 6: Get Single Recurring Pattern

**Endpoint**: `GET /api/households/{householdId}/recurring-patterns/{patternId}`

**Request**:
```bash
curl -X GET http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1 \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Expected Response**: `200 OK` with full pattern details

**Verification**:
- [ ] Pattern ID matches
- [ ] Includes account and category objects
- [ ] Includes generationLogs array

---

### Test 7: Update Recurring Pattern

**Endpoint**: `PATCH /api/households/{householdId}/recurring-patterns/{patternId}`

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1 \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Rent - Updated",
    "amount": 1100,
    "description": "Updated rent payment"
  }'
```

**Expected Response**: `200 OK` with updated pattern

**Verification**:
- [ ] Name is updated
- [ ] Amount is updated to 1100
- [ ] Description is updated
- [ ] Other fields unchanged

---

### Test 8: Update Pattern - Add End Date

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1 \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endDate": "2026-11-01T00:00:00Z"
  }'
```

**Verification**:
- [ ] endDate is set
- [ ] Pattern no longer generates after this date

---

### Test 9: Pause Recurring Pattern

**Endpoint**: `PATCH /api/households/{householdId}/recurring-patterns/{patternId}/pause`

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1/pause \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isPaused": true
  }'
```

**Expected Response**: `200 OK`

**Verification**:
- [ ] isPaused is true
- [ ] Pattern does not generate while paused

---

### Test 10: Resume Recurring Pattern

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1/pause \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isPaused": false
  }'
```

**Verification**:
- [ ] isPaused is false
- [ ] Pattern resumes generation

---

### Test 11: Get Generation Logs

**Endpoint**: `GET /api/households/{householdId}/recurring-patterns/{patternId}/logs`

**Request**:
```bash
curl -X GET "http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1/logs?limit=10" \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Expected Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Historique de génération récupéré avec succès",
  "data": [
    {
      "id": "log-id",
      "recurringPatternId": "PATTERN_ID_1",
      "generatedTransactionId": "trans-id",
      "generatedDate": "2025-11-02T00:00:00Z",
      "status": "SUCCESS",
      "createdAt": "2025-11-02T00:00:05Z"
    }
  ]
}
```

**Verification**:
- [ ] Returns array of logs
- [ ] Logs contain status, date, transaction ID
- [ ] Most recent first

---

### Test 12: Delete Recurring Pattern

**Endpoint**: `DELETE /api/households/{householdId}/recurring-patterns/{patternId}`

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns/PATTERN_ID_1 \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Expected Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Motif récurrent supprimé avec succès",
  "data": {
    "message": "Motif récurrent supprimé avec succès"
  }
}
```

**Verification**:
- [ ] Status is 200
- [ ] Pattern is deleted from database
- [ ] Cannot retrieve pattern after deletion

---

### Test 13: Validation - Invalid Frequency

**Request**:
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Test",
    "frequency": "INVALID_FREQUENCY",
    "type": "DEBIT",
    "amount": 100,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Expected Response**: `400 Bad Request`

**Verification**:
- [ ] Returns validation error
- [ ] Pattern not created

---

### Test 14: Validation - Negative Amount

**Request**:
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Test",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": -100,
    "startDate": "2025-11-01T00:00:00Z"
  }'
```

**Expected Response**: `400 Bad Request`

**Verification**:
- [ ] Returns validation error
- [ ] Amount must be positive

---

### Test 15: Validation - Invalid Date

**Request**:
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Test",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": 100,
    "startDate": "invalid-date"
  }'
```

**Expected Response**: `400 Bad Request`

---

### Test 16: Security - Missing Auth Token

**Request**:
```bash
curl -X GET http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns
```

**Expected Response**: `401 Unauthorized`

**Verification**:
- [ ] Endpoint requires authentication
- [ ] No access without JWT token

---

### Test 17: Security - Invalid JWT Token

**Request**:
```bash
curl -X GET http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response**: `401 Unauthorized`

---

### Test 18: Security - Different Household Access

**Setup**: Create pattern in HOUSEHOLD_A, try to access from HOUSEHOLD_B user

**Request**:
```bash
curl -X GET http://localhost:3000/api/households/HOUSEHOLD_A/recurring-patterns/PATTERN_ID \
  -H "Authorization: Bearer TOKEN_FROM_HOUSEHOLD_B"
```

**Expected Response**: `403 Forbidden`

**Verification**:
- [ ] Users cannot access patterns from other households

---

### Test 19: Edge Case - Month-End Date (31st)

**Request**:
```bash
curl -X POST http://localhost:3000/api/households/HOUSEHOLD_ID/recurring-patterns \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "End of Month Bill",
    "frequency": "MONTHLY",
    "type": "DEBIT",
    "amount": 500,
    "startDate": "2025-01-31T00:00:00Z",
    "dayOfMonth": 31
  }'
```

**Expected Behavior**:
- Jan 31 → Feb 28 (not 31)
- Feb 28 → Mar 31
- Mar 31 → Apr 30 (not 31)

**Verification**:
- [ ] Algorithm handles month-end correctly
- [ ] No invalid dates generated

---

### Test 20: Cron Job Execution

**Manual Test**:
```bash
# Trigger generation manually
curl -X POST http://localhost:3000/api/recurring-patterns/generate \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Expected Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Transactions récurrentes générées",
  "data": {
    "count": 5,
    "results": [
      { "patternId": "...", "status": "success", "transactionId": "..." },
      { "patternId": "...", "status": "success", "transactionId": "..." }
    ]
  }
}
```

**Verification**:
- [ ] Manual trigger works
- [ ] Returns transaction IDs
- [ ] Can check transactions created

---

### Test 21: Verify Transactions Created

**After running Test 20, verify transactions exist**:

```bash
curl -X GET http://localhost:3000/api/accounts/ACCOUNT_ID/transactions \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Verification**:
- [ ] New transactions appear in list
- [ ] Amount matches pattern
- [ ] Type matches pattern
- [ ] Description matches pattern
- [ ] isRecurring is true
- [ ] recurringPatternId is set

---

### Test 22: Cron Job Logs

**Check server logs**:
```bash
# From terminal running server
# Should see lines like:
# [Cron Job] Starting recurring transaction generation...
# [Cron Job] Recurring transaction generation completed
#   - Success: 2
#   - Failed: 0
#   - Total: 2
```

**Verification**:
- [ ] Cron job logs appear at expected time
- [ ] Success/failure counts are correct

---

### Test 23: Database Integrity

**Connect to PostgreSQL**:
```bash
psql -U user finances_db
```

**Check tables exist**:
```sql
\dt recurring*
-- Should show:
-- recurring_patterns
-- recurring_transaction_logs
```

**Check data**:
```sql
SELECT id, name, frequency, next_generation_date FROM recurring_patterns LIMIT 5;
SELECT * FROM recurring_transaction_logs WHERE status = 'SUCCESS' LIMIT 5;
```

**Verification**:
- [ ] Tables exist with correct structure
- [ ] Data is persisted correctly
- [ ] Relationships are intact

---

## 📊 Test Results Summary

Create a test results table:

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1 | Create pattern - Basic | ✅/❌ | |
| 2 | Create pattern - With category | ✅/❌ | |
| 3a | Frequency - DAILY | ✅/❌ | |
| 3b | Frequency - WEEKLY | ✅/❌ | |
| 3c | Frequency - BIWEEKLY | ✅/❌ | |
| 3d | Frequency - QUARTERLY | ✅/❌ | |
| 3e | Frequency - YEARLY | ✅/❌ | |
| 4 | Get household patterns | ✅/❌ | |
| 5 | Filter active only | ✅/❌ | |
| 6 | Get single pattern | ✅/❌ | |
| 7 | Update pattern | ✅/❌ | |
| 8 | Update - Add end date | ✅/❌ | |
| 9 | Pause pattern | ✅/❌ | |
| 10 | Resume pattern | ✅/❌ | |
| 11 | Get logs | ✅/❌ | |
| 12 | Delete pattern | ✅/❌ | |
| 13 | Validation - Invalid freq | ✅/❌ | |
| 14 | Validation - Negative amt | ✅/❌ | |
| 15 | Validation - Invalid date | ✅/❌ | |
| 16 | Security - No auth | ✅/❌ | |
| 17 | Security - Bad token | ✅/❌ | |
| 18 | Security - Wrong household | ✅/❌ | |
| 19 | Edge case - Month-end | ✅/❌ | |
| 20 | Cron - Manual trigger | ✅/❌ | |
| 21 | Verify transactions created | ✅/❌ | |
| 22 | Cron - Check logs | ✅/❌ | |
| 23 | Database integrity | ✅/❌ | |

---

## 🐛 Known Issues / TODO

- [ ] Add admin-only protection to `/api/recurring-patterns/generate`
- [ ] Add rate limiting to prevent abuse
- [ ] Add transaction rollback on partial failure
- [ ] Add webhook notifications when patterns execute
- [ ] Add pattern templates for common cases

---

## 📝 Notes

### Common Issues

**Issue**: Cron job not executing
- Check server is running
- Check for errors in logs
- Verify database connection

**Issue**: Transactions not generating
- Check pattern isActive is true
- Check pattern isPaused is false
- Check nextGenerationDate <= today
- Check account has owners

**Issue**: Wrong timezone
- Cron job uses UTC (00:00 UTC)
- Adjust if needed in `src/jobs/recurringTransactionJob.ts`

---

## ✅ Sign-Off

**Testing Completed**: __________ (Date)
**Tester**: __________________
**All Tests Passed**: ✅/❌
**Issues Found**: _____ (Count)

---

**Testing Guide for Phase 5.1**
**Created**: November 1, 2025
**Backend Version**: v0.5.0
