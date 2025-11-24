# 🧪 Phase 5.2 Testing Guide - Frontend UI for Recurring Transactions

**Date**: November 1, 2025
**Version**: v0.5.0
**Status**: Ready for Testing

---

## 📋 Test Plan Overview

This document provides comprehensive testing procedures for Phase 5.2 (Frontend UI) implementation.

**Testing Scope**:
- UI components rendering
- Form validation
- User interactions
- API integration
- Navigation flows
- Responsive design
- Error handling
- Edge cases

---

## 🔐 Prerequisites

### Required
- [ ] Frontend server running: `npm run dev`
- [ ] Backend server running on port 3030
- [ ] Valid JWT token for authentication
- [ ] Household ID with at least one account
- [ ] Browser DevTools for debugging
- [ ] Mobile device or DevTools mobile emulation

### Get Required IDs

```bash
# Get your households
Navigate to: http://localhost:5173/households

# Copy:
- HOUSEHOLD_ID = ...
- ACCOUNT_ID = ...
- JWT_TOKEN = ... (from localStorage if applicable)
```

---

## 🧪 Component Tests

### Test 1: RecurringTransactionsPage - Load and Display

**URL**: `/households/{householdId}/recurring-transactions`

**Expected Result**:
- Page loads with title "Transactions Récurrentes"
- Subtitle: "Gérez vos transactions automatiques..."
- "Ajouter" button visible
- "Actualiser" button visible
- Empty state message if no patterns exist

**Steps**:
1. Navigate to the URL
2. Wait for page to load
3. Check all elements render correctly

**Verification**:
- [ ] Page title displays correctly
- [ ] Header has Add and Refresh buttons
- [ ] Page doesn't crash on load
- [ ] Loading spinner appears if data is loading

---

### Test 2: Empty State Display

**Condition**: Household has no recurring patterns

**Expected Result**:
- Empty state message: "Aucune transaction récurrente"
- Subtitle: "Créez une transaction récurrente..."
- "Créer ma première transaction" button visible
- No error message shown

**Steps**:
1. Navigate to page on household with no patterns
2. Wait for data to load
3. Check empty state displays

**Verification**:
- [ ] Empty state renders
- [ ] No error messages
- [ ] "Créer ma première transaction" button works

---

### Test 3: Add Recurring Pattern Button - Opens Dialog

**Action**: Click "Ajouter" button

**Expected Result**:
- Dialog opens with title "Créer une transaction récurrente"
- Form is visible with all fields
- Dialog has Cancel and Enregistrer buttons

**Steps**:
1. Click "Ajouter" button
2. Wait for dialog to open
3. Check form fields

**Verification**:
- [ ] Dialog opens smoothly
- [ ] All form fields are present
- [ ] Dialog is centered and visible
- [ ] Can close with Cancel button

---

### Test 4: Form Fields - Account Selection

**In Add Dialog**:

**Expected Result**:
- Account dropdown populated with accounts
- Can select different accounts
- Selected account persists

**Steps**:
1. Open Add dialog
2. Click Account dropdown
3. Select an account
4. Verify selection

**Verification**:
- [ ] Dropdown shows all accounts
- [ ] Can select account
- [ ] Selected account displays

---

### Test 5: Form Validation - Required Fields

**Action**: Submit empty form

**Expected Result**:
- Error message: "Veuillez sélectionner un compte" (Account)
- Error message: "Le nom est requis" (Name)
- Form does NOT submit
- Errors display in red below fields

**Steps**:
1. Open Add dialog
2. Leave Name field empty
3. Leave Account field empty
4. Click "Enregistrer"
5. Check error messages

**Verification**:
- [ ] Account error shows
- [ ] Name error shows
- [ ] Form doesn't submit
- [ ] Submit button still enabled (for retry)

---

### Test 6: Form Validation - Name Field

**Action**: Enter invalid name

**Steps**:
1. Enter name > 100 characters
2. Try to submit
3. Check error

