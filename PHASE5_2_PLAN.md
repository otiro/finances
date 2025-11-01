# 📋 Phase 5.2 Plan - Frontend UI for Recurring Transactions

**Status**: 🎯 Ready to Start
**Phase**: 5.2 Frontend Implementation
**Duration**: 3-4 days estimated
**Date**: November 1, 2025

---

## 🎯 Overview

Phase 5.2 builds the **frontend UI** for managing recurring transactions. Users will be able to create, view, edit, pause, and delete recurring patterns through an intuitive interface.

**Backend Status**: ✅ Phase 5.1 complete and tested
**Frontend Status**: ⏳ Phase 5.2 starting now

---

## 📊 Architecture Overview

```
Frontend Components
├── Pages
│   └── RecurringTransactionsPage
│       ├── RecurringPatternsList
│       ├── AddRecurringPatternButton
│       └── RecurringTransactionLog
├── Dialogs/Modals
│   ├── AddRecurringPatternDialog
│   ├── EditRecurringPatternDialog
│   ├── DeleteConfirmDialog
│   └── ViewGenerationLogsModal
├── Components
│   ├── RecurringPatternCard
│   ├── RecurringPatternForm
│   ├── FrequencySelector
│   └── GenerationLogsTable
└── Store
    └── recurringTransactionSlice (Redux)
```

---

## 🏗️ Frontend Structure

### Location
```
frontend/src/
├── pages/
│   └── RecurringTransactions.tsx          [NEW]
├── components/
│   ├── RecurringPatterns/                 [NEW]
│   │   ├── RecurringPatternsList.tsx
│   │   ├── RecurringPatternCard.tsx
│   │   ├── RecurringPatternForm.tsx
│   │   ├── FrequencySelector.tsx
│   │   ├── DayOfMonthPicker.tsx
│   │   └── DayOfWeekPicker.tsx
│   ├── Dialogs/                           [EXISTING]
│   │   ├── AddRecurringPatternDialog.tsx  [NEW]
│   │   ├── EditRecurringPatternDialog.tsx [NEW]
│   │   └── GenerationLogsModal.tsx        [NEW]
│   └── ...
├── store/
│   └── slices/
│       └── recurringTransactionSlice.ts   [NEW]
├── services/
│   └── recurringTransaction.service.ts    [EXISTING - already created]
└── ...
```

---

## 🔧 Implementation Plan

### **Day 1: Setup & Form Component**

#### Tasks:
1. **Create RecurringTransactionsPage**
   - Layout page structure
   - Navigation integration
   - Breadcrumbs

2. **Create RecurringPatternForm**
   - Form fields:
     - Name (text input)
     - Description (textarea)
     - Frequency selector (dropdown)
     - Type (DEBIT/CREDIT radio)
     - Amount (number input)
     - Category selector (dropdown)
     - Start Date (date picker)
     - End Date (optional date picker)
     - Day of Month (conditional, for MONTHLY)
     - Day of Week (conditional, for WEEKLY)
   - Form validation with Zod
   - Error display
   - Submit handler

3. **Create FrequencySelector**
   - Radio/Select component
   - Shows conditional fields based on selection
   - Options: DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY

4. **Create AddRecurringPatternDialog**
   - Modal/Dialog wrapper
   - Uses RecurringPatternForm
   - Account selector
   - API call to create pattern
   - Success/error feedback

**Deliverable**: Working form to create recurring patterns ✅

---

### **Day 2: List & Card Components**

#### Tasks:
1. **Create RecurringPatternCard**
   - Display pattern details:
     - Name
     - Frequency
     - Amount
     - Type (DEBIT/CREDIT)
     - Next generation date
     - Last generated date
     - Status (Active/Paused)
   - Action buttons:
     - Edit
     - Pause/Resume
     - View Logs
     - Delete
   - Visual indicators (colors for DEBIT/CREDIT)

2. **Create RecurringPatternsList**
   - List of all household patterns
   - Filter options:
     - Active only
     - By account
     - By frequency
   - Sorting:
     - By name
     - By next generation date
     - By amount
   - Loading states
   - Empty state message
   - Pagination (if many patterns)

