# Phase 4: Polish & Studio Integration

## Overview

Final refinements including responsive design, accessibility, performance optimization, and Studio iframe integration.

## Duration

Days 15-17 (3 days)

## Tasks

### [4.1 Responsive Design](./4.1-responsive-design.md)

Ensure app works perfectly on all screen sizes:

**Breakpoints:**
```css
/* Mobile (default) */
@media (max-width: 767px) {
  .merge-container {
    padding: var(--spacing-sm);
  }

  /* Stack tables vertically */
  .fl-table {
    font-size: var(--font-size-sm);
  }

  /* Full-width buttons */
  .merge-btn {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .merge-container {
    padding: var(--spacing-md);
  }

  /* Two-column layout where appropriate */
  .merge-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .merge-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Three-column layout for cards */
  .merge-card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
  }
}
```

**Mobile Optimizations:**
- Hamburger menu for navigation
- Collapsible sections
- Touch-friendly buttons (min 44x44px)
- Horizontal scrolling for tables
- Bottom sheet modals

### [4.2 Accessibility](./4.2-accessibility.md)

Ensure WCAG 2.1 Level AA compliance:

**ARIA Labels:**
```html
<button
  aria-label="Select all screens"
  aria-pressed="false">
  <i class="fa fa-check"></i>
</button>

<div role="status" aria-live="polite">
  {{ statusMessage }}
</div>
```

**Keyboard Navigation:**
```javascript
// Tab order
$('.fl-table-row').attr('tabindex', '0');

// Keyboard handlers
$(document).on('keydown', '.fl-table-row', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    $(this).click();
  }
});
```

**Focus Management:**
```javascript
// Focus first interactive element in modal
$('.merge-modal').on('shown', function() {
  $(this).find('button, input, select').first().focus();
});

// Focus trap in modal
trapFocus('.merge-modal');
```

**Screen Reader Support:**
```html
<span class="sr-only">
  {{ screenReaderText }}
</span>

<div aria-describedby="help-text">
  <input type="text" />
  <small id="help-text">Enter organization name</small>
</div>
```

### [4.3 Performance Optimization](./4.3-performance.md)

Optimize for fast load times and smooth interactions:

**Lazy Loading:**
```javascript
// Load table data on scroll
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      loadMoreData();
    }
  });
});
```

**Debouncing:**
```javascript
// Debounce search input
var searchDebounced = MergeUtils.debounce(function(term) {
  searchTable(term);
}, 300);

$('#search-input').on('input', function() {
  searchDebounced($(this).val());
});
```

**Caching:**
```javascript
// Cache API responses
var cache = {};

function getCachedData(key, fetchFn) {
  if (cache[key]) {
    return Promise.resolve(cache[key]);
  }

  return fetchFn().then(function(data) {
    cache[key] = data;
    return data;
  });
}
```

**Optimize Re-renders:**
```javascript
// Only update changed rows
table.on('selection:change', function(detail) {
  // Update only affected rows instead of full re-render
  updateRowSelectionUI(detail.selected, detail.deselected);
});
```

### [4.4 Studio Integration](./4.4-studio-integration.md)

Integrate app as iframe in Studio:

**Receive Source App ID:**
```javascript
// Get from URL parameter
var sourceAppId = MergeUtils.getQueryParam('sourceAppId');
if (sourceAppId) {
  MergeState.sourceApp = { id: parseInt(sourceAppId) };
}
```

**Post Messages to Parent:**
```javascript
// Notify Studio of navigation
function notifyStudio(action, data) {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'app-merge',
      action: action,
      data: data
    }, '*');
  }
}

// Examples
notifyStudio('merge-started', { mergeId: 123 });
notifyStudio('merge-completed', { success: true });
notifyStudio('close-requested', {});
```

**Listen for Studio Messages:**
```javascript
window.addEventListener('message', function(event) {
  if (event.data.type === 'studio-action') {
    switch (event.data.action) {
      case 'close':
        cleanup();
        break;
      case 'refresh':
        location.reload();
        break;
    }
  }
});
```

**Handle Studio Theme:**
```javascript
// Apply Studio theme colors if provided
var studioTheme = MergeUtils.getQueryParam('theme');
if (studioTheme) {
  applyTheme(JSON.parse(decodeURIComponent(studioTheme)));
}
```

### [4.5 Testing & QA](./4.5-testing-qa.md)

Comprehensive testing across all scenarios:

**Test Scenarios:**

1. **Happy Path**
   - Select destination app
   - Configure merge with all options
   - Review and execute
   - Verify completion

2. **Cross-Organization Merge**
   - Different regions (US, EU)
   - Different permissions
   - Lock management across orgs

3. **Conflict Handling**
   - Duplicate screen names
   - Duplicate data source names
   - Plan limit warnings

4. **Lock Expiry**
   - Lock expires during configuration
   - Auto-extension works
   - Manual extension works
   - Warning shown at 2 minutes

5. **Network Failures**
   - API timeout
   - Connection lost
   - Resume after reconnection

6. **Large Apps**
   - 100+ screens
   - 50+ data sources
   - 1000+ files
   - Performance acceptable

7. **Empty Selections**
   - No screens selected
   - No data sources selected
   - Only app settings selected

8. **Cancel at Each Step**
   - Dashboard cancel
   - Destination selection cancel
   - Configuration cancel
   - Apps properly unlocked

**Browser Testing:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Device Testing:**
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## Verification Checklist

- [ ] Responsive on all screen sizes
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] ARIA labels correct
- [ ] Performance optimized
- [ ] No memory leaks
- [ ] Studio integration functional
- [ ] All test scenarios pass
- [ ] Cross-browser compatible
- [ ] No console errors
- [ ] Documentation complete

## Success Criteria

- ✅ Works on mobile, tablet, and desktop
- ✅ WCAG 2.1 Level AA compliant
- ✅ Page load < 3 seconds
- ✅ Smooth interactions (60fps)
- ✅ Embedded in Studio successfully
- ✅ All test scenarios pass
- ✅ No critical bugs
- ✅ Merge completes < 5 minutes

## Delivery

Once all verification criteria are met:

1. Final code review
2. Documentation review
3. User acceptance testing
4. Production deployment
5. Monitor for issues

