import { initTRPC } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { prisma } from '@/lib/prisma'

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts
  
  return {
    req,
    res,
    prisma,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// For now, all procedures are public - no authentication required
export const protectedProcedure = publicProcedure
export const adminProcedure = publicProcedure
export const managerProcedure = publicProcedure