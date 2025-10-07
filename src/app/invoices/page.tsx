import { requireAuth } from '@/lib/auth'
import { InvoiceProcessingInterface } from '@/components/invoices/invoice-processing-interface'

export default async function InvoicesPage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invoice Processing</h1>
        <p className="text-gray-600">
          Upload and process supplier invoices with OCR and automated price detection
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">How Invoice Processing Works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
            <li><strong>Upload:</strong> Drag and drop invoice files (PDF, images)</li>
            <li><strong>OCR Processing:</strong> Extract text and structured data automatically</li>
            <li><strong>Review & Edit:</strong> Verify and correct extracted information</li>
            <li><strong>Price Detection:</strong> Compare prices with existing inventory</li>
            <li><strong>Approval:</strong> Review significant price changes before updating</li>
            <li><strong>Integration:</strong> Update inventory prices and create records</li>
          </ol>
        </div>
      </div>

      <InvoiceProcessingInterface />
    </div>
  )
}