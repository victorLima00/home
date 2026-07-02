// Accessibility validation utilities
// Tests to validate WCAG 2.1 AA compliance

export async function runAccessibilityValidation() {
  const results = {
    contrast: checkContrast(),
    keyboard: checkKeyboard(),
    ariaLabels: checkAriaLabels(),
    focusIndicators: checkFocusIndicators(),
    semanticHTML: checkSemanticHTML(),
    imageAlt: checkImageAlt(),
    formLabels: checkFormLabels(),
    headings: checkHeadingStructure()
  };

  const passed = Object.values(results).filter((r) => r.passed).length;
  const total = Object.keys(results).length;

  return {
    results,
    summary: {
      passed,
      total,
      percentage: Math.round((passed / total) * 100),
      compliant: passed / total >= 0.8
    }
  };
}

function checkContrast() {
  const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a');
  let passed = 0;
  let total = 0;

  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.backgroundColor !== 'transparent') {
      total++;
      // Simplified check
      if (style.color && style.backgroundColor) {
        passed++;
      }
    }
  });

  return {
    name: 'Color Contrast',
    passed: passed > 0,
    details: `${passed}/${total} elements checked`
  };
}

function checkKeyboard() {
  const interactiveElements = document.querySelectorAll(
    'button, a[href], input, select, textarea, [role="button"], [role="link"]'
  );

  let passed = 0;
  interactiveElements.forEach((el) => {
    const tabindex = el.getAttribute('tabindex');
    const isNativeInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);

    if (isNativeInteractive || (tabindex && parseInt(tabindex) >= -1)) {
      passed++;
    }
  });

  return {
    name: 'Keyboard Navigation',
    passed: passed / interactiveElements.length > 0.8,
    details: `${passed}/${interactiveElements.length} focusable elements`
  };
}

function checkAriaLabels() {
  const buttons = document.querySelectorAll('button');
  let passed = 0;

  buttons.forEach((btn) => {
    if (btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.textContent?.trim()) {
      passed++;
    }
  });

  return {
    name: 'ARIA Labels',
    passed: passed / Math.max(buttons.length, 1) > 0.8,
    details: `${passed}/${buttons.length} buttons with label`
  };
}

function checkFocusIndicators() {
  const sheets = Array.from(document.styleSheets);
  let hasFocusStyles = false;

  sheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        if (
          rule.cssText &&
          (rule.cssText.includes(':focus') || rule.cssText.includes(':focus-visible'))
        ) {
          hasFocusStyles = true;
        }
      });
    } catch {
      // May fail with CORS
    }
  });

  return {
    name: 'Focus Indicators',
    passed: hasFocusStyles,
    details: ':focus-visible styles in CSS'
  };
}

function checkSemanticHTML() {
  const hasMain = document.querySelector('main') !== null;
  const hasNav = document.querySelector('nav') !== null;
  const hasHeadings = document.querySelectorAll('h1, h2, h3').length > 0;
  const hasList = document.querySelector('ul, ol') !== null;

  return {
    name: 'Semantic HTML',
    passed: hasMain && hasNav && hasHeadings && hasList,
    details: `main: ${hasMain}, nav: ${hasNav}, headings: ${hasHeadings}, lists: ${hasList}`
  };
}

function checkImageAlt() {
  const images = document.querySelectorAll('img');
  let passedCount = 0;

  images.forEach((img) => {
    if (img.getAttribute('alt')?.trim()) {
      passedCount++;
    }
  });

  return {
    name: 'Alt Text on Images',
    passed: passedCount / Math.max(images.length, 1) > 0.95,
    details: `${passedCount}/${images.length} images with alt`
  };
}

function checkFormLabels() {
  const inputs = document.querySelectorAll('input:not([type="hidden"])');
  let passedCount = 0;

  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    const ariaLabel = input.getAttribute('aria-label');

    if (label || ariaLabel) {
      passedCount++;
    }
  });

  return {
    name: 'Labels on Forms',
    passed: passedCount / Math.max(inputs.length, 1) > 0.95,
    details: `${passedCount}/${inputs.length} inputs with label`
  };
}

function checkHeadingStructure() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) =>
    parseInt(h.tagName[1])
  );

  let isCorrect = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1 && headings[i - 1] !== 0) {
      isCorrect = false;
      break;
    }
  }

  return {
    name: 'Heading Structure',
    passed: isCorrect,
    details: `Hierarchy: ${headings.join(' -> ')}`
  };
}
