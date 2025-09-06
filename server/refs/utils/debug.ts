const DEBUG = true; // Set to false to hide debug output

export function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}
