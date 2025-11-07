# Phase 7 Testing Guides Index

Complete reference for all testing documentation.

---

## 🎯 Start Here

**If you just landed here:** Read [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md) first (5 min)

---

## 📚 All Guides

### 1. PHASE7_TESTING_SUMMARY.md
**Quick Overview & Decisions**
- 3 methods of testing explained
- 5-minute quick start
- Complete checklist
- Troubleshooting

**Read if:** You want quick overview before deciding how to test

**Time:** 5-10 minutes

---

### 2. PHASE7_TEST_METHODS_COMPARISON.md
**Compare All 3 Methods**
- Postman vs Bash vs Full Guide
- Pros & cons of each
- When to use which
- Recommended workflows

**Read if:** You want to choose the best testing method for you

**Time:** 3-5 minutes

---

### 3. PHASE7_POSTMAN_COLLECTION.md
**Ready-to-Use Postman Requests**
- Setup variables (base_url, token, household_id)
- 5 complete requests formatted
- Expected responses
- Step-by-step workflow

**Use if:** You prefer visual/GUI testing

**Time:** 5-10 minutes to execute

---

### 4. test-proportional-sharing.sh
**Automated Bash Script**
- One command tests everything
- 6 endpoints tested
- Colorful formatted output
- Usage: `./test-proportional-sharing.sh "id" "token"`

**Use if:** You want fast automated testing

**Time:** 2-3 minutes to execute

---

### 5. PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md
**Deep Dive Guide**
- 3 testing methods detailed (API, Cron, Long-term)
- 5 important test cases
- Manual testing steps
- SQL verification queries
- Complete troubleshooting

**Read if:** You want to understand the system deeply

**Time:** 15-20 minutes to read + test

---

## 🗺️ Navigation Guide

### "I'm in a hurry"
1. Read: [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md) (5 min)
2. Run: `./test-proportional-sharing.sh "id" "token"` (3 min)
3. Done! (8 minutes total)

### "I want visual testing"
1. Read: [PHASE7_TEST_METHODS_COMPARISON.md](./PHASE7_TEST_METHODS_COMPARISON.md)
2. Use: [PHASE7_POSTMAN_COLLECTION.md](./PHASE7_POSTMAN_COLLECTION.md)
3. Execute 5 requests in Postman (10 minutes total)

### "I want to understand everything"
1. Read: [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md)
2. Read: [PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md](./PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md)
3. Test manually or with script (25 minutes total)

### "I want to be thorough"
1. Read: [PHASE7_TEST_METHODS_COMPARISON.md](./PHASE7_TEST_METHODS_COMPARISON.md)
2. Use Postman: [PHASE7_POSTMAN_COLLECTION.md](./PHASE7_POSTMAN_COLLECTION.md)
3. Run script: `./test-proportional-sharing.sh`
4. Read: [PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md](./PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md)
5. Verify in SQL (40 minutes total)

---

## 📊 What Each Guide Covers

| Guide | Postman | Bash | Manual | SQL | Cron | Deep Dive |
|-------|---------|------|--------|-----|------|-----------|
| TESTING_SUMMARY | ✅ | ✅ | - | - | - | - |
| COMPARISON | ✅ | ✅ | ✅ | - | - | - |
| POSTMAN_COLLECTION | ✅✅✅ | - | - | - | - | - |
| test-proportional-sharing.sh | - | ✅✅✅ | - | - | - | - |
| PROPORTIONAL_GUIDE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅✅✅ |

---

## 🎯 Specific Use Cases

### "How do I test with Postman?"
→ [PHASE7_POSTMAN_COLLECTION.md](./PHASE7_POSTMAN_COLLECTION.md)

### "How do I test with bash?"
→ [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md) (Method 2 section)
→ [test-proportional-sharing.sh](./test-proportional-sharing.sh)

### "How do I test the cron job?"
→ [PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md](./PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md) (Method 2 section)

### "How do I test with SQL?"
→ [PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md](./PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md) (Method 3 section)

### "What if something fails?"
→ [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md) (Troubleshooting)
→ [PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md](./PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md) (Troubleshooting)

### "Which test method should I use?"
→ [PHASE7_TEST_METHODS_COMPARISON.md](./PHASE7_TEST_METHODS_COMPARISON.md)

### "What endpoints are tested?"
→ All guides have endpoint lists
→ [PHASE7_IMPLEMENTATION_SUMMARY.md](./PHASE7_IMPLEMENTATION_SUMMARY.md) for technical details

---

## 📝 Quick Reference

### What Gets Tested

