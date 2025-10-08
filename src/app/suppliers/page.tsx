'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";

// Sample data for demonstration
const sampleSuppliers = [
  {
    id: '1',
    name: 'Premium Spirits Co.',
    contactName: 'Sarah Johnson',
    email: 'sarah@premiumspirits.com',
    phone: '(555) 123-4567',
    ccEmails: ['orders@premiumspirits.com'],
    autoSendPolicy: 'MANUAL_APPROVE',
    productCount: 45,
    lastOrderDate: '2024-01-05',
    monthlySpend: 1850.00
  },
  {
    id: '2',
    name: 'Local Wine Distributors',
    contactName: 'Mike Chen',
    email: 'mike@localwine.com',
    phone: '(555) 987-6543',
    ccEmails: ['warehouse@localwine.com', 'billing@localwine.com'],
    autoSendPolicy: 'AUTO_SEND_BUSINESS_HOURS',
    productCount: 28,
    lastOrderDate: '2024-01-02',
    monthlySpend: 1200.00
  },
  {
    id: '3',
    name: 'Craft Beer Supply',
    contactName: 'Emma Rodriguez',
    email: 'emma@craftbeersupply.com',
    phone: '(555) 456-7890',
    ccEmails: [],
    autoSendPolicy: 'AUTO_SEND_ALWAYS',
    productCount: 15,
    lastOrderDate: '2023-12-28',
    monthlySpend: 800.00
  }
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    ccEmails: '',
    autoSendPolicy: 'MANUAL_APPROVE'
  });

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSupplier = {
      id: editingSupplier ? editingSupplier.id : Date.now().toString(),
      name: formData.name,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      ccEmails: formData.ccEmails.split(',').map(email => email.trim()).filter(email => email),
      autoSendPolicy: formData.autoSendPolicy,
      productCount: editingSupplier ? editingSupplier.productCount : 0,
      lastOrderDate: editingSupplier ? editingSupplier.lastOrderDate : new Date().toISOString().split('T')[0],
      monthlySpend: editingSupplier ? editingSupplier.monthlySpend : 0
    };

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? newSupplier : s));
    } else {
      setSuppliers([...suppliers, newSupplier]);
    }

    // Reset form
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      ccEmails: '',
      autoSendPolicy: 'MANUAL_APPROVE'
    });
    setEditingSupplier(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      ccEmails: supplier.ccEmails.join(', '),
      autoSendPolicy: supplier.autoSendPolicy
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case 'AUTO_SEND_ALWAYS':
        return <Badge className="bg-green-100 text-green-800">Auto Send</Badge>;
      case 'AUTO_SEND_BUSINESS_HOURS':
        return <Badge className="bg-blue-100 text-blue-800">Business Hours</Badge>;
      default:
        return <Badge variant="outline">Manual Approve</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
            <p className="text-gray-600">Manage vendor relationships and communications</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSupplier(null);
                setFormData({
                  name: '',
                  contactName: '',
                  email: '',
                  phone: '',
                  ccEmails: '',
                  autoSendPolicy: 'MANUAL_APPROVE'
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSupplier ? 'Edit' : 'Add'} Supplier</DialogTitle>
                <DialogDescription>
                  {editingSupplier ? 'Update' : 'Add a new'} supplier to your database
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Premium Spirits Co."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="e.g., Sarah Johnson"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@supplier.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="ccEmails">CC Emails (comma separated)</Label>
                  <Input
                    id="ccEmails"
                    value={formData.ccEmails}
                    onChange={(e) => setFormData({...formData, ccEmails: e.target.value})}
                    placeholder="orders@supplier.com, billing@supplier.com"
                  />
                </div>
                <div>
                  <Label htmlFor="autoSendPolicy">Auto Send Policy</Label>
                  <select
                    id="autoSendPolicy"
                    value={formData.autoSendPolicy}
                    onChange={(e) => setFormData({...formData, autoSendPolicy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="MANUAL_APPROVE">Manual Approve</option>
                    <option value="AUTO_SEND_BUSINESS_HOURS">Auto Send (Business Hours)</option>
                    <option value="AUTO_SEND_ALWAYS">Auto Send Always</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingSupplier ? 'Update' : 'Add'} Supplier
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Suppliers</CardTitle>
            <CardDescription>Current vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">{suppliers.length}</div>
            <p className="text-sm text-gray-500">Verified suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>Across all suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {suppliers.reduce((sum, s) => sum + s.productCount, 0)}
            </div>
            <p className="text-sm text-gray-500">Available products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              ${suppliers.reduce((sum, s) => sum + s.monthlySpend, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Across all suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search suppliers, contacts, or emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {filteredSuppliers.map(supplier => (
          <Card key={supplier.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{supplier.name}</h3>
                    {getPolicyBadge(supplier.autoSendPolicy)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Contact:</span>
                        <span>{supplier.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{supplier.email}</span>
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Products:</span> {supplier.productCount}
                      </div>
                      <div>
                        <span className="font-medium">Monthly Spend:</span> ${supplier.monthlySpend.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Order:</span> {new Date(supplier.lastOrderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {supplier.ccEmails.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">CC Emails: </span>
                      <div className="flex gap-1 flex-wrap">
                        {supplier.ccEmails.map(email => (
                          <Badge key={email} variant="secondary" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No suppliers found matching your search.</p>
        </div>
      )}
    </div>
  );
}