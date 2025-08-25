import express from 'express';
import request from 'supertest';

export const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  return app;
};

export const setupTestDatabase = async () => {
  // Mock database setup for tests
  // This would typically involve setting up a test database
  // or using in-memory database for tests
};

export const cleanupTestDatabase = async () => {
  // Cleanup test database
};

export { request };
