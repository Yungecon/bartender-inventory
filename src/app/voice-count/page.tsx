import { requireAuth } from '@/lib/auth'
import { VoiceCountingInterface } from '@/components/voice/voice-counting-interface'

export default async function VoiceCountPage() {
  const user = await requireAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voice Inventory Counting</h1>
        <p className="text-gray-600">
          Use voice commands to quickly count inventory across locations
        </p>
      </div>

      <VoiceCountingInterface />
    </div>
  )
}