# Design System Component Registry

This document provides a complete reference for all design system components built in Phase 1.2.

## Overview

The App Merge UI includes 9 core reusable components that implement the design system defined in [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md). All components are globally registered Vue components available throughout the application.

---

## 1. MergeButton

Standardized button component with multiple variants and sizes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | String | `'primary'` | Button style: `primary`, `secondary`, `danger`, `success`, `warning`, `info` |
| `size` | String | `'md'` | Button size: `sm`, `md`, `lg` |
| `disabled` | Boolean | `false` | Disable button interaction |
| `loading` | Boolean | `false` | Show loading spinner and disable button |
| `block` | Boolean | `false` | Make button full width |
| `outline` | Boolean | `false` | Use outline style instead of solid |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | Event | Emitted when button is clicked |

### Usage Examples

```vue
<!-- Primary button (default) -->
<merge-button @click="handleClick">
  Click Me
</merge-button>

<!-- Danger button with loading state -->
<merge-button
  variant="danger"
  :loading="deleting"
  @click="handleDelete"
>
  Delete
</merge-button>

<!-- Large outline secondary button -->
<merge-button
  variant="secondary"
  size="lg"
  outline
>
  Cancel
</merge-button>

<!-- Small block button -->
<merge-button
  size="sm"
  block
  variant="success"
>
  Save
</merge-button>
```

### Accessibility

- Uses semantic `<button>` element
- Disabled state prevents interaction
- Loading state shows spinner with descriptive text
- Can be used with `type="submit"` for forms

---

## 2. MergeCard

Card container component with header, body, and footer sections.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | - | Card title (displayed in header) |
| `subtitle` | String | - | Card subtitle (displayed under title) |
| `noPadding` | Boolean | `false` | Remove padding from card body |
| `shadow` | String | `'md'` | Shadow depth: `sm`, `md`, `lg`, `xl` |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Card body content |
| `header` | Custom header content (overrides title/subtitle) |
| `footer` | Card footer content |

### Usage Examples

```vue
<!-- Basic card with title -->
<merge-card title="Screen Selection">
  <p>Select the screens you want to merge.</p>
</merge-card>

<!-- Card with title, subtitle, and footer -->
<merge-card
  title="Merge Summary"
  subtitle="Review your selections"
  shadow="lg"
>
  <p>5 screens selected</p>
  <p>3 data sources selected</p>

  <template #footer>
    <merge-button variant="primary">
      Start Merge
    </merge-button>
  </template>
</merge-card>

<!-- Card with custom header -->
<merge-card noPadding>
  <template #header>
    <div class="custom-header">
      <h3>Custom Header</h3>
      <merge-button size="sm">Action</merge-button>
    </div>
  </template>

  <!-- Table or other content that shouldn't have padding -->
  <table class="table">
    <!-- ... -->
  </table>
</merge-card>
```

### Accessibility

- Uses semantic HTML structure
- Header section uses `<h3>` for title
- Maintains proper heading hierarchy

---

## 3. MergeAlert

Alert/notification box for displaying messages to users.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | String | `'info'` | Alert type: `info`, `success`, `warning`, `danger` |
| `dismissible` | Boolean | `false` | Show close button to dismiss alert |
| `icon` | String | - | Custom icon class (overrides default icon) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when alert is dismissed |

### Usage Examples

```vue
<!-- Info alert (default) -->
<merge-alert>
  This is an informational message.
</merge-alert>

<!-- Success alert with default icon -->
<merge-alert type="success">
  Merge completed successfully!
</merge-alert>

<!-- Warning alert that can be dismissed -->
<merge-alert
  type="warning"
  dismissible
  @close="handleDismiss"
>
  Lock will expire in 2 minutes.
</merge-alert>

<!-- Danger alert with custom icon -->
<merge-alert
  type="danger"
  icon="fa-exclamation-triangle"
>
  <strong>Error:</strong> Failed to load apps.
</merge-alert>
```

### Default Icons

