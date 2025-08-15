import '@testing-library/jest-dom';
import { configure } from 'mobx';

// Configure MobX for testing
configure({
  enforceActions: "never",
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: true
});

// Mock window.location if needed
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock fetch if needed for tests
global.fetch = jest.fn();

// Setup for debugging in tests
process.env.DEBUG = '';

// Mock CSS modules
jest.mock('*.css', () => ({}));
jest.mock('*.scss', () => ({}));
