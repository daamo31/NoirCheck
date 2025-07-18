/**
 * Development Warning Suppressor
 * Suppresses specific accessibility warnings in development
 */

"use client";

import { useEffect } from 'react';

export default function DevWarningsSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalWarn = console.warn;
      const originalError = console.error;
      
      // Override console.warn
      console.warn = function(message, ...args) {
        // List of warnings to suppress
        const suppressedWarnings = [
          'DialogContent',
          'DialogTitle',
          'aria-describedby',
          'screen reader users',
          'VisuallyHidden component',
          'radix-ui.com/primitives/docs/components/dialog'
        ];
        
        // Check if this warning should be suppressed
        const shouldSuppress = suppressedWarnings.some(warning => 
          typeof message === 'string' && message.includes(warning)
        );
        
        if (!shouldSuppress) {
          originalWarn.apply(console, [message, ...args]);
        }
      };
      
      // Override console.error for similar errors
      console.error = function(message, ...args) {
        const suppressedErrors = [
          'DialogContent',
          'DialogTitle',
          'aria-describedby'
        ];
        
        const shouldSuppress = suppressedErrors.some(error => 
          typeof message === 'string' && message.includes(error)
        );
        
        if (!shouldSuppress) {
          originalError.apply(console, [message, ...args]);
        }
      };
      
      // Cleanup function
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);
  
  return null;
}
