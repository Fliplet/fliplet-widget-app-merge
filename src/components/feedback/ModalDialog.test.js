const { shallowMount } = require('@vue/test-utils');
const ModalDialog = require('./ModalDialog.vue').default;

const XStub = {
  name: 'X',
  template: '<svg />'
};

const TeleportStub = {
  name: 'Teleport',
  template: '<div><slot /></div>'
};

const TransitionStub = {
  name: 'Transition',
  template: '<div><slot /></div>'
};

const renderComponent = (props = {}, slots = {}) => {
  return shallowMount(ModalDialog, {
    propsData: props,
    slots,
    global: {
      stubs: {
        X: XStub,
        Teleport: TeleportStub,
        Transition: TransitionStub
      }
    }
  });
};

describe('ModalDialog', () => {
  describe('visibility', () => {
    it('renders when show prop is true', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test Modal'
      });

      expect(wrapper.find('[data-testid="modal-dialog"]').exists()).toBe(true);
    });

    it('does not render when show prop is false', () => {
      const wrapper = renderComponent({
        show: false,
        title: 'Test Modal'
      });

      expect(wrapper.find('[data-testid="modal-dialog"]').exists()).toBe(false);
    });
  });

  describe('title', () => {
    it('displays the provided title', () => {
      const title = 'My Modal Title';
      const wrapper = renderComponent({
        show: true,
        title
      });

      expect(wrapper.text()).toContain(title);
    });

    it('sets correct aria-labelledby on dialog', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      const titleId = wrapper.vm.titleId;

      expect(dialog.attributes('aria-labelledby')).toBe(titleId);
    });
  });

  describe('variants', () => {
    it('renders confirm variant with both buttons', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Confirm',
        variant: 'confirm',
        confirmText: 'Yes',
        cancelText: 'No'
      });

      expect(wrapper.find('[data-testid="modal-confirm-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="modal-cancel-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="modal-confirm-button"]').text()).toBe('Yes');
      expect(wrapper.find('[data-testid="modal-cancel-button"]').text()).toBe('No');
    });

    it('renders alert variant with only confirm button', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Alert',
        variant: 'alert',
        confirmText: 'OK'
      });

      expect(wrapper.find('[data-testid="modal-confirm-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="modal-cancel-button"]').exists()).toBe(false);
    });

    it('renders custom variant without default footer', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Custom',
        variant: 'custom'
      });

      expect(wrapper.find('[data-testid="modal-footer"]').exists()).toBe(false);
    });

    it('renders custom footer slot in custom variant', () => {
      const wrapper = renderComponent(
        {
          show: true,
          title: 'Custom',
          variant: 'custom'
        },
        {
          footer: '<button data-testid="custom-footer-button">Custom Action</button>'
        }
      );

      expect(wrapper.find('[data-testid="modal-custom-footer"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="custom-footer-button"]').exists()).toBe(true);
    });
  });

  describe('content slot', () => {
    it('renders default slot content', () => {
      const wrapper = renderComponent(
        {
          show: true,
          title: 'Test'
        },
        {
          default: '<p data-testid="modal-content">Modal content here</p>'
        }
      );

      expect(wrapper.find('[data-testid="modal-content"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Modal content here');
    });
  });

  describe('close button', () => {
    it('renders close button', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      expect(wrapper.find('[data-testid="modal-close-button"]').exists()).toBe(true);
    });

    it('emits close event when close button clicked', async () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      await wrapper.find('[data-testid="modal-close-button"]').trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('confirm button', () => {
    it('emits confirm and close events when confirm button clicked', async () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        variant: 'confirm'
      });

      await wrapper.find('[data-testid="modal-confirm-button"]').trigger('click');

      expect(wrapper.emitted('confirm')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('uses default text "OK" when confirmText not provided', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        variant: 'alert'
      });

      expect(wrapper.find('[data-testid="modal-confirm-button"]').text()).toBe('OK');
    });
  });

  describe('cancel button', () => {
    it('emits cancel and close events when cancel button clicked', async () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        variant: 'confirm'
      });

      await wrapper.find('[data-testid="modal-cancel-button"]').trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('uses default text "Cancel" when cancelText not provided', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        variant: 'confirm'
      });

      expect(wrapper.find('[data-testid="modal-cancel-button"]').text()).toBe('Cancel');
    });
  });

  describe('backdrop interactions', () => {
    it('emits close event when backdrop clicked and closeOnBackdrop is true', async () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        closeOnBackdrop: true
      });

      const backdrop = wrapper.find('[data-testid="modal-backdrop"]');
      await backdrop.trigger('click.self');

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not close when backdrop clicked and closeOnBackdrop is false', async () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        closeOnBackdrop: false
      });

      wrapper.vm.handleBackdropClick();
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('keyboard interactions', () => {
    it('closes on ESC key when closeOnEsc is true', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        closeOnEsc: true
      });

      wrapper.vm.handleEscapeKey();

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not close on ESC key when closeOnEsc is false', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test',
        closeOnEsc: false
      });

      wrapper.vm.handleEscapeKey();

      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('sets role="dialog" on modal', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      expect(dialog.attributes('role')).toBe('dialog');
    });

    it('sets aria-modal="true" on modal', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      const dialog = wrapper.find('[data-testid="modal-dialog"]');
      expect(dialog.attributes('aria-modal')).toBe('true');
    });

    it('sets aria-label on close button', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      const closeButton = wrapper.find('[data-testid="modal-close-button"]');
      expect(closeButton.attributes('aria-label')).toBe('Close dialog');
    });
  });

  describe('prop validation', () => {
    it('validates variant prop correctly', () => {
      const validator = ModalDialog.props.variant.validator;

      expect(validator('confirm')).toBe(true);
      expect(validator('alert')).toBe(true);
      expect(validator('custom')).toBe(true);
      expect(validator('invalid-variant')).toBe(false);
    });
  });

  describe('default props', () => {
    it('uses default variant of "confirm"', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      expect(wrapper.vm.variant).toBe('confirm');
    });

    it('uses default closeOnBackdrop of true', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      expect(wrapper.vm.closeOnBackdrop).toBe(true);
    });

    it('uses default closeOnEsc of true', () => {
      const wrapper = renderComponent({
        show: true,
        title: 'Test'
      });

      expect(wrapper.vm.closeOnEsc).toBe(true);
    });
  });
});
