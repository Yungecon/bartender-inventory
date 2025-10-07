import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

const createSupplierSchema = z.object({
  name: z.string().min(1).max(255),
  contact_name: z.string().optional(),
  email: z.string().email().optional(),
  cc_emails: z.array(z.string().email()).optional(),
  email_template_id: z.string().uuid().optional(),
  auto_send_policy: z.enum(['MANUAL_APPROVE', 'AUTO_SEND_BUSINESS_HOURS', 'AUTO_SEND_ALWAYS']).optional(),
})

const updateSupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  contact_name: z.string().optional(),
  email: z.string().email().optional(),
  cc_emails: z.array(z.string().email()).optional(),
  email_template_id: z.string().uuid().optional(),
  auto_send_policy: z.enum(['MANUAL_APPROVE', 'AUTO_SEND_BUSINESS_HOURS', 'AUTO_SEND_ALWAYS']).optional(),
})

export const suppliersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.supplier.findMany({
      include: {
        email_template: true,
        _count: {
          select: {
            ingredients: true,
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
      return ctx.prisma.supplier.findUnique({
        where: { id: input },
        include: {
          email_template: true,
          ingredients: true,
        },
      })
    }),

  create: protectedProcedure
    .input(createSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.supplier.create({
        data: {
          ...input,
          cc_emails: input.cc_emails || [],
        },
        include: {
          email_template: true,
        },
      })
    }),

  update: protectedProcedure
    .input(updateSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.supplier.update({
        where: { id },
        data,
        include: {
          email_template: true,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.supplier.delete({
        where: { id: input },
      })
    }),
})