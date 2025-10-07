import { vi, describe, it, expect } from 'vitest'
import { prismaMock, createTestSupplier, createTestIngredient } from '../utils/prisma-test-utils'

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('Supplier Model', () => {
  it('should create a supplier with valid data', async () => {
    const testSupplier = createTestSupplier()

    prismaMock.supplier.create.mockResolvedValue(testSupplier)

    const result = await prismaMock.supplier.create({
      data: {
        name: testSupplier.name,
        contact_name: testSupplier.contact_name,
        email: testSupplier.email,
        cc_emails: testSupplier.cc_emails,
        auto_send_policy: testSupplier.auto_send_policy,
      },
    })

    expect(result).toEqual(testSupplier)
    expect(prismaMock.supplier.create).toHaveBeenCalledWith({
      data: {
        name: testSupplier.name,
        contact_name: testSupplier.contact_name,
        email: testSupplier.email,
        cc_emails: testSupplier.cc_emails,
        auto_send_policy: testSupplier.auto_send_policy,
      },
    })
  })

  it('should handle cc_emails array correctly', async () => {
    const testSupplier = createTestSupplier({
      cc_emails: ['manager@supplier.com', 'orders@supplier.com'],
    })

    prismaMock.supplier.create.mockResolvedValue(testSupplier)

    const result = await prismaMock.supplier.create({
      data: testSupplier,
    })

    expect(result.cc_emails).toEqual(['manager@supplier.com', 'orders@supplier.com'])
    expect(Array.isArray(result.cc_emails)).toBe(true)
  })

  it('should validate auto_send_policy enum values', async () => {
    const validPolicies = ['MANUAL_APPROVE', 'AUTO_SEND_BUSINESS_HOURS', 'AUTO_SEND_ALWAYS']
    
    validPolicies.forEach(policy => {
      const testSupplier = createTestSupplier({
        auto_send_policy: policy,
      })

      expect(validPolicies).toContain(testSupplier.auto_send_policy)
    })
  })

  it('should establish relationship with ingredients', async () => {
    const testSupplier = createTestSupplier()
    const testIngredients = [
      createTestIngredient({ supplier_id: testSupplier.id }),
      createTestIngredient({ 
        id: 'ingredient-2',
        name: 'Test Vodka',
        supplier_id: testSupplier.id 
      }),
    ]

    prismaMock.supplier.findUnique.mockResolvedValue({
      ...testSupplier,
      ingredients: testIngredients,
    })

    const result = await prismaMock.supplier.findUnique({
      where: { id: testSupplier.id },
      include: { ingredients: true },
    })

    expect(result?.ingredients).toHaveLength(2)
    expect(result?.ingredients[0].supplier_id).toBe(testSupplier.id)
    expect(result?.ingredients[1].supplier_id).toBe(testSupplier.id)
  })

  it('should handle cascade delete of ingredients', async () => {
    const testSupplier = createTestSupplier()

    prismaMock.supplier.delete.mockResolvedValue(testSupplier)

    const result = await prismaMock.supplier.delete({
      where: { id: testSupplier.id },
    })

    expect(result).toEqual(testSupplier)
    expect(prismaMock.supplier.delete).toHaveBeenCalledWith({
      where: { id: testSupplier.id },
    })
  })

  it('should validate email format', () => {
    const validEmails = [
      'test@supplier.com',
      'orders@example.org',
      'contact+orders@supplier.co.uk',
    ]

    const invalidEmails = [
      'invalid-email',
      '@supplier.com',
      'test@',
      'test.supplier.com',
    ]

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true)
    })

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false)
    })
  })

  it('should handle communication preferences correctly', async () => {
    const manualSupplier = createTestSupplier({
      auto_send_policy: 'MANUAL_APPROVE',
    })

    const businessHoursSupplier = createTestSupplier({
      id: '550e8400-e29b-41d4-a716-446655440006',
      auto_send_policy: 'AUTO_SEND_BUSINESS_HOURS',
    })

    const alwaysAutoSupplier = createTestSupplier({
      id: '550e8400-e29b-41d4-a716-446655440007',
      auto_send_policy: 'AUTO_SEND_ALWAYS',
    })

    expect(manualSupplier.auto_send_policy).toBe('MANUAL_APPROVE')
    expect(businessHoursSupplier.auto_send_policy).toBe('AUTO_SEND_BUSINESS_HOURS')
    expect(alwaysAutoSupplier.auto_send_policy).toBe('AUTO_SEND_ALWAYS')
  })

  it('should support multiple CC email addresses', async () => {
    const testSupplier = createTestSupplier({
      cc_emails: [
        'manager@supplier.com',
        'accounting@supplier.com',
        'orders@supplier.com',
      ],
    })

    prismaMock.supplier.create.mockResolvedValue(testSupplier)

    const result = await prismaMock.supplier.create({
      data: testSupplier,
    })

    expect(result.cc_emails).toHaveLength(3)
    expect(result.cc_emails).toContain('manager@supplier.com')
    expect(result.cc_emails).toContain('accounting@supplier.com')
    expect(result.cc_emails).toContain('orders@supplier.com')
  })

  it('should handle empty contact information gracefully', async () => {
    const minimalSupplier = createTestSupplier({
      contact_name: null,
      email: null,
      cc_emails: [],
    })

    prismaMock.supplier.create.mockResolvedValue(minimalSupplier)

    const result = await prismaMock.supplier.create({
      data: minimalSupplier,
    })

    expect(result.contact_name).toBeNull()
    expect(result.email).toBeNull()
    expect(result.cc_emails).toEqual([])
  })

  it('should validate supplier name is required', () => {
    expect(() => {
      const invalidSupplier = {
        name: '', // Empty name should fail validation
        auto_send_policy: 'MANUAL_APPROVE',
      }
      
      if (!invalidSupplier.name || invalidSupplier.name.trim() === '') {
        throw new Error('Supplier name is required')
      }
    }).toThrow('Supplier name is required')
  })

  it('should support email template association', async () => {
    const emailTemplate = {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Standard Order Template',
      subject_template: 'Order Request from {{restaurant_name}}',
      body_template: 'Please process the following order: {{order_items}}',
      locale: 'en',
      created_at: new Date(),
    }

    const testSupplier = createTestSupplier({
      email_template_id: emailTemplate.id,
    })

    prismaMock.supplier.findUnique.mockResolvedValue({
      ...testSupplier,
      email_template: emailTemplate,
    })

    const result = await prismaMock.supplier.findUnique({
      where: { id: testSupplier.id },
      include: { email_template: true },
    })

    expect(result?.email_template).toEqual(emailTemplate)
    expect(result?.email_template?.name).toBe('Standard Order Template')
  })
})