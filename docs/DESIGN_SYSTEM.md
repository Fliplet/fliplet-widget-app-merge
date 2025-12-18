# App Merge UI - Design System

This document defines the visual language for the App Merge UI, accessible to designers, developers, and non-technical stakeholders.

## Overview

The App Merge UI uses a consistent design system based on Fliplet's brand colors and patterns. All components use CSS custom properties (design tokens) defined in Global CSS.

For project context and technical architecture, see [README.md](README.md).

---

## Color Palette

### Primary Colors

#### Fliplet Blue
- **Hex**: `#00abd1`
- **Token**: `--primary-color`
- **Usage**: Primary actions, links, selected states, focus indicators
- **Examples**: "Next" button, "Start Merge" button, active tab underline

#### Secondary Gray
- **Hex**: `#36344c`
- **Token**: `--secondary-color`
- **Usage**: Body text, headings, borders, disabled states
- **Examples**: Card text, table headers, form labels

### Status Colors (Merge Operations)

#### Success Green
- **Hex**: `#19cd9d` / `#4caf50`
- **Tokens**: `--success-color`, `--status-copy`
- **Usage**: "Copy" operations, successful states, confirmation messages
- **Examples**: Items being copied (no conflicts), success badges, checkmarks

#### Warning Orange
- **Hex**: `#ed9119` / `#ff9800`
- **Tokens**: `--warning-color`, `--status-overwrite`
- **Usage**: "Overwrite" operations, caution states, important warnings
- **Examples**: Items that will replace existing data, lock expiry warnings

#### Danger Red
- **Hex**: `#e03629` / `#f44336`
- **Tokens**: `--danger-color`, `--status-conflict`
- **Usage**: "Conflict" states, destructive actions, critical errors
- **Examples**: Items that can't be merged, "Cancel merge" button, error alerts

#### Info Blue
- **Hex**: `#4e5169` / `#2196f3`
- **Tokens**: `--info-color`, `--status-partial`
- **Usage**: Informational messages, "partial" merge mode (structure only)
- **Examples**: Data source structure-only mode, help text

### When to Use Each Color

| Scenario | Color | Example |
|----------|-------|---------|
| Primary action (proceed) | Blue | "Next", "Start Merge" buttons |
| Item will be copied | Green | Screen with no conflicts |
| Item will overwrite existing | Orange | Screen with same name in destination |
| Item has conflict / can't merge | Red | Screen with dependency conflicts |
| Cancel / destructive action | Red | "Cancel merge", "Delete" buttons |
| Informational | Blue/Gray | Help text, tooltips |
| Success confirmation | Green | "Merge complete!" message |

---

## Typography

### Font Family
- **Primary**: `"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Token**: `--font-family`
- **Fallback**: System sans-serif

### Font Sizes

| Size | Value | Token | Usage |
|------|-------|-------|-------|
| Tiny | 11px | `--font-size-xs` | Timestamps, footnotes |
| Small | 12px | `--font-size-sm` | Helper text, labels |
| Base | 14px | `--font-size-base` | Body text, descriptions |
| Large | 16px | `--font-size-lg` | Emphasized text, large buttons |
| XL | 20px | `--font-size-xl` | H2 headings, subheadings |
| XXL | 24px | `--font-size-xxl` | H1 headings, screen titles |

### Font Weights

| Weight | Value | Token | Usage |
|--------|-------|-------|-------|
| Normal | 400 | `--font-weight-normal` | Body text |
| Medium | 500 | `--font-weight-medium` | Emphasized text |
| Semibold | 600 | `--font-weight-semibold` | Buttons, labels, H3 |
| Bold | 700 | `--font-weight-bold` | H1, H2 headings |

### Line Heights

| Height | Value | Token | Usage |
|--------|-------|-------|-------|
| Tight | 1.2 | `--line-height-tight` | Headings |
| Normal | 1.5 | `--line-height-normal` | Body text |
| Relaxed | 1.75 | `--line-height-relaxed` | Long-form content |

### Typography Scale Examples

```css
/* H1 - Screen Titles */
.screen-title {
  font-size: var(--font-size-xxl);    /* 24px */
  font-weight: var(--font-weight-bold);  /* 700 */
  line-height: var(--line-height-tight);  /* 1.2 */
}

