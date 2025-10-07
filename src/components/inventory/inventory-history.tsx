'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

interface InventoryHistoryProps {
  ingredientId?: string
}

export function InventoryHistory({ ingredientId }: InventoryHistoryProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const { data: monthlyData, isLoading: isLoadingMonthly } = trpc.inventory.getByMonth.useQuery({
    year: selectedYear,
    month: selectedMonth,
  })

  const { data: ingredientHistory, isLoading: isLoadingHistory } = trpc.inventory.getHistory.useQuery(
    ingredientId!,
    {
      enabled: !!ingredientId,
    }
  )

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  // Calculate aggregated totals for the selected month
  const monthlyTotals = monthlyData?.reduce(
    (acc: any, snapshot: any) => {
      const locationTotals = acc.byLocation[snapshot.location.name] || { count: 0, value: 0 }
      acc.byLocation[snapshot.location.name] = {
        count: locationTotals.count + snapshot.count,
        value: locationTotals.value + Number(snapshot.total_value),
      }
      acc.total.count += snapshot.count
      acc.total.value += Number(snapshot.total_value)
      return acc
    },
    {
      byLocation: {} as Record<string, { count: number; value: number }>,
      total: { count: 0, value: 0 },
    }
  )

  if (ingredientId && isLoadingHistory) {
    return <div className="flex justify-center p-8">Loading ingredient history...</div>
  }

  if (!ingredientId && isLoadingMonthly) {
    return <div className="flex justify-center p-8">Loading monthly data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory History</CardTitle>
          <CardDescription>
            {ingredientId 
              ? 'View 12-month history for selected ingredient'
              : 'View inventory data by month and location'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ingredientId && (
            <div className="flex gap-4 mb-6">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Monthly Aggregated Totals */}
          {!ingredientId && monthlyTotals && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(monthlyTotals.byLocation).map(([location, totals]: [string, any]) => (
                <Card key={location}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{location}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.count}</div>
                    <p className="text-xs text-muted-foreground">
                      ${totals.value.toFixed(2)} total value
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyTotals.total.count}</div>
                  <p className="text-xs text-muted-foreground">
                    ${monthlyTotals.total.value.toFixed(2)} total value
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Table */}
          <Table>
            <TableHeader>
              <TableRow>
                {!ingredientId && <TableHead>Ingredient</TableHead>}
                {!ingredientId && <TableHead>Supplier</TableHead>}
                <TableHead>Location</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientId ? (
                ingredientHistory?.map((snapshot: any) => (
                  <TableRow key={snapshot.id}>
                    <TableCell>
                      <Badge variant="outline">{snapshot.location.name}</Badge>
                    </TableCell>
                    <TableCell>{snapshot.count}</TableCell>
                    <TableCell>${Number(snapshot.total_value).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(snapshot.submitted_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))
              ) : (
                monthlyData?.map((snapshot: any) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="font-medium">{snapshot.ingredient.name}</TableCell>
                    <TableCell>{snapshot.ingredient.supplier.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{snapshot.location.name}</Badge>
                    </TableCell>
                    <TableCell>{snapshot.count}</TableCell>
                    <TableCell>${Number(snapshot.total_value).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(snapshot.submitted_at), 'MMM dd, HH:mm')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {((ingredientId && !ingredientHistory?.length) || (!ingredientId && !monthlyData?.length)) && (
            <div className="text-center py-8 text-muted-foreground">
              No inventory data found for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}