**Expected**: Error "Le nom ne doit pas dépasser 100 caractères"

**Verification**:
- [ ] Error message appears
- [ ] Form doesn't submit

---

### Test 7: Form Validation - Amount Field

**Action**: Enter negative or zero amount

**Steps**:
1. Enter amount: -100
2. Try to submit
3. Check error

**Expected**: Error "Le montant doit être positif"

**Verification**:
- [ ] Error shows
- [ ] Cannot submit

---

### Test 8: Frequency Selector - All Options

**Action**: Click different frequency options

**Steps**:
1. Open Add dialog
2. Click DAILY
3. Verify card highlights
4. Click WEEKLY
5. Verify card highlights
6. Test all 6 options

**Expected**:
- Selected option has border highlight
- Background color changes
- Icons and descriptions visible

**Verification**:
- [ ] DAILY selectable
- [ ] WEEKLY selectable
- [ ] BIWEEKLY selectable
- [ ] MONTHLY selectable
- [ ] QUARTERLY selectable
- [ ] YEARLY selectable
- [ ] Visual feedback for selection

---

### Test 9: Conditional Fields - Day of Month (MONTHLY)

**Action**: Select MONTHLY frequency

**Expected Result**:
- "Jour du mois" field appears
- Input accepts 1-31
- Field is required for MONTHLY

**Steps**:
1. Select MONTHLY frequency
2. Check if Day of Month field appears
3. Enter day (e.g., 15)
4. Verify value persists

**Verification**:
- [ ] Field appears for MONTHLY
- [ ] Field disappears for other frequencies
- [ ] Can enter 1-31
- [ ] Error on >31

---

### Test 10: Conditional Fields - Day of Week (WEEKLY)

**Action**: Select WEEKLY frequency

**Expected Result**:
- "Jour de la semaine" dropdown appears
- Shows 7 day options
- Can select day

**Steps**:
1. Select WEEKLY frequency
2. Check dropdown appears
3. Select "Lundi"
4. Verify selection

**Verification**:
- [ ] Dropdown appears for WEEKLY
- [ ] Dropdown hidden for other frequencies
- [ ] Can select all 7 days
- [ ] Selection persists

---

### Test 11: Create Pattern - Successful Submission

**Action**: Fill all required fields and submit

**Steps**:
1. Open Add dialog
2. Fill form:
   - Account: Select any account
   - Name: "Test Pattern"
   - Frequency: MONTHLY
   - Type: DEBIT
   - Amount: 100.50
   - Start Date: Today
   - Day of Month: 1
3. Click "Enregistrer"
4. Wait for submission

**Expected Result**:
- Form shows loading state
- Button text changes to "Enregistrement..."
- Pattern appears in list
- Dialog closes
- Success notification (if implemented)

**Verification**:
- [ ] Loading state shows
- [ ] API call succeeds
- [ ] Dialog closes
- [ ] Pattern in list

---

### Test 12: Form Reset on Dialog Open

**Action**: Add pattern, close dialog, open again

**Expected Result**:
- Form is empty on second open
- No data from previous submission
- Fresh form for new pattern

**Verification**:
- [ ] Form is empty
- [ ] No default values persist
- [ ] Ready for new entry

---

### Test 13: RecurringPatternCard - Display Details

**Condition**: At least one pattern exists

**Expected Result**:
- Card shows pattern name
- Shows frequency (e.g., "📊 Mensuel")
- Shows amount with color (red for DEBIT, green for CREDIT)
- Shows type (DEBIT/CREDIT)
- Shows next generation date
- Shows status badges if paused/inactive

**Steps**:
1. Create a pattern (or use existing)
2. Check card displays on list page
3. Verify all details visible

**Verification**:
- [ ] Pattern name displays
- [ ] Amount displays with correct sign
- [ ] Color coding correct (DEBIT=-red, CREDIT=+green)
- [ ] Frequency displays
- [ ] Next generation date displays
- [ ] Status badges show if needed

---

