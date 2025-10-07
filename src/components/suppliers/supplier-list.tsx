'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SupplierForm } from './supplier-form'
import { Edit, Trash2, Eye, Building2, Mail, Users } from 'lucide-react'

interface SupplierListProps {
  suppliers: any[]
  isLoading: boolean
  onUpdate: () => void
}

export function SupplierList({ suppliers, isLoading, onUpdate }: SupplierListProps) {
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null)
  const [viewingSupplier, setViewingSupplier] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      onUpdate()
    },
  })

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  const handleView = (supplier: any) => {
    setViewingSupplier(supplier)
    setIsViewDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all associated ingredients. This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case 'MANUAL_APPROVE':
        return <Badge variant="outline">Manual</Badge>
      case 'AUTO_SEND_BUSINESS_HOURS':
        return <Badge variant="secondary">Auto (Business Hours)</Badge>
      case 'AUTO_SEND_ALWAYS':
        return <Badge variant="default">Auto (Always)</Badge>
      default:
        return <Badge variant="outline">Manual</Badge>
    }
  }



  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No suppliers found</p>
            <p className="text-sm">Try adjusting your search or add a new supplier.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead>Auto-Send Policy</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_name || '-'}</TableCell>
                  <TableCell>
                    {supplier.email ? (
                      <div>
                        <div className="text-sm">{supplier.email}</div>
                        {supplier.cc_emails.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{supplier.cc_emails.length} CC
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier._count.ingredients}</Badge>
                  </TableCell>
                  <TableCell>
                    {getPolicyBadge(supplier.auto_send_policy)}
                  </TableCell>
                  <TableCell>
                    {supplier.email_template ? (
                      <Badge variant="secondary">{supplier.email_template.name}</Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(supplier)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {supplier.name}
                  </CardTitle>
                  {supplier.contact_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4" />
                      {supplier.contact_name}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(supplier)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id, supplier.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm">{supplier.email}</div>
                      {supplier.cc_emails.length > 0 && (
                        <div className="text-xs text-gray-500">
                          +{supplier.cc_emails.length} CC addresses
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ingredients:</span>
                  <Badge variant="outline">{supplier._count.ingredients}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auto-Send:</span>
                  {getPolicyBadge(supplier.auto_send_policy)}
                </div>
                
                {supplier.email_template && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Template:</span>
                    <Badge variant="secondary">{supplier.email_template.name}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information and communication preferences.
            </DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <SupplierForm
              supplier={editingSupplier}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setEditingSupplier(null)
                onUpdate()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>
              View detailed information about this supplier.
            </DialogDescription>
          </DialogHeader>
          {viewingSupplier && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-sm">{viewingSupplier.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Name</Label>
                  <p className="text-sm">{viewingSupplier.contact_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Primary Email</Label>
                  <p className="text-sm">{viewingSupplier.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ingredients Count</Label>
                  <p className="text-sm">{viewingSupplier._count.ingredients}</p>
                </div>
              </div>

              {/* CC Emails */}
              {viewingSupplier.cc_emails.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">CC Email Addresses</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingSupplier.cc_emails.map((email: any) => (
                      <Badge key={email} variant="outline">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Settings */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Communication Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Auto-Send Policy</Label>
                    <div className="mt-1">
                      {getPolicyBadge(viewingSupplier.auto_send_policy)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Template</Label>
                    <p className="text-sm">
                      {viewingSupplier.email_template?.name || 'No template assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm">{new Date(viewingSupplier.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-sm">{new Date(viewingSupplier.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}