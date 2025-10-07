'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { VoiceRecorder } from './voice-recorder'
import { ConfirmationReader } from './confirmation-reader'

interface WorksheetEntry {
  ingredient_id: string
  ingredient_name: string
  location_id: string
  location_name: string
  quantity: number
  value: number
  price_per_unit: number
}

interface WorksheetGridProps {
  ingredients: Array<{
    id: string
    name: string
    current_price: number
    bottle_size?: string
    category?: string
  }>
  locations: Array<{
    id: string
    name: string
  }>
  onSubmit: (entries: WorksheetEntry[]) => void
}

export function WorksheetGrid({ ingredients, locations, onSubmit }: WorksheetGridProps) {
  const [entries, setEntries] = useState<Map<string, WorksheetEntry>>(new Map())
  const [currentIngredient, setCurrentIngredient] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [voiceInput, setVoiceInput] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string>('')

  // Auto-select first location if only one exists
  useEffect(() => {
    if (locations.length === 1 && !currentLocation) {
      setCurrentLocation(locations[0].id)
    }
  }, [locations, currentLocation])

  const parseVoiceInput = (text: string): number | null => {
    // Remove common words and extract numbers
    const cleaned = text.toLowerCase()
      .replace(/bottles?|bottle|count|total|have|got|there are|i see/g, '')
      .trim()

    // Try to extract number
    const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const number = parseFloat(numberMatch[1])
      return number >= 0 ? number : null
    }

    // Handle word numbers (one, two, three, etc.)
    const wordNumbers: Record<string, number> = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
    }

    for (const [word, number] of Object.entries(wordNumbers)) {
      if (cleaned.includes(word)) {
        return number
      }
    }

    return null
  }

  const handleVoiceTranscription = (text: string) => {
    setVoiceInput(text)
    setShowConfirmation(true)
    setError('')
  }

  const handleVoiceError = (error: string) => {
    setError(error)
    setShowConfirmation(false)
  }

  const confirmVoiceInput = () => {
    const quantity = parseVoiceInput(voiceInput)
    
    if (quantity === null) {
      setError('Could not understand the number. Please try again.')
      setShowConfirmation(false)
      return
    }

    if (!currentIngredient || !currentLocation) {
      setError('Please select an ingredient and location first.')
      setShowConfirmation(false)
      return
    }

    const ingredient = ingredients.find(i => i.id === currentIngredient)
    const location = locations.find(l => l.id === currentLocation)
    
    if (!ingredient || !location) {
      setError('Invalid ingredient or location selected.')
      setShowConfirmation(false)
      return
    }

    const entryKey = `${currentIngredient}-${currentLocation}`
    const entry: WorksheetEntry = {
      ingredient_id: currentIngredient,
      ingredient_name: ingredient.name,
      location_id: currentLocation,
      location_name: location.name,
      quantity,
      value: quantity * ingredient.current_price,
      price_per_unit: ingredient.current_price
    }

    setEntries(prev => new Map(prev.set(entryKey, entry)))
    setShowConfirmation(false)
    setVoiceInput('')
    
    // Move to next ingredient
    const currentIndex = ingredients.findIndex(i => i.id === currentIngredient)
    if (currentIndex < ingredients.length - 1) {
      setCurrentIngredient(ingredients[currentIndex + 1].id)
    }
  }

  const rejectVoiceInput = () => {
    setShowConfirmation(false)
    setVoiceInput('')
    setError('')
  }

  const updateQuantity = (ingredientId: string, locationId: string, quantity: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    const location = locations.find(l => l.id === locationId)
    
    if (!ingredient || !location) return

    const entryKey = `${ingredientId}-${locationId}`
    
    if (quantity === 0) {
      setEntries(prev => {
        const newEntries = new Map(prev)
        newEntries.delete(entryKey)
        return newEntries
      })
    } else {
      const entry: WorksheetEntry = {
        ingredient_id: ingredientId,
        ingredient_name: ingredient.name,
        location_id: locationId,
        location_name: location.name,
        quantity,
        value: quantity * ingredient.current_price,
        price_per_unit: ingredient.current_price
      }
      setEntries(prev => new Map(prev.set(entryKey, entry)))
    }
  }

  const getTotalValue = () => {
    return Array.from(entries.values()).reduce((sum, entry) => sum + entry.value, 0)
  }

  const getTotalItems = () => {
    return Array.from(entries.values()).reduce((sum, entry) => sum + entry.quantity, 0)
  }

  const handleSubmit = () => {
    const entriesArray = Array.from(entries.values())
    if (entriesArray.length === 0) {
      setError('Please add at least one inventory entry before submitting.')
      return
    }
    onSubmit(entriesArray)
  }

  const clearWorksheet = () => {
    setEntries(new Map())
    setCurrentIngredient(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
          <CardDescription>Choose the storage location for counting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {locations.map(location => (
              <Button
                key={location.id}
                variant={currentLocation === location.id ? "default" : "outline"}
                onClick={() => setCurrentLocation(location.id)}
                className="capitalize"
              >
                {location.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Input Section */}
      {currentLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingredient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Ingredient</CardTitle>
              <CardDescription>Choose ingredient to count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ingredients.map(ingredient => (
                  <Button
                    key={ingredient.id}
                    variant={currentIngredient === ingredient.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setCurrentIngredient(ingredient.id)}
                  >
                    <div className="flex justify-between w-full">
                      <span>{ingredient.name}</span>
                      <Badge variant="secondary">${ingredient.current_price}</Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Input */}
          <div className="space-y-4">
            {currentIngredient && !showConfirmation && (
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                onError={handleVoiceError}
              />
            )}

            {showConfirmation && (
              <ConfirmationReader
                text={voiceInput}
                onConfirm={confirmVoiceInput}
                onReject={rejectVoiceInput}
              />
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-700 text-center">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Current Entries */}
      {entries.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Entries</CardTitle>
            <CardDescription>Review and edit your inventory counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(entries.values()).map(entry => (
                <div key={`${entry.ingredient_id}-${entry.location_id}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{entry.ingredient_name}</div>
                    <div className="text-sm text-gray-500 capitalize">{entry.location_name}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={entry.quantity}
                      onChange={(e) => updateQuantity(entry.ingredient_id, entry.location_id, parseFloat(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    <div className="text-right">
                      <div className="font-medium">${entry.value.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">${entry.price_per_unit}/unit</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Total Items: {getTotalItems()}</div>
                  <div className="font-bold text-lg">Total Value: ${getTotalValue().toFixed(2)}</div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={clearWorksheet}>
                    Clear All
                  </Button>
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                    Submit Worksheet
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}