### Test 14: Pattern Card - Status Badges

**For Paused Pattern**:
**Expected**: Yellow "Pausé" badge appears

**For Inactive Pattern**:
**Expected**: Gray "Inactif" badge appears

**For Active Pattern**:
**Expected**: No badge

**Verification**:
- [ ] Paused patterns show yellow badge
- [ ] Inactive patterns show gray badge
- [ ] Active patterns have no badge

---

### Test 15: Pattern Card - Action Menu

**Action**: Click three-dot menu icon on card

**Expected Result**:
- Menu opens with options:
  - Éditer
  - Historique
  - Pause/Reprendre
  - Supprimer

**Steps**:
1. Find a pattern card
2. Click three-dot icon
3. Check menu items

**Verification**:
- [ ] Menu opens
- [ ] All 4 options visible
- [ ] Options have correct icons

---

### Test 16: Edit Pattern - Open Dialog

**Action**: Click "Éditer" from menu

**Expected Result**:
- Edit dialog opens
- Form is pre-populated with pattern data
- All fields show current values

**Steps**:
1. Click menu on a pattern
2. Click "Éditer"
3. Check form values

**Expected Values in Form**:
- Account: Same as pattern's account
- Name: Same as pattern's name
- Amount: Same as pattern's amount
- Frequency: Same as pattern's frequency
- Type: Same as pattern's type
- Dates: Same as pattern's dates

**Verification**:
- [ ] Dialog opens
- [ ] All fields pre-populated correctly
- [ ] Can modify values

---

### Test 17: Edit Pattern - Modify and Save

**Action**: Change pattern values and save

**Steps**:
1. Open Edit dialog
2. Change Name to "Updated Name"
3. Change Amount to 200
4. Click "Enregistrer"
5. Check list updates

**Expected Result**:
- Pattern in list shows new values
- Dialog closes
- Success feedback

**Verification**:
- [ ] Name updates
- [ ] Amount updates
- [ ] List refreshes
- [ ] Dialog closes

---

### Test 18: Delete Pattern - Confirmation Dialog

**Action**: Click "Supprimer" from menu

**Expected Result**:
- Confirmation dialog opens
- Title: "Supprimer une transaction récurrente"
- Warning message visible
- Pattern name shown in confirmation text
- Two buttons: "Annuler" and "Supprimer"

**Steps**:
1. Click menu on a pattern
2. Click "Supprimer"
3. Check dialog content

**Verification**:
- [ ] Dialog opens
- [ ] Warning displayed
- [ ] Pattern name shown
- [ ] Cancel button works
- [ ] Delete button visible

---

### Test 19: Delete Pattern - Confirm Deletion

**Action**: Click "Supprimer" in confirmation dialog

**Expected Result**:
- Dialog shows loading state
- Button text: "Suppression..."
- Pattern is removed from list
- Dialog closes
- List updates

**Steps**:
1. Open delete confirmation
2. Click "Supprimer"
3. Wait for deletion
4. Check list

**Verification**:
- [ ] Loading state shows
- [ ] Pattern disappears from list
- [ ] Dialog closes
- [ ] No error message

---

### Test 20: Pause Pattern - From Menu

**Action**: Click "Pause" from menu

**Expected Result**:
- Pattern card updates immediately
- "Pausé" badge appears
- Menu option changes to "Reprendre"
- Pattern no longer generates transactions

**Steps**:
1. Find active pattern
2. Click menu
3. Click "Pause"
4. Check badge appears

**Verification**:
- [ ] Badge appears
- [ ] Card reflects paused state
- [ ] Pause button becomes Resume

---

### Test 21: Resume Pattern - From Menu

**Action**: Click "Reprendre" on paused pattern

**Expected Result**:
- "Pausé" badge disappears
- Pattern card reflects active state
- Menu option changes back to "Pause"

**Steps**:
1. Find paused pattern
2. Click menu
3. Click "Reprendre"
4. Check badge disappears

