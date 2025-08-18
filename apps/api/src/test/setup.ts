// Test setup file for Jest
import { prisma } from '../lib/prisma';

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up between tests if needed
});

afterEach(async () => {
  // Cleanup after each test
});