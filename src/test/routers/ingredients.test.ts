import { vi } from 'vitest'
import { prismaMock, createTestIngredient, createTestSupplier } from '../utils/prisma-test-utils'

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { ingredientsRouter } from '@/server/routers/ingredients'

// Mock context
const mockContext = {
  prisma: prismaMock,
}

describe('Ingredients Router', () => {
  it('should list ingredients with filters', async () => {
    const testSupplier = createTestSupplier()
    const testIngredients = [
      { ...createTestIngredient(), supplier: testSupplier },
      { 
        ...createTestIngredient({ 
          id: '550e8400-e29b-41d4-a716-446655440004', 
          name: 'Test Vodka',
          category: 'Vodka' 
        }), 
        supplier: testSupplier 
      },
    ]

    prismaMock.ingredient.findMany.mockResolvedValue(testIngredients)

    const caller = ingredientsRouter.createCaller(mockContext)
    const result = await caller.list({ category: 'Gin' })

    expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
      where: { category: 'Gin' },
      include: { supplier: true },
      orderBy: { name: 'asc' },
    })
    expect(result).toEqual(testIngredients)
  })

  it('should get ingredient by id with relationships', async () => {
    const testSupplier = createTestSupplier()
    const testIngredient = createTestIngredient()
    const mockSnapshots = [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        ingredient_id: testIngredient.id,
        location_id: '550e8400-e29b-41d4-a716-446655440002',
        count: 5,
        total_value: 229.95,
        submitted_at: new Date(),
        location: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'bar', created_at: new Date() },
      },
    ]

    prismaMock.ingredient.findUnique.mockResolvedValue({
      ...testIngredient,
      supplier: testSupplier,
      snapshots: mockSnapshots,
    })

    const caller = ingredientsRouter.createCaller(mockContext)
    const result = await caller.getById(testIngredient.id)

    expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
      where: { id: testIngredient.id },
      include: {
        supplier: true,
        snapshots: {
          include: { location: true },
          orderBy: { submitted_at: 'desc' },
          take: 12,
        },
      },
    })
    expect(result?.snapshots).toHaveLength(1)
  })

  it('should create ingredient with valid data', async () => {
    const testSupplier = createTestSupplier()
    const testIngredient = createTestIngredient()
    const createData = {
      name: testIngredient.name,
      supplier_id: testIngredient.supplier_id,
      bottle_size: testIngredient.bottle_size,
      current_price: testIngredient.current_price,
      category: testIngredient.category,
      tags: testIngredient.tags,
      par_level: testIngredient.par_level,
      default_reorder_qty: testIngredient.default_reorder_qty,
    }

    prismaMock.ingredient.create.mockResolvedValue({
      ...testIngredient,
      supplier: testSupplier,
    })

    const caller = ingredientsRouter.createCaller(mockContext)
    const result = await caller.create(createData)

    expect(prismaMock.ingredient.create).toHaveBeenCalledWith({
      data: createData,
      include: { supplier: true },
    })
    expect(result.supplier).toEqual(testSupplier)
  })

  it('should update ingredient tags', async () => {
    const testIngredient = createTestIngredient()
    const newTags = ['core', 'overstock']

    prismaMock.ingredient.update.mockResolvedValue({
      ...testIngredient,
      tags: newTags,
    })

    const caller = ingredientsRouter.createCaller(mockContext)
    const result = await caller.updateTags({
      id: testIngredient.id,
      tags: newTags,
    })

    expect(prismaMock.ingredient.update).toHaveBeenCalledWith({
      where: { id: testIngredient.id },
      data: { tags: newTags },
    })
    expect(result.tags).toEqual(newTags)
  })

  it('should delete ingredient', async () => {
    const testIngredient = createTestIngredient()

    prismaMock.ingredient.delete.mockResolvedValue(testIngredient)

    const caller = ingredientsRouter.createCaller(mockContext)
    const result = await caller.delete(testIngredient.id)

    expect(prismaMock.ingredient.delete).toHaveBeenCalledWith({
      where: { id: testIngredient.id },
    })
    expect(result).toEqual(testIngredient)
  })

  it('should filter ingredients by tags', async () => {
    const testIngredients = [
      createTestIngredient({ tags: ['core', 'premium'] }),
      createTestIngredient({ 
        id: '550e8400-e29b-41d4-a716-446655440004',
        tags: ['common', 'standard'] 
      }),
    ]

    prismaMock.ingredient.findMany.mockResolvedValue(testIngredients)

    const caller = ingredientsRouter.createCaller(mockContext)
    await caller.list({ tags: ['core'] })

    expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
      where: { tags: { hasSome: ['core'] } },
      include: { supplier: true },
      orderBy: { name: 'asc' },
    })
  })
})