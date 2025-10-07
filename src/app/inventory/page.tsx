'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InventoryHistory } from '@/components/inventory/inventory-history'
import { LocationInventory } from '@/components/inventory/location-inventory'
import { InventoryTrends } from '@/components/inventory/inventory-trends'

export default function InventoryPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedIngredient, setSelectedIngredient] = useState<string>('')

  const { data: locations } = trpc.locations.list.useQuery()
  const { data: ingredients } = trpc.ingredients.list.useQuery()
  const { data: totals, isLoading: isLoadingTotals } = trpc.inventory.getTotals.useQuery()

  // Calculate summary statistics
  const summaryStats = {
    totalIngredients: totals?.length || 0,
    totalCount: totals?.reduce((sum: number, item: any) => sum + item.total_count, 0) || 0,
    totalValue: totals?.reduce((sum: number, item: any) => sum + item.total_value, 0) || 0,
    locations: locations?.length || 0,
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track inventory across locations with historical data and trend analysis
          </p>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalIngredients}</div>
            <p className="text-xs text-muted-foreground">Unique products tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCount}</div>
            <p className="text-xs text-muted-foreground">Items across all locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.locations}</div>
            <p className="text-xs text-muted-foreground">Storage areas configured</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory Overview</CardTitle>
              <CardDescription>
                Real-time view of all ingredients across locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTotals ? (
                <div className="flex justify-center p-8">Loading inventory data...</div>
              ) : (
                <div className="space-y-4">
                  {totals?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.supplier.name}</p>
                        <div className="flex gap-2 mt-1">
                          {item.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{item.total_count}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.total_value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {!totals?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No inventory data available. Start by adding some inventory snapshots.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredient History</CardTitle>
              <CardDescription>
                View 12-month history for a specific ingredient or browse by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select ingredient (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All ingredients</SelectItem>
                    {ingredients?.map((ingredient: any) => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} - {ingredient.supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedIngredient && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedIngredient('')}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <InventoryHistory ingredientId={selectedIngredient || undefined} />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location-Specific Inventory</CardTitle>
              <CardDescription>
                View inventory details for specific storage locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location: any) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location._count.snapshots} entries)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {selectedLocation && <LocationInventory locationId={selectedLocation} />}
          
          {!selectedLocation && (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                Select a location above to view its inventory details.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <InventoryTrends />
        </TabsContent>
      </Tabs>
    </div>
  )
}