3. **Integrate with Redux Store**
   - Create `recurringTransactionSlice`
   - Actions:
     - setPatterns
     - addPattern
     - updatePattern
     - deletePattern
     - setLoading
     - setError
   - Selectors:
     - selectPatterns
     - selectActivePatterns
     - selectLoading
     - selectError

4. **Create RecurringTransactionsPage**
   - Fetch patterns on mount
   - Display list
   - Add pattern button
   - Refresh button

**Deliverable**: Display all recurring patterns ✅

---

### **Day 3: Edit & Delete Operations**

#### Tasks:
1. **Create EditRecurringPatternDialog**
   - Pre-populate form with pattern data
   - Allow editing all fields
   - API call to update pattern
   - Success/error feedback

2. **Create DeleteConfirmDialog**
   - Confirm pattern deletion
   - Show pattern name
   - API call to delete
   - Remove from list on success

3. **Add Pause/Resume Buttons**
   - Toggle isPaused state
   - Update card UI
   - API call
   - Confirmation optional

4. **Action Handlers**
   - Edit pattern → open EditDialog
   - Delete pattern → open DeleteConfirm
   - Pause/Resume → API call
   - View Logs → open LogsModal

**Deliverable**: Full CRUD operations working ✅

---

### **Day 4: Logs & Polish**

#### Tasks:
1. **Create GenerationLogsModal**
   - Display log history
   - Table columns:
     - Generated Date
     - Status (SUCCESS/FAILED/SKIPPED)
     - Transaction ID (if successful)
     - Error Message (if failed)
   - Sorting by date
   - Pagination
   - Download/Export (optional)

2. **Create GenerationLogsTable**
   - Reusable table component
   - Status badges (green/red/yellow)
   - Timestamps formatted
   - Copy transaction ID button

3. **Error Handling**
   - API error messages
   - User-friendly alerts
   - Retry buttons where applicable
   - Loading states

4. **Styling & Polish**
   - Consistent with existing UI
   - Responsive design
   - Mobile-friendly
   - Dark mode support (if applicable)
   - Animations (smooth transitions)

5. **Testing**
   - Manual QA
   - Edge cases
   - Form validation
   - API integration

**Deliverable**: Polished, complete UI ✅

---

## 📋 Component Checklist

### Pages
- [ ] RecurringTransactionsPage

### Dialogs/Modals
- [ ] AddRecurringPatternDialog
- [ ] EditRecurringPatternDialog
- [ ] DeleteConfirmDialog
- [ ] GenerationLogsModal

### Components
- [ ] RecurringPatternsList
- [ ] RecurringPatternCard
- [ ] RecurringPatternForm
- [ ] FrequencySelector
- [ ] DayOfMonthPicker (conditional)
- [ ] DayOfWeekPicker (conditional)
- [ ] GenerationLogsTable

### Store
- [ ] recurringTransactionSlice (Redux)

### Services
- [x] recurringTransaction.service.ts (already exists)

---

## 🎨 UI/UX Guidelines

### Colors & Indicators
```
DEBIT   → Red/Negative color    (expense)
CREDIT  → Green/Positive color  (income)

Status:
ACTIVE   → Green badge
PAUSED   → Yellow badge
INACTIVE → Gray badge

Generation:
SUCCESS  → Green
FAILED   → Red
SKIPPED  → Gray
```

### Layout
- **List View**: Card-based grid
- **Form**: Modal dialog with validation
- **Logs**: Modal with scrollable table
- **Responsive**: Mobile-first design

### Forms
- Client-side validation with Zod
- Error messages below fields
- Submit button disabled during submission
- Success toast notification
- Auto-close on success, keep on error

---

## 🔄 User Flows

### Create Pattern
1. User clicks "Add Recurring Pattern"
2. Dialog opens with empty form
3. User fills form
4. Selects account, frequency, amount, etc.
5. Clicks "Create"
6. API call to backend
7. Pattern added to list
8. Success notification
9. Dialog closes

### Edit Pattern
1. User clicks "Edit" on card
2. EditDialog opens
3. Form pre-populated with data
4. User modifies fields
5. Clicks "Update"
6. API call
7. List updated
8. Success notification

### Delete Pattern
1. User clicks "Delete" on card
2. ConfirmDialog opens
3. User confirms deletion
4. API call
5. Pattern removed from list
6. Success notification

