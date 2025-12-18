# Modal Dialog Pattern

## When to Use

Use modals for focused interactions that require user attention:

- Confirming destructive actions (delete, cancel merge)
- Displaying detailed information
- Collecting user input
- Showing warnings or critical alerts
- Displaying results or summaries

**Why it matters**: Modals focus user attention on important decisions and prevent accidental actions.

## Implementation

### 1. Basic Modal

Simple modal with title and content:

```vue
<template>
  <div>
    <!-- Trigger button -->
    <merge-button @click="showModal = true">
      Open Modal
    </merge-button>

    <!-- Modal component -->
    <merge-modal
      :show="showModal"
      title="Modal Title"
      @close="showModal = false"
    >
      <p>Modal content goes here.</p>

      <template #footer>
        <merge-button variant="secondary" @click="showModal = false">
          Cancel
        </merge-button>
        <merge-button variant="primary" @click="handleConfirm">
          Confirm
        </merge-button>
      </template>
    </merge-modal>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const showModal = ref(false);

    const handleConfirm = () => {
      // Perform action
      console.log('Confirmed');
      showModal.value = false;
    };

    return { showModal, handleConfirm };
  }
}
</script>
```

### 2. Confirmation Modal

Confirm destructive actions:

```vue
<template>
  <div>
    <!-- Delete button -->
    <merge-button variant="danger" @click="confirmDelete">
      Delete App
    </merge-button>

    <!-- Confirmation modal -->
    <merge-modal
      :show="showDeleteConfirm"
      title="Confirm Deletion"
      size="sm"
      @close="showDeleteConfirm = false"
    >
      <merge-alert variant="danger">
        <strong>Warning!</strong> This action cannot be undone.
      </merge-alert>

      <p class="mt-3">
        Are you sure you want to delete <strong>{{ appName }}</strong>?
        All data will be permanently lost.
      </p>

      <template #footer>
        <merge-button
          variant="secondary"
          @click="showDeleteConfirm = false"
        >
          Cancel
        </merge-button>
        <merge-button
          variant="danger"
          :loading="deleting"
          @click="performDelete"
        >
          Delete Permanently
        </merge-button>
      </template>
    </merge-modal>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    appName: String,
    appId: Number
  },
  setup(props, { emit }) {
    const showDeleteConfirm = ref(false);
    const deleting = ref(false);

    const confirmDelete = () => {
      showDeleteConfirm.value = true;
    };

    const performDelete = async () => {
      deleting.value = true;

      try {
        await window.MergeAPI.deleteApp({ appId: props.appId });
        showDeleteConfirm.value = false;
        emit('deleted');
      } catch (err) {
        alert('Failed to delete app: ' + err.message);
      } finally {
        deleting.value = false;
      }
    };

    return { showDeleteConfirm, deleting, confirmDelete, performDelete };
  }
}
</script>
```

### 3. Form Modal

Collect user input:

```vue
<template>
  <div>
    <merge-button @click="openCreateModal">
      Create Data Source
    </merge-button>

    <merge-modal
      :show="showModal"
      title="Create Data Source"
      size="md"
      :close-on-backdrop="false"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="dsName">Name *</label>
          <input
            id="dsName"
            v-model="form.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            required
          />
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>

        <div class="form-group">
          <label for="dsType">Type</label>
          <select
            id="dsType"
            v-model="form.type"
            class="form-control"
          >
            <option value="standard">Standard</option>
            <option value="structured">Structured</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input
              v-model="form.createBackup"
              type="checkbox"
            />
            Create backup before merge
          </label>
        </div>
      </form>

      <template #footer>
        <merge-button variant="secondary" @click="closeModal">
          Cancel
        </merge-button>
        <merge-button
          variant="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          Create
        </merge-button>
      </template>
    </merge-modal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  setup(props, { emit }) {
    const showModal = ref(false);
    const submitting = ref(false);

    const form = reactive({
      name: '',
      type: 'standard',
      createBackup: true
    });

    const errors = reactive({
      name: null
    });

    const openCreateModal = () => {
      // Reset form
      form.name = '';
      form.type = 'standard';
      form.createBackup = true;
      errors.name = null;

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const validateForm = () => {
      errors.name = null;

      if (!form.name || form.name.trim() === '') {
        errors.name = 'Name is required';
        return false;
      }

      if (form.name.length < 3) {
        errors.name = 'Name must be at least 3 characters';
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      submitting.value = true;

      try {
        const dataSource = await window.MergeAPI.createDataSource({
          name: form.name,
          type: form.type,
          createBackup: form.createBackup
        });

        emit('created', dataSource);
        closeModal();
      } catch (err) {
        errors.name = err.message;
      } finally {
        submitting.value = false;
      }
    };

    return {
      showModal,
      submitting,
      form,
      errors,
      openCreateModal,
      closeModal,
      handleSubmit
    };
  }
}
</script>
```

