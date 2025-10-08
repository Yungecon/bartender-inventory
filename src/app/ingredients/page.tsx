'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

// Sample data for demonstration
const sampleIngredients = [
  {
    id: '1',
    name: 'Tito\'s Handmade Vodka',
    category: 'Vodka',
    supplier: 'Premium Spirits Co.',
    bottleSize: '750ml',
    currentPrice: 24.99,
    parLevel: 6,
    tags: ['core', 'premium'],
    inStock: 8
  },
  {
    id: '2',
    name: 'Bombay Sapphire Gin',
    category: 'Gin',
    supplier: 'Premium Spirits Co.',
    bottleSize: '750ml',
    currentPrice: 28.50,
    parLevel: 4,
    tags: ['core', 'premium'],
    inStock: 3
  },
  {
    id: '3',
    name: 'Jameson Irish Whiskey',
    category: 'Whiskey',
    supplier: 'Local Wine Distributors',
    bottleSize: '750ml',
    currentPrice: 32.00,
    parLevel: 5,
    tags: ['core'],
    inStock: 7
  },
  {
    id: '4',
    name: 'Cointreau Orange Liqueur',
    category: 'Liqueur',
    supplier: 'Premium Spirits Co.',
    bottleSize: '750ml',
    currentPrice: 45.99,
    parLevel: 2,
    tags: ['specialty', 'premium'],
    inStock: 1
  }
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState(sampleIngredients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    supplier: '',
    bottleSize: '750ml',
    currentPrice: '',
    parLevel: '',
    tags: ''
  });

  const categories = ['all', ...Array.from(new Set(ingredients.map(i => i.category)))];
  
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIngredient = {
      id: editingIngredient ? editingIngredient.id : Date.now().toString(),
      name: formData.name,
      category: formData.category,
      supplier: formData.supplier,
      bottleSize: formData.bottleSize,
      currentPrice: parseFloat(formData.currentPrice),
      parLevel: parseInt(formData.parLevel),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      inStock: editingIngredient ? editingIngredient.inStock : 0
    };

    if (editingIngredient) {
      setIngredients(ingredients.map(i => i.id === editingIngredient.id ? newIngredient : i));
    } else {
      setIngredients([...ingredients, newIngredient]);
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      supplier: '',
      bottleSize: '750ml',
      currentPrice: '',
      parLevel: '',
      tags: ''
    });
    setEditingIngredient(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      supplier: ingredient.supplier,
      bottleSize: ingredient.bottleSize,
      currentPrice: ingredient.currentPrice.toString(),
      parLevel: ingredient.parLevel.toString(),
      tags: ingredient.tags.join(', ')
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
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
            <h1 className="text-3xl font-bold mb-2">Ingredient Database</h1>
            <p className="text-gray-600">Manage your complete ingredient catalog</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingIngredient(null);
                setFormData({
                  name: '',
                  category: '',
                  supplier: '',
                  bottleSize: '750ml',
                  currentPrice: '',
                  parLevel: '',
                  tags: ''
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingIngredient ? 'Edit' : 'Add'} Ingredient</DialogTitle>
                <DialogDescription>
                  {editingIngredient ? 'Update' : 'Add a new'} ingredient to your database
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Tito's Handmade Vodka"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Vodka, Gin, Whiskey"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="e.g., Premium Spirits Co."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bottleSize">Bottle Size</Label>
                    <Input
                      id="bottleSize"
                      value={formData.bottleSize}
                      onChange={(e) => setFormData({...formData, bottleSize: e.target.value})}
                      placeholder="750ml"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentPrice">Price ($)</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
                      placeholder="24.99"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parLevel">Par Level</Label>
                  <Input
                    id="parLevel"
                    type="number"
                    value={formData.parLevel}
                    onChange={(e) => setFormData({...formData, parLevel: e.target.value})}
                    placeholder="6"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="core, premium, specialty"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingIngredient ? 'Update' : 'Add'} Ingredient
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Ingredients</CardTitle>
            <CardDescription>In database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">{ingredients.length}</div>
            <p className="text-sm text-gray-500">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Product types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">{categories.length - 1}</div>
            <p className="text-sm text-gray-500">Different categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock</CardTitle>
            <CardDescription>Below par level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {ingredients.filter(i => i.inStock < i.parLevel).length}
            </div>
            <p className="text-sm text-gray-500">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Price</CardTitle>
            <CardDescription>Per bottle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              ${(ingredients.reduce((sum, i) => sum + i.currentPrice, 0) / ingredients.length).toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Across all products</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ingredients or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        {filteredIngredients.map(ingredient => (
          <Card key={ingredient.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                    <Badge variant="outline">{ingredient.category}</Badge>
                    {ingredient.inStock < ingredient.parLevel && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Supplier:</span> {ingredient.supplier}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {ingredient.bottleSize}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${ingredient.currentPrice}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {ingredient.inStock}/{ingredient.parLevel}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {ingredient.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ingredient)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(ingredient.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No ingredients found matching your search.</p>
        </div>
      )}
    </div>
  );
}