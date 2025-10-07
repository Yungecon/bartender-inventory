'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, FileText, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import { trpc } from '@/components/providers/trpc-provider'

interface ExportHistoryItem {
  id: string
  format: string
  dataType: string
  fileName: string
  fileSize: number
  recordCount: number
  createdAt: Date
  downloadUrl?: string
}

export function ExportHistory() {
  const { data: history, isLoading } = trpc.exports.getHistory.useQuery()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFormatBadgeColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'excel':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'csv':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDataTypeBadgeColor = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case 'inventory':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ingredients':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'suppliers':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'invoices':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'sales':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Loading export history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Export History
        </CardTitle>
        <CardDescription>
          View and download your previous exports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!history || history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No exports found</p>
            <p className="text-sm">Your export history will appear here after you generate your first export.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{history.length}</div>
                    <div className="text-sm text-blue-600">Total Exports</div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {history.reduce((sum, item) => sum + item.recordCount, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Total Records</div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatFileSize(history.reduce((sum, item) => sum + item.fileSize, 0))}
                    </div>
                    <div className="text-sm text-purple-600">Total Size</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.fileName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getDataTypeBadgeColor(item.dataType)}
                        >
                          {item.dataType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getFormatBadgeColor(item.format)}
                        >
                          {item.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.recordCount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatFileSize(item.fileSize)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(item.createdAt, 'MMM d, yyyy')}</div>
                          <div className="text-gray-500">{format(item.createdAt, 'h:mm a')}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => {
                            // In a real implementation, this would download from cloud storage
                            // For now, show a message that the file would be downloaded
                            alert(`Download ${item.fileName} - Feature will be implemented with cloud storage`)
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}