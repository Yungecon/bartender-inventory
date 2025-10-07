import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { beforeEach } from 'vitest'

export type MockPrisma = DeepMockProxy<PrismaClient>

export const prismaMock = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(prismaMock)
})

// Real database test utilities for integration tests
let testPrisma: PrismaClient | null = null

export async function createTestContext() {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://localhost:5432/test_db'
        }
      }
    })
  }
  
  return {
    prisma: testPrisma,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin' as const
    }
  }
}

export async function cleanupTestData() {
  if (testPrisma) {
    // Clean up test data in reverse dependency order
    await testPrisma.inventorySnapshot.deleteMany({})
    await testPrisma.ingredient.deleteMany({})
    await testPrisma.supplier.deleteMany({})
    await testPrisma.location.deleteMany({})
  }
}

// Test data factories
export const createTestSupplier = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Supplier',
  contact_name: 'John Doe',
  email: 'john@testsupplier.com',
  cc_emails: [],
  email_template_id: null,
  auto_send_policy: 'MANUAL_APPROVE' as const,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

export const createTestIngredient = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Test Gin',
  supplier_id: '550e8400-e29b-41d4-a716-446655440000',
  bottle_size: '750ml',
  current_price: 45.99,
  category: 'Gin',
  tags: ['core', 'premium'],
  metadata: null,
  par_level: 6,
  default_reorder_qty: 12,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

export const createTestLocation = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'bar',
  created_at: new Date(),
  ...overrides,
})

export const createTestInventorySnapshot = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440003',
  ingredient_id: '550e8400-e29b-41d4-a716-446655440001',
  location_id: '550e8400-e29b-41d4-a716-446655440002',
  count: 5,
  total_value: 229.95,
  submitted_at: new Date(),
  ...overrides,
})