/* H2 - Section Headers */
.section-header {
  font-size: var(--font-size-xl);     /* 20px */
  font-weight: var(--font-weight-semibold);  /* 600 */
}

/* H3 - Card Titles */
.card-title {
  font-size: var(--font-size-lg);     /* 16px */
  font-weight: var(--font-weight-semibold);  /* 600 */
}

/* Body Text */
.body-text {
  font-size: var(--font-size-base);   /* 14px */
  font-weight: var(--font-weight-normal);  /* 400 */
  line-height: var(--line-height-normal);  /* 1.5 */
}

/* Small Text */
.helper-text {
  font-size: var(--font-size-sm);     /* 12px */
  color: var(--info-color);
}
```

---

## Spacing System

### Scale Values

| Name | Value | Token | Usage |
|------|-------|-------|-------|
| XS | 4px | `--spacing-xs` | Tight spacing, icon padding |
| SM | 8px | `--spacing-sm` | Compact spacing, button padding |
| MD | 16px | `--spacing-md` | Standard spacing, card padding |
| LG | 24px | `--spacing-lg` | Generous spacing, section gaps |
| XL | 32px | `--spacing-xl` | Large spacing, screen sections |
| XXL | 48px | `--spacing-xxl` | Extra large, between major sections |

### Usage Guidelines

```css
/* Card Padding */
.card {
  padding: var(--spacing-md);  /* 16px */
}

/* Button Padding */
.button {
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
}

/* Section Gap */
.section {
  margin-bottom: var(--spacing-lg);  /* 24px */
}

/* Screen Sections */
.screen-section {
  margin: var(--spacing-xl) 0;  /* 32px top/bottom */
}
```

### Spacing Utility Classes

Use these utility classes for quick spacing adjustments:

```css
/* Margin Top */
.mt-1  /* margin-top: 4px */
.mt-2  /* margin-top: 8px */
.mt-3  /* margin-top: 16px */
.mt-4  /* margin-top: 24px */
.mt-5  /* margin-top: 32px */

/* Margin Bottom */
.mb-1  /* margin-bottom: 4px */
.mb-2  /* margin-bottom: 8px */
.mb-3  /* margin-bottom: 16px */
.mb-4  /* margin-bottom: 24px */
.mb-5  /* margin-bottom: 32px */

/* Padding */
.p-0  /* padding: 0 */
.p-1  /* padding: 4px */
.p-2  /* padding: 8px */
.p-3  /* padding: 16px */
.p-4  /* padding: 24px */
.p-5  /* padding: 32px */
```

---

## Component Specifications

### MergeButton

Visual styles for button variants:

#### Primary Button
- **Background**: Blue (`--primary-color`)
- **Text**: White
- **Padding**: 8px 16px
- **Border Radius**: 4px
- **Font Weight**: 600
- **Hover**: Slightly darker blue
- **Usage**: Main actions ("Next", "Start Merge")

#### Secondary Button
- **Background**: White
- **Border**: 1px solid blue
- **Text**: Blue (`--primary-color`)
- **Padding**: 8px 16px
- **Hover**: Light blue background
- **Usage**: Secondary actions ("View Audit Log")

#### Danger Button
- **Background**: Red (`--danger-color`)
- **Text**: White
- **Padding**: 8px 16px
- **Hover**: Slightly darker red
- **Usage**: Destructive actions ("Cancel Merge")

#### Button Sizes
- **Small**: 6px 12px padding, 12px font size
- **Medium** (default): 8px 16px padding, 14px font size
- **Large**: 12px 24px padding, 16px font size

### MergeCard

Card container styling:

- **Background**: White
- **Border**: 1px solid `#dee2e6` (`--border-color`)
- **Border Radius**: 4px (`--border-radius`)
- **Padding**: 16px (`--spacing-md`)
- **Shadow**: `0 1px 3px rgba(0,0,0,0.12)` (`--shadow-sm`)

#### Card Variants
- **Default**: White background, subtle border
- **Highlighted**: Blue left border (4px wide)
- **Warning**: Orange left border
- **Error**: Red left border

### MergeBadge

Small status indicators:

- **Success (Green)**: Green background, white text
- **Warning (Orange)**: Orange background, white text
- **Danger (Red)**: Red background, white text
- **Info (Blue)**: Blue background, white text
- **Secondary (Gray)**: Gray background, white text

