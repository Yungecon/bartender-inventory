'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/components/providers/trpc-provider'

interface POSItem {
  name: string
  category: string
  quantity: number
  revenue: number
}

interface ProductMapping {
  pos_item_name: string
  ingredient_id: string | null
  ingredient_name: string | null
  mapping_confidence: 'high' | 'medium' | 'low' | 'manual'
  usage_ratio: number // How much inventory is used per POS sale
}

interface ProductMappingProps {
  posItems: POSItem[]
  onMappingComplete: (mappings: ProductMapping[]) => void
}

export function ProductMapping({ posItems, onMappingComplete }: ProductMappingProps) {
  const [mappings, setMappings] = useState<ProductMapping[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: ingredients } = trpc.ingredients.list.useQuery(undefined)

  useEffect(() => {
    // Initialize mappings with auto-suggestions
    const initialMappings = posItems.map(item => {
      const suggestion = suggestIngredientMapping(item.name)
      return {
        pos_item_name: item.name,
        ingredient_id: suggestion?.id || null,
        ingredient_name: suggestion?.name || null,
        mapping_confidence: suggestion ? 'medium' as const : 'low' as const,
        usage_ratio: 1.0 // Default 1:1 ratio
      }
    })
    setMappings(initialMappings)
  }, [posItems])

  const suggestIngredientMapping = (posItemName: string) => {
    if (!ingredients) return null

    const lowerPosName = posItemName.toLowerCase()
    
    // Try exact match first
    let match = ingredients.find(ing => 
      ing.name.toLowerCase() === lowerPosName
    )
    
    if (match) return match

    // Try partial matches
    match = ingredients.find(ing => 
      lowerPosName.includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(lowerPosName)
    )
    
    if (match) return match

    // Try category-based matching
    const categoryKeywords = {
      'vodka': ['vodka', 'tito', 'grey goose', 'absolut'],
      'gin': ['gin', 'tanqueray', 'hendrick', 'bombay'],
      'whiskey': ['whiskey', 'bourbon', 'jack daniel', 'jameson'],
      'rum': ['rum', 'bacardi', 'captain morgan', 'malibu'],
      'beer': ['beer', 'bud', 'corona', 'heineken', 'stella'],
      'wine': ['wine', 'chardonnay', 'cabernet', 'pinot', 'merlot']
    }

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerPosName.includes(keyword))) {
        match = ingredients.find(ing => 
          ing.category?.toLowerCase().includes(category) ||
          ing.name.toLowerCase().includes(category)
        )
        if (match) return match
      }
    }

    return null
  }

  const updateMapping = (posItemName: string, field: keyof ProductMapping, value: any) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.pos_item_name === posItemName 
          ? { ...mapping, [field]: value }
          : mapping
      )
    )
  }

  const setIngredientMapping = (posItemName: string, ingredientId: string) => {
    const ingredient = ingredients?.find(ing => ing.id === ingredientId)
    if (ingredient) {
      updateMapping(posItemName, 'ingredient_id', ingredientId)
      updateMapping(posItemName, 'ingredient_name', ingredient.name)
      updateMapping(posItemName, 'mapping_confidence', 'manual')
    }
  }

  const clearMapping = (posItemName: string) => {
    updateMapping(posItemName, 'ingredient_id', null)
    updateMapping(posItemName, 'ingredient_name', null)
    updateMapping(posItemName, 'mapping_confidence', 'low')
  }

  const autoMapAll = () => {
    const updatedMappings = mappings.map(mapping => {
      const suggestion = suggestIngredientMapping(mapping.pos_item_name)
      if (suggestion && !mapping.ingredient_id) {
        return {
          ...mapping,
          ingredient_id: suggestion.id,
          ingredient_name: suggestion.name,
          mapping_confidence: 'medium' as const
        }
      }
      return mapping
    })
    setMappings(updatedMappings)
  }

  const getConfidenceColor = (confidence: ProductMapping['mapping_confidence']) => {
    switch (confidence) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-red-500'
      case 'manual': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = mapping.pos_item_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'mapped' && mapping.ingredient_id) ||
      (selectedCategory === 'unmapped' && !mapping.ingredient_id)
    
    return matchesSearch && matchesCategory
  })

  const mappedCount = mappings.filter(m => m.ingredient_id).length
  const totalCount = mappings.length

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Product Mapping ({mappedCount}/{totalCount} mapped)</CardTitle>
          <CardDescription>
            Link POS items to inventory ingredients for accurate usage tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(mappedCount / totalCount) * 100}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search POS Items</Label>
                <Input
                  id="search"
                  placeholder="Search by item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="sm:w-48">
                <Label htmlFor="category">Filter</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="mapped">Mapped Only</SelectItem>
                    <SelectItem value="unmapped">Unmapped Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={autoMapAll} variant="outline">
                  Auto-Map All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapping List */}
      <div className="space-y-3">
        {filteredMappings.map(mapping => {
          const posItem = posItems.find(item => item.name === mapping.pos_item_name)
          
          return (
            <Card key={mapping.pos_item_name}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* POS Item Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{mapping.pos_item_name}</h3>
                      <Badge className={getConfidenceColor(mapping.mapping_confidence)}>
                        {mapping.mapping_confidence}
                      </Badge>
                    </div>
                    {posItem && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Category: {posItem.category}</div>
                        <div>Sold: {posItem.quantity} units</div>
                        <div>Revenue: ${posItem.revenue.toFixed(2)}</div>
                      </div>
                    )}
                  </div>

                  {/* Ingredient Mapping */}
                  <div>
                    <Label className="text-sm font-medium">Map to Ingredient</Label>
                    <div className="mt-1">
                      {mapping.ingredient_id ? (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                          <span className="text-sm font-medium text-green-800">
                            {mapping.ingredient_name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearMapping(mapping.pos_item_name)}
                          >
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value=""
                          onValueChange={(value) => setIngredientMapping(mapping.pos_item_name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients?.map(ingredient => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} - {ingredient.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Usage Ratio */}
                  <div>
                    <Label htmlFor={`ratio-${mapping.pos_item_name}`} className="text-sm font-medium">
                      Usage Ratio
                    </Label>
                    <div className="mt-1">
                      <Input
                        id={`ratio-${mapping.pos_item_name}`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={mapping.usage_ratio}
                        onChange={(e) => updateMapping(
                          mapping.pos_item_name, 
                          'usage_ratio', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Inventory units used per POS sale
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {mappedCount} of {totalCount} items mapped ({Math.round((mappedCount / totalCount) * 100)}%)
            </div>
            <Button 
              onClick={() => onMappingComplete(mappings)}
              disabled={mappedCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Mapping ({mappedCount} items)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}