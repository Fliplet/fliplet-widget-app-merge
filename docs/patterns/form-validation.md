# Form Validation Pattern

## When to Use

Implement form validation whenever collecting user input:

- Creating or editing resources
- Configuration forms
- Search filters
- Login/registration
- Any user input that must meet criteria

**Why it matters**: Validation prevents bad data from entering the system and provides helpful feedback to users.

## Implementation

### 1. Basic Field Validation

Validate individual form fields:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="appName">App Name *</label>
      <input
        id="appName"
        v-model="form.name"
        @blur="validateField('name')"
        :class="{ 'is-invalid': errors.name }"
        type="text"
        class="form-control"
        required
      />
      <div v-if="errors.name" class="invalid-feedback">
        {{ errors.name }}
      </div>
    </div>

    <div class="form-group">
      <label for="appDescription">Description</label>
      <textarea
        id="appDescription"
        v-model="form.description"
        @blur="validateField('description')"
        :class="{ 'is-invalid': errors.description }"
        class="form-control"
        rows="3"
      ></textarea>
      <div v-if="errors.description" class="invalid-feedback">
        {{ errors.description }}
      </div>
    </div>

    <merge-button
      type="submit"
      variant="primary"
      :disabled="hasErrors"
    >
      Submit
    </merge-button>
  </form>
</template>

<script>
import { reactive, computed } from 'vue';

export default {
  setup() {
    const form = reactive({
      name: '',
      description: ''
    });

    const errors = reactive({
      name: null,
      description: null
    });

    const validateField = (field) => {
      // Clear previous error
      errors[field] = null;

      switch (field) {
        case 'name':
          if (!form.name || form.name.trim() === '') {
            errors.name = 'Name is required';
          } else if (form.name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
          } else if (form.name.length > 100) {
            errors.name = 'Name must not exceed 100 characters';
          }
          break;

        case 'description':
          if (form.description && form.description.length > 500) {
            errors.description = 'Description must not exceed 500 characters';
          }
          break;
      }

      return !errors[field];
    };

    const validateForm = () => {
      let isValid = true;

      Object.keys(form).forEach(field => {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    };

    const hasErrors = computed(() => {
      return Object.values(errors).some(error => error !== null);
    });

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      // Form is valid, proceed with submission
      try {
        await submitForm(form);
      } catch (err) {
        // Handle submission error
        errors.name = err.message;
      }
    };

    return {
      form,
      errors,
      hasErrors,
      validateField,
      handleSubmit
    };
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--secondary-color);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  transition: border-color var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 171, 209, 0.1);
}

.form-control.is-invalid {
  border-color: var(--danger-color);
}

.invalid-feedback {
  display: block;
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
</style>
```

### 2. Real-Time Validation

Validate as user types (with debouncing):

```vue
<template>
  <div class="form-group">
    <label for="email">Email *</label>
    <input
      id="email"
      v-model="email"
      @input="debouncedValidate"
      :class="{ 'is-invalid': emailError, 'is-valid': emailValid }"
      type="email"
      class="form-control"
    />

    <!-- Validation indicators -->
    <div v-if="validating" class="validation-feedback">
      <i class="fa fa-spinner fa-spin"></i> Checking...
    </div>
    <div v-else-if="emailError" class="invalid-feedback">
      {{ emailError }}
    </div>
    <div v-else-if="emailValid" class="valid-feedback">
      <i class="fa fa-check"></i> Email is available
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const email = ref('');
    const emailError = ref(null);
    const emailValid = ref(false);
    const validating = ref(false);

    let validationTimer = null;

    const validateEmail = async () => {
      emailError.value = null;
      emailValid.value = false;

      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        emailError.value = 'Invalid email format';
        return;
      }

      // Check if email already exists (API call)
      validating.value = true;
      try {
        const exists = await window.MergeAPI.checkEmailExists({
          email: email.value
        });

        if (exists) {
          emailError.value = 'This email is already registered';
        } else {
          emailValid.value = true;
        }
      } catch (err) {
        emailError.value = 'Unable to verify email';
      } finally {
        validating.value = false;
      }
    };

    const debouncedValidate = () => {
      // Clear previous timer
      if (validationTimer) {
        clearTimeout(validationTimer);
      }

      // Reset states
      emailError.value = null;
      emailValid.value = false;

      // Don't validate empty input
      if (!email.value) return;

      // Validate after 500ms of no typing
      validationTimer = setTimeout(() => {
        validateEmail();
      }, 500);
    };

    return {
      email,
      emailError,
      emailValid,
      validating,
      debouncedValidate
    };
  }
}
</script>

