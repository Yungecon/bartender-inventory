'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/components/providers/trpc-provider'

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

interface PriceDeltaReviewProps {
  deltas: PriceDelta[]
  onApprove: (approvedDeltas: PriceDelta[]) => void
  onReject: (rejectedDeltas: PriceDelta[]) => void
}

export function PriceDeltaReview({ deltas, onApprove, onReject }: PriceDeltaReviewProps) {
  const [selectedDeltas, setSelectedDeltas] = useState<Set<number>>(new Set())
  const [approvalThreshold] = useState(0.15) // 15% threshold for auto-approval

  const toggleSelection = (index: number) => {
    setSelectedDeltas(prev => {
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
    setSelectedDeltas(new Set(deltas.map((_, i) => i)))
  }

  const selectNone = () => {
    setSelectedDeltas(new Set())
  }

  const selectByThreshold = (threshold: number) => {
    const indices = deltas
      .map((delta, index) => ({ delta, index }))
      .filter(({ delta }) => Math.abs(delta.delta_percentage) <= threshold)
      .map(({ index }) => index)
    
    setSelectedDeltas(new Set(indices))
  }

  const getDeltaColor = (percentage: number) => {
    const abs = Math.abs(percentage)
    if (abs <= 0.05) return 'bg-green-500' // ≤5% - minimal change
    if (abs <= 0.15) return 'bg-yellow-500' // ≤15% - moderate change
    return 'bg-red-500' // >15% - significant change
  }

  const getDeltaText = (percentage: number) => {
    const abs = Math.abs(percentage)
    if (abs <= 0.05) return 'Minimal'
    if (abs <= 0.15) return 'Moderate'
    return 'Significant'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${(percentage * 100).toFixed(1)}%`
  }

  const handleApprove = () => {
    const approved = deltas.filter((_, i) => selectedDeltas.has(i))
    onApprove(approved)
  }

  const handleReject = () => {
    const rejected = deltas.filter((_, i) => selectedDeltas.has(i))
    onReject(rejected)
  }

  if (deltas.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-green-700 font-medium">No price changes detected</p>
          <p className="text-green-600 text-sm">All prices match existing records</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Price Change Review ({deltas.length} changes)</CardTitle>
          <CardDescription>
            Review price changes that exceed the automatic approval threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {deltas.filter(d => Math.abs(d.delta_percentage) <= 0.05).length}
                </div>
                <div className="text-sm text-gray-600">Minimal (≤5%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {deltas.filter(d => Math.abs(d.delta_percentage) > 0.05 && Math.abs(d.delta_percentage) <= 0.15).length}
                </div>
                <div className="text-sm text-gray-600">Moderate (5-15%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {deltas.filter(d => Math.abs(d.delta_percentage) > 0.15).length}
                </div>
                <div className="text-sm text-gray-600">Significant (>15%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {deltas.filter(d => d.requires_approval).length}
                </div>
                <div className="text-sm text-gray-600">Need Approval</div>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectByThreshold(0.05)}>
                Select Minimal (≤5%)
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectByThreshold(0.15)}>
                Select Moderate (≤15%)
              </Button>
              <span className="text-sm text-gray-500 ml-auto">
                {selectedDeltas.size} of {deltas.length} selected
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={selectedDeltas.size === 0}
              >
                Reject Selected
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={selectedDeltas.size === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Changes List */}
      <div className="space-y-3">
        {deltas.map((delta, index) => (
          <Card key={index} className={`${selectedDeltas.has(index) ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedDeltas.has(index)}
                    onChange={() => toggleSelection(index)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{delta.ingredient_name}</h3>
                      <Badge className={getDeltaColor(delta.delta_percentage)}>
                        {getDeltaText(delta.delta_percentage)}
                      </Badge>
                      {delta.requires_approval && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          Approval Required
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {delta.supplier_name} • Invoice: {delta.invoice_number}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Previous</div>
                      <div className="font-medium">{formatCurrency(delta.old_price)}</div>
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">New</div>
                      <div className="font-medium">{formatCurrency(delta.new_price)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Change</div>
                      <div className={`font-bold ${delta.delta_amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(delta.delta_amount)}
                      </div>
                      <div className={`text-sm ${delta.delta_amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercentage(delta.delta_percentage)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}