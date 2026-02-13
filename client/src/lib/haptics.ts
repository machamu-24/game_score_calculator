// Haptic feedback utility

export const haptics = {
  // Light impact (for regular buttons)
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  
  // Medium impact (for important actions)
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  
  // Heavy impact (for destructive actions or success)
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  },
  
  // Success pattern
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  },
  
  // Error pattern
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }
};