<style scoped>
.form-control.is-valid {
  border-color: var(--success-color);
}

.valid-feedback {
  display: block;
  color: var(--success-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.validation-feedback {
  display: block;
  color: var(--info-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
</style>
```

### 3. Complex Validation Rules

Multiple validation rules per field:

```javascript
const validationRules = {
  username: [
    {
      rule: (value) => value && value.trim() !== '',
      message: 'Username is required'
    },
    {
      rule: (value) => value.length >= 3,
      message: 'Username must be at least 3 characters'
    },
    {
      rule: (value) => value.length <= 20,
      message: 'Username must not exceed 20 characters'
    },
    {
      rule: (value) => /^[a-zA-Z0-9_]+$/.test(value),
      message: 'Username can only contain letters, numbers, and underscores'
    }
  ],

  password: [
    {
      rule: (value) => value && value.length >= 8,
      message: 'Password must be at least 8 characters'
    },
    {
      rule: (value) => /[A-Z]/.test(value),
      message: 'Password must contain at least one uppercase letter'
    },
    {
      rule: (value) => /[a-z]/.test(value),
      message: 'Password must contain at least one lowercase letter'
    },
    {
      rule: (value) => /[0-9]/.test(value),
      message: 'Password must contain at least one number'
    }
  ],

  confirmPassword: [
    {
      rule: (value, form) => value === form.password,
      message: 'Passwords do not match'
    }
  ]
};

const validateField = (field, value, form) => {
  const rules = validationRules[field];
  if (!rules) return null;

  for (const rule of rules) {
    if (!rule.rule(value, form)) {
      return rule.message;
    }
  }

  return null; // No errors
};

const validateForm = (form) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const error = validateField(field, form[field], form);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
```

### 4. Async Validation

Validate against API (e.g., check uniqueness):

```javascript
import { ref } from 'vue';

setup() {
  const appName = ref('');
  const checkingName = ref(false);
  const nameError = ref(null);
  const nameAvailable = ref(false);

  const checkNameAvailability = async () => {
    if (!appName.value || appName.value.length < 3) {
      nameError.value = 'Name must be at least 3 characters';
      return;
    }

    checkingName.value = true;
    nameError.value = null;
    nameAvailable.value = false;

    try {
      const exists = await window.MergeAPI.checkAppNameExists({
        organizationId: window.MergeState.organizationId,
        name: appName.value
      });

      if (exists) {
        nameError.value = 'An app with this name already exists';
      } else {
        nameAvailable.value = true;
      }
    } catch (err) {
      nameError.value = 'Unable to check name availability';
    } finally {
      checkingName.value = false;
    }
  };

  return {
    appName,
    checkingName,
    nameError,
    nameAvailable,
    checkNameAvailability
  };
}
```

### 5. Form-Level Validation

Validate entire form before submission:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->
    <div v-for="field in fields" :key="field.name" class="form-group">
      <label :for="field.name">{{ field.label }}</label>
      <input
        :id="field.name"
        v-model="form[field.name]"
        :type="field.type"
        :class="{ 'is-invalid': errors[field.name] }"
        class="form-control"
      />
      <div v-if="errors[field.name]" class="invalid-feedback">
        {{ errors[field.name] }}
      </div>
    </div>

    <!-- Form-level error -->
    <merge-alert v-if="formError" variant="danger" class="mt-3">
      {{ formError }}
    </merge-alert>

    <!-- Submit button -->
    <merge-button
      type="submit"
      variant="primary"
      :loading="submitting"
      :disabled="hasErrors || submitting"
    >
      Submit
    </merge-button>
  </form>
</template>

<script>
import { reactive, ref, computed } from 'vue';

export default {
  setup() {
    const form = reactive({
      appName: '',
      description: '',
      organizationId: null
    });

    const errors = reactive({
      appName: null,
      description: null,
      organizationId: null
    });

    const formError = ref(null);
    const submitting = ref(false);

    const hasErrors = computed(() => {
      return Object.values(errors).some(error => error !== null);
    });

    const validateForm = () => {
      // Reset errors
      Object.keys(errors).forEach(key => {
        errors[key] = null;
      });
      formError.value = null;

      let isValid = true;

      // Validate app name
      if (!form.appName || form.appName.trim() === '') {
        errors.appName = 'App name is required';
        isValid = false;
      } else if (form.appName.length < 3) {
        errors.appName = 'App name must be at least 3 characters';
        isValid = false;
      }

      // Validate organization
      if (!form.organizationId) {
        errors.organizationId = 'Organization is required';
        isValid = false;
      }

      // Cross-field validation
      if (form.appName && form.description &&
          form.appName === form.description) {
        formError.value = 'Name and description should be different';
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.is-invalid');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      submitting.value = true;

      try {
        await window.MergeAPI.createApp(form);
        // Success - redirect or show success message
      } catch (err) {
        formError.value = err.message || 'Failed to create app';
      } finally {
        submitting.value = false;
      }
    };

    return {
      form,
      errors,
      formError,
      submitting,
      hasErrors,
      handleSubmit
    };
  }
}
</script>
```

### 6. Custom Validators

Reusable validation functions:

```javascript
// validators.js
export const validators = {
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (min) => (value) => {
    return value && value.length >= min;
  },

  maxLength: (max) => (value) => {
    return !value || value.length <= max;
  },

  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || regex.test(value);
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  numeric: (value) => {
    return !value || !isNaN(Number(value));
  },

  pattern: (regex) => (value) => {
    return !value || regex.test(value);
  },

  custom: (fn) => (value, form) => {
    return fn(value, form);
  }
};

// Usage
import { validators } from './validators';

const rules = {
  email: [
    { validator: validators.required, message: 'Email is required' },
    { validator: validators.email, message: 'Invalid email format' }
  ],

  age: [
    { validator: validators.required, message: 'Age is required' },
    { validator: validators.numeric, message: 'Age must be a number' },
    {
      validator: validators.custom((value) => value >= 18),
      message: 'Must be 18 or older'
    }
  ]
};
```

## Best Practices

### Do:
- Validate on blur (not on every keystroke for complex rules)
- Provide clear, specific error messages
- Show validation state visually (colors, icons)
- Disable submit button while form is invalid
- Scroll to first error on submission
- Use debouncing for async validation
- Validate both client-side and server-side
- Clear errors when user starts correcting

### Don't:
- Don't show errors before user interacts with field
- Don't use generic error messages
- Don't validate on every keystroke (use debouncing)
- Don't forget to validate on submit
- Don't trust client-side validation alone
- Don't make error messages too technical
- Don't hide validation errors

## Validation Messages

### Good Error Messages

```javascript
// ✅ CORRECT: Clear and specific
'Email is required'
'Password must be at least 8 characters'
'Passwords do not match'
'App name must be unique within organization'

// ❌ WRONG: Generic or technical
'Invalid input'
'Validation failed'
'ERR_VALIDATION_001'
```

### Error Message Guidelines

1. **Be specific**: Tell user exactly what's wrong
2. **Be actionable**: Explain how to fix it
3. **Be concise**: Keep it short and clear
4. **Be friendly**: Don't blame the user

## Accessibility

### Screen Reader Support

```vue
<div class="form-group">
  <label for="username">
    Username *
    <span class="sr-only">(required)</span>
  </label>

  <input
    id="username"
    v-model="username"
    :aria-invalid="!!errors.username"
    :aria-describedby="errors.username ? 'username-error' : null"
    class="form-control"
  />

  <div
    v-if="errors.username"
    id="username-error"
    role="alert"
    aria-live="polite"
    class="invalid-feedback"
  >
    {{ errors.username }}
  </div>
</div>
```

## Common Pitfalls

### Pitfall 1: Validating Too Early

```javascript
// ❌ WRONG: Validate on input (annoying)
<input @input="validate" />

// ✅ CORRECT: Validate on blur
<input @blur="validate" />

// ✅ BETTER: Debounced validation for async checks
<input @input="debouncedValidate" />
```

### Pitfall 2: Not Clearing Errors

```javascript
// ❌ WRONG: Old errors persist
const validateField = (field) => {
  if (!form[field]) {
    errors[field] = 'Required';
  }
};

// ✅ CORRECT: Clear previous error
const validateField = (field) => {
  errors[field] = null; // Clear first

  if (!form[field]) {
    errors[field] = 'Required';
  }
};
```

### Pitfall 3: Allowing Submit with Errors

```vue
<!-- ❌ WRONG: Can submit invalid form -->
<merge-button type="submit">
  Submit
</merge-button>

<!-- ✅ CORRECT: Disable when invalid -->
<merge-button
  type="submit"
  :disabled="hasErrors || submitting"
>
  Submit
</merge-button>
```

## Related Patterns

- [Error Handling](error-handling.md) - Handle validation and submission errors
- [Modal Dialog](modal-dialog.md) - Forms in modals
- [API Calls](api-calls.md) - Submit validated data to API

## Related Documentation

- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md) - Form component examples
- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Form styling

---

**Last Updated**: December 18, 2024
**Pattern Category**: Forms & Input
**Difficulty**: Intermediate
