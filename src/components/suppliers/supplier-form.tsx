'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/components/providers/trpc-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Mail } from 'lucide-react'

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  auto_send_policy: z.enum(['MANUAL_APPROVE', 'AUTO_SEND_BUSINESS_HOURS', 'AUTO_SEND_ALWAYS']).optional(),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface Supplier {
  id: string
  name: string
  contact_name?: string
  email?: string
  cc_emails: string[]
  auto_send_policy: string
}

interface SupplierFormProps {
  supplier?: Supplier
  onSuccess: () => void
}

const AUTO_SEND_POLICIES = [
  { value: 'MANUAL_APPROVE', label: 'Manual Approval Required', description: 'All orders require manual review' },
  { value: 'AUTO_SEND_BUSINESS_HOURS', label: 'Auto-Send (Business Hours)', description: 'Automatically send during business hours' },
  { value: 'AUTO_SEND_ALWAYS', label: 'Auto-Send (Always)', description: 'Automatically send orders anytime' },
]

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const [ccEmails, setCcEmails] = useState<string[]>(supplier?.cc_emails || [])
  const [newCcEmail, setNewCcEmail] = useState('')

  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      onSuccess()
      reset()
      setCcEmails([])
    },
  })

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier ? {
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      auto_send_policy: (supplier.auto_send_policy as 'MANUAL_APPROVE' | 'AUTO_SEND_BUSINESS_HOURS' | 'AUTO_SEND_ALWAYS') || 'MANUAL_APPROVE',
    } : {
      auto_send_policy: 'MANUAL_APPROVE',
    },
  })

  const selectedPolicy = watch('auto_send_policy')

  const onSubmit = (data: SupplierFormData) => {
    const payload = {
      ...data,
      cc_emails: ccEmails,
      // Convert empty strings to undefined for optional fields
      contact_name: data.contact_name || undefined,
      email: data.email || undefined,
    }

    if (supplier) {
      updateMutation.mutate({ id: supplier.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const addCcEmail = () => {
    if (newCcEmail && !ccEmails.includes(newCcEmail)) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(newCcEmail)) {
        setCcEmails([...ccEmails, newCcEmail])
        setNewCcEmail('')
      }
    }
  }

  const removeCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter(email => email !== emailToRemove))
  }

  const getPolicyDescription = (policy: string) => {
    return AUTO_SEND_POLICIES.find(p => p.value === policy)?.description || ''
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., ABC Liquor Distributors"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Contact Name */}
        <div>
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            {...register('contact_name')}
            placeholder="e.g., John Smith"
          />
          {errors.contact_name && (
            <p className="text-sm text-red-600 mt-1">{errors.contact_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Primary Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="orders@supplier.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* CC Emails Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" />
            CC Email Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Additional email addresses to include when sending orders to this supplier.
          </p>
          
          {/* Current CC Emails */}
          {ccEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ccEmails.map(email => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeCcEmail(email)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Add CC Email */}
          <div className="flex gap-2">
            <Input
              type="email"
              value={newCcEmail}
              onChange={(e) => setNewCcEmail(e.target.value)}
              placeholder="cc@supplier.com"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCcEmail()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCcEmail}
              disabled={!newCcEmail || ccEmails.includes(newCcEmail)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Send Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="auto_send_policy">Auto-Send Policy</Label>
            <Select 
              value={selectedPolicy} 
              onValueChange={(value) => setValue('auto_send_policy', value as 'MANUAL_APPROVE' | 'AUTO_SEND_BUSINESS_HOURS' | 'AUTO_SEND_ALWAYS')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select auto-send policy" />
              </SelectTrigger>
              <SelectContent>
                {AUTO_SEND_POLICIES.map(policy => (
                  <SelectItem key={policy.value} value={policy.value}>
                    {policy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPolicy && (
              <p className="text-sm text-gray-600 mt-1">
                {getPolicyDescription(selectedPolicy)}
              </p>
            )}
            {errors.auto_send_policy && (
              <p className="text-sm text-red-600 mt-1">{errors.auto_send_policy.message}</p>
            )}
          </div>

          {/* Policy Explanation */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Auto-Send Policy Explanation:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Manual Approval:</strong> All reorder emails will be saved as drafts for manual review and sending.</li>
              <li><strong>Business Hours:</strong> Orders will be sent automatically Monday-Friday, 9 AM - 5 PM local time.</li>
              <li><strong>Always:</strong> Orders will be sent immediately when generated, regardless of time or day.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : supplier
            ? 'Update Supplier'
            : 'Create Supplier'
          }
        </Button>
      </div>
    </form>
  )
}