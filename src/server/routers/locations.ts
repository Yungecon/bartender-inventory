import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
})

export const locationsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.location.findMany({
      include: {
        _count: {
          select: {
            snapshots: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  }),

  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.location.findUnique({
        where: { id: input },
        include: {
          snapshots: {
            include: {
              ingredient: {
                include: {
                  supplier: true,
                },
              },
            },
            orderBy: {
              submitted_at: 'desc',
            },
            take: 20,
          },
        },
      })
    }),

  create: protectedProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.location.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.location.update({
        where: { id },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.location.delete({
        where: { id: input },
      })
    }),
})