'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download } from 'lucide-react'
import { format } from 'date-fns'
import { trpc } from '@/components/providers/trpc-provider'

interface ExportConfig {
  format: 'excel' | 'csv'
  dataType: 'inventory' | 'ingredients' | 'suppliers' | 'invoices' | 'sales'
  dateRange: {
    start: Date | null
    end: Date | null
  }
  locations: string[]
  categories: string[]
  suppliers: string[]
  columns: string[]
  includeHeaders: boolean
  includeMetadata: boolean
}

interface ExportBuilderProps {
  onExport: (config: ExportConfig) => void
  isExporting?: boolean
}

export function ExportBuilder({ onExport, isExporting = false }: ExportBuilderProps) {
  const generateExportMutation = trpc.exports.generate.useMutation()
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dataType: 'inventory',
    dateRange: {
      start: null,
      end: null
    },
    locations: [],
    categories: [],
    suppliers: [],
    columns: [],
    includeHeaders: true,
    includeMetadata: false
  })

  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null)

  // Available columns for different data types
  const availableColumns = {
    inventory: [
      'ingredient_name',
      'supplier_name', 
      'location_name',
      'quantity',
      'unit_price',
      'total_value',
      'category',
      'tags',
      'date_recorded',
      'par_level',
      'reorder_quantity'
    ],
    ingredients: [
      'name',
      'supplier_name',
      'category',
      'bottle_size',
      'current_price',
      'tags',
      'par_level',
      'default_reorder_qty',
      'created_at',
      'updated_at'
    ],
    suppliers: [
      'name',
      'contact_name',
      'email',
      'cc_emails',
      'auto_send_policy',
      'ingredient_count',
      'total_value',
      'created_at'
    ],
    invoices: [
      'invoice_number',
      'supplier_name',
      'date',
      'total_amount',
      'line_items_count',
      'processed_at',
      'status'
    ],
    sales: [
      'date',
      'item_name',
      'category',
      'quantity_sold',
      'unit_price',
      'total_revenue',
      'location',
      'server'
    ]
  }

  const updateConfig = (field: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const toggleColumn = (column: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(column)
        ? prev.columns.filter(c => c !== column)
        : [...prev.columns, column]
    }))
  }

  const selectAllColumns = () => {
    setConfig(prev => ({
      ...prev,
      columns: availableColumns[prev.dataType]
    }))
  }

  const clearAllColumns = () => {
    setConfig(prev => ({ ...prev, columns: [] }))
  }

  const handleExport = async () => {
    // Set default columns if none selected
    const finalConfig = {
      ...config,
      columns: config.columns.length > 0 ? config.columns : availableColumns[config.dataType].slice(0, 6)
    }
    
    try {
      const result = await generateExportMutation.mutateAsync(finalConfig)
      
      // Create download link
      const blob = new Blob([
        config.format === 'excel' 
          ? Uint8Array.from(atob(result.content), c => c.charCodeAt(0))
          : result.content
      ], { type: result.mimeType })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Call the onExport callback if provided
      onExport(finalConfig)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const getFormatDescription = (format: 'excel' | 'csv') => {
    switch (format) {
      case 'excel':
        return 'Excel format (.xlsx) with formatting, perfect for accounting software'
      case 'csv':
        return 'CSV format (.csv) for universal compatibility and data analysis'
      default:
        return ''
    }
  }

  const getDataTypeDescription = (dataType: ExportConfig['dataType']) => {
    switch (dataType) {
      case 'inventory':
        return 'Current inventory levels across all locations'
      case 'ingredients':
        return 'Master ingredient database with pricing and supplier info'
      case 'suppliers':
        return 'Supplier contact information and relationship data'
      case 'invoices':
        return 'Processed invoice history and pricing data'
      case 'sales':
        return 'POS sales data and product performance metrics'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Format */}
      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>Choose your preferred export format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['excel', 'csv'] as const).map(format => (
              <div
                key={format}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  config.format === format 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateConfig('format', format)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={config.format === format}
                    onChange={() => updateConfig('format', format)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium capitalize">{format} Export</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getFormatDescription(format)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Data to Export</CardTitle>
          <CardDescription>Select what type of data you want to export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(['inventory', 'ingredients', 'suppliers', 'invoices', 'sales'] as const).map(dataType => (
              <div
                key={dataType}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  config.dataType === dataType 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateConfig('dataType', dataType)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={config.dataType === dataType}
                    onChange={() => updateConfig('dataType', dataType)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium capitalize">{dataType} Data</div>
                    <div className="text-sm text-gray-500">
                      {getDataTypeDescription(dataType)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Filter data by date range (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover open={showDatePicker === 'start'} onOpenChange={(open) => setShowDatePicker(open ? 'start' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.dateRange.start ? format(config.dateRange.start, 'PPP') : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.start || undefined}
                    onSelect={(date) => {
                      updateConfig('dateRange', { ...config.dateRange, start: date || null })
                      setShowDatePicker(null)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover open={showDatePicker === 'end'} onOpenChange={(open) => setShowDatePicker(open ? 'end' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.dateRange.end ? format(config.dateRange.end, 'PPP') : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.end || undefined}
                    onSelect={(date) => {
                      updateConfig('dateRange', { ...config.dateRange, end: date || null })
                      setShowDatePicker(null)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {(config.dateRange.start || config.dateRange.end) && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateConfig('dateRange', { start: null, end: null })}
              >
                Clear Date Range
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Columns to Include</CardTitle>
              <CardDescription>
                Select which data fields to include in your export
              </CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllColumns}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllColumns}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableColumns[config.dataType].map(column => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={column}
                  checked={config.columns.includes(column)}
                  onCheckedChange={() => toggleColumn(column)}
                />
                <Label htmlFor={column} className="text-sm font-normal">
                  {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {config.columns.length} of {availableColumns[config.dataType].length} columns selected
            </div>
            {config.columns.length === 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Default columns will be used
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Additional formatting and metadata options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headers"
                checked={config.includeHeaders}
                onCheckedChange={(checked) => updateConfig('includeHeaders', checked)}
              />
              <Label htmlFor="headers">Include column headers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={config.includeMetadata}
                onCheckedChange={(checked) => updateConfig('includeMetadata', checked)}
              />
              <Label htmlFor="metadata">Include export metadata (date, user, filters)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Format:</span>
              <Badge className="capitalize">{config.format}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Data Type:</span>
              <Badge variant="outline" className="capitalize">{config.dataType}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Date Range:</span>
              <span className="text-gray-600">
                {config.dateRange.start && config.dateRange.end
                  ? `${format(config.dateRange.start, 'MMM d')} - ${format(config.dateRange.end, 'MMM d, yyyy')}`
                  : 'All dates'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Columns:</span>
              <span className="text-gray-600">
                {config.columns.length > 0 ? `${config.columns.length} selected` : 'Default set'}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={handleExport}
              disabled={isExporting || generateExportMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isExporting || generateExportMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate {config.format.toUpperCase()} Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}