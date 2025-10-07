'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { TemporaryWorksheet } from './temporary-worksheet'
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

export function WorksheetInterface() {
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
      }, 3000)
      
    } catch (error) {
      console.error('Failed to submit worksheet:', error)
      // Error handling is done by the mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    // Reset is handled by the TemporaryWorksheet component
    console.log('Worksheet reset')
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

  if (!ingredients || !locations || ingredients.length === 0 || locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Setup Required</CardTitle>
          <CardDescription>
            You need to set up ingredients and locations before using the worksheet.
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
            Your inventory counts have been saved permanently. Redirecting to inventory view...
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
              <p className="text-green-600 text-sm mt-2">Temporary worksheet data has been cleared.</p>
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
          <CardTitle className="text-blue-800">Worksheet Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">How to Use:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Select a location tab (hobbit, cabinet, bar, etc.)</li>
                <li>Enter quantities for each ingredient in that location</li>
                <li>Switch between location tabs to count all areas</li>
                <li>Review totals and submit when complete</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Features:</h4>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• <strong>Auto-save:</strong> Data saved locally as you type</li>
                <li>• <strong>Location totals:</strong> See values per storage area</li>
                <li>• <strong>Temporary storage:</strong> Data cleared after submission</li>
                <li>• <strong>Mobile friendly:</strong> Works on phones and tablets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Worksheet */}
      <TemporaryWorksheet
        ingredients={ingredients}
        locations={locations}
        onSubmit={handleSubmitWorksheet}
        onReset={handleReset}
      />

      {/* Loading State */}
      {isSubmitting && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-yellow-700 font-medium">Submitting your inventory counts...</p>
              <p className="text-yellow-600 text-sm mt-1">This may take a moment for large inventories.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}