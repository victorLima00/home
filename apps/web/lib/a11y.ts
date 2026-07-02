// Accessibility utilities for WCAG 2.1 AA compliance

export const a11y = {
  focusable: {
    tabIndex: 0,
    role: 'button'
  },

  labels: {
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    menu: 'Menu',
    filter: 'Filter'
  },

  getLiveRegionMessage: (type: 'success' | 'error' | 'info', message: string) => {
    const prefix = {
      success: 'Success:',
      error: 'Error:',
      info: 'Info:'
    }[type];
    return `${prefix} ${message}`;
  },

  getRelativeLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  getContrastRatio: (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
    const lum1 = a11y.getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = a11y.getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }
};

export const a11yColors = {
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40'
};