- `info`: `fa-info-circle`
- `success`: `fa-check-circle`
- `warning`: `fa-exclamation-triangle`
- `danger`: `fa-times-circle`

### Accessibility

- Uses `role="alert"` for screen readers
- Dismissible alerts have proper button semantics
- Icons have `aria-hidden="true"`

---

## 4. MergeModal

Modal dialog overlay for focused user interactions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | Boolean | `false` | Control modal visibility |
| `title` | String | - | Modal title |
| `size` | String | `'md'` | Modal size: `sm`, `md`, `lg`, `xl` |
| `closeOnBackdrop` | Boolean | `true` | Allow closing by clicking backdrop |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:show` | Boolean | Emitted when modal should close (use with `v-model:show`) |
| `close` | - | Emitted when modal is closed |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Modal body content |
| `footer` | Modal footer content (typically buttons) |

### Usage Examples

```vue
<!-- Basic modal -->
<merge-modal
  :show="showModal"
  title="Confirm Action"
  @close="showModal = false"
>
  <p>Are you sure you want to proceed?</p>

  <template #footer>
    <merge-button variant="secondary" @click="showModal = false">
      Cancel
    </merge-button>
    <merge-button variant="primary" @click="confirm">
      Confirm
    </merge-button>
  </template>
</merge-modal>

<!-- Large modal that can't be closed by backdrop click -->
<merge-modal
  :show="showWizard"
  title="Merge Wizard"
  size="lg"
  :close-on-backdrop="false"
  @close="confirmClose"
>
  <!-- Wizard content -->
</merge-modal>

<!-- Using v-model -->
<merge-modal
  v-model:show="showModal"
  title="Details"
>
  <!-- Content -->
</merge-modal>
```

### Modal Sizes

- `sm`: 400px max width
- `md`: 600px max width (default)
- `lg`: 900px max width
- `xl`: 1200px max width

### Accessibility

- Uses `role="dialog"` and `aria-modal="true"`
- Title linked via `aria-labelledby`
- Traps focus within modal
- ESC key closes modal
- Restores focus when closed

---

## 5. MergeBadge

Small status indicator badges.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | String | `'secondary'` | Badge color: `primary`, `secondary`, `success`, `warning`, `danger`, `info` |
| `pill` | Boolean | `false` | Use pill shape (fully rounded) |
| `size` | String | `'md'` | Badge size: `sm`, `md`, `lg` |

### Usage Examples

```vue
<!-- Default badge -->
<merge-badge>
  New
</merge-badge>

<!-- Success badge -->
<merge-badge variant="success">
  Ready to Merge
</merge-badge>

<!-- Pill-shaped warning badge -->
<merge-badge variant="warning" pill>
  Conflict
</merge-badge>

<!-- Small danger badge -->
<merge-badge variant="danger" size="sm">
  Error
</merge-badge>

<!-- Count badges -->
<merge-badge variant="primary" pill>
  {{ selectedCount }}
</merge-badge>
```

### Color Variants

- `primary`: Blue (Fliplet brand color)
- `secondary`: Gray
- `success`: Green (copy/ready status)
- `warning`: Orange (overwrite/caution)
- `danger`: Red (conflict/error)
- `info`: Blue (informational)

---

## 6. MergeProgressBar

Progress indicator for showing task completion.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | Number | **required** | Progress percentage (0-100) |
| `variant` | String | `'primary'` | Progress bar color: `primary`, `success`, `warning`, `danger` |
| `striped` | Boolean | `false` | Show striped pattern |
| `animated` | Boolean | `false` | Animate striped pattern |
| `showLabel` | Boolean | `false` | Display percentage text |

### Usage Examples

```vue
<!-- Basic progress bar -->
<merge-progress-bar :value="progress" />

<!-- Progress bar with label -->
<merge-progress-bar
  :value="progress"
  variant="success"
  show-label
/>

<!-- Animated striped progress bar -->
<merge-progress-bar
  :value="progress"
  striped
  animated
/>

