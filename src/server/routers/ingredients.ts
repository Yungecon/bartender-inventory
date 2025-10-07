import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

const createIngredientSchema = z.object({
  name: z.string().min(1).max(255),
  supplier_id: z.string().uuid(),
  bottle_size: z.string().min(1),
  current_price: z.number().positive(),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  par_level: z.number().int().positive().optional(),
  default_reorder_qty: z.number().int().positive().optional(),
})

const updateIngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  supplier_id: z.string().uuid().optional(),
  bottle_size: z.string().min(1).optional(),
  current_price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  par_level: z.number().int().positive().optional(),
  default_reorder_qty: z.number().int().positive().optional(),
})

export const ingredientsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        supplier_id: z.string().uuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {}
      
      if (input?.category) {
        where.category = input.category
      }
      
      if (input?.tags && input.tags.length > 0) {
        where.tags = {
          hasSome: input.tags,
        }
      }
      
      if (input?.supplier_id) {
        where.supplier_id = input.supplier_id
      }

      return ctx.prisma.ingredient.findMany({
        where,
        include: {
          supplier: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }),

  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.ingredient.findUnique({
        where: { id: input },
        include: {
          supplier: true,
          snapshots: {
            include: {
              location: true,
            },
            orderBy: {
              submitted_at: 'desc',
            },
            take: 12, // Last 12 entries for 12-month tracking
          },
        },
      })
    }),

  create: protectedProcedure
    .input(createIngredientSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.ingredient.create({
        data: input,
        include: {
          supplier: true,
        },
      })
    }),

  update: protectedProcedure
    .input(updateIngredientSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.ingredient.update({
        where: { id },
        data,
        include: {
          supplier: true,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.ingredient.delete({
        where: { id: input },
      })
    }),

  updateTags: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.ingredient.update({
        where: { id: input.id },
        data: { tags: input.tags },
      })
    }),
})