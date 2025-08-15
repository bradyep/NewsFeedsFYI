import debug from 'debug';

// Disable debug output in tests unless explicitly enabled
process.env.DEBUG = process.env.DEBUG || '';

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