<!-- Indeterminate progress (for unknown duration) -->
<merge-progress-bar
  :value="100"
  variant="primary"
  striped
  animated
/>
```

### Accessibility

- Uses `role="progressbar"`
- Includes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Updates announced to screen readers

---

## 7. MergeStepper

Multi-step progress indicator for wizards and flows.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | Array | **required** | Array of step objects: `[{ label, complete }, ...]` |
| `currentStep` | Number | **required** | Index of current step (0-based) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `step-click` | Number | Emitted when a step is clicked (index) |

### Usage Examples

```vue
<template>
  <merge-stepper
    :steps="steps"
    :current-step="currentStep"
    @step-click="goToStep"
  />
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      steps: [
        { label: 'Select Source', complete: true },
        { label: 'Select Destination', complete: false },
        { label: 'Choose Items', complete: false },
        { label: 'Review', complete: false },
        { label: 'Execute', complete: false }
      ]
    };
  },
  methods: {
    goToStep(index) {
      // Only allow navigation to completed steps
      if (index < this.currentStep) {
        this.currentStep = index;
      }
    },
    nextStep() {
      this.steps[this.currentStep].complete = true;
      this.currentStep++;
    }
  }
}
</script>
```

### Step Object Structure

```javascript
{
  label: 'Step Name',  // Display label
  complete: false      // Whether step is completed
}
```

### Visual States

- **Active step**: Primary color, current position
- **Completed step**: Green color, checkmark icon
- **Future step**: Gray color, step number
- **Clickable**: Completed steps can be clicked to navigate back

---

## 8. MergeLoadingSpinner

Loading state indicator with optional message.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | String | `'md'` | Spinner size: `sm`, `md`, `lg` |
| `overlay` | Boolean | `false` | Show as full-screen overlay |
| `message` | String | - | Optional loading message |

### Usage Examples

```vue
<!-- Small inline spinner -->
<merge-loading-spinner size="sm" />

<!-- Default spinner with message -->
<merge-loading-spinner message="Loading apps..." />

<!-- Large spinner with overlay -->
<merge-loading-spinner
  size="lg"
  overlay
  message="Processing merge..."
/>

<!-- Loading state in component -->
<div v-if="loading">
  <merge-loading-spinner message="Loading data..." />
</div>
<div v-else>
  <!-- Data content -->
</div>
```

### Accessibility

- Uses `aria-busy="true"` on parent container
- Message announced to screen readers
- Spinner uses `fa-spinner fa-spin` icon

---

## 9. MergeLockTimer

Countdown timer for lock expiry with auto-extend functionality.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lockedUntil` | Number | **required** | Timestamp (ms) when lock expires |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `expired` | - | Emitted when lock expires |
| `extend` | - | Emitted when user clicks extend button |

### Usage Examples

```vue
<template>
  <merge-lock-timer
    v-if="lock"
    :locked-until="lock.expiresAt"
    @expired="handleLockExpiry"
    @extend="extendLock"
  />
</template>

<script>
import { computed } from 'vue';

export default {
  setup() {
    const lock = computed(() => window.MergeState.lock);

    const handleLockExpiry = () => {
      alert('Lock has expired!');
      // Handle expiry (redirect, show modal, etc.)
    };

    const extendLock = async () => {
      try {
        const extended = await window.MergeAPI.extendLock({
          appId: window.MergeState.destinationApp.id,
          lockId: lock.value.id,
          duration: 900 // 15 minutes
        });

        window.MergeState.lock = extended;
      } catch (err) {
        console.error('Failed to extend lock:', err);
      }
    };

    return { lock, handleLockExpiry, extendLock };
  }
}
</script>
```

### Additional Examples

#### Testing Different States

