// Setup for common model tests
import debug from 'debug';

// Disable debug output in tests unless explicitly enabled
process.env.DEBUG = process.env.DEBUG || '';

// Global test timeout
jest.setTimeout(5000);
