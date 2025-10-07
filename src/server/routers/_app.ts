import { router } from '../trpc'
import { ingredientsRouter } from './ingredients'
import { suppliersRouter } from './suppliers'
import { inventoryRouter } from './inventory'
import { locationsRouter } from './locations'

export const appRouter = router({
  ingredients: ingredientsRouter,
  suppliers: suppliersRouter,
  inventory: inventoryRouter,
  locations: locationsRouter,
})

export type AppRouter = typeof appRouter