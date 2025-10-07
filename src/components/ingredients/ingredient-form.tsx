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
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  supplier_id: z.string().min(1, 'Supplier is required'),
  bottle_size: z.string().min(1, 'Bottle size is required'),
  current_price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  par_level: z.number().int().positive().optional(),
  default_reorder_qty: z.number().int().positive().optional(),
})

type IngredientFormData = z.infer<typeof ingredientSchema>

interface Ingredient {
  id: string
  name: string
  supplier_id: string
  bottle_size: string
  current_price: number
  category: string
  tags: string[]
  par_level?: number
  default_reorder_qty?: number
}

interface IngredientFormProps {
  ingredient?: Ingredient
  onSuccess: () => void
}

const COMMON_CATEGORIES = [
  'Spirits',
  'Liqueurs',
  'Bitters',
  'Mixers',
  'Garnishes',
  'Syrups',
  'Wine',
  'Beer',
  'Non-Alcoholic'
]

const COMMON_TAGS = [
  'core',
  'common',
  'overstock',
  'program',
  'seasonal',
  'premium',
  'house-made',
  'organic',
  'local'
]

export function IngredientForm({ ingredient, onSuccess }: IngredientFormProps) {
  const [tags, setTags] = useState<string[]>(ingredient?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  const { data: suppliers } = trpc.suppliers.list.useQuery()
  
  const createMutation = trpc.ingredients.create.useMutation({
    onSuccess: () => {
      onSuccess()
      reset()
      setTags([])
    },
  })

  const updateMutation = trpc.ingredients.update.useMutation({
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
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient ? {
      name: ingredient.name,
      supplier_id: ingredient.supplier_id,
      bottle_size: ingredient.bottle_size,
      current_price: Number(ingredient.current_price),
      category: ingredient.category,
      par_level: ingredient.par_level || undefined,
      default_reorder_qty: ingredient.default_reorder_qty || undefined,
    } : undefined,
  })

  const selectedCategory = watch('category')

  const onSubmit = (data: IngredientFormData) => {
    const payload = {
      ...data,
      tags,
    }

    if (ingredient) {
      updateMutation.mutate({ id: ingredient.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleCategorySelect = (value: string) => {
    if (value === 'custom') {
      setValue('category', customCategory)
    } else {
      setValue('category', value)
      setCustomCategory('')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Hendrick's Gin"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Supplier */}
        <div>
          <Label htmlFor="supplier_id">Supplier *</Label>
          <Select onValueChange={(value) => setValue('supplier_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers?.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.supplier_id && (
            <p className="text-sm text-red-600 mt-1">{errors.supplier_id.message}</p>
          )}
        </div>

        {/* Bottle Size */}
        <div>
          <Label htmlFor="bottle_size">Bottle Size *</Label>
          <Input
            id="bottle_size"
            {...register('bottle_size')}
            placeholder="e.g., 750ml, 1L, 375ml"
          />
          {errors.bottle_size && (
            <p className="text-sm text-red-600 mt-1">{errors.bottle_size.message}</p>
          )}
        </div>

        {/* Current Price */}
        <div>
          <Label htmlFor="current_price">Current Price *</Label>
          <Input
            id="current_price"
            type="number"
            step="0.01"
            {...register('current_price', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.current_price && (
            <p className="text-sm text-red-600 mt-1">{errors.current_price.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select onValueChange={handleCategorySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Category</SelectItem>
            </SelectContent>
          </Select>
          {selectedCategory === 'custom' && (
            <Input
              className="mt-2"
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value)
                setValue('category', e.target.value)
              }}
              placeholder="Enter custom category"
            />
          )}
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Par Level */}
        <div>
          <Label htmlFor="par_level">Par Level</Label>
          <Input
            id="par_level"
            type="number"
            {...register('par_level', { valueAsNumber: true })}
            placeholder="Minimum stock level"
          />
          {errors.par_level && (
            <p className="text-sm text-red-600 mt-1">{errors.par_level.message}</p>
          )}
        </div>

        {/* Default Reorder Quantity */}
        <div>
          <Label htmlFor="default_reorder_qty">Default Reorder Quantity</Label>
          <Input
            id="default_reorder_qty"
            type="number"
            {...register('default_reorder_qty', { valueAsNumber: true })}
            placeholder="Default order amount"
          />
          {errors.default_reorder_qty && (
            <p className="text-sm text-red-600 mt-1">{errors.default_reorder_qty.message}</p>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <Card>
        <CardContent className="pt-6">
          <Label>Tags</Label>
          <p className="text-sm text-gray-600 mb-3">
            Add tags to categorize this ingredient (core, common, overstock, program, etc.)
          </p>
          
          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Common Tags */}
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Common tags:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => addTag(tag)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(newTag)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag(newTag)}
              disabled={!newTag || tags.includes(newTag)}
            >
              Add
            </Button>
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
            : ingredient
            ? 'Update Ingredient'
            : 'Create Ingredient'
          }
        </Button>
      </div>
    </form>
  )
}