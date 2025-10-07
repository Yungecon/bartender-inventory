import { describe, it, expect } from 'vitest'

// Tagging algorithm functions (these would be implemented in the actual system)
export const categorizeIngredient = (ingredient: {
  current_price: number
  par_level?: number | null
  category: string
  usage_frequency?: number
}) => {
  const tags: string[] = []

  // Core items - essential for operations
  if (ingredient.par_level && ingredient.par_level >= 6) {
    tags.push('core')
  }

  // Common items - regularly used
  if (ingredient.par_level && ingredient.par_level >= 3 && ingredient.par_level < 6) {
    tags.push('common')
  }

  // Premium items - high-value products
  if (ingredient.current_price >= 50) {
    tags.push('premium')
  }

  // Category-based tagging
  if (['Gin', 'Vodka', 'Whiskey', 'Rum', 'Tequila'].includes(ingredient.category)) {
    tags.push('spirits')
  }

  if (['Bitters', 'Vermouth'].includes(ingredient.category)) {
    tags.push('cocktail-essential')
  }

  return tags
}

export const detectOverstock = (ingredient: {
  current_count: number
  par_level?: number | null
  usage_frequency?: number
  last_order_date?: Date
}) => {
  if (!ingredient.par_level) return false

  // Consider overstock if current count is more than 2x par level
  const overstockThreshold = ingredient.par_level * 2

  // Also consider usage frequency - low usage + high stock = overstock
  const lowUsage = ingredient.usage_frequency && ingredient.usage_frequency < 0.1

  return ingredient.current_count > overstockThreshold || 
         (ingredient.current_count > ingredient.par_level && lowUsage)
}

export const suggestReorderQuantity = (ingredient: {
  par_level?: number | null
  current_count: number
  default_reorder_qty?: number | null
  usage_frequency?: number
}) => {
  if (!ingredient.par_level) return 0

  const shortage = ingredient.par_level - ingredient.current_count

  if (shortage <= 0) return 0

  // Use default reorder quantity if available
  if (ingredient.default_reorder_qty) {
    return Math.max(shortage, ingredient.default_reorder_qty)
  }

  // Calculate based on usage frequency
  if (ingredient.usage_frequency) {
    const weeksOfStock = 4 // Target 4 weeks of stock
    const projectedUsage = ingredient.usage_frequency * weeksOfStock
    return Math.max(shortage, Math.ceil(projectedUsage))
  }

  // Default to par level if no other data available
  return ingredient.par_level
}

