import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

const snapshotSchema = z.object({
  ingredient_id: z.string().uuid(),
  location_id: z.string().uuid(),
  count: z.number().int().min(0),
  total_value: z.number().min(0),
})

const worksheetSchema = z.object({
  snapshots: z.array(snapshotSchema),
})

export const inventoryRouter = router({
  createSnapshot: protectedProcedure
    .input(snapshotSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventorySnapshot.create({
        data: input,
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
            data: snapshot,
          })
        )
      )
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
      FROM inventory_snapshots 
      ORDER BY ingredient_id, location_id, submitted_at DESC
    ` as Array<{
      ingredient_id: string
      location_id: string
      count: number
      total_value: number
      submitted_at: Date
    }>

    // Aggregate totals by ingredient
    const ingredientTotals = new Map<string, { count: number; value: number }>()
    
    for (const snapshot of recentSnapshots) {
      const current = ingredientTotals.get(snapshot.ingredient_id) || { count: 0, value: 0 }
      ingredientTotals.set(snapshot.ingredient_id, {
        count: current.count + snapshot.count,
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
      const totals = ingredientTotals.get(ingredient.id) || { count: 0, value: 0 }
      return {
        ...ingredient,
        total_count: totals.count,
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