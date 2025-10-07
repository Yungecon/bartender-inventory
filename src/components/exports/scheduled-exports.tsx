'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Clock, Mail, Edit, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { trpc } from '@/components/providers/trpc-provider'
import { ExportBuilder } from './export-builder'

interface ScheduledExport {
  id: string
  name: string
  config: any
  schedule: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  emailRecipients?: string[]
  createdAt: Date | string
}

export function ScheduledExports() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null)
  const [newExportName, setNewExportName] = useState('')
  const [newExportSchedule, setNewExportSchedule] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [newExportEmails, setNewExportEmails] = useState('')
  const [exportConfig, setExportConfig] = useState<any>(null)

  const { data: scheduledExports, isLoading, refetch } = trpc.exports.listScheduled.useQuery()
  const createScheduledMutation = trpc.exports.createScheduled.useMutation()
  const updateScheduledMutation = trpc.exports.updateScheduled.useMutation()
  const deleteScheduledMutation = trpc.exports.deleteScheduled.useMutation()

  const handleCreateScheduled = async () => {
    if (!newExportName || !exportConfig) return

    try {
      await createScheduledMutation.mutateAsync({
        name: newExportName,
        config: exportConfig,
        schedule: newExportSchedule,
        enabled: true,
        emailRecipients: newExportEmails ? newExportEmails.split(',').map(email => email.trim()) : undefined,
      })
      
      setIsCreateDialogOpen(false)
      setNewExportName('')
      setNewExportEmails('')
      setExportConfig(null)
      refetch()
    } catch (error) {
      console.error('Failed to create scheduled export:', error)
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await updateScheduledMutation.mutateAsync({
        id,
        updates: { enabled }
      })
      refetch()
    } catch (error) {
      console.error('Failed to update scheduled export:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled export?')) return

    try {
      await deleteScheduledMutation.mutateAsync(id)
      refetch()
    } catch (error) {
      console.error('Failed to delete scheduled export:', error)
    }
  }

  const getScheduleBadgeColor = (schedule: string) => {
    switch (schedule) {
      case 'daily':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'weekly':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'monthly':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getNextRunDate = (schedule: string, createdAt: Date | string) => {
    const now = new Date()
    const created = new Date(createdAt)
    
    switch (schedule) {
      case 'daily':
        const nextDaily = new Date(now)
        nextDaily.setDate(now.getDate() + 1)
        nextDaily.setHours(9, 0, 0, 0) // 9 AM
        return nextDaily
      case 'weekly':
        const nextWeekly = new Date(now)
        nextWeekly.setDate(now.getDate() + (7 - now.getDay() + 1)) // Next Monday
        nextWeekly.setHours(9, 0, 0, 0)
        return nextWeekly
      case 'monthly':
        const nextMonthly = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        nextMonthly.setHours(9, 0, 0, 0)
        return nextMonthly
      default:
        return now
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>Loading scheduled exports...</CardDescription>
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Scheduled Exports
            </CardTitle>
            <CardDescription>
              Automate your export generation and delivery
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Schedule Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Export</DialogTitle>
                <DialogDescription>
                  Configure an export to run automatically on a schedule
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-name">Export Name</Label>
                    <Input
                      id="export-name"
                      value={newExportName}
                      onChange={(e) => setNewExportName(e.target.value)}
                      placeholder="e.g., Weekly Inventory Report"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule">Schedule</Label>
                    <Select value={newExportSchedule} onValueChange={(value: any) => setNewExportSchedule(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily (9 AM)</SelectItem>
                        <SelectItem value="weekly">Weekly (Monday 9 AM)</SelectItem>
                        <SelectItem value="monthly">Monthly (1st of month, 9 AM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email-recipients">Email Recipients (optional)</Label>
                  <Input
                    id="email-recipients"
                    value={newExportEmails}
                    onChange={(e) => setNewExportEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Comma-separated email addresses to receive the export
                  </p>
                </div>

                {/* Export Configuration */}
                <div>
                  <Label>Export Configuration</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <ExportBuilder
                      onExport={(config) => setExportConfig(config)}
                      isExporting={false}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateScheduled}
                    disabled={!newExportName || !exportConfig || createScheduledMutation.isPending}
                  >
                    {createScheduledMutation.isPending ? 'Creating...' : 'Create Schedule'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!scheduledExports || scheduledExports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No scheduled exports</p>
            <p className="text-sm">Create automated exports to run on a regular schedule.</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledExports.map((exportItem) => (
                  <TableRow key={exportItem.id}>
                    <TableCell className="font-medium">
                      {exportItem.name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getScheduleBadgeColor(exportItem.schedule)}
                      >
                        {exportItem.schedule}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {exportItem.config.dataType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {exportItem.config.format.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exportItem.emailRecipients && exportItem.emailRecipients.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{exportItem.emailRecipients.length}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(getNextRunDate(exportItem.schedule, exportItem.createdAt), 'MMM d')}</div>
                        <div className="text-gray-500">{format(getNextRunDate(exportItem.schedule, exportItem.createdAt), 'h:mm a')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={exportItem.enabled}
                        onCheckedChange={(checked) => handleToggleEnabled(exportItem.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingExport(exportItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(exportItem.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}