'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InvoiceUpload } from './invoice-upload'
import { OCRResultsReview } from './ocr-results-review'
import { PriceDeltaReview } from './price-delta-review'
import { trpc } from '@/components/providers/trpc-provider'

type ProcessingStep = 'upload' | 'review' | 'price-check' | 'complete'

interface ProcessedFile {
  filename: string
  size: number
  type: string
  ocr_result: any
  processed_at: string
}

interface PriceDelta {
  ingredient_id: string
  ingredient_name: string
  old_price: number
  new_price: number
  delta_amount: number
  delta_percentage: number
  supplier_name: string
  invoice_number: string
  requires_approval: boolean
}

export function InvoiceProcessingInterface() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload')
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [approvedFiles, setApprovedFiles] = useState<ProcessedFile[]>([])
  const [priceDeltas, setPriceDeltas] = useState<PriceDelta[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  // Mock price delta detection - replace with actual logic
  const detectPriceDeltas = (files: ProcessedFile[]): PriceDelta[] => {
    const deltas: PriceDelta[] = []
    
    files.forEach(file => {
      file.ocr_result.line_items.forEach((item: any) => {
        // Mock existing price lookup
        const existingPrice = Math.random() * 50 + 10 // Random existing price
        const newPrice = parseFloat(item.unit_price)
        const deltaAmount = newPrice - existingPrice
        const deltaPercentage = deltaAmount / existingPrice
        
        // Only include if there's a significant change
        if (Math.abs(deltaPercentage) > 0.02) { // >2% change
          deltas.push({
            ingredient_id: `ingredient-${Math.random().toString(36).substr(2, 9)}`,
            ingredient_name: item.description,
            old_price: existingPrice,
            new_price: newPrice,
            delta_amount: deltaAmount,
            delta_percentage: deltaPercentage,
            supplier_name: file.ocr_result.supplier,
            invoice_number: file.ocr_result.invoice_number,
            requires_approval: Math.abs(deltaPercentage) > 0.15 // >15% requires approval
          })
        }
      })
    })
    
    return deltas
  }

  const handleFilesProcessed = (results: any[]) => {
    const files: ProcessedFile[] = results.map(result => ({
      filename: result.filename,
      size: result.size,
      type: result.type,
      ocr_result: result.ocr_result,
      processed_at: result.processed_at
    }))
    
    setProcessedFiles(files)
    setCurrentStep('review')
    setError('')
  }

  const handleOCRApproval = (approved: ProcessedFile[]) => {
    setApprovedFiles(approved)
    
    // Detect price changes
    const deltas = detectPriceDeltas(approved)
    setPriceDeltas(deltas)
    
    if (deltas.length > 0) {
      setCurrentStep('price-check')
    } else {
      // No price changes, proceed to completion
      handleFinalApproval([])
    }
  }

  const handleOCRRejection = (rejected: ProcessedFile[]) => {
    // Remove rejected files from processed list
    setProcessedFiles(prev => 
      prev.filter(file => !rejected.some(r => r.filename === file.filename))
    )
    
    if (processedFiles.length === rejected.length) {
      // All files rejected, go back to upload
      setCurrentStep('upload')
    }
  }

  const handlePriceApproval = (approvedDeltas: PriceDelta[]) => {
    handleFinalApproval(approvedDeltas)
  }

  const handlePriceRejection = (rejectedDeltas: PriceDelta[]) => {
    // Remove rejected deltas and continue with remaining
    const remainingDeltas = priceDeltas.filter(
      delta => !rejectedDeltas.some(r => r.ingredient_id === delta.ingredient_id)
    )
    
    if (remainingDeltas.length === 0) {
      handleFinalApproval([])
    } else {
      setPriceDeltas(remainingDeltas)
    }
  }

  const handleFinalApproval = async (approvedDeltas: PriceDelta[]) => {
    setIsProcessing(true)
    
    try {
      // Here you would:
      // 1. Create invoice records in database
      // 2. Update ingredient prices
      // 3. Create audit logs
      // 4. Send notifications if needed
      
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCurrentStep('complete')
    } catch (error) {
      setError('Failed to process invoices')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUploadError = (error: string) => {
    setError(error)
  }

  const resetProcess = () => {
    setCurrentStep('upload')
    setProcessedFiles([])
    setApprovedFiles([])
    setPriceDeltas([])
    setError('')
  }

  const getStepNumber = (step: ProcessingStep) => {
    switch (step) {
      case 'upload': return 1
      case 'review': return 2
      case 'price-check': return 3
      case 'complete': return 4
      default: return 1
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {(['upload', 'review', 'price-check', 'complete'] as ProcessingStep[]).map((step, index) => {
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
                      {step === 'upload' && 'Upload'}
                      {step === 'review' && 'Review OCR'}
                      {step === 'price-check' && 'Price Changes'}
                      {step === 'complete' && 'Complete'}
                    </div>
                  </div>
                  {index < 3 && (
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
        <InvoiceUpload
          onFilesProcessed={handleFilesProcessed}
          onError={handleUploadError}
        />
      )}

      {currentStep === 'review' && (
        <OCRResultsReview
          results={processedFiles}
          onApprove={handleOCRApproval}
          onReject={handleOCRRejection}
        />
      )}

      {currentStep === 'price-check' && (
        <PriceDeltaReview
          deltas={priceDeltas}
          onApprove={handlePriceApproval}
          onReject={handlePriceRejection}
        />
      )}

      {currentStep === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Processing Complete!</CardTitle>
            <CardDescription>
              Invoices have been successfully processed and integrated into your inventory system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedFiles.length}</div>
                  <div className="text-sm text-green-700">Invoices Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {priceDeltas.filter(d => Math.abs(d.delta_percentage) > 0).length}
                  </div>
                  <div className="text-sm text-green-700">Price Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {approvedFiles.reduce((sum, file) => sum + file.ocr_result.line_items.length, 0)}
                  </div>
                  <div className="text-sm text-green-700">Line Items</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={resetProcess} className="bg-blue-600 hover:bg-blue-700">
                  Process More Invoices
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
              <p className="text-blue-700 font-medium">Processing invoices...</p>
              <p className="text-blue-600 text-sm mt-1">Updating prices and creating records</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}