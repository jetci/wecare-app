// Vitest setup for API tests (Node.js environment)
// No DOM-specific setups like jest-dom should be here.

import { vi } from 'vitest';

// Expose global variables for tests if needed, similar to the main setup but without DOM specifics
Object.assign(globalThis, {
  jest: vi, // Alias jest to vi for compatibility if any tests use 'jest' object
});
