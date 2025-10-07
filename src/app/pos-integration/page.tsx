import { requireAuth } from '@/lib/auth'
import { POSIntegrationInterface } from '@/components/pos/pos-integration-interface'

export default async function POSIntegrationPage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">POS Integration</h1>
        <p className="text-gray-600">
          Import and analyze sales data from your point-of-sale system
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">How POS Integration Works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
            <li><strong>Upload:</strong> Import sales data from Toast, Micros, Square, Clover, or CSV files</li>
            <li><strong>Processing:</strong> Automatically parse and normalize different POS formats</li>
            <li><strong>Product Mapping:</strong> Link POS items to inventory ingredients</li>
            <li><strong>Analysis:</strong> Generate sales trends and usage patterns</li>
            <li><strong>Integration:</strong> Enable chatbot recommendations based on sales data</li>
          </ol>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-medium text-blue-800 mb-2">Supported POS Systems:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-blue-700">
              <div>• Toast POS</div>
              <div>• Oracle Micros</div>
              <div>• Square</div>
              <div>• Clover</div>
              <div>• Generic CSV</div>
            </div>
          </div>
        </div>
      </div>

      <POSIntegrationInterface />
    </div>
  )
}