import { vi } from 'vitest'
import { prismaMock, createTestSupplier, createTestIngredient } from '../utils/prisma-test-utils'

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { suppliersRouter } from '@/server/routers/suppliers'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { it } from 'zod/v4/locales'
import { describe } from 'node:test'

// Mock context
const mockContext = {
  prisma: prismaMock,
}

describe('Suppliers Router', () => {
  it('should list suppliers with ingredient counts', async () => {
    const testSuppliers = [
      {
        ...createTestSupplier(),
        email_template: null,
        _count: { ingredients: 5 },
      },
      {
        ...createTestSupplier({
          id: '550e8400-e29b-41d4-a716-446655440005',
          name: 'Another Supplier',
        }),
        email_template: null,
        _count: { ingredients: 3 },
      },
    ]

    prismaMock.supplier.findMany.mockResolvedValue(testSuppliers)

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.list()

    expect(prismaMock.supplier.findMany).toHaveBeenCalledWith({
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
    expect(result).toEqual(testSuppliers)
    expect(result[0]._count.ingredients).toBe(5)
  })

  it('should get supplier by id with ingredients', async () => {
    const testSupplier = createTestSupplier()
    const testIngredients = [
      createTestIngredient({ supplier_id: testSupplier.id }),
      createTestIngredient({
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Test Vodka',
        supplier_id: testSupplier.id,
      }),
    ]

    prismaMock.supplier.findUnique.mockResolvedValue({
      ...testSupplier,
      email_template: null,
      ingredients: testIngredients,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.getById(testSupplier.id)

    expect(prismaMock.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: testSupplier.id },
      include: {
        email_template: true,
        ingredients: true,
      },
    })
    expect(result?.ingredients).toHaveLength(2)
  })

  it('should create supplier with valid data', async () => {
    const testSupplier = createTestSupplier()
    const createData = {
      name: testSupplier.name,
      contact_name: testSupplier.contact_name,
      email: testSupplier.email,
      cc_emails: testSupplier.cc_emails,
      auto_send_policy: testSupplier.auto_send_policy,
    }

    prismaMock.supplier.create.mockResolvedValue({
      ...testSupplier,
      email_template: null,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.create(createData)

    expect(prismaMock.supplier.create).toHaveBeenCalledWith({
      data: {
        ...createData,
        cc_emails: createData.cc_emails || [],
      },
      include: {
        email_template: true,
      },
    })
    expect(result.name).toBe(testSupplier.name)
  })

  it('should update supplier information', async () => {
    const testSupplier = createTestSupplier()
    const updateData = {
      id: testSupplier.id,
      name: 'Updated Supplier Name',
      contact_name: 'Jane Doe',
      email: 'jane@updatedsupplier.com',
      auto_send_policy: 'AUTO_SEND_BUSINESS_HOURS' as const,
    }

    prismaMock.supplier.update.mockResolvedValue({
      ...testSupplier,
      ...updateData,
      email_template: null,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.update(updateData)

    expect(prismaMock.supplier.update).toHaveBeenCalledWith({
      where: { id: updateData.id },
      data: {
        name: updateData.name,
        contact_name: updateData.contact_name,
        email: updateData.email,
        auto_send_policy: updateData.auto_send_policy,
      },
      include: {
        email_template: true,
      },
    })
    expect(result.name).toBe('Updated Supplier Name')
  })

  it('should delete supplier', async () => {
    const testSupplier = createTestSupplier()

    prismaMock.supplier.delete.mockResolvedValue(testSupplier)

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.delete(testSupplier.id)

    expect(prismaMock.supplier.delete).toHaveBeenCalledWith({
      where: { id: testSupplier.id },
    })
    expect(result).toEqual(testSupplier)
  })

  it('should handle cc_emails array correctly', async () => {
    const testSupplier = createTestSupplier({
      cc_emails: ['manager@supplier.com', 'orders@supplier.com'],
    })
    const createData = {
      name: testSupplier.name,
      contact_name: testSupplier.contact_name,
      email: testSupplier.email,
      cc_emails: testSupplier.cc_emails,
      auto_send_policy: testSupplier.auto_send_policy,
    }

    prismaMock.supplier.create.mockResolvedValue({
      ...testSupplier,
      email_template: null,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.create(createData)

    expect(result.cc_emails).toEqual(['manager@supplier.com', 'orders@supplier.com'])
    expect(Array.isArray(result.cc_emails)).toBe(true)
  })

  it('should validate auto_send_policy enum values', async () => {
    const testSupplier = createTestSupplier({
      auto_send_policy: 'AUTO_SEND_ALWAYS',
    })

    prismaMock.supplier.create.mockResolvedValue({
      ...testSupplier,
      email_template: null,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    const result = await caller.create({
      name: testSupplier.name,
      auto_send_policy: 'AUTO_SEND_ALWAYS',
    })

    expect(result.auto_send_policy).toBe('AUTO_SEND_ALWAYS')
  })

  it('should handle empty cc_emails array', async () => {
    const testSupplier = createTestSupplier({
      cc_emails: [],
    })

    prismaMock.supplier.create.mockResolvedValue({
      ...testSupplier,
      email_template: null,
    })

    const caller = suppliersRouter.createCaller(mockContext)
    await caller.create({
      name: testSupplier.name,
      cc_emails: undefined, // Should default to empty array
    })

    expect(prismaMock.supplier.create).toHaveBeenCalledWith({
      data: {
        name: testSupplier.name,
        cc_emails: [],
      },
      include: {
        email_template: true,
      },
    })
  })
})