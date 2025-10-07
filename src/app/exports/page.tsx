'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExportBuilder } from '@/components/exports/export-builder'
import { ExportHistory } from '@/components/exports/export-history'
import { ScheduledExports } from '@/components/exports/scheduled-exports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSpreadsheet, Clock, History, Download } from 'lucide-react'

export default function ExportsPage() {
  const [activeTab, setActiveTab] = useState('builder')

  const handleExport = (config: any) => {
    // Switch to history tab to show the new export
    setActiveTab('history')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Exports</h1>
          <p className="text-muted-foreground">
            Export your inventory data in Excel or CSV format for accounting and analysis
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">Excel</div>
                <div className="text-sm text-muted-foreground">Accounting Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">CSV</div>
                <div className="text-sm text-muted-foreground">Universal Format</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">Auto</div>
                <div className="text-sm text-muted-foreground">Scheduled Exports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <History className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">Track</div>
                <div className="text-sm text-muted-foreground">Export History</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Builder
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Export History
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Scheduled Exports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Export</CardTitle>
              <CardDescription>
                Configure and generate a custom export of your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportBuilder onExport={handleExport} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ExportHistory />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledExports />
        </TabsContent>
      </Tabs>
    </div>
  )
}