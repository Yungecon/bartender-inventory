'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { POSFileUpload } from './pos-file-upload'
import { ProductMapping } from './product-mapping'
import { Badge } from '@/components/ui/badge'

type IntegrationStep = 'upload' | 'mapping' | 'complete'

interface ProcessedPOSData {
  filename: string
  format: string
  summary: {
    recordCount: number
    dateRange: {
      start: string
      end: string
    }
    totalSales: number
    categories: string[]
    topItems: Array<{
      name: string
      quantity: number
      revenue: number
    }>
  }
  records: any[]
  processed_at: string
}

interface ProductMapping {
  pos_item_name: string
  ingredient_id: string | null
  ingredient_name: string | null
  mapping_confidence: 'high' | 'medium' | 'low' | 'manual'
  usage_ratio: number
}

export function POSIntegrationInterface() {
  const [currentStep, setCurrentStep] = useState<IntegrationStep>('upload')
  const [processedData, setProcessedData] = useState<ProcessedPOSData[]>([])
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFilesProcessed = (results: any[]) => {
    const data: ProcessedPOSData[] = results.map(result => ({
      filename: result.filename,
      format: result.format,
      summary: result.summary,
      records: result.records,
      processed_at: result.processed_at
    }))
    
    setProcessedData(data)
    setCurrentStep('mapping')
    setError('')
  }

  const handleMappingComplete = async (mappings: ProductMapping[]) => {
    setIsProcessing(true)
    setProductMappings(mappings)
    
    try {
      // Here you would:
      // 1. Save product mappings to database
      // 2. Process sales data with mappings
      // 3. Update inventory usage analytics
      // 4. Create trend data for chatbot insights
      
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCurrentStep('complete')
    } catch (error) {
      setError('Failed to process POS integration')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUploadError = (error: string) => {
    setError(error)
  }

  const resetProcess = () => {
    setCurrentStep('upload')
    setProcessedData([])
    setProductMappings([])
    setError('')
  }

  const getStepNumber = (step: IntegrationStep) => {
    switch (step) {
      case 'upload': return 1
      case 'mapping': return 2
      case 'complete': return 3
      default: return 1
    }
  }

  // Aggregate all top items from processed data
  const allTopItems = processedData.reduce((acc, data) => {
    data.summary.topItems.forEach(item => {
      const existing = acc.find(existing => existing.name === item.name)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.revenue
      } else {
        acc.push({ 
          name: item.name,
          quantity: item.quantity,
          revenue: item.revenue,
          category: 'General' // Default category
        })
      }
    })
    return acc
  }, [] as Array<{name: string, quantity: number, revenue: number, category: string}>)

  const totalSales = processedData.reduce((sum, data) => sum + data.summary.totalSales, 0)
  const totalRecords = processedData.reduce((sum, data) => sum + data.summary.recordCount, 0)

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {(['upload', 'mapping', 'complete'] as IntegrationStep[]).map((step, index) => {
              const stepNumber = index + 1
              const isActive = currentStep === step
              const isCompleted = getStepNumber(currentStep) > stepNumber
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step === 'upload' && 'Upload POS Data'}
                      {step === 'mapping' && 'Map Products'}
                      {step === 'complete' && 'Integration Complete'}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      getStepNumber(currentStep) > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === 'upload' && (
        <POSFileUpload
          onFilesProcessed={handleFilesProcessed}
          onError={handleUploadError}
        />
      )}

      {currentStep === 'mapping' && processedData.length > 0 && (
        <div className="space-y-6">
          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>POS Data Summary</CardTitle>
              <CardDescription>
                Overview of processed sales data from {processedData.length} file(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                  <div className="text-sm text-gray-600">Sales Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{allTopItems.length}</div>
                  <div className="text-sm text-gray-600">Unique Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{processedData.length}</div>
                  <div className="text-sm text-gray-600">Data Sources</div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Detected POS Systems:</h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(processedData.map(d => d.format))].map(format => (
                    <Badge key={format} variant="outline" className="capitalize">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Mapping */}
          <ProductMapping
            posItems={allTopItems}
            onMappingComplete={handleMappingComplete}
          />
        </div>
      )}

      {currentStep === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">POS Integration Complete!</CardTitle>
            <CardDescription>
              Sales data has been successfully integrated with your inventory system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{processedData.length}</div>
                  <div className="text-sm text-green-700">Files Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {productMappings.filter(m => m.ingredient_id).length}
                  </div>
                  <div className="text-sm text-green-700">Products Mapped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalRecords}</div>
                  <div className="text-sm text-green-700">Sales Records</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-green-800 mb-2">What's Next:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Sales trends are now available for inventory analysis</li>
                  <li>• Product mappings will improve inventory usage tracking</li>
                  <li>• Chatbot can now provide sales-based recommendations</li>
                  <li>• Historical data is ready for trend analysis</li>
                </ul>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={resetProcess} className="bg-blue-600 hover:bg-blue-700">
                  Process More POS Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-blue-700 font-medium">Processing POS integration...</p>
              <p className="text-blue-600 text-sm mt-1">Saving mappings and analyzing sales data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}