```vue
<template>
  <div class="timer-states-demo">
    <h4>Normal State (5 minutes remaining):</h4>
    <merge-lock-timer
      :locked-until="Date.now() + (5 * 60 * 1000)"
      @expired="handleExpiry"
      @extend="handleExtend"
    />
    <!-- Renders: "🕐 Lock expires in: 5:00" -->

    <h4>Warning State (90 seconds remaining):</h4>
    <merge-lock-timer
      :locked-until="Date.now() + (90 * 1000)"
      @expired="handleExpiry"
      @extend="handleExtend"
    />
    <!-- Renders: "🕐 Lock expires in: 1:30 [Extend Lock]" (orange background) -->

    <h4>Expired State:</h4>
    <merge-lock-timer
      :locked-until="Date.now() - 60000"
      @expired="handleExpiry"
    />
    <!-- Renders: "⚠️ Lock Expired! Please return to the dashboard." (red background) -->
  </div>
</template>

<script>
export default {
  setup() {
    const handleExpiry = () => {
      console.log('Lock expired - redirecting to dashboard');
      Fliplet.Navigate.screen(123); // Redirect to dashboard
    };

    const handleExtend = async () => {
      console.log('Extending lock...');
      // API call to extend lock
    };

    return { handleExpiry, handleExtend };
  }
}
</script>
```

### Visual States & Content Display

The timer uses mutually exclusive display logic to prevent contradictory messages.

#### Normal State (> 2 minutes remaining)
- **Background**: Gray (#f8f9fa)
- **Border**: Standard gray border
- **Display**:
  - Clock icon (`fa-clock-o`)
  - "Lock expires in: MM:SS"
- **Hidden**:
  - Extend button
  - Expired message

#### Warning State (< 2 minutes remaining)
- **Background**: Orange/yellow (#fff3cd)
- **Border**: Yellow (#ffeaa7)
- **Text Color**: Dark yellow (#856404)
- **Display**:
  - Clock icon (`fa-clock-o`)
  - "Lock expires in: MM:SS"
  - "Extend Lock" button (primary action)
- **Hidden**:
  - Expired message

#### Expired State (0:00 remaining)
- **Background**: Red/pink (#f8d7da)
- **Border**: Pink (#f5c6cb)
- **Text Color**: Dark red (#721c24)
- **Display**:
  - Warning icon (`fa-exclamation-triangle`)
  - "Lock Expired! Please return to the dashboard."
- **Hidden**:
  - Timer countdown
  - Extend button

**State Transition Pattern**: The component uses `<template v-if>` / `<template v-else>` to ensure only one message is shown at a time, preventing conflicting information like "Lock expires in: 0:00" appearing alongside "Lock Expired!"

### Timer Format

Displays time as `MM:SS` (e.g., `14:32`, `2:05`, `0:30`)

### Accessibility

- Updates announced to screen readers at warning thresholds
- Extend button is keyboard accessible
- Time remaining visible and announced

---

## Global Registration

All components are registered via the `window.registerMergeComponents()` function which is called on each Vue app instance:

```javascript
// In Global JS - Component Registration Function
window.registerMergeComponents = function(app) {
  app.component('merge-button', { /* ... */ });
  app.component('merge-card', { /* ... */ });
  app.component('merge-alert', { /* ... */ });
  app.component('merge-modal', { /* ... */ });
  app.component('merge-badge', { /* ... */ });
  app.component('merge-progress-bar', { /* ... */ });
  app.component('merge-stepper', { /* ... */ });
  app.component('merge-loading-spinner', { /* ... */ });
  app.component('merge-lock-timer', { /* ... */ });
  return app;
};
```

## Component Naming Convention

All components use the `merge-` prefix to avoid conflicts with other libraries and clearly identify App Merge UI components.

## Styling

All components use design tokens from [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md). Component styles are defined in Global CSS and use CSS custom properties for consistency.

## Related Documentation

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Design tokens and visual specifications
- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md) - Component structure templates
- [implementation/phase-1-foundation/1.2-design-system.md](../implementation/phase-1-foundation/1.2-design-system.md) - Component implementation details
- [AGENT_GUIDELINES.md](../AGENT_GUIDELINES.md) - Development rules

---

**Last Updated**: December 18, 2024
**Status**: Phase 2 Complete
**Version**: 1.0
