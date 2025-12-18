# Middleware Development Guidelines

## Core Philosophy

You are building **behaviour-parameterized, caller-agnostic middleware** that sits between the UI layer and REST APIs. The middleware should be designed with awareness of real usage patterns but must never couple to specific caller identities.

## Fundamental Principles

### 1. Intent-Based Function Signatures
- **DO:** Accept parameters that describe *what behaviour is needed*
  ```typescript
  fetchUsers({ fields, filters, pagination, sortBy })
  ```
- **DON'T:** Accept parameters that identify *who is calling*
  ```typescript
  fetchUsers(userId, callerType: 'mobile' | 'web') // ❌
  ```

### 2. Design-Time Awareness, Runtime Agnosticism
- **Review the PRD and design specs** to understand usage patterns and requirements
- **Use this knowledge to inform capabilities** (e.g., "the mobile UI needs efficient data fetching" → add field selection)
- **Never hardcode assumptions** based on caller identity into the implementation
- **Document design decisions** that were informed by specific use cases, but implement them as general capabilities

### 3. Explicit Over Implicit
- Every behaviour must be explicitly requested through parameters
- No magic defaults based on guessed caller intent
- If a sensible default exists, document why it's the default (not "because mobile needs it")

## Implementation Guidelines

### Function Design

**Parameter Structure:**
- Use **options objects** for flexibility rather than positional parameters
- Group related parameters logically
- Provide TypeScript types that clearly express available behaviours
  ```typescript
  interface FetchOptions {
    fields?: string[]           // Which data fields to return
    include?: string[]          // Related resources to include
    filters?: Record<string, any>
    pagination?: { page: number, limit: number }
    sort?: { field: string, order: 'asc' | 'desc' }
  }
  ```

**Avoid:**
```typescript
// ❌ Caller-context bleeding through
function getData(id: string, isMobile: boolean)

// ❌ Implicit behaviour
function getData(id: string) // Returns different shapes based on internal logic

// ❌ Overloaded meanings
function getData(id: string, mode: string) // What does "mode" mean?
```

**Prefer:**
```typescript
// ✓ Explicit behavioural instructions
function getData(id: string, options: {
  fields?: string[],
  depth?: number,
  cache?: boolean
})
```

### Handling the REST API

**API Response Transformation:**
- Middleware should transform REST API responses into UI-friendly shapes
- Transformations should be **driven by the options passed in**, not by assumptions about the caller
- If the REST API returns more data than requested, filter it based on `fields` parameter
- If the REST API requires specific request shapes, construct them from behavioural parameters

**Error Handling:**
- Transform API errors into consistent, actionable error objects
- Include enough context for debugging without exposing internal implementation details
- **Don't** create different error formats for different assumed callers
- **Do** allow callers to specify error handling preferences through options if needed

### Data Fetching Patterns

**When the PRD/design shows different UIs need different data:**
- ✓ Implement field selection: `{ fields: ['id', 'name', 'avatar'] }`
- ✓ Implement inclusion of relations: `{ include: ['profile', 'settings'] }`
- ✓ Implement depth control: `{ depth: 1 }` for shallow vs deep fetching
- ❌ Don't implement: `{ clientType: 'dashboard' }`

**When performance matters:**
- Implement pagination capabilities
- Implement caching options that callers can enable
- Implement batch operation support where the REST API allows it
- Let callers opt into performance features rather than guessing when to apply them

### State Management Integration

If middleware manages state (e.g., caching, normalization):
- State structure should be **deterministic** based on data, not caller
- Cache keys should be based on **request parameters**, not caller identity
- Provide cache control options: `{ cache: 'force-refresh' | 'cache-first' | 'network-only' }`

## Specification Interpretation

### Reading the PRD
- **Extract requirements** about what data is needed and when
- **Identify patterns** like "list views need minimal data, detail views need full data"
- **Translate to capabilities**: This becomes support for field selection, not "list view mode"

### Reading Design Specs
- **Note which components** consume which data
- **Identify common data shapes** that appear across multiple screens
- **Don't create screen-specific functions**; create data-fetching functions with options that can serve multiple screens

### Reading REST API Specs
- **Understand available endpoints** and their capabilities
- **Note any batching, filtering, or field selection** the API already supports
- **Map API capabilities to middleware options** transparently
- If the API has limitations, **document them** but don't work around them with caller-specific logic

## Documentation Requirements

For each middleware function, document:

1. **Purpose**: What data/action does this provide?
2. **Parameters**: What behavioural options are available?
3. **Usage examples**: Show 2-3 examples of different option combinations
4. **Design rationale**: If a capability exists because of a specific use case in the PRD, note it
   - ✓ "Supports field selection because dashboard and mobile views require different data density"
   - ❌ "Use `isMobile: true` for mobile clients"

## Anti-Patterns to Avoid

❌ **Caller identification**
```typescript
function fetchData(id: string, source: 'mobile' | 'web' | 'admin')
```

❌ **Hidden branching logic**
```typescript
function fetchData(id: string) {
  if (someInternalCheck) { return minimalData }
  return fullData
}
```

❌ **Overloaded boolean flags**
```typescript
function fetchData(id: string, fast: boolean) // What does "fast" mean?
```

❌ **Magic strings without clear semantics**
```typescript
function fetchData(id: string, mode: 'quick' | 'full' | 'detailed')
```

❌ **Side effects based on assumptions**
```typescript
function fetchData(id: string) {
  if (window.innerWidth < 768) { // ❌ Detecting mobile
    return minimalData
  }
}
```

## Testing Considerations

- Write tests that verify behavior under different option combinations
- Don't write tests that simulate different "caller types"
- Test edge cases: What happens with empty options? Maximum options?
- Verify that the same options always produce the same behavior (determinism)

## Key Takeaways for LLM

1. **Every capability must be explicitly opt-in** through parameters
2. **Design is informed by usage patterns** but implementation is generic
3. **Function signatures describe behaviors**, not callers
4. **No magic, no guessing, no implicit branching** based on caller identity
5. **When in doubt**, prefer more granular, compositional options over high-level "modes"

---

## Critical Thinking Prompt for LLM

Before implementing any middleware function, ask yourself:
- Could this function serve a caller I haven't thought of yet?
- Are my parameters describing *what to do* or *who is asking*?
- If the UI completely changes tomorrow, would this function still make sense?
- Can I explain every parameter's purpose without referring to specific screens or devices?

If you answer "no" to any of these, reconsider your design.

---
