'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LineItem {
  description: string
  quantity: number
  unit_price: string
  total: string
}

interface OCRResult {
  supplier: string
  invoice_number: string
  date: string
  total_amount: string
  line_items: LineItem[]
  confidence: number
  raw_text: string
}

interface ProcessedFile {
  filename: string
  size: number
  type: string
  ocr_result: OCRResult
  processed_at: string
}

interface OCRResultsReviewProps {
  results: ProcessedFile[]
  onApprove: (approvedResults: ProcessedFile[]) => void
  onReject: (rejectedResults: ProcessedFile[]) => void
}

export function OCRResultsReview({ results, onApprove, onReject }: OCRResultsReviewProps) {
  const [editedResults, setEditedResults] = useState<ProcessedFile[]>(results)
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set())

  const updateResult = (index: number, field: string, value: any) => {
    setEditedResults(prev => 
      prev.map((result, i) => 
        i === index 
          ? { 
              ...result, 
              ocr_result: { 
                ...result.ocr_result, 
                [field]: value 
              } 
            }
          : result
      )
    )
  }

  const updateLineItem = (resultIndex: number, itemIndex: number, field: string, value: any) => {
    setEditedResults(prev => 
      prev.map((result, i) => 
        i === resultIndex 
          ? {
              ...result,
              ocr_result: {
                ...result.ocr_result,
                line_items: result.ocr_result.line_items.map((item, j) => 
                  j === itemIndex ? { ...item, [field]: value } : item
                )
              }
            }
          : result
      )
    )
  }

  const toggleSelection = (index: number) => {
    setSelectedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedResults(new Set(editedResults.map((_, i) => i)))
  }

  const selectNone = () => {
    setSelectedResults(new Set())
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500'
    if (confidence >= 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    if (confidence >= 0.9) return `${percentage}% - High`
    if (confidence >= 0.7) return `${percentage}% - Medium`
    return `${percentage}% - Low`
  }

  const handleApprove = () => {
    const approved = editedResults.filter((_, i) => selectedResults.has(i))
    onApprove(approved)
  }

  const handleReject = () => {
    const rejected = editedResults.filter((_, i) => selectedResults.has(i))
    onReject(rejected)
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No OCR results to review</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>OCR Results Review ({results.length} files)</CardTitle>
          <CardDescription>
            Review and edit the extracted invoice data before approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
              <span className="text-sm text-gray-500">
                {selectedResults.size} of {results.length} selected
              </span>
            </div>
            <div className="space-x-2">
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={selectedResults.size === 0}
              >
                Reject Selected
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={selectedResults.size === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {editedResults.map((result, index) => (
        <Card key={index} className={`${selectedResults.has(index) ? 'ring-2 ring-blue-500' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedResults.has(index)}
                  onChange={() => toggleSelection(index)}
                  className="w-4 h-4"
                />
                <div>
                  <CardTitle className="text-lg">{result.filename}</CardTitle>
                  <CardDescription>
                    Processed: {new Date(result.processed_at).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getConfidenceColor(result.ocr_result.confidence)}>
                {getConfidenceText(result.ocr_result.confidence)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="structured" className="w-full">
              <TabsList>
                <TabsTrigger value="structured">Structured Data</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="structured" className="space-y-4">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`supplier-${index}`}>Supplier</Label>
                    <Input
                      id={`supplier-${index}`}
                      value={result.ocr_result.supplier}
                      onChange={(e) => updateResult(index, 'supplier', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`invoice-${index}`}>Invoice Number</Label>
                    <Input
                      id={`invoice-${index}`}
                      value={result.ocr_result.invoice_number}
                      onChange={(e) => updateResult(index, 'invoice_number', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`date-${index}`}>Date</Label>
                    <Input
                      id={`date-${index}`}
                      type="date"
                      value={result.ocr_result.date}
                      onChange={(e) => updateResult(index, 'date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`total-${index}`}>Total Amount</Label>
                    <Input
                      id={`total-${index}`}
                      type="number"
                      step="0.01"
                      value={result.ocr_result.total_amount}
                      onChange={(e) => updateResult(index, 'total_amount', e.target.value)}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <Label className="text-base font-medium">Line Items</Label>
                  <div className="mt-2 space-y-3">
                    {result.ocr_result.line_items.map((item, itemIndex) => (
                      <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, itemIndex, 'description', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, itemIndex, 'quantity', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(index, itemIndex, 'unit_price', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Total</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.total}
                            onChange={(e) => updateLineItem(index, itemIndex, 'total', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="raw">
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {result.ocr_result.raw_text}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}