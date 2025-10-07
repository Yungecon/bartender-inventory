import { requireAuth } from '@/lib/auth'
import { WorksheetInterface } from '@/components/worksheet/worksheet-interface'

export default async function WorksheetPage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventory Worksheet</h1>
        <p className="text-gray-600">
          Manual inventory counting with temporary storage and location organization
        </p>
      </div>

      <WorksheetInterface />
    </div>
  )
}