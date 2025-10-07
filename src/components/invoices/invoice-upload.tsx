'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  ocrResult?: any
  error?: string
}

interface InvoiceUploadProps {
  onFilesProcessed: (results: any[]) => void
  onError: (error: string) => void
}

export function InvoiceUpload({ onFilesProcessed, onError }: InvoiceUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const processFile = async (fileData: UploadedFile) => {
    try {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { ...f, status: 'processing', progress: 10 } : f)
      )

      // Simulate OCR processing with progress updates
      const formData = new FormData()
      formData.append('file', fileData.file)

      // Mock OCR API call - replace with actual OCR service
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`)
      }

      // Simulate progress updates
      for (let progress = 20; progress <= 90; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileData.id ? { ...f, progress } : f)
        )
      }

      const ocrResult = await response.json()

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileData.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          ocrResult 
        } : f)
      )

      return ocrResult

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

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'processing': return 'Processing...'
      case 'completed': return 'Completed'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoice Files</CardTitle>
          <CardDescription>
            Drag and drop invoice files or click to select. Supports PDF, PNG, JPG, and other image formats.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag files here or click to browse'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum file size: 10MB per file
                </p>
              </div>
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
                  Review files and process with OCR
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
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {fileData.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={fileData.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{fileData.progress}% complete</p>
                      </div>
                    )}
                    
                    {fileData.error && (
                      <p className="text-xs text-red-600 mt-1">{fileData.error}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(fileData.status)}>
                      {getStatusText(fileData.status)}
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
              <p className="text-blue-700 font-medium">Processing invoices with OCR...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}