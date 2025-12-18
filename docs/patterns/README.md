# Component Patterns

This directory contains reusable implementation patterns for common scenarios in the App Merge UI.

## Overview

Patterns provide proven solutions to recurring problems in component development. Each pattern includes:
- When to use the pattern
- Code examples
- Best practices
- Common pitfalls to avoid

## Available Patterns

### 1. [Loading States](loading-states.md)
How to handle loading states for data fetching and async operations.

**Use when**:
- Fetching data from API
- Processing long-running operations
- Waiting for user actions to complete

**Key concepts**: Component-level loading, global loading state, loading UI components

---

### 2. [Error Handling](error-handling.md) ⭐ **REQUIRED STANDARD**
**Standard for all error handling** - Always use `Fliplet.parseError()` for extracting error messages.

**Use when**:
- Making API calls
- Validating user input
- Handling edge cases
- Processing data that might fail

**Key concepts**: `Fliplet.parseError()` for message extraction, try-catch blocks, error display, logging

**Critical**: Always use `Fliplet.parseError(error, fallback)` - never `error.message` directly!

---

### 3. [API Calls](api-calls.md)
Best practices for making API requests through the MergeAPI middleware.

**Use when**:
- Fetching data from Fliplet API
- Creating/updating resources
- Managing locks
- Executing merge operations

**Key concepts**: Middleware usage, request/response handling, error handling, loading states

---

### 4. [Lock Management](lock-management.md)
Managing app locks to prevent concurrent modifications.

**Use when**:
- Selecting destination app
- Starting merge process
- Making changes to destination app
- Navigating away from merge flow

**Key concepts**: Acquire lock, extend lock, release lock, lock expiry handling

---

### 5. [State Persistence](state-persistence.md)
Saving and restoring application state for recovery.

**Use when**:
- User navigates between screens
- Browser refresh occurs
- Session timeout
- Crash recovery needed

**Key concepts**: MergeStorage, state serialization, state validation, recovery logic

---

### 6. [Modal Dialog](modal-dialog.md)
Creating and managing modal dialogs for user interactions.

**Use when**:
- Confirming destructive actions
- Displaying detailed information
- Collecting user input
- Showing warnings or alerts

**Key concepts**: Modal component, backdrop handling, keyboard navigation, focus management

---

### 7. [Table Selection](table-selection.md)
Implementing selectable tables with checkboxes and bulk actions.

**Use when**:
- Selecting screens to merge
- Selecting data sources
- Selecting media files
- Managing multiple items

**Key concepts**: Select all, individual selection, selection state, bulk operations

---

### 8. [Form Validation](form-validation.md)
Validating user input and displaying validation errors.

**Use when**:
- Collecting user input
- Validating form fields
- Preventing invalid submissions
- Providing user feedback

**Key concepts**: Field validation, error messages, submit handling, real-time validation

---

## Using Patterns in Your Code

### Step 1: Identify the Pattern
Review the pattern descriptions above and identify which pattern(s) apply to your use case.

### Step 2: Read the Pattern Documentation
Open the pattern file and review the full implementation details, examples, and best practices.

### Step 3: Adapt the Pattern
Copy the code example and adapt it to your specific component needs. Don't blindly copy-paste - understand the pattern and modify as needed.

### Step 4: Test Thoroughly
Test the pattern implementation with various scenarios, including edge cases and error conditions.

## Pattern Development Guidelines

When creating a new pattern:

1. **Document the problem**: Clearly describe what problem the pattern solves
2. **Show the solution**: Provide complete, working code examples
3. **Explain the reasoning**: Help developers understand why this approach works
4. **List best practices**: Include dos and don'ts
5. **Cover edge cases**: Address common pitfalls and special scenarios
6. **Link to related docs**: Reference relevant sections in other documentation

## Pattern Combinations

Many patterns work together. Common combinations:

- **API Calls + Loading States + Error Handling**: Standard data fetching
- **Lock Management + State Persistence**: Robust merge flow
- **Table Selection + Modal Dialog**: Confirm bulk actions
- **Form Validation + Error Handling**: Robust form submission

---

**Last Updated**: December 18, 2024
**Status**: Phase 2 Complete
**Version**: 1.0
