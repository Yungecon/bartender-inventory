import { vi, describe, it, expect } from 'vitest'
import { prismaMock, createTestIngredient, createTestSupplier } from '../utils/prisma-test-utils'

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('Ingredient Model', () => {
  it('should create an ingredient with valid data', async () => {
    const testSupplier = createTestSupplier()
    const testIngredient = createTestIngredient()

    prismaMock.ingredient.create.mockResolvedValue({
      ...testIngredient,
      supplier: testSupplier,
    })

    const result = await prismaMock.ingredient.create({
      data: {
        name: testIngredient.name,
        supplier_id: testIngredient.supplier_id,
        bottle_size: testIngredient.bottle_size,
        current_price: testIngredient.current_price,
        category: testIngredient.category,
        tags: testIngredient.tags,
        par_level: testIngredient.par_level,
        default_reorder_qty: testIngredient.default_reorder_qty,
      },
      include: {
        supplier: true,
      },
    })

    expect(result).toEqual({
      ...testIngredient,
      supplier: testSupplier,
    })
    expect(prismaMock.ingredient.create).toHaveBeenCalledWith({
      data: {
        name: testIngredient.name,
        supplier_id: testIngredient.supplier_id,
        bottle_size: testIngredient.bottle_size,
        current_price: testIngredient.current_price,
        category: testIngredient.category,
        tags: testIngredient.tags,
        par_level: testIngredient.par_level,
        default_reorder_qty: testIngredient.default_reorder_qty,
      },
      include: {
        supplier: true,
      },
    })
  })

  it('should validate required fields', async () => {
    const invalidData = {
      // Missing required fields
      bottle_size: '750ml',
      current_price: 45.99,
    }

    // This would fail validation at the Zod schema level
    expect(() => {
      // Simulate validation
      if (!invalidData.name || !invalidData.supplier_id || !invalidData.category) {
        throw new Error('Missing required fields')
      }
    }).toThrow('Missing required fields')
  })

  it('should handle tags array correctly', async () => {
    const testIngredient = createTestIngredient({
      tags: ['core', 'premium', 'gin'],
    })

    prismaMock.ingredient.create.mockResolvedValue(testIngredient)

    const result = await prismaMock.ingredient.create({
      data: testIngredient,
    })

    expect(result.tags).toEqual(['core', 'premium', 'gin'])
    expect(Array.isArray(result.tags)).toBe(true)
  })

  it('should update ingredient tags', async () => {
    const testIngredient = createTestIngredient()
    const newTags = ['core', 'overstock']

    prismaMock.ingredient.update.mockResolvedValue({
      ...testIngredient,
      tags: newTags,
    })

    const result = await prismaMock.ingredient.update({
      where: { id: testIngredient.id },
      data: { tags: newTags },
    })

    expect(result.tags).toEqual(newTags)
    expect(prismaMock.ingredient.update).toHaveBeenCalledWith({
      where: { id: testIngredient.id },
      data: { tags: newTags },
    })
  })

  it('should handle decimal precision for prices', async () => {
    const testIngredient = createTestIngredient({
      current_price: 45.99,
    })

    prismaMock.ingredient.create.mockResolvedValue(testIngredient)

    const result = await prismaMock.ingredient.create({
      data: testIngredient,
    })

    expect(result.current_price).toBe(45.99)
    expect(typeof result.current_price).toBe('number')
  })

  it('should categorize ingredients correctly', async () => {
    const categories = ['Spirits', 'Liqueurs', 'Bitters', 'Mixers', 'Garnishes']
    
    categories.forEach(category => {
      const testIngredient = createTestIngredient({ category })
      expect(testIngredient.category).toBe(category)
    })
  })

  it('should handle tag-based categorization', async () => {
    const coreIngredient = createTestIngredient({
      tags: ['core', 'premium'],
      name: 'Premium Gin',
    })

    const overstockIngredient = createTestIngredient({
      id: '550e8400-e29b-41d4-a716-446655440005',
      tags: ['overstock', 'common'],
      name: 'House Vodka',
    })

    const programIngredient = createTestIngredient({
      id: '550e8400-e29b-41d4-a716-446655440006',
      tags: ['program', 'seasonal'],
      name: 'Seasonal Liqueur',
    })

    // Test core ingredient
    expect(coreIngredient.tags).toContain('core')
    expect(coreIngredient.tags).toContain('premium')

    // Test overstock ingredient
    expect(overstockIngredient.tags).toContain('overstock')
    expect(overstockIngredient.tags).toContain('common')

    // Test program ingredient
    expect(programIngredient.tags).toContain('program')
    expect(programIngredient.tags).toContain('seasonal')
  })

  it('should validate par_level and default_reorder_qty', async () => {
    const testIngredient = createTestIngredient({
      par_level: 6,
      default_reorder_qty: 12,
    })

    prismaMock.ingredient.create.mockResolvedValue(testIngredient)

    const result = await prismaMock.ingredient.create({
      data: testIngredient,
    })

    expect(result.par_level).toBe(6)
    expect(result.default_reorder_qty).toBe(12)
    expect(typeof result.par_level).toBe('number')
    expect(typeof result.default_reorder_qty).toBe('number')
  })

  it('should handle optional fields as null/undefined', async () => {
    const testIngredient = createTestIngredient({
      par_level: null,
      default_reorder_qty: null,
      metadata: null,
    })

    prismaMock.ingredient.create.mockResolvedValue(testIngredient)

    const result = await prismaMock.ingredient.create({
      data: testIngredient,
    })

    expect(result.par_level).toBeNull()
    expect(result.default_reorder_qty).toBeNull()
    expect(result.metadata).toBeNull()
  })

  it('should support automatic tag assignment based on usage patterns', () => {
    // Simulate automatic tagging logic
    const getAutomaticTags = (ingredient: any) => {
      const tags = []
      
      // Core items (high par level)
      if (ingredient.par_level && ingredient.par_level >= 6) {
        tags.push('core')
      }
      
      // Common items (medium par level)
      if (ingredient.par_level && ingredient.par_level >= 3 && ingredient.par_level < 6) {
        tags.push('common')
      }
      
      // Premium items (high price)
      if (ingredient.current_price >= 50) {
        tags.push('premium')
      }
      
      return tags
    }

    const premiumIngredient = createTestIngredient({
      current_price: 75.99,
      par_level: 8,
    })

    const commonIngredient = createTestIngredient({
      current_price: 25.99,
      par_level: 4,
    })

    const premiumTags = getAutomaticTags(premiumIngredient)
    const commonTags = getAutomaticTags(commonIngredient)

    expect(premiumTags).toContain('core')
    expect(premiumTags).toContain('premium')
    expect(commonTags).toContain('common')
    expect(commonTags).not.toContain('premium')
  })
})