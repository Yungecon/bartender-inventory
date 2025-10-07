'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IngredientForm } from './ingredient-form'
import { Edit, Trash2, Eye, Tag } from 'lucide-react'



interface IngredientListProps {
  ingredients: any[]
  isLoading: boolean
  onUpdate: () => void
}

export function IngredientList({ ingredients, isLoading, onUpdate }: IngredientListProps) {
  const [editingIngredient, setEditingIngredient] = useState<any | null>(null)
  const [viewingIngredient, setViewingIngredient] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const deleteMutation = trpc.ingredients.delete.useMutation({
    onSuccess: () => {
      onUpdate()
    },
  })

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient)
    setIsEditDialogOpen(true)
  }

  const handleView = (ingredient: any) => {
    setViewingIngredient(ingredient)
    setIsViewDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'core':
        return 'bg-blue-100 text-blue-800'
      case 'common':
        return 'bg-green-100 text-green-800'
      case 'overstock':
        return 'bg-red-100 text-red-800'
      case 'program':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-yellow-100 text-yellow-800'
      case 'seasonal':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (ingredients.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No ingredients found</p>
            <p className="text-sm">Try adjusting your search or filters, or add a new ingredient.</p>
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
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Par Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.supplier.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ingredient.category}</Badge>
                  </TableCell>
                  <TableCell>{ingredient.bottle_size}</TableCell>
                  <TableCell>${Number(ingredient.current_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ingredient.tags.slice(0, 2).map((tag: any) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {ingredient.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ingredient.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ingredient.par_level ? (
                      <Badge variant="outline">{ingredient.par_level}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(ingredient)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ingredient)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ingredient.id, ingredient.name)}
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
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  <p className="text-sm text-gray-600">{ingredient.supplier.name}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(ingredient)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(ingredient)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ingredient.id, ingredient.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="outline">{ingredient.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm">{ingredient.bottle_size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium">${Number(ingredient.current_price).toFixed(2)}</span>
                </div>
                {ingredient.par_level && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Par Level:</span>
                    <Badge variant="outline">{ingredient.par_level}</Badge>
                  </div>
                )}
                {ingredient.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {ingredient.tags.map((tag: any) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update the ingredient information.
            </DialogDescription>
          </DialogHeader>
          {editingIngredient && (
            <IngredientForm
              ingredient={editingIngredient}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setEditingIngredient(null)
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
            <DialogTitle>Ingredient Details</DialogTitle>
            <DialogDescription>
              View detailed information about this ingredient.
            </DialogDescription>
          </DialogHeader>
          {viewingIngredient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-sm">{viewingIngredient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Supplier</Label>
                  <p className="text-sm">{viewingIngredient.supplier.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <p className="text-sm">{viewingIngredient.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bottle Size</Label>
                  <p className="text-sm">{viewingIngredient.bottle_size}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Current Price</Label>
                  <p className="text-sm">${Number(viewingIngredient.current_price).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Par Level</Label>
                  <p className="text-sm">{viewingIngredient.par_level || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Default Reorder Qty</Label>
                  <p className="text-sm">{viewingIngredient.default_reorder_qty || 'Not set'}</p>
                </div>
              </div>
              
              {viewingIngredient.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingIngredient.tags.map((tag: any) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={getTagColor(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm">{new Date(viewingIngredient.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-sm">{new Date(viewingIngredient.updated_at).toLocaleDateString()}</p>
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