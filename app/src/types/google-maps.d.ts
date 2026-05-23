/**
 * Google Maps TypeScript declarations
 * Extend the global window object with Google Maps types
 */

declare global {
  interface Window {
    google: typeof google;
  }
}

// Export empty module to make this a module file
export {};