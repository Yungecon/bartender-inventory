import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

// Mock OCR processing - replace with actual OCR service like Tesseract.js or cloud OCR
async function processOCR(filePath: string, fileName: string) {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock OCR results based on file type
  const mockResults = {
    supplier: 'ABC Liquor Distributors',
    invoice_number: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    total_amount: (Math.random() * 1000 + 100).toFixed(2),
    line_items: [
      {
        description: 'Premium Vodka 750ml',
        quantity: Math.floor(Math.random() * 10) + 1,
        unit_price: (Math.random() * 50 + 20).toFixed(2),
        total: 0
      },
      {
        description: 'House Gin 1L',
        quantity: Math.floor(Math.random() * 8) + 1,
        unit_price: (Math.random() * 40 + 15).toFixed(2),
        total: 0
      },
      {
        description: 'Craft Beer Case',
        quantity: Math.floor(Math.random() * 5) + 1,
        unit_price: (Math.random() * 30 + 25).toFixed(2),
        total: 0
      }
    ],
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    raw_text: `INVOICE\n\nABC Liquor Distributors\n123 Main St\nCity, State 12345\n\nInvoice #: INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\nItems:\n- Premium Vodka 750ml\n- House Gin 1L\n- Craft Beer Case\n\nTotal: $${(Math.random() * 1000 + 100).toFixed(2)}`
  }

  // Calculate line item totals
  mockResults.line_items.forEach(item => {
    item.total = (parseFloat(item.unit_price) * item.quantity).toFixed(2)
  })

  return mockResults
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const tempDir = join(process.cwd(), 'tmp')
    const filePath = join(tempDir, `${Date.now()}-${file.name}`)
    
    try {
      await writeFile(filePath, buffer)
      
      // Process with OCR
      const ocrResult = await processOCR(filePath, file.name)
      
      // Clean up temporary file
      await unlink(filePath)
      
      return NextResponse.json({
        success: true,
        filename: file.name,
        size: file.size,
        type: file.type,
        ocr_result: ocrResult,
        processed_at: new Date().toISOString()
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
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' }, 
      { status: 500 }
    )
  }
}