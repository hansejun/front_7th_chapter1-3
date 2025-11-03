# E2E Tests - Recurring Event Management

## Overview

This directory contains Playwright E2E tests for the calendar application's recurring event management functionality.

## Test File

- **`02-recurring-event-management.spec.ts`**: Comprehensive E2E tests for recurring event CRUD operations

## Test Scenarios

The test suite includes the following scenarios:

1. **주간 반복 일정 생성** - Create weekly recurring events

   - Verifies 5 events are created (11/10, 11/17, 11/24, 12/01, 12/08)
   - Validates all events share the same `repeatId`

2. **반복 일정 단일 항목 수정** - Edit single occurrence

   - Tests "이 일정만" (this event only) dialog option
   - Verifies only the selected event is modified
   - Confirms other events in the series remain unchanged

3. **반복 일정 전체 시리즈 수정** - Edit entire series

   - Tests "모든 일정" (all events) dialog option
   - Validates all events in the series are updated
   - Uses `repeatId`-based API when available

4. **반복 일정 단일 항목 삭제** - Delete single occurrence

   - Tests single event deletion from a recurring series
   - Verifies only one event is removed
   - Confirms remaining 4 events persist

5. **반복 일정 전체 시리즈 삭제** - Delete entire series

   - Tests complete series deletion
   - Validates all 5 events are removed
   - Uses `repeatId`-based delete API

6. **다양한 반복 유형 테스트** - Various repeat types
   - **매일** (Daily): Creates 5 daily events (11/03-11/07)
   - **매월** (Monthly): Creates 2 monthly events (11/01, 12/01)
   - **매년** (Yearly): Creates 1 yearly event (end date < 1 year)

## Prerequisites

### 1. Environment Setup

The servers must be running with the correct environment variable:

```bash
# Terminal 1: Start backend server with E2E environment
TEST_ENV=e2e node server.js

# Terminal 2: Start frontend dev server
pnpm start
```

### 2. E2E Data File

The backend uses `src/__mocks__/response/e2e.json` when `TEST_ENV=e2e` is set. This file is automatically created if it doesn't exist.

### 3. Playwright Installation

Ensure Playwright is installed with browsers:

```bash
# Install Playwright browsers (if not already installed)
npx playwright install chromium
```

## Running the Tests

### Run all recurring event tests

```bash
npx playwright test tests/e2e/02-recurring-event-management.spec.ts
```

### Run specific test scenario

```bash
npx playwright test tests/e2e/02-recurring-event-management.spec.ts -g "시나리오 1"
```

### Run with UI mode (interactive)

```bash
npx playwright test tests/e2e/02-recurring-event-management.spec.ts --ui
```

### Run in headed mode (see browser)

```bash
npx playwright test tests/e2e/02-recurring-event-management.spec.ts --headed
```

### Generate HTML report

```bash
npx playwright test tests/e2e/02-recurring-event-management.spec.ts --reporter=html
npx playwright show-report
```

## Test Architecture

### Helper Functions

#### `createRecurringEvent(page, eventData)`

Creates a recurring event by filling out the form and submitting it.

**Parameters:**

- `title`: Event title (use unique timestamp)
- `date`: Start date (YYYY-MM-DD)
- `startTime`: Start time (HH:MM)
- `endTime`: End time (HH:MM)
- `description`: Event description
- `location`: Event location
- `category`: Event category (업무, 개인, 가족, 기타)
- `repeatType`: '매일' | '매주' | '매월' | '매년'
- `repeatInterval`: Repeat interval (default: 1)
- `repeatEndDate`: End date for recurrence (YYYY-MM-DD)
- `notificationTime`: Notification time (optional)

#### `handleRecurringDialog(page, option)`

Handles the recurring event edit/delete dialog.

**Parameters:**

- `option`: 'this' | 'all' | 'cancel'
  - `'this'`: Click "예" (this event only)
  - `'all'`: Click "아니오" (all events in series)
  - `'cancel'`: Click "취소" (cancel operation)

#### `cleanupAllEvents()`

Deletes all events from the e2e.json file via API calls. Used in `beforeEach` and `afterEach` to ensure test isolation.

## Key Selectors

The tests use the following selector strategy:

1. **ID selectors** for form inputs: `#title`, `#date`, `#start-time`, `#end-time`, etc.
2. **aria-label selectors** for dropdowns: `[aria-label="반복 유형"]`, `[aria-label="카테고리"]`
3. **role-based selectors** for options: `getByRole('option', { name: 'daily-option' })`
4. **test-id selectors** for buttons: `getByTestId('event-submit-button')`

## Data Isolation

Each test:

1. **Cleans up** all events before starting (`beforeEach`)
2. Uses **unique timestamps** in event titles to avoid conflicts
3. **Cleans up** after completion (`afterEach`)
4. Runs **sequentially** (not in parallel) to prevent data races

## Assertions

Tests verify functionality through:

1. **Visual checks**: `expect(page.locator('text=...')).toBeVisible()`
2. **API validation**: Fetching events and checking counts, titles, repeatIds
3. **State validation**: Verifying correct events were modified/deleted

## Troubleshooting

### Tests fail with "connection refused"

- Ensure both servers are running
- Verify TEST_ENV=e2e is set for the backend server
- Check that ports 3000 and 5173 are not in use by other processes

### Tests fail with "element not found"

- Check that selectors match the current implementation
- Verify the repeat options appear when the checkbox is checked
- Try running in headed mode to see what's happening: `--headed`

### Tests are flaky

- Increase timeout values if the application is slow
- Check that `waitForSelector` and `waitForLoadState` are used appropriately
- Ensure cleanup is working properly between tests

### Events not being created correctly

- Verify the repeat type mapping is correct (매일→daily, 매주→weekly, etc.)
- Check that the repeat end date is valid
- Inspect the API response to see what was actually created

## Future Improvements

- [ ] Add tests for editing recurring events after single occurrence edit
- [ ] Test edge cases (Feb 29, year boundaries, etc.)
- [ ] Add visual regression testing for calendar rendering
- [ ] Test keyboard navigation and accessibility
- [ ] Add performance benchmarks for large recurring series
- [ ] Test concurrent operations on recurring events
