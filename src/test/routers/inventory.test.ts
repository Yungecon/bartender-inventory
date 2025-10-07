import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { appRouter } from '@/server/routers/_app'
import { createTestContext, cleanupTestData } from '../utils/prisma-test-utils'

describe('Inventory Router', () => {
  let testContext: any

  beforeEach(async () => {
    testContext = await createTestContext()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('Multi-location inventory tracking', () => {
    it('should create inventory snapshots for multiple locations', async () => {
      const caller = appRouter.createCaller(testContext)

      // Create test locations
      const hobbitLocation = await testContext.prisma.location.create({
        data: { name: 'hobbit', description: 'Hobbit storage area' }
      })

      const cabinetLocation = await testContext.prisma.location.create({
        data: { name: 'cabinet', description: 'Cabinet storage area' }
      })

      // Create test ingredient
      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Test Vodka',
          category: 'spirits',
          unit: 'bottle',
          current_price: 25.99,
          supplier_id: null
        }
      })

      // Create inventory snapshots for both locations
      const hobbitSnapshot = await caller.inventory.createSnapshot({
        ingredient_id: ingredient.id,
        location_id: hobbitLocation.id,
        quantity: 12,
        value: 311.88,
        date: new Date('2024-01-15')
      })

      const cabinetSnapshot = await caller.inventory.createSnapshot({
        ingredient_id: ingredient.id,
        location_id: cabinetLocation.id,
        quantity: 8,
        value: 207.92,
        date: new Date('2024-01-15')
      })

      expect(hobbitSnapshot.quantity).toBe(12)
      expect(cabinetSnapshot.quantity).toBe(8)
      expect(hobbitSnapshot.location_id).toBe(hobbitLocation.id)
      expect(cabinetSnapshot.location_id).toBe(cabinetLocation.id)
    })

    it('should aggregate inventory totals across locations', async () => {
      const caller = appRouter.createCaller(testContext)

      // Create locations
      const locations = await Promise.all([
        testContext.prisma.location.create({
          data: { name: 'hobbit', description: 'Hobbit area' }
        }),
        testContext.prisma.location.create({
          data: { name: 'cabinet', description: 'Cabinet area' }
        }),
        testContext.prisma.location.create({
          data: { name: 'bar', description: 'Bar area' }
        })
      ])

      // Create ingredient
      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Premium Gin',
          category: 'spirits',
          unit: 'bottle',
          current_price: 35.00,
          supplier_id: null
        }
      })

      // Create snapshots across all locations
      const snapshots = await Promise.all([
        caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: locations[0].id,
          quantity: 15,
          value: 525.00,
          date: new Date('2024-01-15')
        }),
        caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: locations[1].id,
          quantity: 10,
          value: 350.00,
          date: new Date('2024-01-15')
        }),
        caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: locations[2].id,
          quantity: 5,
          value: 175.00,
          date: new Date('2024-01-15')
        })
      ])

      // Get aggregated totals
      const aggregated = await caller.inventory.getAggregatedByDate({
        date: new Date('2024-01-15')
      })

      const ginTotal = aggregated.find(item => item.ingredient_id === ingredient.id)
      expect(ginTotal).toBeDefined()
      expect(ginTotal?.total_quantity).toBe(30) // 15 + 10 + 5
      expect(ginTotal?.total_value).toBe(1050.00) // 525 + 350 + 175
    })

    it('should track 12-month historical inventory data', async () => {
      const caller = appRouter.createCaller(testContext)

      // Create location and ingredient
      const location = await testContext.prisma.location.create({
        data: { name: 'bar', description: 'Main bar area' }
      })

      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'House Whiskey',
          category: 'spirits',
          unit: 'bottle',
          current_price: 28.50,
          supplier_id: null
        }
      })

      // Create monthly snapshots for 12 months
      const monthlyData = []
      for (let i = 0; i < 12; i++) {
        const date = new Date(2024, i, 15) // 15th of each month
        const quantity = 20 - i // Decreasing inventory over time
        const value = quantity * 28.50

        const snapshot = await caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: location.id,
          quantity,
          value,
          date
        })

        monthlyData.push(snapshot)
      }

      // Get historical data
      const historical = await caller.inventory.getHistoricalByIngredient({
        ingredient_id: ingredient.id,
        months: 12
      })

      expect(historical).toHaveLength(12)
      expect(historical[0].quantity).toBe(20) // January
      expect(historical[11].quantity).toBe(9) // December
      
      // Verify chronological order
      for (let i = 1; i < historical.length; i++) {
        expect(new Date(historical[i].date).getTime())
          .toBeGreaterThan(new Date(historical[i-1].date).getTime())
      }
    })

    it('should calculate location-specific inventory values', async () => {
      const caller = appRouter.createCaller(testContext)

      // Create locations
      const hobbitLocation = await testContext.prisma.location.create({
        data: { name: 'hobbit', description: 'Hobbit storage' }
      })

      // Create multiple ingredients
      const ingredients = await Promise.all([
        testContext.prisma.ingredient.create({
          data: {
            name: 'Expensive Scotch',
            category: 'spirits',
            unit: 'bottle',
            current_price: 150.00,
            supplier_id: null
          }
        }),
        testContext.prisma.ingredient.create({
          data: {
            name: 'House Wine',
            category: 'wine',
            unit: 'bottle',
            current_price: 12.00,
            supplier_id: null
          }
        })
      ])

      // Create snapshots with different values
      await Promise.all([
        caller.inventory.createSnapshot({
          ingredient_id: ingredients[0].id,
          location_id: hobbitLocation.id,
          quantity: 3,
          value: 450.00, // 3 * 150
          date: new Date('2024-01-15')
        }),
        caller.inventory.createSnapshot({
          ingredient_id: ingredients[1].id,
          location_id: hobbitLocation.id,
          quantity: 24,
          value: 288.00, // 24 * 12
          date: new Date('2024-01-15')
        })
      ])

      // Get location totals
      const locationTotals = await caller.inventory.getLocationTotals({
        location_id: hobbitLocation.id,
        date: new Date('2024-01-15')
      })

      expect(locationTotals.total_value).toBe(738.00) // 450 + 288
      expect(locationTotals.item_count).toBe(2)
      expect(locationTotals.total_quantity).toBe(27) // 3 + 24
    })
  })

  describe('Inventory data validation', () => {
    it('should validate snapshot data integrity', async () => {
      const caller = appRouter.createCaller(testContext)

      const location = await testContext.prisma.location.create({
        data: { name: 'test_location', description: 'Test location' }
      })

      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Test Spirit',
          category: 'spirits',
          unit: 'bottle',
          current_price: 30.00,
          supplier_id: null
        }
      })

      // Test negative quantity validation
      await expect(
        caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: location.id,
          quantity: -5,
          value: -150.00,
          date: new Date()
        })
      ).rejects.toThrow()

      // Test valid snapshot creation
      const validSnapshot = await caller.inventory.createSnapshot({
        ingredient_id: ingredient.id,
        location_id: location.id,
        quantity: 10,
        value: 300.00,
        date: new Date()
      })

      expect(validSnapshot.quantity).toBe(10)
      expect(validSnapshot.value).toBe(300.00)
    })

    it('should handle missing ingredient or location references', async () => {
      const caller = appRouter.createCaller(testContext)

      // Test with non-existent ingredient
      await expect(
        caller.inventory.createSnapshot({
          ingredient_id: 'non-existent-id',
          location_id: 'also-non-existent',
          quantity: 5,
          value: 100.00,
          date: new Date()
        })
      ).rejects.toThrow()
    })
  })

  describe('Inventory trend analysis', () => {
    it('should identify inventory movement patterns', async () => {
      const caller = appRouter.createCaller(testContext)

      const location = await testContext.prisma.location.create({
        data: { name: 'bar', description: 'Main bar' }
      })

      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Popular Vodka',
          category: 'spirits',
          unit: 'bottle',
          current_price: 25.00,
          supplier_id: null
        }
      })

      // Create trend data showing declining inventory
      const trendData = [
        { month: 0, quantity: 50 },
        { month: 1, quantity: 45 },
        { month: 2, quantity: 38 },
        { month: 3, quantity: 30 }
      ]

      for (const data of trendData) {
        await caller.inventory.createSnapshot({
          ingredient_id: ingredient.id,
          location_id: location.id,
          quantity: data.quantity,
          value: data.quantity * 25.00,
          date: new Date(2024, data.month, 15)
        })
      }

      const trends = await caller.inventory.getTrends({
        ingredient_id: ingredient.id,
        months: 4
      })

      expect(trends).toHaveLength(4)
      
      // Verify declining trend
      const quantities = trends.map(t => t.quantity)
      expect(quantities[0]).toBeGreaterThan(quantities[1])
      expect(quantities[1]).toBeGreaterThan(quantities[2])
      expect(quantities[2]).toBeGreaterThan(quantities[3])
    })
  })
})