### Pause Pattern
1. User clicks "Pause" button
2. Pattern state changes
3. API call to update isPaused
4. Card shows paused badge
5. Success notification

### View Logs
1. User clicks "View Logs" on card
2. LogsModal opens
3. Shows generation history
4. Can see successes/failures
5. Click close to dismiss

---

## 🔌 API Integration Points

All endpoints use `recurringTransaction.service.ts`:

```typescript
// Service functions already created:
createRecurringPattern(householdId, data)
getHouseholdRecurringPatterns(householdId, onlyActive)
getRecurringPattern(householdId, patternId)
updateRecurringPattern(householdId, patternId, data)
deleteRecurringPattern(householdId, patternId)
pauseRecurringPattern(householdId, patternId)
resumeRecurringPattern(householdId, patternId)
getGenerationLogs(householdId, patternId, limit)
```

---

## 🧪 Testing Strategy

### Manual Testing
1. Create pattern with all frequencies
2. Edit pattern (change name, amount, dates)
3. Delete pattern
4. Pause and resume patterns
5. View generation logs
6. Form validation errors
7. API error handling
8. Empty states
9. Loading states
10. Mobile responsiveness

### Edge Cases
1. Month-end dates (31st Jan → 28th Feb)
2. Leap years
3. Timezone handling
4. Very long pattern names
5. Large amounts
6. No patterns in household
7. Network errors during API calls
8. Concurrent edits

---

## 📦 Dependencies (Already Installed)

- React (frontend framework)
- Redux Toolkit (state management)
- React Query (data fetching - optional)
- Material-UI or Ant Design (UI components)
- React Hook Form (form handling)
- Zod (validation)
- Axios (HTTP client)

---

## 🎯 Success Criteria

✅ All CRUD operations work
✅ Form validation works
✅ API calls succeed
✅ Error handling works
✅ Logs display correctly
✅ Responsive design
✅ No TypeScript errors
✅ Smooth animations
✅ Accessible (WCAG)
✅ Works on mobile

---

## 📊 Metrics to Track

- Time to create pattern
- Time to edit pattern
- API response times
- Form validation accuracy
- Error rate
- User satisfaction (if applicable)

---

## 🚀 Rollout Plan

1. **Local Development**
   - Build components locally
   - Test in dev environment
   - Integration testing

2. **Testing on Raspberry Pi**
   - Deploy frontend to Raspberry Pi
   - Test with real Raspberry Pi backend
   - Full end-to-end testing

3. **User Acceptance Testing (UAT)**
   - If applicable, have users test
   - Gather feedback
   - Make adjustments

4. **Production Deployment**
   - Push to production
   - Monitor for errors
   - Support users

---

## 📝 Notes

### Important Considerations
- **Timezone**: Cron job uses UTC, display local time to user
- **Validation**: Server-side validation already exists, frontend mirrors it
- **Offline**: Form can be filled offline, submits when online
- **Race Conditions**: Handle updates from cron job in real-time
- **Security**: All API calls authenticated with JWT

### Future Enhancements (Phase 5.3+)
- Webhooks for instant updates
- Pattern templates (common patterns)
- Recurring pattern groups
- Bulk operations
- Export/Import patterns
- Pattern analytics/statistics
- Notifications when patterns generate
- Calendar view of upcoming generations

---

## 🔗 Related Documents

- [PHASE5_1_COMPLETE.md](./PHASE5_1_COMPLETE.md) - Backend implementation
- [TESTING_PHASE5_1.md](./TESTING_PHASE5_1.md) - API testing guide
- [PHASE5_PLAN.md](./PHASE5_PLAN.md) - Overall Phase 5 plan

---

## 📞 Backend API Reference

See [recurringTransaction.service.ts](./frontend/src/services/recurringTransaction.service.ts) for all available functions.

All endpoints require:
- Valid JWT token in `Authorization` header
- User must be member of household
- Account must belong to household

---

## ✨ Ready to Build!

**Phase 5.2 frontend is ready to start!**

Frontend service and types are already created. Time to build the UI components!

---

**Plan Created**: November 1, 2025
**Version**: v0.5.0
**Status**: 🟢 Ready to Start Development

🤖 Generated with Claude Code
