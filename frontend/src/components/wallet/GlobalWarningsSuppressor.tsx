/**
 * Global Warnings Suppressor
 * Suppresses console warnings from third-party libraries like XION
 * This runs immediately when imported to catch early warnings
 */

"use client";

// Suppress warnings immediately when this module is imported
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = function(...args) {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('DialogContent') ||
       message.includes('DialogTitle') ||
       message.includes('Missing Description') ||
       message.includes('aria-describedby') ||
       message.includes('VisuallyHidden') ||
       message.includes('screen reader users') ||
       message.includes('requires a') ||
       message.includes('for the component to be accessible'))
    ) {
      return; // Suppress these warnings
    }
    return originalWarn.apply(console, args);
  };

  console.error = function(...args) {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('DialogContent') ||
       message.includes('DialogTitle') ||
       message.includes('Missing Description') ||
       message.includes('aria-describedby') ||
       message.includes('VisuallyHidden') ||
       message.includes('screen reader users') ||
       message.includes('requires a') ||
       message.includes('for the component to be accessible'))
    ) {
      return; // Suppress these errors
    }
    return originalError.apply(console, args);
  };
}

export default function GlobalWarningsSuppressor() {
  return null;
}