### 4. Details/Preview Modal

Show detailed information:

```vue
<template>
  <div>
    <!-- Trigger -->
    <merge-button variant="secondary" size="sm" @click="openDetails">
      View Details
    </merge-button>

    <!-- Details modal -->
    <merge-modal
      :show="showDetails"
      :title="screen.title"
      size="lg"
      @close="showDetails = false"
    >
      <div class="screen-details">
        <!-- Metadata -->
        <div class="detail-section">
          <h4>Information</h4>
          <table class="table">
            <tr>
              <td><strong>ID:</strong></td>
              <td>{{ screen.id }}</td>
            </tr>
            <tr>
              <td><strong>Created:</strong></td>
              <td>{{ formatDate(screen.createdAt) }}</td>
            </tr>
            <tr>
              <td><strong>Modified:</strong></td>
              <td>{{ formatDate(screen.updatedAt) }}</td>
            </tr>
            <tr>
              <td><strong>Components:</strong></td>
              <td>{{ screen.components?.length || 0 }}</td>
            </tr>
          </table>
        </div>

        <!-- Dependencies -->
        <div class="detail-section" v-if="screen.dependencies?.length">
          <h4>Dependencies</h4>
          <ul>
            <li v-for="dep in screen.dependencies" :key="dep.id">
              {{ dep.name }} ({{ dep.type }})
            </li>
          </ul>
        </div>

        <!-- Preview -->
        <div class="detail-section" v-if="screen.previewUrl">
          <h4>Preview</h4>
          <img :src="screen.previewUrl" alt="Screen preview" class="img-fluid" />
        </div>
      </div>

      <template #footer>
        <merge-button variant="secondary" @click="showDetails = false">
          Close
        </merge-button>
      </template>
    </merge-modal>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    screen: {
      type: Object,
      required: true
    }
  },
  setup() {
    const showDetails = ref(false);

    const openDetails = () => {
      showDetails.value = true;
    };

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    return { showDetails, openDetails, formatDate };
  }
}
</script>

<style scoped>
.screen-details {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: var(--spacing-lg);
}

.detail-section h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--secondary-color);
}
</style>
```

### 5. Multi-Step Modal

Modal with wizard/stepper:

```vue
<template>
  <merge-modal
    :show="showWizard"
    :title="currentStepTitle"
    size="lg"
    :close-on-backdrop="false"
    @close="confirmClose"
  >
    <!-- Progress stepper -->
    <merge-stepper
      :steps="steps"
      :current-step="currentStep"
      @step-click="goToStep"
    />

    <!-- Step content -->
    <div class="wizard-content">
      <!-- Step 1 -->
      <div v-if="currentStep === 0">
        <h3>Select Items</h3>
        <!-- Selection UI -->
      </div>

      <!-- Step 2 -->
      <div v-if="currentStep === 1">
        <h3>Configure Options</h3>
        <!-- Options UI -->
      </div>

      <!-- Step 3 -->
      <div v-if="currentStep === 2">
        <h3>Review & Confirm</h3>
        <!-- Summary UI -->
      </div>
    </div>

    <template #footer>
      <merge-button
        v-if="currentStep > 0"
        variant="secondary"
        @click="previousStep"
      >
        Back
      </merge-button>

      <merge-button
        v-if="currentStep < steps.length - 1"
        variant="primary"
        @click="nextStep"
        :disabled="!canProceed"
      >
        Next
      </merge-button>

      <merge-button
        v-else
        variant="primary"
        :loading="processing"
        @click="complete"
      >
        Complete
      </merge-button>
    </template>
  </merge-modal>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup(props, { emit }) {
    const showWizard = ref(false);
    const currentStep = ref(0);
    const processing = ref(false);

    const steps = [
      { label: 'Select', complete: false },
      { label: 'Configure', complete: false },
      { label: 'Review', complete: false }
    ];

    const currentStepTitle = computed(() => {
      return steps[currentStep.value].label;
    });

    const canProceed = computed(() => {
      // Add validation logic for each step
      return true;
    });

    const nextStep = () => {
      if (currentStep.value < steps.length - 1) {
        steps[currentStep.value].complete = true;
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    };

    const goToStep = (index) => {
      if (index < currentStep.value) {
        currentStep.value = index;
      }
    };

    const complete = async () => {
      processing.value = true;

      try {
        // Perform action
        await performWizardAction();
        emit('completed');
        showWizard.value = false;
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        processing.value = false;
      }
    };

    const confirmClose = () => {
      const confirmed = confirm('Close wizard? Progress will be lost.');
      if (confirmed) {
        showWizard.value = false;
        currentStep.value = 0;
      }
    };

    return {
      showWizard,
      currentStep,
      steps,
      currentStepTitle,
      canProceed,
      processing,
      nextStep,
      previousStep,
      goToStep,
      complete,
      confirmClose
    };
  }
}
</script>
```

