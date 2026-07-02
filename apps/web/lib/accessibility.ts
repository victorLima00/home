// Accessibility helpers for interactive elements

import { useEffect, useRef } from 'react';

interface AccessibleElementOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  role?: string;
}

export function makeAccessible(element: HTMLElement, options: AccessibleElementOptions) {
  if (options.ariaLabel) {
    element.setAttribute('aria-label', options.ariaLabel);
  }

  if (options.ariaPressed !== undefined) {
    element.setAttribute('aria-pressed', String(options.ariaPressed));
  }

  if (options.role) {
    element.setAttribute('role', options.role);
  }

  if (!['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName)) {
    element.setAttribute('tabindex', '0');
  }

  element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && options.onEnter) {
      e.preventDefault();
      options.onEnter();
    }
    if (e.key === 'Escape' && options.onEscape) {
      e.preventDefault();
      options.onEscape();
    }
  });
}

export function useAccessible(options: AccessibleElementOptions) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      makeAccessible(ref.current, options);
    }
  }, [options]);

  return ref;
}
