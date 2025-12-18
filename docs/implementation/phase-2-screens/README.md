# Phase 2: Screen-by-Screen Implementation

## Overview

Build all user-facing screens with mock data before API integration. This approach allows us to:
- Focus on UI/UX without API complexities
- Test user flows independently
- Iterate quickly on design
- Validate mock data structures match API specs

## Duration

Days 4-10 (7 days)

## Screens to Build

1. **[2.1 Dashboard Screen](./2.1-dashboard.md)** - Entry point showing source app details
2. **[2.2 Select Destination](./2.2-select-destination.md)** - Choose organization and destination app
3. **[2.3 Configure Merge](./2.3-configure-merge.md)** - Select screens, data sources, files, and settings (4 tabs)
4. **[2.4 Review & Merge](./2.4-review-merge.md)** - Preview merge summary and initiate
5. **[2.5 Merge Execution](./2.5-merge-execution.md)** - Real-time progress tracking
6. **[2.6 Merge Completion](./2.6-merge-completion.md)** - Final results and next steps

## Implementation Approach

For each screen:

### Step 1: Create Mock Data
```javascript
var mockData = {
  // Representative data structure matching API responses
};
```

### Step 2: Build HTML Structure
- Use Bootstrap grid for layout
- Use design system components
- Mobile-first responsive design

### Step 3: Create Vue Component
```javascript
var ScreenComponent = {
  data: function() {
    return {
      mockData: mockData,
      loading: false,
      error: null
    };
  },
  methods: {
    // User interactions
  }
};
```

### Step 4: Add Custom Styling
- Modern, professional appearance
- Consistent with Fliplet design language
- Responsive breakpoints for mobile/tablet/desktop

### Step 5: Test User Flow
- Click through entire flow
- Verify all interactions work
- Test responsive behavior
- Validate mock data completeness

## Common Patterns

### State Management
```javascript
// Read from global state
var sourceApp = MergeState.sourceApp;

// Update global state
MergeState.selectedScreens = selected;

// Persist to localStorage
MergeStorage.saveState();
```

### Navigation
```javascript
// Navigate to next screen
Fliplet.Navigate.screen(screenId);

// Or use event bus
MergeEventBus.$emit('navigate', 'screen-name');
```

### Using Fliplet.UI.Table
```javascript
var table = new Fliplet.UI.Table({
  target: '#table-container',
  columns: [...],
  data: mockData,
  searchable: true,
  pagination: { pageSize: 20 },
  selection: {
    enabled: true,
    multiple: true
  }
});
```

## Verification Checklist

For each screen:

- [ ] HTML structure is semantic and accessible
- [ ] Vue component is registered and functional
- [ ] Mock data covers all edge cases
- [ ] All user interactions work correctly
- [ ] Design system components are used consistently
- [ ] Custom CSS is responsive
- [ ] No console errors
- [ ] Flows naturally to next screen
- [ ] Global state is updated correctly
- [ ] localStorage persistence works

## Next Steps

After all screens are built with mock data, proceed to [Phase 3: API Integration](../phase-3-integration/README.md) to replace mock data with real API calls.