**Verification**:
- [ ] Badge disappears
- [ ] Resume button changes to Pause

---

### Test 22: Pause/Resume - From Card Footer

**Action**: Click "Pause" button in card footer

**Expected Result**:
- Same as Test 20
- Button text changes to "Reprendre"

**Verification**:
- [ ] Pattern paused
- [ ] Button text updates
- [ ] Badge appears

---

### Test 23: View Logs - Open Modal

**Action**: Click "Historique" from menu or "Logs" button

**Expected Result**:
- Modal opens
- Title: "Historique de génération"
- Pattern name shown
- Table with columns:
  - Date
  - Statut
  - Transaction ID
  - Message

**Steps**:
1. Click "Historique" from menu
2. Check modal opens
3. Check table structure

**Verification**:
- [ ] Modal opens
- [ ] Title displays
- [ ] Table visible
- [ ] Columns correct

---

### Test 24: Generation Logs - Table Content

**Expected Result**:
- If logs exist:
  - Rows show with dates
  - Status badges (✅ Succès, ❌ Échoué, ⏭️ Ignoré)
  - Transaction IDs (if successful)
  - Error messages (if failed)
- If no logs:
  - "Aucun historique de génération" message

**Verification**:
- [ ] Logs display
- [ ] Status badges correct color
- [ ] Transaction IDs visible
- [ ] Error messages shown
- [ ] Empty state message shows when no logs

---

### Test 25: Copy Transaction ID

**Action**: Click copy icon next to transaction ID

**Expected Result**:
- Transaction ID copied to clipboard
- Button shows "Copié!" feedback
- Feedback disappears after 2 seconds

**Steps**:
1. Open logs modal
2. Find successful transaction
3. Click copy icon
4. Wait 2 seconds

**Verification**:
- [ ] Copy feedback shows
- [ ] ID copied to clipboard
- [ ] Feedback auto-hides

---

### Test 26: Filter by Frequency

**Action**: Change frequency filter

**Steps**:
1. On main list page
2. Click "Fréquence" dropdown
3. Select "Mensuel"
4. Check list updates

**Expected Result**:
- Only MONTHLY patterns show
- Other patterns hidden
- Result count updates
- "Réinitialiser les filtres" button appears

**Verification**:
- [ ] Only matching frequency shows
- [ ] Count updates
- [ ] Reset button appears

---

### Test 27: Filter by Status

**Action**: Change status filter

**Steps**:
1. Click "Statut" dropdown
2. Select "Pausés"
3. Check list updates

**Expected Result**:
- Only paused patterns show
- Result count shows "pausés"

**Verification**:
- [ ] Only paused patterns visible
- [ ] Count correct

---

### Test 28: Filter Combination

**Action**: Filter by both frequency AND status

**Steps**:
1. Set Frequency to "MONTHLY"
2. Set Status to "ACTIVE"
3. Check results

**Expected Result**:
- Only MONTHLY AND ACTIVE patterns show
- "Réinitialiser les filtres" button visible

**Verification**:
- [ ] Both filters apply
- [ ] Results correct

---

### Test 29: Reset Filters

**Action**: Click "Réinitialiser les filtres"

**Expected Result**:
- All patterns show again
- Filter dropdowns reset to "All"
- Reset button disappears

**Verification**:
- [ ] All patterns visible
- [ ] Filters reset
- [ ] Reset button gone

---

### Test 30: Responsive Design - Desktop

**Viewport**: 1920x1080 (Desktop)

**Expected Result**:
- 3 cards per row
- Cards properly sized
- Text readable
- All buttons accessible
- No horizontal scroll

**Steps**:
1. Open on desktop
2. Check layout
3. Click various elements
4. Check interaction

**Verification**:
- [ ] 3 columns layout
- [ ] No overflow
- [ ] All clickable

---

### Test 31: Responsive Design - Tablet

**Viewport**: 768x1024 (iPad)

**Expected Result**:
- 2 cards per row
- Touch-friendly spacing
- No horizontal scroll
- All elements accessible via touch

