# Error Handling Patterns

**Updated**: December 18, 2025

## Overview

Standard patterns for handling errors in the App Merge UI, leveraging Fliplet's built-in error utilities.

---

## Use Fliplet.parseError() for Error Messages

**Always use `Fliplet.parseError()` to extract error messages** from error objects. It's a robust utility that handles various error formats.

### Why Use It?

```javascript
// ❌ Manual error handling - fragile
const message = err.message || err.error_message || err.description || 'Error occurred';

// ✅ Use Fliplet.parseError() - robust
const message = Fliplet.parseError(err, 'Error occurred');
```

**Benefits**:
- Handles nested error structures automatically
- Supports multiple error formats (string, object, array, XHR)
- Recursively extracts from common error keys
- Provides fallback if no error found
- Avoids HTML document responses

---

## How Fliplet.parseError() Works

**Function signature**:
```javascript
Fliplet.parseError(error, defaultError)
```

**Parameters**:
- `error` - Error object, string, array, or any error response
- `defaultError` - Fallback message if no error found (optional)

**Returns**: String error message

### Supported Error Formats

**1. String errors**:
```javascript
const err = "Something went wrong";
Fliplet.parseError(err);  // Returns: "Something went wrong"
```

**2. JSON strings**:
```javascript
const err = '{"message": "Invalid request"}';
Fliplet.parseError(err);  // Returns: "Invalid request"
```

**3. Error objects**:
```javascript
const err = new Error('Validation failed');
Fliplet.parseError(err);  // Returns: "Validation failed"
```

**4. API error responses**:
```javascript
const err = {
  status: 404,
  responseJSON: {
    message: "App not found"
  }
};
Fliplet.parseError(err);  // Returns: "App not found"
```

**5. Nested error structures**:
```javascript
const err = {
  error: {
    description: "Permission denied"
  }
};
Fliplet.parseError(err);  // Returns: "Permission denied"
```

**6. XHR error objects**:
```javascript
const err = {
  responseText: '{"error_message": "Unauthorized"}'
};
Fliplet.parseError(err);  // Returns: "Unauthorized"
```

**7. Single-element arrays**:
```javascript
const err = [{message: "Validation error"}];
Fliplet.parseError(err);  // Returns: "Validation error"
```

### Extraction Order

`Fliplet.parseError()` checks error properties in this order:
1. `responseJSON`
2. `message`
3. `error_message`
4. `description`
5. `responseText`
6. `error`

It recursively extracts from the first property that exists.

---

## Standard Error Handling Patterns

### 1. API Calls with User Feedback

```javascript
try {
  const result = await MergeAPI.getAppDetails(appId);
  this.app = result.app;
} catch (error) {
  const errorMessage = Fliplet.parseError(error, 'Failed to load app details');

  // Show user-friendly error
  Fliplet.UI.Toast({
    message: errorMessage,
    type: 'error'
  });

  // Log full error for debugging
  console.error('getAppDetails failed:', error);

  // Store for UI display
  this.error = errorMessage;
}
```

### 2. Validation Errors from Middleware

```javascript
try {
  const result = await MergeAPI.lockApps(sourceAppId, targetAppId);
  this.lockInfo = result.lock;
} catch (error) {
  const errorMessage = Fliplet.parseError(error, 'Failed to lock apps');

  // Check if it's a validation error
  if (error instanceof Error) {
    // Client-side validation (e.g., "sourceAppId is required")
    this.validationError = errorMessage;
  } else {
    // API error
    this.apiError = errorMessage;
  }
}
```

### 3. Silent Error Handling (Background Operations)

```javascript
try {
  await MergeAPI.extendLock(sourceAppId, targetAppId);
  console.log('Lock extended successfully');
} catch (error) {
  // Don't interrupt user flow, just log
  const errorMessage = Fliplet.parseError(error, 'Failed to extend lock');
  console.warn('Lock extension failed:', errorMessage, error);
}
```

### 4. Error Recovery with Fallback

```javascript
let apps = [];

try {
  const result = await MergeAPI.getApps();
  apps = result.apps;
} catch (error) {
  const errorMessage = Fliplet.parseError(error, 'Failed to load apps');
  console.error('getApps failed:', errorMessage);

  // Fallback to cached data
  apps = await MergeStorage.get('cachedApps') || [];

  if (apps.length === 0) {
    // No fallback available - notify user
    this.error = errorMessage;
  }
}
```

### 5. Multiple Error Sources

```javascript
try {
  // Might throw validation error OR API error
  const result = await MergeAPI.executeMerge(sourceAppId, config);
  this.mergeId = result.mergeId;
} catch (error) {
  // Fliplet.parseError handles both gracefully
  const errorMessage = Fliplet.parseError(error, 'Merge failed');

  // Categorize for UI
  this.error = {
    message: errorMessage,
    isValidation: error instanceof Error,
    statusCode: error.status,
    timestamp: Date.now()
  };
}
```

---

## Error Display Best Practices

### 1. Show User-Friendly Messages

```javascript
// ❌ Don't show raw technical errors to users
this.error = error.stack;

// ✅ Extract clean message
this.error = Fliplet.parseError(error, 'Something went wrong');
```

### 2. Provide Context

```javascript
// ❌ Generic message
Fliplet.UI.Toast({ message: 'Error occurred', type: 'error' });

// ✅ Contextual message
const errorMessage = Fliplet.parseError(error, 'Failed to save');
Fliplet.UI.Toast({
  message: 'Unable to save merge configuration: ' + errorMessage,
  type: 'error'
});
```

