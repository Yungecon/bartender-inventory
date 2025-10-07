'use client'

import { useState } from 'react'
import { trpc } from '@/components/providers/trpc-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { IngredientForm } from '@/components/ingredients/ingredient-form'
import { IngredientList } from '@/components/ingredients/ingredient-list'
import { Plus, Search, Filter } from 'lucide-react'

export default function IngredientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch data
  const { data: ingredients, isLoading, refetch } = trpc.ingredients.list.useQuery({
    category: selectedCategory || undefined,
    supplier_id: selectedSupplier || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })

  const { data: suppliers } = trpc.suppliers.list.useQuery()

  // Filter ingredients by search term
  const filteredIngredients = ingredients?.filter((ingredient: any) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique categories and tags for filtering
  const categories = [...new Set(ingredients?.map((i: any) => i.category) || [])]
  const allTags = [...new Set(ingredients?.flatMap((i: any) => i.tags) || [])]

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSupplier('')
    setSelectedTags([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
              <p className="text-gray-600">Manage your bar&apos;s ingredient inventory</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Ingredient</DialogTitle>
                  <DialogDescription>
                    Create a new ingredient in your inventory system.
                  </DialogDescription>
                </DialogHeader>
                <IngredientForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    refetch()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Suppliers</SelectItem>
                    {suppliers?.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredIngredients?.length || 0} ingredients found`}
          </p>
        </div>

        {/* Ingredients List */}
        <IngredientList 
          ingredients={filteredIngredients || []} 
          isLoading={isLoading}
          onUpdate={refetch}
        />
      </div>
    </div>
  )
}