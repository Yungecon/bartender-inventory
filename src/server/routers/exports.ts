import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

// Export configuration schema
const exportConfigSchema = z.object({
  format: z.enum(['excel', 'csv']),
  dataType: z.enum(['inventory', 'ingredients', 'suppliers', 'invoices', 'sales']),
  dateRange: z.object({
    start: z.date().nullable(),
    end: z.date().nullable(),
  }),
  locations: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  suppliers: z.array(z.string()).optional(),
  columns: z.array(z.string()),
  includeHeaders: z.boolean().default(true),
  includeMetadata: z.boolean().default(false),
})

// Export history schema
const exportHistorySchema = z.object({
  id: z.string(),
  format: z.string(),
  dataType: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  recordCount: z.number(),
  createdAt: z.date(),
  downloadUrl: z.string().optional(),
})

// Scheduled export schema
const scheduledExportSchema = z.object({
  name: z.string().min(1),
  config: exportConfigSchema,
  schedule: z.enum(['daily', 'weekly', 'monthly']),
  enabled: z.boolean().default(true),
  emailRecipients: z.array(z.string().email()).optional(),
})

export const exportsRouter = router({
  // Generate export file
  generate: protectedProcedure
    .input(exportConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx
      
      let data: any[] = []
      let fileName = ''
      
      // Fetch data based on type
      switch (input.dataType) {
        case 'inventory':
          const inventoryData = await prisma.inventorySnapshot.findMany({
            where: {
              ...(input.dateRange.start && input.dateRange.end && {
                submitted_at: {
                  gte: input.dateRange.start,
                  lte: input.dateRange.end,
                }
              }),
              ...(input.locations && input.locations.length > 0 && {
                location: {
                  name: { in: input.locations }
                }
              }),
            },
            include: {
              ingredient: {
                include: {
                  supplier: true,
                }
              },
              location: true,
            },
            orderBy: {
              submitted_at: 'desc'
            }
          })
          
          data = inventoryData.map(snapshot => ({
            ingredient_name: snapshot.ingredient.name,
            supplier_name: snapshot.ingredient.supplier.name,
            location_name: snapshot.location.name,
            quantity: snapshot.count,
            unit_price: snapshot.ingredient.current_price,
            total_value: snapshot.total_value,
            category: snapshot.ingredient.category,
            tags: snapshot.ingredient.tags.join(', '),
            date_recorded: snapshot.submitted_at,
            par_level: snapshot.ingredient.par_level,
            reorder_quantity: snapshot.ingredient.default_reorder_qty,
          }))
          fileName = `inventory-export-${new Date().toISOString().split('T')[0]}`
          break
          
        case 'ingredients':
          const ingredientsData = await prisma.ingredient.findMany({
            include: {
              supplier: true,
            },
            orderBy: {
              name: 'asc'
            }
          })
          
          data = ingredientsData.map(ingredient => ({
            name: ingredient.name,
            supplier_name: ingredient.supplier.name,
            category: ingredient.category,
            bottle_size: ingredient.bottle_size,
            current_price: ingredient.current_price,
            tags: ingredient.tags.join(', '),
            par_level: ingredient.par_level,
            default_reorder_qty: ingredient.default_reorder_qty,
            created_at: ingredient.created_at,
            updated_at: ingredient.updated_at,
          }))
          fileName = `ingredients-export-${new Date().toISOString().split('T')[0]}`
          break
          
        case 'suppliers':
          const suppliersData = await prisma.supplier.findMany({
            include: {
              ingredients: true,
              _count: {
                select: {
                  ingredients: true,
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          })
          
          data = suppliersData.map(supplier => ({
            name: supplier.name,
            contact_name: supplier.contact_name,
            email: supplier.email,
            cc_emails: supplier.cc_emails.join(', '),
            auto_send_policy: supplier.auto_send_policy,
            ingredient_count: supplier._count.ingredients,
            total_value: supplier.ingredients.reduce((sum, ing) => sum + Number(ing.current_price), 0),
            created_at: supplier.created_at,
          }))
          fileName = `suppliers-export-${new Date().toISOString().split('T')[0]}`
          break
          
        case 'invoices':
          const invoicesData = await prisma.invoice.findMany({
            where: {
              ...(input.dateRange.start && input.dateRange.end && {
                invoice_date: {
                  gte: input.dateRange.start,
                  lte: input.dateRange.end,
                }
              }),
            },
            include: {
              supplier: true,
              lines: true,
            },
            orderBy: {
              invoice_date: 'desc'
            }
          })
          
          data = invoicesData.map(invoice => ({
            invoice_number: invoice.id,
            supplier_name: invoice.supplier.name,
            date: invoice.invoice_date,
            total_amount: invoice.lines.reduce((sum, line) => sum + (Number(line.unit_price) * line.purchased_qty), 0),
            line_items_count: invoice.lines.length,
            processed_at: invoice.created_at,
            status: invoice.status,
          }))
          fileName = `invoices-export-${new Date().toISOString().split('T')[0]}`
          break
          
        case 'sales':
          // For now, return empty data as POS integration is not fully implemented
          data = []
          fileName = `sales-export-${new Date().toISOString().split('T')[0]}`
          break
      }
      
      // Filter columns if specified
      if (input.columns.length > 0) {
        data = data.map(row => {
          const filteredRow: any = {}
          input.columns.forEach(col => {
            if (row.hasOwnProperty(col)) {
              filteredRow[col] = row[col]
            }
          })
          return filteredRow
        })
      }
      
      // Add metadata if requested
      if (input.includeMetadata && data.length > 0) {
        const metadata = {
          export_date: new Date().toISOString(),
          data_type: input.dataType,
          record_count: data.length,
          date_range: input.dateRange.start && input.dateRange.end 
            ? `${input.dateRange.start.toISOString().split('T')[0]} to ${input.dateRange.end.toISOString().split('T')[0]}`
            : 'All dates',
          columns_included: input.columns.length > 0 ? input.columns.join(', ') : 'All columns',
        }
        
        // Add metadata as first row for CSV, or separate sheet for Excel
        if (input.format === 'csv') {
          data.unshift(metadata)
        }
      }
      
      // Generate file content
      let fileContent: string
      let mimeType: string
      let fileExtension: string
      
      if (input.format === 'excel') {
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data, { 
          header: input.includeHeaders ? undefined : [] 
        })
        
        // Add metadata sheet if requested
        if (input.includeMetadata) {
          const metadataSheet = XLSX.utils.json_to_sheet([{
            export_date: new Date().toISOString(),
            data_type: input.dataType,
            record_count: data.length,
            date_range: input.dateRange.start && input.dateRange.end 
              ? `${input.dateRange.start.toISOString().split('T')[0]} to ${input.dateRange.end.toISOString().split('T')[0]}`
              : 'All dates',
            columns_included: input.columns.length > 0 ? input.columns.join(', ') : 'All columns',
          }])
          XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info')
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        fileContent = buffer.toString('base64')
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
      } else {
        fileContent = Papa.unparse(data, {
          header: input.includeHeaders,
          skipEmptyLines: true,
        })
        mimeType = 'text/csv'
        fileExtension = 'csv'
      }
      
      const fullFileName = `${fileName}.${fileExtension}`
      
      // In a real implementation, you would save this to cloud storage
      // For now, we'll return the base64 content for direct download
      return {
        fileName: fullFileName,
        content: fileContent,
        mimeType,
        recordCount: data.length,
        size: fileContent.length,
      }
    }),

  // Get export history
  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      // In a real implementation, this would fetch from a database table
      // For now, return mock data
      return [
        {
          id: '1',
          format: 'excel',
          dataType: 'inventory',
          fileName: 'inventory-export-2024-01-15.xlsx',
          fileSize: 45632,
          recordCount: 234,
          createdAt: new Date('2024-01-15T10:30:00Z'),
        },
        {
          id: '2',
          format: 'csv',
          dataType: 'ingredients',
          fileName: 'ingredients-export-2024-01-14.csv',
          fileSize: 12456,
          recordCount: 89,
          createdAt: new Date('2024-01-14T14:22:00Z'),
        },
      ]
    }),

  // Create scheduled export
  createScheduled: protectedProcedure
    .input(scheduledExportSchema)
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would save to database and set up cron job
      // For now, return success response
      return {
        id: `scheduled-${Date.now()}`,
        ...input,
        createdAt: new Date(),
      }
    }),

  // List scheduled exports
  listScheduled: protectedProcedure
    .query(async ({ ctx }) => {
      // In a real implementation, this would fetch from database
      // For now, return mock data
      return [
        {
          id: 'scheduled-1',
          name: 'Weekly Inventory Report',
          config: {
            format: 'excel' as const,
            dataType: 'inventory' as const,
            dateRange: { start: null, end: null },
            columns: ['ingredient_name', 'quantity', 'total_value'],
            includeHeaders: true,
            includeMetadata: true,
          },
          schedule: 'weekly' as const,
          enabled: true,
          emailRecipients: ['manager@bar.com'],
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]
    }),

  // Update scheduled export
  updateScheduled: protectedProcedure
    .input(z.object({
      id: z.string(),
      updates: scheduledExportSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update database record
      return {
        id: input.id,
        ...input.updates,
        updatedAt: new Date(),
      }
    }),

  // Delete scheduled export
  deleteScheduled: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would delete from database
      return { success: true }
    }),
})