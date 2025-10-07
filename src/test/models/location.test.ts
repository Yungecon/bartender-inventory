import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestContext, cleanupTestData } from '../utils/prisma-test-utils'

describe('Location Model', () => {
  let testContext: any

  beforeEach(async () => {
    testContext = await createTestContext()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('Location creation and management', () => {
    it('should create locations with proper constraints', async () => {
      const location = await testContext.prisma.location.create({
        data: {
          name: 'hobbit',
          description: 'Hobbit hole storage area'
        }
      })

      expect(location.name).toBe('hobbit')
      expect(location.description).toBe('Hobbit hole storage area')
      expect(location.id).toBeDefined()
      expect(location.created_at).toBeDefined()
    })

    it('should enforce unique location names', async () => {
      await testContext.prisma.location.create({
        data: {
          name: 'cabinet',
          description: 'Main cabinet storage'
        }
      })

      // Attempt to create duplicate name should fail
      await expect(
        testContext.prisma.location.create({
          data: {
            name: 'cabinet',
            description: 'Another cabinet storage'
          }
        })
      ).rejects.toThrow()
    })

    it('should support standard bar location types', async () => {
      const standardLocations = [
        { name: 'hobbit', description: 'Hobbit hole storage' },
        { name: 'cabinet', description: 'Main storage cabinet' },
        { name: 'bar', description: 'Behind the bar area' },
        { name: 'cellar', description: 'Wine cellar storage' },
        { name: 'cooler', description: 'Refrigerated storage' }
      ]

      const createdLocations = await Promise.all(
        standardLocations.map(loc => 
          testContext.prisma.location.create({ data: loc })
        )
      )

      expect(createdLocations).toHaveLength(5)
      expect(createdLocations.map(l => l.name)).toEqual(
        expect.arrayContaining(['hobbit', 'cabinet', 'bar', 'cellar', 'cooler'])
      )
    })
  })

  describe('Location relationships with inventory', () => {
    it('should track inventory snapshots per location', async () => {
      const location = await testContext.prisma.location.create({
        data: {
          name: 'test_location',
          description: 'Test location for inventory'
        }
      })

      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Test Ingredient',
          category: 'spirits',
          unit: 'bottle',
          current_price: 20.00,
          supplier_id: null
        }
      })

      // Create multiple snapshots for this location
      const snapshots = await Promise.all([
        testContext.prisma.inventorySnapshot.create({
          data: {
            ingredient_id: ingredient.id,
            location_id: location.id,
            quantity: 10,
            value: 200.00,
            date: new Date('2024-01-01')
          }
        }),
        testContext.prisma.inventorySnapshot.create({
          data: {
            ingredient_id: ingredient.id,
            location_id: location.id,
            quantity: 8,
            value: 160.00,
            date: new Date('2024-02-01')
          }
        })
      ])

      // Verify location has snapshots
      const locationWithSnapshots = await testContext.prisma.location.findUnique({
        where: { id: location.id },
        include: {
          snapshots: true
        }
      })

      expect(locationWithSnapshots?.snapshots).toHaveLength(2)
      expect(locationWithSnapshots?.snapshots[0].quantity).toBe(10)
      expect(locationWithSnapshots?.snapshots[1].quantity).toBe(8)
    })

    it('should calculate total inventory value per location', async () => {
      const location = await testContext.prisma.location.create({
        data: {
          name: 'value_test_location',
          description: 'Location for value testing'
        }
      })

      // Create multiple ingredients
      const ingredients = await Promise.all([
        testContext.prisma.ingredient.create({
          data: {
            name: 'Expensive Spirit',
            category: 'spirits',
            unit: 'bottle',
            current_price: 100.00,
            supplier_id: null
          }
        }),
        testContext.prisma.ingredient.create({
          data: {
            name: 'Cheap Beer',
            category: 'beer',
            unit: 'bottle',
            current_price: 3.00,
            supplier_id: null
          }
        })
      ])

      // Create snapshots for same date
      const testDate = new Date('2024-01-15')
      await Promise.all([
        testContext.prisma.inventorySnapshot.create({
          data: {
            ingredient_id: ingredients[0].id,
            location_id: location.id,
            quantity: 5,
            value: 500.00,
            date: testDate
          }
        }),
        testContext.prisma.inventorySnapshot.create({
          data: {
            ingredient_id: ingredients[1].id,
            location_id: location.id,
            quantity: 50,
            value: 150.00,
            date: testDate
          }
        })
      ])

      // Calculate total value for location on specific date
      const totalValue = await testContext.prisma.inventorySnapshot.aggregate({
        where: {
          location_id: location.id,
          date: testDate
        },
        _sum: {
          value: true,
          quantity: true
        }
      })

      expect(totalValue._sum.value).toBe(650.00) // 500 + 150
      expect(totalValue._sum.quantity).toBe(55) // 5 + 50
    })
  })

  describe('Location data integrity', () => {
    it('should handle location deletion with existing snapshots', async () => {
      const location = await testContext.prisma.location.create({
        data: {
          name: 'deletion_test',
          description: 'Location to test deletion'
        }
      })

      const ingredient = await testContext.prisma.ingredient.create({
        data: {
          name: 'Test Ingredient',
          category: 'spirits',
          unit: 'bottle',
          current_price: 25.00,
          supplier_id: null
        }
      })

      // Create snapshot
      await testContext.prisma.inventorySnapshot.create({
        data: {
          ingredient_id: ingredient.id,
          location_id: location.id,
          quantity: 5,
          value: 125.00,
          date: new Date()
        }
      })

      // Attempting to delete location with snapshots should fail due to foreign key constraint
      await expect(
        testContext.prisma.location.delete({
          where: { id: location.id }
        })
      ).rejects.toThrow()
    })

    it('should validate location name format', async () => {
      // Test empty name
      await expect(
        testContext.prisma.location.create({
          data: {
            name: '',
            description: 'Empty name test'
          }
        })
      ).rejects.toThrow()

      // Test null name
      await expect(
        testContext.prisma.location.create({
          data: {
            name: null as any,
            description: 'Null name test'
          }
        })
      ).rejects.toThrow()
    })
  })
})