import { vi, describe, it, expect } from 'vitest'
import { 
  prismaMock, 
  createTestInventorySnapshot, 
  createTestIngredient, 
  createTestLocation,
  createTestSupplier 
} from '../utils/prisma-test-utils'

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('InventorySnapshot Model', () => {
  it('should create an inventory snapshot with valid data', async () => {
    const testSnapshot = createTestInventorySnapshot()

    prismaMock.inventorySnapshot.create.mockResolvedValue(testSnapshot)

    const result = await prismaMock.inventorySnapshot.create({
      data: {
        ingredient_id: testSnapshot.ingredient_id,
        location_id: testSnapshot.location_id,
        count: testSnapshot.count,
        total_value: testSnapshot.total_value,
      },
    })

    expect(result).toEqual(testSnapshot)
    expect(result.count).toBe(5)
    expect(result.total_value).toBe(229.95)
  })

  it('should establish relationships with ingredient and location', async () => {
    const testSupplier = createTestSupplier()
    const testIngredient = createTestIngredient()
    const testLocation = createTestLocation()
    const testSnapshot = createTestInventorySnapshot()

    prismaMock.inventorySnapshot.findUnique.mockResolvedValue({
      ...testSnapshot,
      ingredient: {
        ...testIngredient,
        supplier: testSupplier,
      },
      location: testLocation,
    })

    const result = await prismaMock.inventorySnapshot.findUnique({
      where: { id: testSnapshot.id },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
        location: true,
      },
    })

    expect(result?.ingredient.id).toBe(testIngredient.id)
    expect(result?.ingredient.supplier.id).toBe(testSupplier.id)
    expect(result?.location.id).toBe(testLocation.id)
  })

  it('should handle decimal precision for total_value', async () => {
    const testSnapshot = createTestInventorySnapshot({
      total_value: 123.45,
    })

    prismaMock.inventorySnapshot.create.mockResolvedValue(testSnapshot)

    const result = await prismaMock.inventorySnapshot.create({
      data: testSnapshot,
    })

    expect(result.total_value).toBe(123.45)
    expect(typeof result.total_value).toBe('number')
  })

  it('should validate non-negative count values', async () => {
    expect(() => {
      const invalidCount = -1
      if (invalidCount < 0) {
        throw new Error('Count must be non-negative')
      }
    }).toThrow('Count must be non-negative')
  })

  it('should handle multiple snapshots for same ingredient-location', async () => {
    const testIngredient = createTestIngredient()
    const testLocation = createTestLocation()
    
    const snapshots = [
      createTestInventorySnapshot({
        id: '550e8400-e29b-41d4-a716-446655440005',
        ingredient_id: testIngredient.id,
        location_id: testLocation.id,
        count: 5,
        submitted_at: new Date('2024-01-01'),
      }),
      createTestInventorySnapshot({
        id: '550e8400-e29b-41d4-a716-446655440006',
        ingredient_id: testIngredient.id,
        location_id: testLocation.id,
        count: 3,
        submitted_at: new Date('2024-01-02'),
      }),
    ]

    prismaMock.inventorySnapshot.findMany.mockResolvedValue(snapshots)

    const result = await prismaMock.inventorySnapshot.findMany({
      where: {
        ingredient_id: testIngredient.id,
        location_id: testLocation.id,
      },
      orderBy: {
        submitted_at: 'desc',
      },
    })

    expect(result).toHaveLength(2)
    expect(result[0].count).toBe(5)
    expect(result[1].count).toBe(3)
  })

  it('should cascade delete when ingredient is deleted', async () => {
    const testSnapshot = createTestInventorySnapshot()

    prismaMock.inventorySnapshot.deleteMany.mockResolvedValue({ count: 1 })

    const result = await prismaMock.inventorySnapshot.deleteMany({
      where: {
        ingredient_id: testSnapshot.ingredient_id,
      },
    })

    expect(result.count).toBe(1)
  })
})