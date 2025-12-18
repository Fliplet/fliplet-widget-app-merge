# Fliplet.parseError() Standard

**Date**: December 18, 2025
**Status**: ✅ Implemented as Project Standard

## Summary

Adopted `Fliplet.parseError()` as the **standard method for extracting error messages** throughout the App Merge UI project. This built-in Fliplet utility provides robust error handling for all error formats.

---

## What Changed

### 1. API Tester Updated

**Before** (custom error handling):
```javascript
catch(err) {
  let errorData;
  if (err instanceof Error) {
    errorData = {
      type: 'Validation Error',
      message: err.message,  // Direct access
      stack: err.stack
    };
  } else {
    errorData = err;
  }
  // ...
}
```

**After** (using Fliplet.parseError):
```javascript
catch(err) {
  // Use Fliplet.parseError to extract error message
  const errorMessage = Fliplet.parseError(err, 'Unknown error occurred');

  let errorData;
  if (err instanceof Error) {
    errorData = {
      type: 'Validation Error',
      message: errorMessage,  // ✅ Robust extraction
      stack: err.stack
    };
  } else {
    errorData = err;
    if (!errorData.message) {
      errorData.message = errorMessage;
    }
  }
  // ...
}
```

---

### 2. Documentation Created

**New comprehensive guide**: [`docs/patterns/error-handling.md`](./docs/patterns/error-handling.md)

**Contents**:
- How `Fliplet.parseError()` works
- Supported error formats (string, object, array, XHR, nested structures)
- Standard error handling patterns
- Error display best practices
- Common mistakes to avoid
- Testing guidelines

**Key sections**:
- ✅ Use `Fliplet.parseError()` for all error messages
- ✅ Handles 7+ error formats automatically
- ✅ Recursively extracts from common error keys
- ✅ Provides fallback if no error found

---

### 3. Guidelines Updated

**Added to `AGENT_GUIDELINES.md`** - Section 8:

**Critical Rules**:
- ✅ Always use `Fliplet.parseError(error, fallback)`
- ❌ Never access `error.message` directly
- ❌ Never stringify Error objects

**Why**:
- Error properties are non-enumerable
- Nested error structures need recursive extraction
- Multiple error formats exist (XHR, API responses, validation errors)
- `Fliplet.parseError()` handles all cases robustly

---

### 4. Pattern Documentation Updated

**Updated `docs/patterns/README.md`**:
- Marked Error Handling as ⭐ **REQUIRED STANDARD**
- Added quick example
- Emphasized use of `Fliplet.parseError()`

---

## Why Fliplet.parseError()?

### Problem with Manual Error Handling

```javascript
// ❌ Fragile - only checks one property
const message = error.message || 'Error occurred';

// ❌ Doesn't work - Error objects stringify to {}
const errorData = JSON.stringify(error);  // Returns "{}"

// ❌ Misses nested errors
const message = error.responseJSON?.message || error.message || 'Error';
```

### Solution with Fliplet.parseError()

```javascript
// ✅ Robust - handles all error formats
const message = Fliplet.parseError(error, 'Error occurred');
```

### What It Handles

1. **String errors**: `"Something went wrong"`
2. **JSON strings**: `'{"message": "Invalid"}'`
3. **Error objects**: `new Error('Validation failed')`
4. **API responses**: `{status: 404, responseJSON: {message: "Not found"}}`
5. **Nested structures**: `{error: {description: "Permission denied"}}`
6. **XHR objects**: `{responseText: '{"error_message": "Unauthorized"}'}`
7. **Arrays**: `[{message: "Validation error"}]`

### Extraction Order

Checks error properties in this order:
1. `responseJSON`
2. `message`
3. `error_message`
4. `description`
5. `responseText`
6. `error`

Recursively extracts from the first one that exists.

---

## Standard Pattern

**Golden Rule**: Always use `Fliplet.parseError()` for error messages.

```javascript
try {
  // Your operation
  await MergeAPI.someFunction();
} catch (error) {
  // Extract message with Fliplet.parseError
  const message = Fliplet.parseError(error, 'Operation failed');

  // Use for display
  this.error = message;

  // Log full error for debugging
  console.error('Operation failed:', {
    message: message,
    error: error,
    context: {...}
  });
}
```

---

## Benefits

### For Developers

✅ **Consistent**: Same pattern everywhere
✅ **Robust**: Handles all error formats
✅ **Maintainable**: One standard approach
✅ **Reliable**: Proven Fliplet utility

### For Users

✅ **Clear messages**: Always get readable error text
✅ **Better UX**: No empty error displays
✅ **Helpful feedback**: Actionable error information

### For Debugging

✅ **Full context**: Original error preserved in logs
✅ **Clean extraction**: Message separated from technical details
✅ **Type safety**: Works with any error type

---

## Files Updated

### Implementation
1. ✅ **API Tester (Screen 1858266)** - JavaScript error handling

### Documentation
2. ✅ **`docs/patterns/error-handling.md`** - Comprehensive new guide (470+ lines)
3. ✅ **`docs/AGENT_GUIDELINES.md`** - Section 8: Use Fliplet.parseError()
4. ✅ **`docs/patterns/README.md`** - Marked as required standard
5. ✅ **`docs/implementation/phase-1-foundation/1.8-api-tester-error-display.md`** - Updated with Fliplet.parseError()
6. ✅ **`PROJECT_STATUS.md`** - Reflected standard adoption
7. ✅ **`FLIPLET_PARSE_ERROR_STANDARD.md`** - This document

---

## Testing

### Validation Errors
```javascript
// Test: getAppDetails() with no appId
// Expected: "appId is required" extracted correctly
```

### API Errors
```javascript
// Test: getAppDetails(999999)
// Expected: "App not found" extracted from 404 response
```

### Session Errors
```javascript
// Test: getOrganizationApps() with no session
// Expected: "User session not found..." extracted correctly
```

---

## Future Usage

**All error handling in the app should follow this pattern**:

```javascript
// ✅ API calls
try {
  const result = await MergeAPI.lockApps(sourceId, targetId);
} catch (error) {
  const message = Fliplet.parseError(error, 'Failed to lock apps');
  Fliplet.UI.Toast({ message: message, type: 'error' });
}

// ✅ Validation errors
try {
  await this.validateMergeConfig();
} catch (error) {
  const message = Fliplet.parseError(error, 'Configuration invalid');
  this.configError = message;
}

// ✅ Background operations
try {
  await MergeAPI.extendLock(sourceId, targetId);
} catch (error) {
  console.warn('Lock extension failed:', Fliplet.parseError(error));
}
```

---

## Related Documentation

- **[Error Handling Patterns](./docs/patterns/error-handling.md)** - Complete guide (READ THIS!)
- **[Agent Guidelines](./docs/AGENT_GUIDELINES.md)** - Section 8
- **[API Tester Error Display](./docs/implementation/phase-1-foundation/1.8-api-tester-error-display.md)** - Implementation example
- **[Fliplet Core - core.js:5964](https://github.com/Fliplet/fliplet-api/blob/master/public/assets/fliplet-core/1.0/core.js#L5964)** - Source implementation

---

## Summary

**What**: `Fliplet.parseError()` is now the **standard** for all error message extraction.

**Why**: Robust, consistent, handles all error formats, proven utility.

**How**: Always use `Fliplet.parseError(error, fallback)` instead of accessing error properties directly.

**Where**: Every `catch` block in the app should use this pattern.

**Result**: Better error handling, clearer messages, more maintainable code.

---

**Standard Adopted**: ✅ December 18, 2025
**Status**: Active project standard