### 3. Log Full Errors for Debugging

```javascript
catch (error) {
  // Extract clean message for user
  const userMessage = Fliplet.parseError(error, 'An error occurred');
  this.showError(userMessage);

  // Log full error for developers
  console.error('Operation failed:', {
    message: userMessage,
    error: error,
    context: {
      appId: this.appId,
      user: Fliplet.User.getCachedSession()?.user?.email
    }
  });
}
```

### 4. Differentiate Error Types

```javascript
catch (error) {
  const errorMessage = Fliplet.parseError(error, 'Operation failed');

  if (error instanceof Error) {
    // Client-side error (validation, logic)
    this.showWarning(errorMessage);
  } else if (error.status >= 500) {
    // Server error
    this.showError('Server error: ' + errorMessage);
  } else if (error.status >= 400) {
    // Client error (permissions, not found, etc.)
    this.showError(errorMessage);
  } else {
    // Unknown error
    this.showError('Unexpected error: ' + errorMessage);
  }
}
```

---

## Error Object Structure

### Validation Errors (Middleware)

```javascript
try {
  await MergeAPI.getAppDetails();  // Missing appId
} catch (error) {
  // error instanceof Error === true
  // error.message === "appId is required"
  // Fliplet.parseError(error) === "appId is required"
}
```

### API Errors (Server)

```javascript
try {
  await MergeAPI.getAppDetails(999999);  // Non-existent app
} catch (error) {
  // error.status === 404
  // error.message === "App not found"
  // Fliplet.parseError(error) === "App not found"
}
```

### Session Errors

```javascript
try {
  await MergeAPI.getOrganizationApps(123);  // No session
} catch (error) {
  // error instanceof Error === true
  // error.message === "User session not found. Please ensure user is logged in."
  // Fliplet.parseError(error) === "User session not found. Please ensure user is logged in."
}
```

---

## Testing Error Handling

### Unit Tests Pattern

```javascript
// Test validation error handling
it('should handle missing parameters', async function() {
  try {
    await MergeAPI.getAppDetails();
    throw new Error('Should have thrown validation error');
  } catch (error) {
    const message = Fliplet.parseError(error);
    expect(message).to.equal('appId is required');
  }
});

// Test API error handling
it('should handle 404 responses', async function() {
  try {
    await MergeAPI.getAppDetails(999999);
    throw new Error('Should have thrown API error');
  } catch (error) {
    const message = Fliplet.parseError(error);
    expect(error.status).to.equal(404);
    expect(message).to.include('not found');
  }
});
```

---

## Safe Null Checking for Nested Properties

**Always use safe null checking when accessing nested properties**:

```javascript
// ❌ WRONG - Will throw if any part is undefined
var userId = Fliplet.User.getCachedSession().user.id;

// ✅ CORRECT - Safe null checking
var session = Fliplet.User.getCachedSession();
if (!session || !session.user || !session.user.id) {
  throw new Error('User session not found');
}
var userId = session.user.id;
```

**Why**: In JavaScript, trying to access a property on `undefined` or `null` throws a `TypeError`. Always check each level of nesting before accessing the next.

**Common scenarios requiring safe checking**:
- `Fliplet.User.getCachedSession().user.id`
- `response.data.items[0].name`
- `error.responseJSON.message`

**Tip**: Use `Fliplet.parseError()` for error messages - it handles nested checking automatically!

---

## Common Mistakes to Avoid

### ❌ Don't access error.message directly

```javascript
// Wrong - might not exist or be nested
const message = error.message || 'Error occurred';
```

### ✅ Use Fliplet.parseError()

```javascript
// Correct - handles all cases
const message = Fliplet.parseError(error, 'Error occurred');
```

---

### ❌ Don't stringify Error objects

```javascript
// Wrong - Error objects stringify to {}
const errorData = JSON.stringify(error);
```

### ✅ Extract message first

```javascript
// Correct - get message, then include in object
const errorData = {
  message: Fliplet.parseError(error),
  status: error.status,
  timestamp: Date.now()
};
```

---

### ❌ Don't ignore error context

```javascript
// Wrong - no context for debugging
catch (error) {
  console.error('Error');
}
```

### ✅ Log with context

```javascript
// Correct - full context for debugging
catch (error) {
  console.error('Failed to lock apps:', {
    message: Fliplet.parseError(error),
    sourceAppId: sourceAppId,
    targetAppId: targetAppId,
    error: error
  });
}
```

---

## Related Documentation

- [API Middleware Guidelines](../MIDDLEWARE_GUIDELINES.md) - Error handling in middleware
- [API Tester Error Display](../implementation/phase-1-foundation/1.8-api-tester-error-display.md) - Error display in UI
- [Fliplet Core API](https://developers.fliplet.com/API/core/overview.html) - Official Fliplet API docs

---

## Summary

**Golden Rule**: Always use `Fliplet.parseError()` for extracting error messages.

**Pattern**:
```javascript
try {
  // Your operation
} catch (error) {
  const message = Fliplet.parseError(error, 'Operation failed');
  // Use message for display, log full error for debugging
}
```

**Benefits**:
- Consistent error handling across the app
- Robust parsing of various error formats
- Clean user-facing messages
- Full debugging information preserved
