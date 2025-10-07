import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default locations
  const hobbitLocation = await prisma.location.upsert({
    where: { name: 'hobbit' },
    update: {},
    create: {
      name: 'hobbit',
    },
  })

  const cabinetLocation = await prisma.location.upsert({
    where: { name: 'cabinet' },
    update: {},
    create: {
      name: 'cabinet',
    },
  })

  const barLocation = await prisma.location.upsert({
    where: { name: 'bar' },
    update: {},
    create: {
      name: 'bar',
    },
  })

  // Create default email template
  const defaultTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Default Reorder Template',
      subject_template: 'Reorder Request - {{restaurant_name}}',
      body_template: `Dear {{supplier_name}},

We would like to place the following order:

{{#each items}}
- {{name}}: {{quantity}} units
{{/each}}

{{#if additional_context}}
Additional notes: {{additional_context}}
{{/if}}

Please confirm availability and delivery date.

Best regards,
{{restaurant_name}}`,
      locale: 'en',
    },
  })

  // Create sample suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Premium Spirits Co.',
      contact_name: 'John Smith',
      email: 'orders@premiumspirits.com',
      cc_emails: ['manager@premiumspirits.com'],
      email_template_id: defaultTemplate.id,
      auto_send_policy: 'MANUAL_APPROVE',
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Local Distillery',
      contact_name: 'Jane Doe',
      email: 'sales@localdistillery.com',
      cc_emails: [],
      email_template_id: defaultTemplate.id,
      auto_send_policy: 'AUTO_SEND_BUSINESS_HOURS',
    },
  })

  // Create sample ingredients
  const ingredient1 = await prisma.ingredient.create({
    data: {
      name: 'Hendricks Gin',
      supplier_id: supplier1.id,
      bottle_size: '750ml',
      current_price: 45.99,
      category: 'Gin',
      tags: ['core', 'premium'],
      par_level: 6,
      default_reorder_qty: 12,
      metadata: {
        flavor_profile: 'Cucumber and rose petal infused',
        origin: 'Scotland',
        abv: '44%',
      },
    },
  })

  const ingredient2 = await prisma.ingredient.create({
    data: {
      name: 'Titos Vodka',
      supplier_id: supplier2.id,
      bottle_size: '750ml',
      current_price: 28.99,
      category: 'Vodka',
      tags: ['core', 'common'],
      par_level: 8,
      default_reorder_qty: 24,
      metadata: {
        flavor_profile: 'Clean, neutral',
        origin: 'Texas, USA',
        abv: '40%',
      },
    },
  })

  // Create sample inventory snapshots
  await prisma.inventorySnapshot.createMany({
    data: [
      {
        ingredient_id: ingredient1.id,
        location_id: barLocation.id,
        count: 3,
        total_value: 137.97,
      },
      {
        ingredient_id: ingredient1.id,
        location_id: hobbitLocation.id,
        count: 2,
        total_value: 91.98,
      },
      {
        ingredient_id: ingredient2.id,
        location_id: barLocation.id,
        count: 5,
        total_value: 144.95,
      },
      {
        ingredient_id: ingredient2.id,
        location_id: cabinetLocation.id,
        count: 3,
        total_value: 86.97,
      },
    ],
  })

  // Create sample restaurant profile
  await prisma.restaurantProfile.create({
    data: {
      name: 'The Craft Bar',
      attributes: {
        concept: 'Farm-to-bar cocktail program',
        sustainability_focus: 'Local sourcing and zero waste',
        beverage_program: 'Craft cocktails with house-made syrups',
        mocktail_menu: true,
        wellness_focus: 'Low-ABV and functional ingredients',
      },
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })