const { shallowMount } = require('@vue/test-utils');
const ProgressIndicator = require('./ProgressIndicator.vue').default;

const CheckCircle2Stub = {
  name: 'CheckCircle2',
  template: '<svg />'
};

const renderComponent = (props = {}) => {
  return shallowMount(ProgressIndicator, {
    propsData: props,
    global: {
      stubs: {
        CheckCircle2: CheckCircle2Stub
      }
    }
  });
};

describe('ProgressIndicator', () => {
  const sampleSteps = [
    { label: 'Select Destination', completed: true },
    { label: 'Configure Settings', completed: false },
    { label: 'Review Summary', completed: false }
  ];

  it('renders correct number of steps', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const stepCircles = wrapper.findAll('[aria-current]');
    const allSteps = wrapper.findAll('.rounded-full');

    expect(allSteps.length).toBe(3);
  });

  it('applies correct classes for completed steps', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const firstStepCircle = wrapper.findAll('.rounded-full')[0];

    expect(firstStepCircle.classes()).toContain('border-success');
    expect(firstStepCircle.classes()).toContain('bg-success');
  });

  it('applies correct classes for current step', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const currentStepCircle = wrapper.findAll('.rounded-full')[1];

    expect(currentStepCircle.classes()).toContain('border-primary');
    expect(currentStepCircle.classes()).toContain('bg-white');
  });

  it('applies correct classes for upcoming steps', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const upcomingStepCircle = wrapper.findAll('.rounded-full')[2];

    expect(upcomingStepCircle.classes()).toContain('border-gray-300');
    expect(upcomingStepCircle.classes()).toContain('bg-white');
  });

  it('displays step labels on desktop', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 0
    });

    const labels = wrapper.findAll('.md\\:block');

    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0].text()).toBe('Select Destination');
  });

  it('shows CheckCircle2 icon for completed steps', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const completedStep = wrapper.findAll('.rounded-full')[0];

    expect(completedStep.findComponent(CheckCircle2Stub).exists()).toBe(true);
  });

  it('shows step number for non-completed steps', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const currentStep = wrapper.findAll('.rounded-full')[1];
    const stepNumber = currentStep.find('span');

    expect(stepNumber.text()).toBe('2');
  });

  it('displays current step label on mobile', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const mobileLabel = wrapper.find('.md\\:hidden');

    expect(mobileLabel.text()).toBe('Configure Settings');
  });

  it('applies correct connector line colors', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const connectors = wrapper.findAll('.h-0\\.5');

    // First connector (after completed step) should be green
    expect(connectors[0].classes()).toContain('bg-success');

    // Second connector (after current step) should be gray
    expect(connectors[1].classes()).toContain('bg-gray-300');
  });

  it('does not render connector after last step', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 0
    });

    const connectors = wrapper.findAll('.h-0\\.5');

    // Should have n-1 connectors for n steps
    expect(connectors.length).toBe(2);
  });

  it('sets aria-current on current step', () => {
    const wrapper = renderComponent({
      steps: sampleSteps,
      currentStep: 1
    });

    const stepCircles = wrapper.findAll('.rounded-full');

    expect(stepCircles[0].attributes('aria-current')).toBeFalsy();
    expect(stepCircles[1].attributes('aria-current')).toBe('step');
    expect(stepCircles[2].attributes('aria-current')).toBeFalsy();
  });

  it('validates step prop structure', () => {
    const invalidSteps = [
      { label: 'Step 1' } // missing completed
    ];

    // Get the validator function
    const stepsValidator = ProgressIndicator.props.steps.validator;

    expect(stepsValidator(invalidSteps)).toBe(false);
    expect(stepsValidator(sampleSteps)).toBe(true);
  });
});
