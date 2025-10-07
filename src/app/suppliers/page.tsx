'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import { SupplierList } from '@/components/suppliers/supplier-list'
import { Plus, Search, Building2 } from 'lucide-react'

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch data
  const { data: suppliers, isLoading, refetch } = trpc.suppliers.list.useQuery()

  // Filter suppliers by search term
  const filteredSuppliers = suppliers?.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-gray-600">Manage your supplier relationships and contact information</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Create a new supplier in your system.
                  </DialogDescription>
                </DialogHeader>
                <SupplierForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    refetch()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active supplier relationships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Email Templates</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suppliers?.filter((s) => s.email_template).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Configured for automated ordering
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Send Enabled</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suppliers?.filter((s) => s.auto_send_policy !== 'MANUAL_APPROVE').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Automatic reorder processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredSuppliers?.length || 0} suppliers found`}
          </p>
        </div>

        {/* Suppliers List */}
        <SupplierList 
          suppliers={filteredSuppliers || []} 
          isLoading={isLoading}
          onUpdate={refetch}
        />
      </div>
    </div>
  )
}