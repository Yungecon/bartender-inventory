import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

const snapshotSchema = z.object({
  ingredient_id: z.string().uuid(),
  location_id: z.string().uuid(),
  count: z.number().int().min(0),
  total_value: z.number().min(0),
  submitted_at: z.date().optional(),
})

const worksheetSchema = z.object({
  snapshots: z.array(snapshotSchema),
})

export const inventoryRouter = router({
  createSnapshot: protectedProcedure
    .input(snapshotSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventorySnapshot.create({
        data: {
          ...input,
          submitted_at: input.submitted_at || new Date(),
        },
        include: {
          ingredient: true,
          location: true,
        },
      })
    }),

  submitWorksheet: protectedProcedure
    .input(worksheetSchema)
    .mutation(async ({ ctx, input }) => {
      // Create all snapshots in a transaction
      return ctx.prisma.$transaction(
        input.snapshots.map((snapshot) =>
          ctx.prisma.inventorySnapshot.create({
            data: {
              ...snapshot,
              submitted_at: snapshot.submitted_at || new Date(),
            },
          })
        )
      )
    }),

  getAggregatedByDate: publicProcedure
    .input(z.object({
      date: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const snapshots = await ctx.prisma.inventorySnapshot.findMany({
        where: {
          submitted_at: {
            gte: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
            lt: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate() + 1),
          },
        },
        include: {
          ingredient: true,
          location: true,
        },
      })

      // Aggregate by ingredient
      const aggregated = new Map<string, {
        ingredient_id: string
        total_quantity: number
        total_value: number
        ingredient: any
      }>()

      for (const snapshot of snapshots) {
        const current = aggregated.get(snapshot.ingredient_id) || {
          ingredient_id: snapshot.ingredient_id,
          total_quantity: 0,
          total_value: 0,
          ingredient: snapshot.ingredient,
        }
        
        aggregated.set(snapshot.ingredient_id, {
          ...current,
          total_quantity: current.total_quantity + snapshot.count,
          total_value: current.total_value + Number(snapshot.total_value),
        })
      }

      return Array.from(aggregated.values())
    }),

  getHistoricalByIngredient: publicProcedure
    .input(z.object({
      ingredient_id: z.string().uuid(),
      months: z.number().int().min(1).max(24).default(12),
    }))
    .query(async ({ ctx, input }) => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - input.months)

      return ctx.prisma.inventorySnapshot.findMany({
        where: {
          ingredient_id: input.ingredient_id,
          submitted_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          location: true,
        },
        orderBy: {
          submitted_at: 'asc',
        },
      })
    }),

  getLocationTotals: publicProcedure
    .input(z.object({
      location_id: z.string().uuid(),
      date: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const snapshots = await ctx.prisma.inventorySnapshot.findMany({
        where: {
          location_id: input.location_id,
          submitted_at: {
            gte: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate()),
            lt: new Date(input.date.getFullYear(), input.date.getMonth(), input.date.getDate() + 1),
          },
        },
      })

      const totals = snapshots.reduce(
        (acc, snapshot) => ({
          total_quantity: acc.total_quantity + snapshot.count,
          total_value: acc.total_value + Number(snapshot.total_value),
          item_count: acc.item_count + 1,
        }),
        { total_quantity: 0, total_value: 0, item_count: 0 }
      )

      return totals
    }),

  getTrends: publicProcedure
    .input(z.object({
      ingredient_id: z.string().uuid(),
      months: z.number().int().min(1).max(24).default(6),
    }))
    .query(async ({ ctx, input }) => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - input.months)

      return ctx.prisma.inventorySnapshot.findMany({
        where: {
          ingredient_id: input.ingredient_id,
          submitted_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          location: true,
        },
        orderBy: {
          submitted_at: 'asc',
        },
      })
    }),

  getByMonth: publicProcedure
    .input(
      z.object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1)
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59)

      return ctx.prisma.inventorySnapshot.findMany({
        where: {
          submitted_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          ingredient: {
            include: {
              supplier: true,
            },
          },
          location: true,
        },
        orderBy: {
          submitted_at: 'desc',
        },
      })
    }),

  getByLocation: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.inventorySnapshot.findMany({
        where: {
          location_id: input,
        },
        include: {
          ingredient: {
            include: {
              supplier: true,
            },
          },
          location: true,
        },
        orderBy: {
          submitted_at: 'desc',
        },
        take: 50, // Limit to recent entries
      })
    }),

  getTotals: publicProcedure.query(async ({ ctx }) => {
    // Get the most recent snapshot for each ingredient-location combination
    const recentSnapshots = await ctx.prisma.$queryRaw`
      SELECT DISTINCT ON (ingredient_id, location_id) 
        ingredient_id, location_id, count, total_value, submitted_at
      FROM "inventory_snapshots" 
      ORDER BY ingredient_id, location_id, submitted_at DESC
    ` as Array<{
      ingredient_id: string
      location_id: string
      count: number
      total_value: number
      submitted_at: Date
    }>

    // Aggregate totals by ingredient
    const ingredientTotals = new Map<string, { quantity: number; value: number }>()
    
    for (const snapshot of recentSnapshots) {
      const current = ingredientTotals.get(snapshot.ingredient_id) || { quantity: 0, value: 0 }
      ingredientTotals.set(snapshot.ingredient_id, {
        quantity: current.quantity + snapshot.count,
        value: current.value + Number(snapshot.total_value),
      })
    }

    // Get ingredient details
    const ingredients = await ctx.prisma.ingredient.findMany({
      where: {
        id: {
          in: Array.from(ingredientTotals.keys()),
        },
      },
      include: {
        supplier: true,
      },
    })

    return ingredients.map((ingredient) => {
      const totals = ingredientTotals.get(ingredient.id) || { quantity: 0, value: 0 }
      return {
        ...ingredient,
        total_quantity: totals.quantity,
        total_value: totals.value,
      }
    })
  }),

  getHistory: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.inventorySnapshot.findMany({
        where: {
          ingredient_id: input,
        },
        include: {
          location: true,
        },
        orderBy: {
          submitted_at: 'desc',
        },
        take: 12, // 12-month history
      })
    }),
})