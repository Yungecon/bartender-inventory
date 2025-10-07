import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'

interface POSRecord {
  date: string
  item_name: string
  category: string
  quantity: number
  unit_price: number
  total_price: number
  location?: string
  server?: string
  table?: string
}

// Mock POS data parsers for different systems
class POSParser {
  static parseToast(content: string): POSRecord[] {
    // Mock Toast POS format parsing
    const lines = content.split('\n').slice(1) // Skip header
    return lines.filter(line => line.trim()).map((line, index) => {
      const parts = line.split(',')
      return {
        date: new Date().toISOString().split('T')[0],
        item_name: `Toast Item ${index + 1}`,
        category: 'Beverages',
        quantity: Math.floor(Math.random() * 5) + 1,
        unit_price: Math.random() * 20 + 5,
        total_price: 0, // Will be calculated
        location: 'Main Bar',
        server: `Server ${Math.floor(Math.random() * 5) + 1}`,
        table: `Table ${Math.floor(Math.random() * 20) + 1}`
      }
    }).slice(0, 50) // Limit for demo
  }

  static parseMicros(content: string): POSRecord[] {
    // Mock Micros format parsing
    const lines = content.split('\n').slice(1)
    return lines.filter(line => line.trim()).map((line, index) => {
      return {
        date: new Date().toISOString().split('T')[0],
        item_name: `Micros Item ${index + 1}`,
        category: 'Food',
        quantity: Math.floor(Math.random() * 3) + 1,
        unit_price: Math.random() * 30 + 10,
        total_price: 0,
        location: 'Kitchen',
        server: `Staff ${Math.floor(Math.random() * 8) + 1}`
      }
    }).slice(0, 50)
  }

  static parseSquare(content: string): POSRecord[] {
    // Mock Square format parsing
    const lines = content.split('\n').slice(1)
    return lines.filter(line => line.trim()).map((line, index) => {
      return {
        date: new Date().toISOString().split('T')[0],
        item_name: `Square Item ${index + 1}`,
        category: 'Retail',
        quantity: Math.floor(Math.random() * 2) + 1,
        unit_price: Math.random() * 15 + 8,
        total_price: 0,
        location: 'Front Counter'
      }
    }).slice(0, 50)
  }

  static parseClover(content: string): POSRecord[] {
    // Mock Clover format parsing
    const lines = content.split('\n').slice(1)
    return lines.filter(line => line.trim()).map((line, index) => {
      return {
        date: new Date().toISOString().split('T')[0],
        item_name: `Clover Item ${index + 1}`,
        category: 'Beverages',
        quantity: Math.floor(Math.random() * 4) + 1,
        unit_price: Math.random() * 25 + 12,
        total_price: 0,
        location: 'Bar Area'
      }
    }).slice(0, 50)
  }

  static parseCSV(content: string): POSRecord[] {
    // Generic CSV parsing
    const lines = content.split('\n')
    const headers = lines[0].toLowerCase().split(',')
    
    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',')
      return {
        date: new Date().toISOString().split('T')[0],
        item_name: values[headers.indexOf('item')] || `CSV Item ${index + 1}`,
        category: values[headers.indexOf('category')] || 'General',
        quantity: parseInt(values[headers.indexOf('quantity')]) || Math.floor(Math.random() * 3) + 1,
        unit_price: parseFloat(values[headers.indexOf('price')]) || Math.random() * 20 + 5,
        total_price: 0,
        location: values[headers.indexOf('location')] || 'Unknown'
      }
    }).slice(0, 50)
  }
}

async function processPOSFile(filePath: string, format: string): Promise<any> {
  const content = await readFile(filePath, 'utf-8')
  
  let records: POSRecord[] = []
  
  switch (format) {
    case 'toast':
      records = POSParser.parseToast(content)
      break
    case 'micros':
      records = POSParser.parseMicros(content)
      break
    case 'square':
      records = POSParser.parseSquare(content)
      break
    case 'clover':
      records = POSParser.parseClover(content)
      break
    case 'csv':
      records = POSParser.parseCSV(content)
      break
    default:
      // Try to auto-detect format or use CSV as fallback
      records = POSParser.parseCSV(content)
  }

  // Calculate total prices
  records.forEach(record => {
    record.total_price = record.quantity * record.unit_price
  })

  // Generate summary statistics
  const summary = {
    recordCount: records.length,
    dateRange: {
      start: records.length > 0 ? records[0].date : null,
      end: records.length > 0 ? records[records.length - 1].date : null
    },
    totalSales: records.reduce((sum, record) => sum + record.total_price, 0),
    categories: [...new Set(records.map(r => r.category))],
    topItems: records
      .reduce((acc, record) => {
        const existing = acc.find(item => item.name === record.item_name)
        if (existing) {
          existing.quantity += record.quantity
          existing.revenue += record.total_price
        } else {
          acc.push({
            name: record.item_name,
            quantity: record.quantity,
            revenue: record.total_price
          })
        }
        return acc
      }, [] as Array<{name: string, quantity: number, revenue: number}>)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  return {
    success: true,
    format: format,
    summary,
    records: records.slice(0, 100), // Return first 100 for preview
    processed_at: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const format = formData.get('format') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const tempDir = join(process.cwd(), 'tmp')
    const filePath = join(tempDir, `pos-${Date.now()}-${file.name}`)
    
    try {
      await writeFile(filePath, buffer)
      
      // Process POS data
      const result = await processPOSFile(filePath, format)
      
      // Clean up temporary file
      await unlink(filePath)
      
      return NextResponse.json({
        ...result,
        filename: file.name,
        size: file.size,
        type: file.type
      })
      
    } catch (fileError) {
      // Try to clean up file even if processing failed
      try {
        await unlink(filePath)
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError)
      }
      throw fileError
    }
    
  } catch (error) {
    console.error('POS processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process POS file' }, 
      { status: 500 }
    )
  }
}