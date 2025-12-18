# App Merge UI - Implementation Documentation

This document provides a complete index of all implementation documentation for the App Merge UI feature.

## Quick Start

1. Read [Implementation Overview](./implementation/00-overview.md)
2. Follow Phase 1 to set up foundation
3. Build screens in Phase 2
4. Integrate APIs in Phase 3
5. Polish and deploy in Phase 4

## Project Documents

### Requirements & Specifications
- [Project PRD](./01-project-prd.md) - Complete product requirements
- [Design Specification](./03-project-design-spec.md) - UI/UX design specs
- [API Technical Specification](./05-api-tech-spec.md) - Backend API documentation
- [Middleware Development Guidelines](./MIDDLEWARE_GUIDELINES.md) - API middleware patterns

### Implementation Guide
- [Implementation Overview](./implementation/00-overview.md) - Architecture and approach

## Phase 1: Foundation & Design System

**Duration:** Days 1-3

Setup core infrastructure, design system, and API middleware.

- [Phase 1 Overview](./implementation/phase-1-foundation/)
- [1.1 Project Setup & Global Architecture](./implementation/phase-1-foundation/1.1-project-setup.md)
  - Set app context (ID: 427998)
  - Create global CSS with design tokens
  - Set up global JavaScript with Vue.js
  - Initialize state management
  - Configure storage utilities

- [1.2 Design System Components](./implementation/phase-1-foundation/1.2-design-system.md)
  - MergeButton - Standardized buttons
  - MergeCard - Card containers
  - MergeAlert - Alert/notification boxes
  - MergeModal - Modal dialogs
  - MergeBadge - Status badges
  - MergeProgressBar - Progress indicators
  - MergeStepper - Step navigation
  - MergeLoadingSpinner - Loading states
  - MergeLockTimer - Countdown timers
  - Design System showcase screen

- [1.3 API Middleware Layer](./implementation/phase-1-foundation/1.3-api-middleware.md)
  - Behavior-parameterized API functions
  - Apps, Organizations, Screens APIs
  - Data Sources, Files APIs
  - Lock Management APIs
  - Merge Operations APIs
  - Logging and Global Code APIs
  - Consistent error handling

- [1.4 API Testing Screen](./implementation/phase-1-foundation/1.4-api-tester.md)
  - Developer tool for testing middleware
  - Function selector by category
  - Dynamic parameter forms
  - Request/response preview
  - Execution and history tracking
  - Quick test scenarios

## Phase 2: Screen-by-Screen Implementation

**Duration:** Days 4-10

Build all screens with mock data before API integration.

- [Phase 2 Overview](./implementation/phase-2-screens/README.md)

### Screens to Build:

1. **Dashboard Screen**
   - Entry point from Studio
   - Source app information display
   - Prerequisites and warnings
   - Link to audit log
   - "Configure Merge" CTA

2. **Select Destination**
   - Organization dropdown
   - Apps table with Fliplet.UI.Table
   - Search and sort functionality
   - Single app selection
   - Lock warning message

3. **Configure Merge (4 Tabs)**
   - **Screens Tab**: Expandable table with associations
   - **Data Sources Tab**: Table with mode dropdowns
   - **Files Tab**: Files and folders selection
   - **Settings Tab**: App-level configuration checkboxes
   - Lock timer component
   - Selection count badges

4. **Review & Merge**
   - Summary cards with counts
   - Color-coded status indicators
   - Expandable tables by category
   - Warning messages
   - Preview before execution

5. **Merge Execution**
   - Real-time progress tracking
   - Stage-by-stage status
   - Log messages
   - Error handling
   - Background continuation

6. **Merge Completion**
   - Success/error message
   - Results summary
   - Limit warnings
   - Error details
   - Next steps guidance

## Phase 3: API Integration & Testing

**Duration:** Days 11-14

Replace mock data with real API calls and add robust error handling.

- [Phase 3 Overview](./implementation/phase-3-integration/README.md)

### Integration Tasks:

1. **Replace Mock Data**
   - Remove mock declarations
   - Add loading states
   - Integrate middleware calls
   - Handle API responses
   - Test with real backend

2. **Error Handling & Edge Cases**
   - Network errors
   - API errors (401, 403, 404, 409, 500)
   - Business logic errors
   - User-friendly error messages
   - Retry mechanisms

3. **Lock Management**
   - Lock on destination selection
   - Auto-extend on activity
   - Manual extension
   - Lock expiry handling
   - Unlock on cancel/close

4. **State Persistence**
   - Save state periodically
   - Restore state on load
   - Handle merge-in-progress scenarios
   - Clear state on completion
   - 24-hour expiry

## Phase 4: Polish & Studio Integration

**Duration:** Days 15-17

Final refinements for production readiness.

- [Phase 4 Overview](./implementation/phase-4-polish/README.md)

### Polish Tasks:

1. **Responsive Design**
   - Mobile breakpoints (< 768px)
   - Tablet breakpoints (768-1023px)
   - Desktop breakpoints (>= 1024px)
   - Touch-friendly interactions
   - Optimized layouts

2. **Accessibility**
   - WCAG 2.1 Level AA compliance
   - ARIA labels and roles
   - Keyboard navigation
   - Focus management
   - Screen reader support

3. **Performance Optimization**
   - Lazy loading
   - Debouncing
   - API response caching
   - Optimized re-renders
   - Memory leak prevention

4. **Studio Integration**
   - Receive source app ID
   - Post messages to parent
   - Listen for Studio messages
   - Apply Studio theme
   - Iframe embedding

5. **Testing & QA**
   - Happy path testing
   - Cross-organization merges
   - Conflict handling
   - Lock expiry scenarios
   - Network failures
   - Large apps (100+ screens)
   - Browser compatibility
   - Device testing

## App Architecture

For complete architecture diagrams and app structure, see [Implementation Overview](implementation/00-overview.md).

## Success Criteria & Testing

See [PROJECT_STATUS.md](../PROJECT_STATUS.md) for current completion status and testing checklist.

---
