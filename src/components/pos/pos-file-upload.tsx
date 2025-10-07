'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface UploadedPOSFile {
  file: File
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  detectedFormat?: 'toast' | 'micros' | 'square' | 'clover' | 'csv' | 'unknown'
  processedData?: any
  error?: string
}

interface POSFileUploadProps {
  onFilesProcessed: (results: any[]) => void
  onError: (error: string) => void
}

export function POSFileUpload({ onFilesProcessed, onError }: POSFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPOSFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const detectPOSFormat = (filename: string, content?: string): UploadedPOSFile['detectedFormat'] => {
    const lowerName = filename.toLowerCase()
    
    // Detect by filename patterns
    if (lowerName.includes('toast')) return 'toast'
    if (lowerName.includes('micros')) return 'micros'
    if (lowerName.includes('square')) return 'square'
    if (lowerName.includes('clover')) return 'clover'
    if (lowerName.endsWith('.csv')) return 'csv'
    
    // Could add content-based detection here
    return 'unknown'
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedPOSFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
      detectedFormat: detectPOSFormat(file.name)
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const processFile = async (fileData: UploadedPOSFile) => {
    try {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { ...f, status: 'processing', progress: 10 } : f)
      )

      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('format', fileData.detectedFormat || 'unknown')

      // Progress simulation
      for (let progress = 20; progress <= 80; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, progress } : f)
        )
      }

      const response = await fetch('/api/pos/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`POS processing failed: ${response.statusText}`)
      }

      const processedData = await response.json()

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          processedData 
        } : f)
      )

      return processedData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { 
          ...f, 
          status: 'error', 
          error: errorMessage 
        } : f)
      )
      
      throw error
    }
  }

  const processAllFiles = async () => {
    setIsProcessing(true)
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending')
    
    try {
      const results = []
      
      for (const file of pendingFiles) {
        const result = await processFile(file)
        results.push(result)
      }
      
      onFilesProcessed(results)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setUploadedFiles([])
  }

  const getFormatColor = (format: UploadedPOSFile['detectedFormat']) => {
    switch (format) {
      case 'toast': return 'bg-orange-500'
      case 'micros': return 'bg-blue-500'
      case 'square': return 'bg-green-500'
      case 'clover': return 'bg-purple-500'
      case 'csv': return 'bg-gray-500'
      default: return 'bg-yellow-500'
    }
  }

  const getFormatName = (format: UploadedPOSFile['detectedFormat']) => {
    switch (format) {
      case 'toast': return 'Toast POS'
      case 'micros': return 'Oracle Micros'
      case 'square': return 'Square'
      case 'clover': return 'Clover'
      case 'csv': return 'Generic CSV'
      default: return 'Unknown Format'
    }
  }

  const getStatusColor = (status: UploadedPOSFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload POS Data Files</CardTitle>
          <CardDescription>
            Upload sales data exports from Toast, Micros, Square, Clover, or CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop POS files here' : 'Drag POS data files here or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports CSV, Excel, and text files up to 50MB
                </p>
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Supported POS Systems:</p>
            <div className="flex flex-wrap gap-2">
              {['Toast POS', 'Oracle Micros', 'Square', 'Clover', 'Generic CSV'].map(format => (
                <Badge key={format} variant="outline" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
                <CardDescription>
                  Review detected formats and process sales data
                </CardDescription>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={clearAll} size="sm">
                  Clear All
                </Button>
                <Button 
                  onClick={processAllFiles}
                  disabled={isProcessing || uploadedFiles.every(f => f.status !== 'pending')}
                  size="sm"
                >
                  {isProcessing ? 'Processing...' : 'Process All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map(fileData => (
                <div key={fileData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Badge className={getFormatColor(fileData.detectedFormat)} size="sm">
                            {getFormatName(fileData.detectedFormat)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {fileData.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={fileData.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Processing sales data... {fileData.progress}%</p>
                      </div>
                    )}
                    
                    {fileData.error && (
                      <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                    )}

                    {fileData.processedData && (
                      <div className="mt-2 text-xs text-green-600">
                        Processed {fileData.processedData.recordCount} sales records
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(fileData.status)}>
                      {fileData.status === 'pending' && 'Pending'}
                      {fileData.status === 'processing' && 'Processing'}
                      {fileData.status === 'completed' && 'Completed'}
                      {fileData.status === 'error' && 'Error'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData.id)}
                      disabled={fileData.status === 'processing'}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-700 font-medium">Processing POS data files...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}