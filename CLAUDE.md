# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calendar event management application built with React, TypeScript, Vite, and Material-UI. The application features event creation, editing, deletion, recurring events, notifications, and drag-and-drop functionality.

## Development Commands

### Running the Application

```bash
pnpm dev                  # Run both server and client concurrently
pnpm start                # Run Vite dev server only
pnpm server               # Run Express server only
pnpm server:watch         # Run Express server with watch mode
```

### Testing

```bash
pnpm test                 # Run tests in watch mode
pnpm test:ui              # Run tests with Vitest UI
pnpm test:coverage        # Run tests with coverage report
```

### Linting & Type Checking

```bash
pnpm lint                 # Run both ESLint and TypeScript checks
pnpm lint:eslint          # Run ESLint only
pnpm lint:tsc             # Run TypeScript type checking only
```

### Building

```bash
pnpm build                # Build the application (TypeScript + Vite)
```

## Architecture Overview

### Backend (Express Server)

- **File**: `server.js`
- **Port**: 3000
- **Data Storage**: JSON files in `src/__mocks__/response/`
  - `realEvents.json` - Production data
  - `e2e.json` - E2E test data (controlled by `TEST_ENV=e2e`)
- **API Endpoints**:
  - `GET /api/events` - Fetch all events
  - `POST /api/events` - Create single event
  - `PUT /api/events/:id` - Update single event
  - `DELETE /api/events/:id` - Delete single event
  - `POST /api/events-list` - Create multiple events (recurring)
  - `PUT /api/events-list` - Update multiple events
  - `DELETE /api/events-list` - Delete multiple events by IDs
  - `PUT /api/recurring-events/:repeatId` - Update recurring series
  - `DELETE /api/recurring-events/:repeatId` - Delete recurring series

### Frontend Architecture

#### Main Component

- **File**: `src/App.tsx`
- Single-page application with event form (left), calendar view (center), and event list (right)
- Handles two view modes: Week and Month
- Manages dialogs for event overlap warnings and recurring event operations

#### Core Hooks

1. **useEventForm** (`src/hooks/useEventForm.ts`)

   - Manages all form state (title, date, time, description, location, category, repeat settings, notifications)
   - Handles form validation for start/end times
   - Provides reset and edit functionality

2. **useEventOperations** (`src/hooks/useEventOperations.ts`)

   - CRUD operations for events via API
   - Manages event state and server synchronization
   - Handles both single and recurring event creation

3. **useRecurringEventOperations** (`src/hooks/useRecurringEventOperations.ts`)

   - Specialized handler for recurring event edit/delete
   - Determines related events in a recurring series
   - Supports editing single occurrence vs. entire series
   - Prefers `repeatId`-based API when available, falls back to individual operations

4. **useNotifications** (`src/hooks/useNotifications.ts`)

   - Monitors events and triggers notifications based on `notificationTime`
   - Tracks which events have been notified

5. **useCalendarView** (`src/hooks/useCalendarView.ts`)

   - Manages calendar view state (week/month)
   - Handles navigation (prev/next)
   - Fetches Korean holidays

6. **useSearch** (`src/hooks/useSearch.ts`)
   - Filters events by search term
   - Searches across title, description, and location

#### Key Utilities

- **dateUtils.ts**: Date formatting, week/month calculations, event filtering by date
- **generateRepeatEvents.ts**: Generates individual event instances from recurring patterns
- **eventOverlap.ts**: Detects time conflicts between events
- **timeValidation.ts**: Validates start/end time logic
- **notificationUtils.ts**: Calculates notification timing

#### Type System

- **types.ts**: Defines core types
  - `RepeatType`: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  - `RepeatInfo`: Contains repeat configuration including optional `id` for series tracking
  - `EventForm`: Form data structure
  - `Event`: Extends `EventForm` with required `id`

### Recurring Events System

Recurring events are implemented in two ways:

1. **Series with `repeatId`**: When created via server, all events in a series share the same `repeat.id`. This allows batch operations via `/api/recurring-events/:repeatId`.
2. **Series without `repeatId`**: Legacy or client-generated series identified by matching repeat config and event properties. Individual operations are batched.

The `useRecurringEventOperations` hook abstracts this complexity and prefers the repeatId approach when available.

### Test Structure

- **Unit tests**: `src/__tests__/unit/` - Test individual utilities
- **Hook tests**: `src/__tests__/hooks/` - Test custom hooks
- **Component tests**: `src/__tests__/components/` - Test React components
- **Integration tests**: `src/__tests__/integration/` - Test recurring event workflows
- **Regression tests**: `src/__tests__/regression/` - Prevent recurring event regressions
- **Edge case tests**: `src/__tests__/edge-cases/` - Test boundary conditions
- **Medium integration**: `src/__tests__/medium.integration.spec.tsx` - Full app integration tests

### MSW (Mock Service Worker)

- **handlers.ts**: Defines mock API handlers for testing
- **handlersUtils.ts**: Utility functions for mock handlers

## Important Notes

### Recurring Events

- When editing a recurring event, user chooses between "this event only" or "all events in series"
- Server manages `repeat.id` for recurring series created via `/api/events-list`
- Max end date for recurring events: 2025-12-30
- Yearly recurring events on Feb 29 automatically advance 4 years

### Event Validation

- Start time must be before end time
- Events can overlap, but user is warned with a dialog
- All form fields are optional except title, date, startTime, and endTime

### Vite Configuration

- Dev server runs on default Vite port (usually 5173)
- API requests proxied to `http://localhost:3000` via `/api` prefix
- Vitest configured with jsdom environment
- Coverage reports in `.coverage/` directory

### ESLint Configuration

- Flat config format (ESLint 9+)
- Enforces import ordering with alphabetical sorting
- Prettier integration for code formatting
- Vitest plugin for test files
- React hooks rules enforced

### Pre-commit Hooks

- Husky configured with `prepare` script
- lint-staged runs ESLint and Prettier on staged files