**Steps**:
1. Resize to tablet width
2. Check layout reorganizes
3. Tap buttons/links
4. Try touch gestures

**Verification**:
- [ ] 2 columns layout
- [ ] Touch targets large enough
- [ ] No overflow

---

### Test 32: Responsive Design - Mobile

**Viewport**: 375x667 (iPhone SE)

**Expected Result**:
- 1 card per row (full width)
- Buttons stack vertically
- No horizontal scroll
- Text readable at 16px+ font
- Touch targets 44x44px+

**Steps**:
1. Resize to mobile width
2. Check layout
3. Try scrolling
4. Tap elements

**Verification**:
- [ ] 1 column layout
- [ ] No horizontal scroll
- [ ] Touch targets adequate
- [ ] Text readable

---

### Test 33: Navigation - Add Button Flow

**Complete Flow**:
1. Start: Empty list page
2. Click "Ajouter"
3. Fill form completely
4. Click "Enregistrer"
5. Verify: Pattern in list

**Expected Result**:
- User can create pattern from empty state
- Appears in list immediately
- Dialog closes
- List refreshes

**Verification**:
- [ ] Create button accessible
- [ ] Form accepts input
- [ ] API call succeeds
- [ ] List updates

---

### Test 34: Navigation - Edit Flow

**Complete Flow**:
1. Start: Pattern in list
2. Click menu → "Éditer"
3. Modify form field
4. Click "Enregistrer"
5. Verify: Pattern updated in list

**Expected Result**:
- Edit works end-to-end
- Changes persist
- Dialog closes
- List reflects changes

**Verification**:
- [ ] Edit accessible
- [ ] Form pre-fills
- [ ] Changes saved
- [ ] List updated

---

### Test 35: Navigation - Delete Flow

**Complete Flow**:
1. Start: Pattern in list
2. Click menu → "Supprimer"
3. Click confirm "Supprimer"
4. Verify: Pattern removed

**Expected Result**:
- Delete works end-to-end
- Pattern removed from list
- Dialog closes
- No errors

**Verification**:
- [ ] Delete accessible
- [ ] Confirmation required
- [ ] Pattern gone
- [ ] No error message

---

### Test 36: Error Handling - API Error

**Condition**: Backend is down or returns error

**Action**: Try to create pattern

**Expected Result**:
- Error message displays in alert
- Form doesn't close
- Can retry submission
- Button remains clickable

**Verification**:
- [ ] Error message clear
- [ ] Dialog stays open
- [ ] Can retry

---

### Test 37: Error Handling - Network Error

**Condition**: No network connection

**Action**: Try to create pattern

**Expected Result**:
- Network error handled gracefully
- Appropriate error message
- User can retry

**Verification**:
- [ ] Doesn't crash
- [ ] Error message shown
- [ ] Can retry

---

### Test 38: Loading States - Page Load

**Expected Result**:
- Spinner shows while loading
- "Actualiser" button disabled
- Cannot click "Ajouter" during load
- Spinner disappears when data loads

**Verification**:
- [ ] Loading indicator visible
- [ ] Buttons disabled
- [ ] Spinner disappears

---

### Test 39: Loading States - Form Submit

**Expected Result**:
- Submit button shows "Enregistrement..."
- Button disabled during submission
- Cancel/close not possible during submit
- Button re-enables on completion

**Verification**:
- [ ] Loading text shows
- [ ] Button disabled
- [ ] Re-enables on done

---

### Test 40: Form Submission - Type DEBIT vs CREDIT

**Test DEBIT**:
1. Select Type: DEBIT
2. Enter Amount: 100
3. Submit
4. Check card shows "-100 €" in red

**Test CREDIT**:
1. Select Type: CREDIT
2. Enter Amount: 500
3. Submit
4. Check card shows "+500 €" in green

**Verification**:
- [ ] DEBIT shows negative amount in red
- [ ] CREDIT shows positive amount in green