**Style**:
- Border Radius: 9999px (pill shape)
- Padding: 4px 8px
- Font Size: 11px
- Font Weight: 600
- Text Transform: None (as provided)

### MergeAlert

Alert/notification boxes:

- **Success**: Light green background (`#d4edda`), green left border (4px)
- **Warning**: Light orange background (`#fff3cd`), orange left border
- **Danger**: Light red background (`#f8d7da`), red left border
- **Info**: Light blue background (`#d1ecf1`), blue left border

**Style**:
- Border Width: 4px (left only)
- Border Radius: 4px
- Padding: 12px 16px
- Font Size: 14px

### MergeModal

Modal dialog styling:

- **Backdrop**: Semi-transparent black (`rgba(0,0,0,0.5)`)
- **Modal Background**: White
- **Border Radius**: 8px (`--border-radius-lg`)
- **Shadow**: Large shadow (`--shadow-xl`)
- **Max Width**: 600px
- **Padding**: 24px

### MergeProgressBar

Progress indicator:

- **Background**: Light gray (`#e9ecef`)
- **Fill**: Blue (`--primary-color`)
- **Height**: 8px
- **Border Radius**: 4px
- **Animation**: Smooth transition (250ms)

### MergeLockTimer

Countdown timer display:

- **Background**: Light orange (when < 5 minutes)
- **Text**: Orange or red (when < 2 minutes)
- **Font**: Monospace numbers
- **Size**: Medium (16px)
- **Update Frequency**: Every second

---

## Borders & Shadows

### Border Radius

| Name | Value | Token | Usage |
|------|-------|-------|-------|
| Small | 2px | `--border-radius-sm` | Inner elements |
| Base | 4px | `--border-radius` | Cards, buttons |
| Medium | 6px | `--border-radius-md` | Larger cards |
| Large | 8px | `--border-radius-lg` | Modals |
| XL | 12px | `--border-radius-xl` | Special components |
| Full | 9999px | `--border-radius-full` | Pills, badges |

### Shadows

| Name | Value | Token | Usage |
|------|-------|-------|-------|
| XS | `0 1px 2px rgba(0,0,0,0.05)` | `--shadow-xs` | Subtle |
| SM | `0 1px 3px rgba(0,0,0,0.12)` | `--shadow-sm` | Cards |
| MD | `0 4px 6px rgba(0,0,0,0.1)` | `--shadow-md` | Hover states |
| LG | `0 10px 20px rgba(0,0,0,0.15)` | `--shadow-lg` | Dropdowns |
| XL | `0 20px 25px rgba(0,0,0,0.15)` | `--shadow-xl` | Modals |

### Border Colors

- **Default**: `#dee2e6` (`--border-color`)
- **Light**: `#e9ecef` (`--border-color-light`)
- **Width**: `1px` (`--border-width`)

---

## Motion & Transitions

### Duration

| Name | Value | Token | Usage |
|------|-------|-------|-------|
| Fast | 150ms | `--transition-fast` | Hover effects |
| Base | 250ms | `--transition-base` | Standard transitions |
| Slow | 350ms | `--transition-slow` | Complex animations |

### Easing
- **Standard**: `ease-in-out`

### Examples

```css
/* Button Hover */
.button {
  transition: background-color var(--transition-fast);
}

/* Modal Fade In */
.modal {
  transition: opacity var(--transition-base);
}

/* Accordion Expand */
.accordion-panel {
  transition: max-height var(--transition-slow);
}
```

---

## Z-Index Scale

Layering order for overlapping elements:

| Element | Value | Token |
|---------|-------|-------|
| Dropdown | 1000 | `--z-dropdown` |
| Sticky | 1020 | `--z-sticky` |
| Fixed | 1030 | `--z-fixed` |
| Modal Backdrop | 1040 | `--z-modal-backdrop` |
| Modal | 1050 | `--z-modal` |
| Popover | 1060 | `--z-popover` |
| Tooltip | 1070 | `--z-tooltip` |

---

## Accessibility Requirements

### Color Contrast
- **Normal Text**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: 3:1 contrast with surroundings