describe('Ingredient Tagging Algorithms', () => {
  describe('categorizeIngredient', () => {
    it('should tag high par level items as core', () => {
      const ingredient = {
        current_price: 30,
        par_level: 8,
        category: 'Gin',
      }

      const tags = categorizeIngredient(ingredient)
      expect(tags).toContain('core')
      expect(tags).toContain('spirits')
    })

    it('should tag medium par level items as common', () => {
      const ingredient = {
        current_price: 25,
        par_level: 4,
        category: 'Vodka',
      }

      const tags = categorizeIngredient(ingredient)
      expect(tags).toContain('common')
      expect(tags).toContain('spirits')
    })

    it('should tag expensive items as premium', () => {
      const ingredient = {
        current_price: 75,
        par_level: 2,
        category: 'Whiskey',
      }

      const tags = categorizeIngredient(ingredient)
      expect(tags).toContain('premium')
      expect(tags).toContain('spirits')
    })

    it('should tag cocktail essentials correctly', () => {
      const bitters = {
        current_price: 15,
        par_level: 3,
        category: 'Bitters',
      }

      const vermouth = {
        current_price: 20,
        par_level: 4,
        category: 'Vermouth',
      }

      expect(categorizeIngredient(bitters)).toContain('cocktail-essential')
      expect(categorizeIngredient(vermouth)).toContain('cocktail-essential')
    })

    it('should handle items with no par level', () => {
      const ingredient = {
        current_price: 30,
        par_level: null,
        category: 'Liqueur',
      }

      const tags = categorizeIngredient(ingredient)
      expect(tags).not.toContain('core')
      expect(tags).not.toContain('common')
    })
  })

  describe('detectOverstock', () => {
    it('should detect overstock when count exceeds 2x par level', () => {
      const ingredient = {
        current_count: 15,
        par_level: 6,
        usage_frequency: 0.5,
      }

      expect(detectOverstock(ingredient)).toBe(true)
    })

    it('should detect overstock with low usage frequency', () => {
      const ingredient = {
        current_count: 8,
        par_level: 6,
        usage_frequency: 0.05, // Very low usage
      }

      expect(detectOverstock(ingredient)).toBe(true)
    })

    it('should not detect overstock for normal levels', () => {
      const ingredient = {
        current_count: 5,
        par_level: 6,
        usage_frequency: 0.3,
      }

      expect(detectOverstock(ingredient)).toBe(false)
    })

    it('should handle items without par level', () => {
      const ingredient = {
        current_count: 10,
        par_level: null,
        usage_frequency: 0.1,
      }

      expect(detectOverstock(ingredient)).toBe(false)
    })
  })

  describe('suggestReorderQuantity', () => {
    it('should use default reorder quantity when available', () => {
      const ingredient = {
        par_level: 6,
        current_count: 2,
        default_reorder_qty: 12,
        usage_frequency: 0.2,
      }

      const quantity = suggestReorderQuantity(ingredient)
      expect(quantity).toBe(12) // Should use default_reorder_qty
    })

    it('should calculate based on usage frequency', () => {
      const ingredient = {
        par_level: 6,
        current_count: 2,
        default_reorder_qty: null,
        usage_frequency: 0.5, // 0.5 bottles per week
      }

      const quantity = suggestReorderQuantity(ingredient)
      expect(quantity).toBeGreaterThanOrEqual(4) // At least the shortage
      expect(quantity).toBeGreaterThanOrEqual(2) // At least projected 4-week usage
    })

    it('should return par level as fallback', () => {
      const ingredient = {
        par_level: 6,
        current_count: 1,
        default_reorder_qty: null,
        usage_frequency: undefined,
      }

      const quantity = suggestReorderQuantity(ingredient)
      expect(quantity).toBe(6) // Should return par_level
    })

    it('should return 0 when no reorder needed', () => {
      const ingredient = {
        par_level: 6,
        current_count: 8, // Above par level
        default_reorder_qty: 12,
      }

      const quantity = suggestReorderQuantity(ingredient)
      expect(quantity).toBe(0)
    })

    it('should handle items without par level', () => {
      const ingredient = {
        par_level: null,
        current_count: 2,
        default_reorder_qty: 12,
      }

      const quantity = suggestReorderQuantity(ingredient)
      expect(quantity).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete ingredient lifecycle', () => {
      const ingredient = {
        current_price: 45,
        par_level: 6,
        category: 'Gin',
        current_count: 3,
        default_reorder_qty: 12,
        usage_frequency: 0.3,
      }

      // Test categorization
      const tags = categorizeIngredient(ingredient)
      expect(tags).toContain('core')
      expect(tags).toContain('spirits')

      // Test overstock detection
      const isOverstock = detectOverstock(ingredient)
      expect(isOverstock).toBe(false)

      // Test reorder suggestion
      const reorderQty = suggestReorderQuantity(ingredient)
      expect(reorderQty).toBe(12) // Should use default_reorder_qty
    })

    it('should identify overstock premium items', () => {
      const premiumOverstock = {
        current_price: 85,
        par_level: 3,
        category: 'Whiskey',
        current_count: 8, // Way above par level
        usage_frequency: 0.05, // Very low usage
      }

      const tags = categorizeIngredient(premiumOverstock)
      const isOverstock = detectOverstock(premiumOverstock)

      expect(tags).toContain('premium')
      expect(tags).toContain('spirits')
      expect(isOverstock).toBe(true)

      // Should suggest adding overstock tag
      if (isOverstock) {
        tags.push('overstock')
      }

      expect(tags).toContain('overstock')
    })
  })
})