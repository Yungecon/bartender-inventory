'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { WorksheetGrid } from './worksheet-grid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface WorksheetEntry {
  ingredient_id: string
  ingredient_name: string
  location_id: string
  location_name: string
  quantity: number
  value: number
  price_per_unit: number
}

export function VoiceCountingInterface() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  const { data: ingredients, isLoading: ingredientsLoading } = trpc.ingredients.list.useQuery()
  const { data: locations, isLoading: locationsLoading } = trpc.locations.list.useQuery()
  const submitWorksheet = trpc.inventory.submitWorksheet.useMutation()

  const handleSubmitWorksheet = async (entries: WorksheetEntry[]) => {
    setIsSubmitting(true)
    
    try {
      // Convert entries to the format expected by the API
      const snapshots = entries.map(entry => ({
        ingredient_id: entry.ingredient_id,
        location_id: entry.location_id,
        quantity: entry.quantity,
        value: entry.value,
        date: new Date()
      }))

      await submitWorksheet.mutateAsync({ snapshots })
      setSubmitSuccess(true)
      
      // Redirect to inventory page after success
      setTimeout(() => {
        router.push('/inventory')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to submit worksheet:', error)
      // Error handling is done by the mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  if (ingredientsLoading || locationsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading ingredients and locations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ingredients || !locations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Setup Required</CardTitle>
          <CardDescription>
            You need to set up ingredients and locations before using voice counting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={() => router.push('/ingredients')}>
              Manage Ingredients
            </Button>
            <Button variant="outline" onClick={() => router.push('/locations')}>
              Manage Locations
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submitSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Worksheet Submitted Successfully!</CardTitle>
          <CardDescription>
            Your inventory counts have been saved. Redirecting to inventory view...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">Inventory updated successfully!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Voice Counting Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Select a storage location (hobbit, cabinet, bar, etc.)</li>
            <li>Choose an ingredient from the list</li>
            <li>Click the microphone and speak the quantity clearly</li>
            <li>Confirm the voice recognition was correct</li>
            <li>Repeat for all ingredients in that location</li>
            <li>Review your entries and submit the worksheet</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm font-medium text-blue-800 mb-1">Voice Tips:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Speak clearly: "Five bottles" or "12" or "Zero"</li>
              <li>• Use numbers or words: "Three" or "3" both work</li>
              <li>• Speak in a quiet environment for best results</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <WorksheetGrid
        ingredients={ingredients as any}
        locations={locations as any}
        onSubmit={handleSubmitWorksheet}
      />

      {/* Loading State */}
      {isSubmitting && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-yellow-700 font-medium">Submitting your inventory counts...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}