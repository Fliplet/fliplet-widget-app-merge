# Handlebars Conflicts in Fliplet Screens

## Critical Issue

**Screen HTML in Fliplet is processed by Handlebars rendering engine before Vue.js sees it.**

This means Vue's text interpolation syntax `{{ }}` will be interpreted as Handlebars tags, not Vue directives.

## The Problem

```vue
<!-- This won't work! -->
<div id="app">
  <span>{{ message }}</span>  <!-- Handlebars processes this first -->
  <span>{{ count }}</span>     <!-- Vue never sees these -->
</div>
```

**What happens**:
1. Fliplet's Handlebars engine processes the HTML first
2. Handlebars looks for `{{ message }}` and `{{ count }}` in its context
3. Finds nothing, replaces with empty strings
4. Vue receives: `<span></span><span></span>`
5. Vue's reactivity never kicks in!

## The Solution

**Use Vue directives instead of text interpolation:**

```vue
<!-- ✅ This works! -->
<div id="app">
  <span v-text="message"></span>  <!-- Vue directive, Handlebars ignores it -->
  <span v-text="count"></span>     <!-- Vue processes after Handlebars -->
</div>
```

## Directive Reference

| Vue Syntax | Use Instead | Example |
|------------|-------------|---------|
| `{{ value }}` | `v-text="value"` | `<span v-text="userName"></span>` |
| `{{{ html }}}` | `v-html="html"` | `<div v-html="content"></div>` |
| `{{ a }} {{ b }}` | Multiple `v-text` | `<span v-text="a"></span> <span v-text="b"></span>` |

## Complex Cases

### Mixing Static and Dynamic Text

```vue
<!-- ❌ WRONG -->
<p>Hello, {{ userName }}!</p>

<!-- ✅ CORRECT -->
<p>Hello, <span v-text="userName"></span>!</p>
```

### Conditional Text

```vue
<!-- ❌ WRONG -->
<span>{{ isOnline ? 'Online' : 'Offline' }}</span>

<!-- ✅ CORRECT - Use computed property -->
<span v-text="statusText"></span>

// In script:
computed: {
  statusText() {
    return this.isOnline ? 'Online' : 'Offline';
  }
}
```

### Lists

```vue
<!-- ❌ WRONG -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>

<!-- ✅ CORRECT -->
<li v-for="item in items" :key="item.id" v-text="item.name"></li>

<!-- ✅ ALSO CORRECT - For complex content -->
<li v-for="item in items" :key="item.id">
  <span v-text="item.name"></span> - <span v-text="item.status"></span>
</li>
```

## When Escape Is Unavoidable

If you absolutely must use text interpolation (not recommended):

```vue
<!-- Escape with backslash -->
<span>\{{ userName }}</span>

<!-- Handlebars passes "{{ userName }}" through to Vue -->
```

**But prefer `v-text` - it's clearer and more reliable!**

## Verified in Project

### ✅ Design System Showcase (Screen 1858108)
- Uses only Vue directives (`:value`, `@click`, etc.)
- No text interpolation - no conflicts!

### ✅ API Tester (Screen 1858266)
- Originally planned with `{{ }}` syntax
- **Fixed** to use `v-text` throughout
- Working correctly with Handlebars

## Documentation Updates

This pattern is now documented in:
- ✅ `docs/AGENT_GUIDELINES.md` - Section 6: Avoid Handlebars Conflicts
- ✅ `docs/HANDLEBARS_CONFLICTS.md` - This comprehensive guide
- ✅ All future screens will follow this pattern

## Testing Checklist

When creating new screens:

- [ ] No `{{ }}` syntax in HTML templates
- [ ] Use `v-text` for dynamic text
- [ ] Use `v-html` for HTML content
- [ ] Use computed properties for complex expressions
- [ ] Test that Vue reactivity works correctly
- [ ] Verify output isn't empty/undefined

## Additional Notes

### API Calls in Fliplet Apps

When making API calls, always use `Fliplet.API.request()` instead of raw `fetch()`:

```javascript
// ✅ CORRECT - Use Fliplet's API method
Fliplet.API.request({
  url: 'v1/apps',
  method: 'GET'
}).then(function(response) {
  console.log(response);
});

// ❌ WRONG - Raw fetch may have auth issues
fetch('https://api.fliplet.com/v1/apps').then(...)
```

The `Fliplet.API.request()` method automatically:
- Handles authentication tokens
- Manages base URLs and environments
- Provides consistent error handling
- Works across all Fliplet regions

## Summary

**Golden Rules for Fliplet Apps**:
1. Use Vue **directives** (`v-text`, `v-html`), never text **interpolation** (`{{ }}`  or `{{{ }}}`)
2. Use `Fliplet.API.request()` for API calls, never raw `fetch()`

This avoids Handlebars conflicts and ensures proper authentication in Fliplet's environment.
