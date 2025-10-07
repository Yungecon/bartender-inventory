'use client'

import { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, subMonths } from 'date-fns'

interface TrendData {
  ingredient_id: string
  ingredient_name: string
  supplier_name: string
  monthly_data: Array<{
    month: string
    count: number
    value: number
  }>
  trend: 'increasing' | 'decreasing' | 'stable'
  change_percentage: number
}

export function InventoryTrends() {
  const [selectedMonths, setSelectedMonths] = useState(6)
  
  // Get data for the last N months
  const monthQueries = useMemo(() => {
    const queries = []
    const now = new Date()
    
    for (let i = 0; i < selectedMonths; i++) {
      const date = subMonths(now, i)
      queries.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      })
    }
    
    return queries.reverse() // Oldest first
  }, [selectedMonths])

  // Fetch data for all months
  const monthlyDataQueries = trpc.useQueries((t: any) =>
    monthQueries.map((query: any) =>
      t.inventory.getByMonth(query)
    )
  )

  const isLoading = monthlyDataQueries.some((query) => query.isLoading)

  // Process trend data
  const trendData = useMemo(() => {
    if (isLoading || monthlyDataQueries.some((query) => !query.data)) {
      return []
    }

    const ingredientMap = new Map<string, TrendData>()

    monthlyDataQueries.forEach((query: any, monthIndex: number) => {
      if (!query.data) return

      const monthKey = format(
        new Date(monthQueries[monthIndex].year, monthQueries[monthIndex].month - 1),
        'MMM yyyy'
      )

      // Aggregate by ingredient for this month
      const monthlyTotals = new Map<string, { count: number; value: number; name: string; supplier: string }>()
      
      query.data.forEach((snapshot: any) => {
        const key = snapshot.ingredient_id
        const existing = monthlyTotals.get(key) || { count: 0, value: 0, name: '', supplier: '' }
        monthlyTotals.set(key, {
          count: existing.count + snapshot.count,
          value: existing.value + Number(snapshot.total_value),
          name: snapshot.ingredient.name,
          supplier: snapshot.ingredient.supplier.name,
        })
      })

      // Add to trend data
      monthlyTotals.forEach((totals, ingredientId) => {
        if (!ingredientMap.has(ingredientId)) {
          ingredientMap.set(ingredientId, {
            ingredient_id: ingredientId,
            ingredient_name: totals.name,
            supplier_name: totals.supplier,
            monthly_data: [],
            trend: 'stable',
            change_percentage: 0,
          })
        }

        const trendItem = ingredientMap.get(ingredientId)!
        trendItem.monthly_data.push({
          month: monthKey,
          count: totals.count,
          value: totals.value,
        })
      })
    })

    // Calculate trends
    const trends: TrendData[] = Array.from(ingredientMap.values()).map((item) => {
      if (item.monthly_data.length < 2) {
        return { ...item, trend: 'stable', change_percentage: 0 }
      }

      const firstMonth = item.monthly_data[0]
      const lastMonth = item.monthly_data[item.monthly_data.length - 1]
      
      const changePercentage = firstMonth.count > 0 
        ? ((lastMonth.count - firstMonth.count) / firstMonth.count) * 100
        : 0

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (Math.abs(changePercentage) > 10) {
        trend = changePercentage > 0 ? 'increasing' : 'decreasing'
      }

      return {
        ...item,
        trend,
        change_percentage: changePercentage,
      }
    })

    // Sort by absolute change percentage (most significant changes first)
    return trends.sort((a, b) => Math.abs(b.change_percentage) - Math.abs(a.change_percentage))
  }, [monthlyDataQueries, monthQueries, isLoading])

  const getTrendBadge = (trend: TrendData['trend'], percentage: number) => {
    switch (trend) {
      case 'increasing':
        return <Badge className="bg-green-100 text-green-800">↗ +{percentage.toFixed(1)}%</Badge>
      case 'decreasing':
        return <Badge className="bg-red-100 text-red-800">↘ {percentage.toFixed(1)}%</Badge>
      default:
        return <Badge variant="outline">→ Stable</Badge>
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading trend analysis...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Trends Analysis</CardTitle>
          <CardDescription>
            Analyze inventory patterns and identify significant changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Time Period Selector */}
          <div className="flex gap-4 mb-6">
            <Select value={selectedMonths.toString()} onValueChange={(value) => setSelectedMonths(parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Analysis Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trendData.length}</div>
                <p className="text-xs text-muted-foreground">Tracked ingredients</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Increasing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {trendData.filter((item) => item.trend === 'increasing').length}
                </div>
                <p className="text-xs text-muted-foreground">Growing inventory</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Decreasing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {trendData.filter((item) => item.trend === 'decreasing').length}
                </div>
                <p className="text-xs text-muted-foreground">Declining inventory</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {trendData.filter((item) => item.trend === 'stable').length}
                </div>
                <p className="text-xs text-muted-foreground">Consistent levels</p>
              </CardContent>
            </Card>
          </div>

          {/* Trends Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Current Count</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Monthly Pattern</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendData.slice(0, 20).map((item) => {
                const latestData = item.monthly_data[item.monthly_data.length - 1]
                return (
                  <TableRow key={item.ingredient_id}>
                    <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                    <TableCell>{item.supplier_name}</TableCell>
                    <TableCell>{getTrendBadge(item.trend, item.change_percentage)}</TableCell>
                    <TableCell>{latestData?.count || 0}</TableCell>
                    <TableCell>${(latestData?.value || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.monthly_data.slice(-6).map((month, index) => (
                          <div
                            key={index}
                            className="w-2 h-8 bg-blue-200 rounded-sm"
                            style={{
                              height: `${Math.max(8, (month.count / Math.max(...item.monthly_data.map(m => m.count))) * 32)}px`
                            }}
                            title={`${month.month}: ${month.count} items`}
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {!trendData.length && (
            <div className="text-center py-8 text-muted-foreground">
              No trend data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}