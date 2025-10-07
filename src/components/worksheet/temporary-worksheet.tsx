'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WorksheetEntry {
  ingredient_id: string
  ingredient_name: string
  location_id: string
  location_name: string
  quantity: number
  value: number
  price_per_unit: number
}

interface TemporaryWorksheetProps {
  ingredients: any[]
  locations: Array<{
    id: string
    name: string
  }>
  onSubmit: (entries: WorksheetEntry[]) => void
  onReset: () => void
}

export function TemporaryWorksheet({ ingredients, locations, onSubmit, onReset }: TemporaryWorksheetProps) {
  const [entries, setEntries] = useState<Map<string, WorksheetEntry>>(new Map())
  const [activeLocation, setActiveLocation] = useState<string>(locations[0]?.id || '')
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bartender-worksheet')
    if (saved) {
      try {
        const savedEntries = JSON.parse(saved)
        const entriesMap = new Map<string, WorksheetEntry>()
        savedEntries.forEach((entry: WorksheetEntry) => {
          const key = `${entry.ingredient_id}-${entry.location_id}`
          entriesMap.set(key, entry)
        })
        setEntries(entriesMap)
      } catch (error) {
        console.error('Failed to load saved worksheet:', error)
      }
    }
  }, [])

  // Save to localStorage whenever entries change
  useEffect(() => {
    const entriesArray = Array.from(entries.values())
    localStorage.setItem('bartender-worksheet', JSON.stringify(entriesArray))
  }, [entries])

  const updateQuantity = (ingredientId: string, locationId: string, quantity: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    const location = locations.find(l => l.id === locationId)
    
    if (!ingredient || !location) return

    const entryKey = `${ingredientId}-${locationId}`
    
    if (quantity === 0 || isNaN(quantity)) {
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

  const getLocationEntries = (locationId: string) => {
    return Array.from(entries.values()).filter(entry => entry.location_id === locationId)
  }

  const getLocationTotals = (locationId: string) => {
    const locationEntries = getLocationEntries(locationId)
    return {
      totalItems: locationEntries.reduce((sum, entry) => sum + entry.quantity, 0),
      totalValue: locationEntries.reduce((sum, entry) => sum + entry.value, 0),
      itemCount: locationEntries.length
    }
  }

  const getGrandTotals = () => {
    const allEntries = Array.from(entries.values())
    return {
      totalItems: allEntries.reduce((sum, entry) => sum + entry.quantity, 0),
      totalValue: allEntries.reduce((sum, entry) => sum + entry.value, 0),
      itemCount: allEntries.length,
      locationCount: new Set(allEntries.map(entry => entry.location_id)).size
    }
  }

  const handleReset = () => {
    setEntries(new Map())
    localStorage.removeItem('bartender-worksheet')
    onReset()
  }

  const handleSubmit = () => {
    const entriesArray = Array.from(entries.values())
    if (entriesArray.length === 0) {
      return
    }
    
    // Clear temporary storage
    localStorage.removeItem('bartender-worksheet')
    onSubmit(entriesArray)
  }

  const grandTotals = getGrandTotals()

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Worksheet Summary</CardTitle>
          <CardDescription>
            Temporary counting worksheet - data is saved locally until submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{grandTotals.itemCount}</div>
              <div className="text-sm text-blue-700">Items Counted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{grandTotals.totalItems}</div>
              <div className="text-sm text-blue-700">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${grandTotals.totalValue.toFixed(2)}</div>
              <div className="text-sm text-blue-700">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{grandTotals.locationCount}</div>
              <div className="text-sm text-blue-700">Locations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Tabs */}
      <Tabs value={activeLocation} onValueChange={setActiveLocation}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          {locations.map(location => {
            const totals = getLocationTotals(location.id)
            return (
              <TabsTrigger key={location.id} value={location.id} className="relative">
                <div className="flex flex-col items-center">
                  <span className="capitalize">{location.name}</span>
                  {totals.itemCount > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {totals.itemCount}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {locations.map(location => (
          <TabsContent key={location.id} value={location.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{location.name} Inventory</CardTitle>
                <CardDescription>
                  Enter quantities for items in this location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {ingredients.map(ingredient => {
                    const entryKey = `${ingredient.id}-${location.id}`
                    const currentEntry = entries.get(entryKey)
                    const currentQuantity = currentEntry?.quantity || 0

                    return (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-sm text-gray-500">
                            ${ingredient.current_price}/unit
                            {ingredient.category && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {ingredient.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={currentQuantity || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              updateQuantity(ingredient.id, location.id, value)
                            }}
                            className="w-24 text-center"
                            placeholder="0"
                          />
                          {currentQuantity > 0 && (
                            <div className="text-right min-w-[80px]">
                              <div className="font-medium text-green-600">
                                ${(currentQuantity * ingredient.current_price).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Location Summary */}
                {getLocationEntries(location.id).length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Location Total:</div>
                        <div className="text-sm text-gray-500">
                          {getLocationTotals(location.id).itemCount} items, {getLocationTotals(location.id).totalItems} units
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${getLocationTotals(location.id).totalValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Buttons */}
      {grandTotals.itemCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Clear Worksheet
              </Button>
              <Button
                onClick={() => setShowSubmitConfirmation(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Submit Inventory ({grandTotals.itemCount} items)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Confirmation */}
      {showSubmitConfirmation && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Confirm Submission</CardTitle>
            <CardDescription>
              This will permanently save your inventory counts and clear the worksheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Items Counted: <strong>{grandTotals.itemCount}</strong></div>
                <div>Total Quantity: <strong>{grandTotals.totalItems}</strong></div>
                <div>Total Value: <strong>${grandTotals.totalValue.toFixed(2)}</strong></div>
                <div>Locations: <strong>{grandTotals.locationCount}</strong></div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirm & Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}