---

## 📊 Test Results Summary

Create a test results table:

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1 | Page load and display | ✅/❌ | |
| 2 | Empty state | ✅/❌ | |
| 3 | Add button opens dialog | ✅/❌ | |
| 4 | Account selection | ✅/❌ | |
| 5 | Form validation - required | ✅/❌ | |
| 6 | Form validation - name | ✅/❌ | |
| 7 | Form validation - amount | ✅/❌ | |
| 8 | Frequency selector | ✅/❌ | |
| 9 | Conditional field - day of month | ✅/❌ | |
| 10 | Conditional field - day of week | ✅/❌ | |
| 11 | Create pattern success | ✅/❌ | |
| 12 | Form reset on dialog open | ✅/❌ | |
| 13 | Card displays details | ✅/❌ | |
| 14 | Status badges | ✅/❌ | |
| 15 | Action menu | ✅/❌ | |
| 16 | Edit dialog opens | ✅/❌ | |
| 17 | Edit and save | ✅/❌ | |
| 18 | Delete confirmation | ✅/❌ | |
| 19 | Confirm deletion | ✅/❌ | |
| 20 | Pause from menu | ✅/❌ | |
| 21 | Resume from menu | ✅/❌ | |
| 22 | Pause from footer | ✅/❌ | |
| 23 | View logs modal | ✅/❌ | |
| 24 | Logs table content | ✅/❌ | |
| 25 | Copy transaction ID | ✅/❌ | |
| 26 | Filter by frequency | ✅/❌ | |
| 27 | Filter by status | ✅/❌ | |
| 28 | Combined filters | ✅/❌ | |
| 29 | Reset filters | ✅/❌ | |
| 30 | Desktop responsive | ✅/❌ | |
| 31 | Tablet responsive | ✅/❌ | |
| 32 | Mobile responsive | ✅/❌ | |
| 33 | Complete add flow | ✅/❌ | |
| 34 | Complete edit flow | ✅/❌ | |
| 35 | Complete delete flow | ✅/❌ | |
| 36 | API error handling | ✅/❌ | |
| 37 | Network error handling | ✅/❌ | |
| 38 | Loading state - page | ✅/❌ | |
| 39 | Loading state - form | ✅/❌ | |
| 40 | DEBIT/CREDIT type | ✅/❌ | |

---

## 🔍 Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Expected Result**: All features work consistently across all browsers

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all form fields
- [ ] Can open dialogs with keyboard
- [ ] Can submit forms with Enter key
- [ ] Can close dialogs with Escape key
- [ ] Focus visible on all interactive elements

### Screen Reader
- [ ] Form labels are associated with inputs
- [ ] Buttons have descriptive text
- [ ] Dialogs have proper titles
- [ ] Errors announced to screen reader
- [ ] Status updates announced

### Color Contrast
- [ ] Text readable on background
- [ ] Not relying on color alone for information
- [ ] DEBIT/CREDIT not differentiated by color alone

---

## 🐛 Known Issues / TODO

- [ ] Add pattern templates
- [ ] Bulk operations (pause all)
- [ ] Pattern cloning
- [ ] Export functionality
- [ ] Real-time updates from cron job
- [ ] Calendar view
- [ ] Notifications

---

## 📝 Notes

### Test Environment
- Backend: Running on localhost:3030
- Frontend: Running on localhost:5173
- Database: PostgreSQL

### Important Considerations
- Dates are stored in UTC, display in local timezone
- Frontend validation mirrors backend validation
- All API calls require valid JWT token
- Household isolation enforced at backend level

---

## ✅ Sign-Off

**Testing Completed**: __________ (Date)
**Tester**: __________________
**All Tests Passed**: ✅/❌
**Issues Found**: _____ (Count)
**Critical Issues**: _____ (Count)

---

**Frontend Testing Guide for Phase 5.2**
**Created**: November 1, 2025
**Version**: v0.5.0

🤖 Generated with Claude Code