### Focus Indicators
```css
.button:focus-visible,
.link:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows visual order
- Clear focus indicators on all focusable elements

### Screen Readers
- All images have descriptive `alt` text
- All form inputs have explicit `<label>` elements
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content

---

## Component State Patterns

This section defines how components should handle multiple visual states to ensure clear, non-contradictory user interfaces.

### Visibility Rules

#### Use Conditional Display Logic
- Use `v-if` for mutually exclusive content (not `v-show`)
- Ensures only one primary message is displayed per state
- Prevents contradictory information from appearing simultaneously

**Example - Poor Implementation:**
```vue
<!-- ❌ BAD: Both messages can appear at once -->
<div class="timer">
  <span>Lock expires in: {{ time }}</span>
  <span v-if="isExpired">Lock Expired!</span>
</div>
```

**Example - Good Implementation:**
```vue
<!-- ✅ GOOD: Mutually exclusive display -->
<div class="timer">
  <template v-if="!isExpired">
    <span>Lock expires in: {{ time }}</span>
  </template>
  <template v-else>
    <span>Lock Expired!</span>
  </template>
</div>
```

#### Progressive Disclosure
Components should reveal information and actions progressively as states change:

1. **Default State**: Show essential information only
2. **Warning State**: Add contextual actions (buttons, links)
3. **Critical/Completed State**: Replace with outcome message and next steps

**Example - Lock Timer Progression:**
- **Normal** (>2 min): Show countdown
- **Warning** (<2 min): Show countdown + "Extend Lock" button
- **Expired**: Replace all with "Lock Expired! Return to dashboard"

### State Messaging Patterns

#### Verb Tense by State
- **Active/In-Progress States**: Present tense
  - "Lock expires in 5:00"
  - "Merge is processing..."
- **Completed States**: Past tense + guidance
  - "Lock expired - please return to dashboard"
  - "Merge completed - view results"
- **Future/Scheduled States**: Future tense
  - "Will overwrite existing data"
  - "Changes will be applied"

#### One Primary Message Per State
Each component state should have **one clear primary message**, not multiple competing messages.

| ❌ Contradictory | ✅ Clear |
|-----------------|---------|
| "Lock expires in: 0:00" + "Lock Expired!" | "Lock Expired! Return to dashboard" |
| "Processing..." + "Complete!" | "Complete! 142 items merged" |
| "Loading..." + "Failed" | "Failed to load. Retry?" |

### Component-Specific Patterns

#### Stateful Components (Alerts, Timers, Progress)
- Define all possible states upfront
- Document what elements are **shown** and **hidden** in each state
- Specify state transition logic and triggers

#### Action Buttons in States
- **Available actions only**: Show buttons only when action is valid
- **Disabled vs Hidden**: Use `v-if` to hide unavailable actions (not `:disabled`)
- **State-specific buttons**: "Extend Lock" appears only in warning state, not normal or expired

### Implementation Checklist

When implementing stateful components:

- [ ] Define all possible visual states
- [ ] For each state, specify what is **shown** and **hidden**
- [ ] Use `v-if` / `v-else` for mutually exclusive content
- [ ] Ensure only one primary message per state
- [ ] Use appropriate verb tense for each state
- [ ] Show actions only when they're valid
- [ ] Document state transitions in component specifications

### Testing State Behavior

When testing components with time-based or dynamic states:

- **Use future timestamps** for countdown timers (not past timestamps)
- **Create test data** that demonstrates each state clearly
- **Verify state transitions** by observing real-time behavior
- **Check for contradictions** - ensure no conflicting messages appear

---

## Layout & Container

### Max Width
```css
.merge-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}
```

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

---

## Usage Examples

### Complete Component Example

```vue
<template>
  <merge-card class="example-card">
    <h2 class="card-title">Selected Items</h2>

    <div class="stats">
      <merge-badge variant="success">
        {{ screensCount }} screens
      </merge-badge>
      <merge-badge variant="warning">
        {{ dsCount }} data sources
      </merge-badge>
    </div>

    <merge-button
      variant="primary"
      @click="handleNext">
      Next
    </merge-button>
  </merge-card>
</template>

<style scoped>
.example-card {
  max-width: 600px;
  margin: var(--spacing-lg) auto;
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
  margin-bottom: var(--spacing-md);
}

.stats {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}
</style>
```

---

## Design Principles

1. **Consistency**: Use design tokens for all styling (no hardcoded values)
2. **Clarity**: Visual hierarchy guides users through merge process
3. **Feedback**: Color-coded statuses make merge operations obvious
4. **Accessibility**: All components meet WCAG AA standards
5. **Simplicity**: Clean, uncluttered interfaces

---