1. **Configuration**
   - GET /sharing-configuration
   - PATCH /sharing-configuration

2. **Income Analysis**
   - GET /income-analysis?year=2025&month=10

3. **Ratio Application**
   - POST /apply-sharing-ratios

4. **History**
   - GET /sharing-history?limit=24

5. **Cron Job**
   - Automatic daily execution
   - Testing by changing ratioAdjustmentDay

---

## 🚀 Quick Start Commands

```bash
# Fastest test (2-3 min)
chmod +x test-proportional-sharing.sh
./test-proportional-sharing.sh "household-id" "token"

# Get token
localStorage.getItem('token')

# Get household ID from URL
http://localhost:5173/households/{id}

# Verify in database
psql -h localhost -U postgres -d finances
SELECT * FROM "SharingRatioHistory" ORDER BY "createdAt" DESC;
```

---

## 📋 Checklist Before Testing

- [ ] Backend deployed on RPi
- [ ] Database migration applied
- [ ] Frontend recompiled
- [ ] Household created (2+ members)
- [ ] Shared account created
- [ ] Salary transactions added (October 2025)
- [ ] Token obtained (localStorage)
- [ ] Household ID noted

---

## ✅ Expected Results

After successful testing:

```
Revenues (October 2025):
  Member 1: €2000
  Member 2: €1500

Ratios (October 2025):
  Member 1: 57.14%
  Member 2: 42.86%

History Record:
  year: 2025
  month: 10
  ratios: {"user-1": 57.14, "user-2": 42.86}
  appliedBy: {user-id}
```

---

## 🔗 Related Documentation

**Deployment:**
- [PHASE7_QUICK_START.md](./PHASE7_QUICK_START.md)
- [PHASE7_DEPLOYMENT_CHECKLIST.md](./PHASE7_DEPLOYMENT_CHECKLIST.md)

**Implementation:**
- [PHASE7_IMPLEMENTATION_SUMMARY.md](./PHASE7_IMPLEMENTATION_SUMMARY.md)
- [PHASE7_FILES_REFERENCE.md](./PHASE7_FILES_REFERENCE.md)

**Planning:**
- [PHASE7_PLAN.md](./PHASE7_PLAN.md)

---

## 📞 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Token invalid | See TESTING_SUMMARY.md → Get token section |
| Ratios not applying | See TESTING_SUMMARY.md → Troubleshooting |
| No revenues calculated | See PROPORTIONAL_GUIDE.md → Troubleshooting |
| Cron job not running | See PROPORTIONAL_GUIDE.md → Cron Testing |
| Database migration failed | See DEPLOYMENT_CHECKLIST.md → Migration Errors |

---

## 🎓 Learning Path

1. **Day 1: Overview**
   - Read TESTING_SUMMARY.md
   - Understand the 3 methods

2. **Day 1: Quick Test**
   - Run bash script (2 min)
   OR
   - Use Postman (10 min)

3. **Day 2: Deep Learning**
   - Read PROPORTIONAL_GUIDE.md
   - Test all 5 cases
   - Verify in SQL

4. **Day 3: Cron Testing**
   - Test automatic execution
   - Modify ratioAdjustmentDay
   - Verify "SYSTEM" in history

5. **Next: Phase 7.3**
   - Build Income Analysis UI
   - Build Configuration UI
   - Create visualizations

---

## ✨ File Structure

```
Root/
├── TESTING_GUIDES_INDEX.md (this file)
├── PHASE7_TESTING_SUMMARY.md (START HERE)
├── PHASE7_TEST_METHODS_COMPARISON.md
├── PHASE7_POSTMAN_COLLECTION.md
├── PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md
├── test-proportional-sharing.sh
│
├── PHASE7_IMPLEMENTATION_SUMMARY.md
├── PHASE7_IMPLEMENTATION_SUMMARY.md
├── PHASE7_FILES_REFERENCE.md
├── PHASE7_QUICK_START.md
├── PHASE7_DEPLOYMENT_CHECKLIST.md
└── PHASE7_PLAN.md
```

---

## 🏁 Summary

**Total Documentation:** 11 files
**Total Time to Test:** 2-20 minutes (depending on method)
**Methods Available:** 3 (Postman, Bash Script, Manual Guide)
**Status:** ✅ Ready to test!

**START HERE:** [PHASE7_TESTING_SUMMARY.md](./PHASE7_TESTING_SUMMARY.md)

---

Last updated: 2025-11-07
Phase 7 Status: ✅ Implementation Complete, Testing Guides Complete
