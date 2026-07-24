import debug from 'debug';

// Disable debug output in tests unless explicitly enabled
process.env.DEBUG = process.env.DEBUG || '';

// Deterministic auth secrets for tests (avoids the dev-fallback warning and keeps
// signed JWT/CSRF tokens stable across test runs).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-do-not-use-in-production';
process.env.CSRF_SECRET = process.env.CSRF_SECRET || 'test-csrf-secret-do-not-use-in-production';

// Mock Sequelize database connection for tests
jest.mock('server/sequelize/nffyi-sequelize', () => ({
  connectDB: jest.fn().mockResolvedValue({
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  })
}));

// Global test timeout
jest.setTimeout(10000);