## Best Practices

### Do:
- Use modals sparingly (don't abuse them)
- Provide clear action buttons
- Include cancel/close option
- Prevent backdrop clicks for critical modals
- Show loading states in modal actions
- Validate input before closing
- Focus on first input when modal opens
- Trap focus within modal
- Allow ESC key to close (unless critical)

### Don't:
- Don't nest modals (modal within modal)
- Don't use for non-critical information
- Don't make modals too large (use pages instead)
- Don't forget to handle keyboard navigation
- Don't auto-close after destructive actions
- Don't use for long forms (use pages)
- Don't forget loading/error states

## Modal Sizes

```vue
<!-- Small modal (400px) -->
<merge-modal size="sm" ...>

<!-- Medium modal (600px, default) -->
<merge-modal size="md" ...>

<!-- Large modal (900px) -->
<merge-modal size="lg" ...>

<!-- Extra large modal (1200px) -->
<merge-modal size="xl" ...>
```

## Accessibility

### Focus Management

```vue
<template>
  <merge-modal
    :show="showModal"
    @close="handleClose"
    @opened="handleOpened"
  >
    <input ref="firstInput" type="text" placeholder="Focus me" />
  </merge-modal>
</template>

<script>
import { ref, nextTick } from 'vue';

export default {
  setup() {
    const firstInput = ref(null);

    const handleOpened = async () => {
      // Focus first input when modal opens
      await nextTick();
      firstInput.value?.focus();
    };

    return { firstInput, handleOpened };
  }
}
</script>
```

### Keyboard Navigation

```javascript
// ESC to close
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
```

### ARIA Attributes

The `MergeModal` component includes:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to content

## Common Pitfalls

### Pitfall 1: Not Preventing Body Scroll

```css
/* Modal component should add this when open */
body.modal-open {
  overflow: hidden;
}
```

### Pitfall 2: Losing Form Data on Close

```javascript
// ❌ WRONG: Data lost on accidental close
const closeModal = () => {
  form.value = {};
  showModal.value = false;
};

// ✅ CORRECT: Confirm before closing with data
const closeModal = () => {
  if (hasFormChanges()) {
    const confirmed = confirm('Close without saving?');
    if (!confirmed) return;
  }

  form.value = {};
  showModal.value = false;
};
```

### Pitfall 3: Not Cleaning Up on Close

```javascript
// ✅ CORRECT: Reset state on close
const closeModal = () => {
  showModal.value = false;

  // Clean up
  form.value = {};
  errors.value = {};
  loading.value = false;
};
```

## Related Patterns

- [Form Validation](form-validation.md) - Validate forms in modals
- [Error Handling](error-handling.md) - Handle modal action errors
- [Loading States](loading-states.md) - Show loading in modal actions

## Related Documentation

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md#mergemodal) - Modal component spec
- [COMPONENT_TEMPLATE.md](../COMPONENT_TEMPLATE.md) - Modal usage examples

---

**Last Updated**: December 18, 2024
**Pattern Category**: UI Components
**Difficulty**: Intermediate
