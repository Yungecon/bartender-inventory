'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

interface LocationInventoryProps {
  locationId: string
}

export function LocationInventory({ locationId }: LocationInventoryProps) {
  const { data: location, isLoading } = trpc.locations.getById.useQuery(locationId)
  const { data: locationSnapshots } = trpc.inventory.getByLocation.useQuery(locationId)

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading location inventory...</div>
  }

  if (!location) {
    return <div className="text-center p-8 text-muted-foreground">Location not found.</div>
  }

  // Calculate current totals for this location
  const currentTotals = locationSnapshots?.reduce(
    (acc: any, snapshot: any) => {
      // Get the most recent snapshot for each ingredient
      const existingIngredient = acc.ingredients.find(
        (item: any) => item.ingredient_id === snapshot.ingredient_id
      )
      
      if (!existingIngredient || new Date(snapshot.submitted_at) > new Date(existingIngredient.submitted_at)) {
        // Remove existing entry if found
        if (existingIngredient) {
          const index = acc.ingredients.indexOf(existingIngredient)
          acc.ingredients.splice(index, 1)
          acc.totalCount -= existingIngredient.count
          acc.totalValue -= Number(existingIngredient.total_value)
        }
        
        // Add new entry
        acc.ingredients.push(snapshot)
        acc.totalCount += snapshot.count
        acc.totalValue += Number(snapshot.total_value)
      }
      
      return acc
    },
    { ingredients: [] as typeof locationSnapshots, totalCount: 0, totalValue: 0 }
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{location.name}</Badge>
            Location Inventory
          </CardTitle>
          <CardDescription>
            Current inventory levels and recent activity for {location.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentTotals?.totalCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {currentTotals?.ingredients.length || 0} unique ingredients
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(currentTotals?.totalValue || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(location as any).snapshots?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Last 20 inventory entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Inventory Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Current Inventory</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTotals?.ingredients.map((snapshot: any) => (
                  <TableRow key={`${snapshot.ingredient_id}-current`}>
                    <TableCell className="font-medium">{snapshot.ingredient.name}</TableCell>
                    <TableCell>{snapshot.ingredient.supplier.name}</TableCell>
                    <TableCell>{snapshot.count}</TableCell>
                    <TableCell>${Number(snapshot.total_value).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(snapshot.submitted_at), 'MMM d, yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!currentTotals?.ingredients.length && (
              <div className="text-center py-8 text-muted-foreground">
                No current inventory data for this location.
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(location as any).snapshots?.map((snapshot: any) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="font-medium">{snapshot.ingredient.name}</TableCell>
                    <TableCell>{snapshot.ingredient.supplier.name}</TableCell>
                    <TableCell>{snapshot.count}</TableCell>
                    <TableCell>${Number(snapshot.total_value).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(snapshot.submitted_at), 'MMM d, yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!(location as any).snapshots?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity for this location.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}