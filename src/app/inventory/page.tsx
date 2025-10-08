'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, Calendar, AlertTriangle } from "lucide-react";

// Sample locations
const locations = [
  { id: 'bar', name: 'Bar', description: 'Main bar area' },
  { id: 'hobbit', name: 'Hobbit', description: 'Storage area' },
  { id: 'cabinet', name: 'Cabinet', description: 'Wine cabinet' }
];

// Sample inventory data
const sampleInventory = [
  {
    id: '1',
    ingredientName: 'Tito\'s Handmade Vodka',
    category: 'Vodka',
    bottleSize: '750ml',
    unitPrice: 24.99,
    parLevel: 6,
    locations: {
      bar: { count: 3, lastCounted: '2024-01-08' },
      hobbit: { count: 4, lastCounted: '2024-01-08' },
      cabinet: { count: 1, lastCounted: '2024-01-07' }
    }
  },
  {
    id: '2',
    ingredientName: 'Bombay Sapphire Gin',
    category: 'Gin',
    bottleSize: '750ml',
    unitPrice: 28.50,
    parLevel: 4,
    locations: {
      bar: { count: 2, lastCounted: '2024-01-08' },
      hobbit: { count: 1, lastCounted: '2024-01-08' },
      cabinet: { count: 0, lastCounted: '2024-01-07' }
    }
  },
  {
    id: '3',
    ingredientName: 'Jameson Irish Whiskey',
    category: 'Whiskey',
    bottleSize: '750ml',
    unitPrice: 32.00,
    parLevel: 5,
    locations: {
      bar: { count: 2, lastCounted: '2024-01-08' },
      hobbit: { count: 3, lastCounted: '2024-01-08' },
      cabinet: { count: 2, lastCounted: '2024-01-07' }
    }
  },
  {
    id: '4',
    ingredientName: 'Cointreau Orange Liqueur',
    category: 'Liqueur',
    bottleSize: '750ml',
    unitPrice: 45.99,
    parLevel: 2,
    locations: {
      bar: { count: 1, lastCounted: '2024-01-08' },
      hobbit: { count: 0, lastCounted: '2024-01-08' },
      cabinet: { count: 0, lastCounted: '2024-01-07' }
    }
  }
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(sampleInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false);
  const [countingItem, setCountingItem] = useState<any>(null);
  const [newCounts, setNewCounts] = useState<{[key: string]: string}>({});

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTotalCount = (item: any) => {
    return Object.values(item.locations).reduce((sum: number, loc: any) => sum + loc.count, 0);
  };

  const getTotalValue = () => {
    return inventory.reduce((sum, item) => {
      const totalCount = getTotalCount(item);
      return sum + (totalCount * item.unitPrice);
    }, 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => getTotalCount(item) < item.parLevel);
  };

  const getTotalItems = () => {
    return inventory.reduce((sum, item) => sum + getTotalCount(item), 0);
  };

  const handleStartCount = (item: any) => {
    setCountingItem(item);
    const initialCounts: {[key: string]: string} = {};
    locations.forEach(loc => {
      initialCounts[loc.id] = item.locations[loc.id]?.count?.toString() || '0';
    });
    setNewCounts(initialCounts);
    setIsCountDialogOpen(true);
  };

  const handleSaveCount = () => {
    if (!countingItem) return;

    const updatedInventory = inventory.map(item => {
      if (item.id === countingItem.id) {
        const updatedLocations = { ...item.locations } as any;
        locations.forEach(loc => {
          updatedLocations[loc.id] = {
            count: parseInt(newCounts[loc.id]) || 0,
            lastCounted: new Date().toISOString().split('T')[0]
          };
        });
        return { ...item, locations: updatedLocations };
      }
      return item;
    });

    setInventory(updatedInventory);
    setIsCountDialogOpen(false);
    setCountingItem(null);
    setNewCounts({});
  };

  const getLocationInventory = (locationId: string) => {
    return inventory.map(item => ({
      ...item,
      count: (item.locations as any)[locationId]?.count || 0,
      lastCounted: (item.locations as any)[locationId]?.lastCounted || 'Never'
    })).filter(() => selectedLocation === 'all' || selectedLocation === locationId);
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
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-gray-600">Track stock levels across all locations</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/voice-count">🎤 Voice Count</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/worksheet">📝 Manual Worksheet</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
            <CardDescription>Across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">{getTotalItems()}</div>
            <p className="text-sm text-gray-500">Bottles in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
            <CardDescription>Current inventory value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">${getTotalValue().toLocaleString()}</div>
            <p className="text-sm text-gray-500">At current prices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Below par level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">{getLowStockItems().length}</div>
            <p className="text-sm text-gray-500">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>Tracking areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">{locations.length}</div>
            <p className="text-sm text-gray-500">Active locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Locations</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-location">By Location</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {filteredInventory.map(item => {
            const totalCount = getTotalCount(item);
            const isLowStock = totalCount < item.parLevel;
            
            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{item.ingredientName}</h3>
                        <Badge variant="outline">{item.category}</Badge>
                        {isLowStock && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium">Total Stock:</span>
                          <div className="text-lg font-bold">{totalCount}/{item.parLevel}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Unit Price:</span>
                          <div className="text-lg">${item.unitPrice}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Total Value:</span>
                          <div className="text-lg">${(totalCount * item.unitPrice).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Size:</span>
                          <div className="text-lg">{item.bottleSize}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {locations.map(location => {
                          const locationData = (item.locations as any)[location.id];
                          return (
                            <div key={location.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-sm">{location.name}</span>
                              </div>
                              <div className="text-lg font-bold">{locationData?.count || 0}</div>
                              <div className="text-xs text-gray-500">
                                Last: {locationData?.lastCounted || 'Never'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button onClick={() => handleStartCount(item)}>
                        Update Count
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="by-location" className="space-y-4">
          {locations.map(location => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {location.name}
                </CardTitle>
                <CardDescription>{location.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getLocationInventory(location.id).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.ingredientName}</div>
                        <div className="text-sm text-gray-500">{item.category} • {item.bottleSize}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count}</div>
                        <div className="text-xs text-gray-500">Last: {item.lastCounted}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {getLowStockItems().length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-green-600 mb-2">✅</div>
                <h3 className="text-lg font-semibold mb-2">All Good!</h3>
                <p className="text-gray-500">No items are currently below par level.</p>
              </CardContent>
            </Card>
          ) : (
            getLowStockItems().map(item => {
              const totalCount = getTotalCount(item);
              const shortage = item.parLevel - totalCount;
              
              return (
                <Card key={item.id} className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800">{item.ingredientName}</h3>
                        <p className="text-gray-600">{item.category} • {item.bottleSize}</p>
                        <div className="mt-2">
                          <Badge variant="destructive">
                            {shortage} bottles short of par level
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{totalCount}/{item.parLevel}</div>
                        <div className="text-sm text-gray-500">Current/Par Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Counts
              </CardTitle>
              <CardDescription>Latest inventory counting activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Full Inventory Count</div>
                    <div className="text-sm text-gray-500">All locations • Manual count</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Jan 8, 2024</div>
                    <div className="text-sm text-gray-500">2 days ago</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Cabinet Count</div>
                    <div className="text-sm text-gray-500">Wine cabinet • Voice count</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Jan 7, 2024</div>
                    <div className="text-sm text-gray-500">3 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Count Dialog */}
      <Dialog open={isCountDialogOpen} onOpenChange={setIsCountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Inventory Count</DialogTitle>
            <DialogDescription>
              {countingItem?.ingredientName} - Enter current count for each location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {locations.map(location => (
              <div key={location.id}>
                <Label htmlFor={location.id}>{location.name}</Label>
                <Input
                  id={location.id}
                  type="number"
                  min="0"
                  value={newCounts[location.id] || ''}
                  onChange={(e) => setNewCounts({...newCounts, [location.id]: e.target.value})}
                  placeholder="0"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveCount} className="flex-1">
                Save Count
              </Button>
              <Button variant="outline" onClick={() => setIsCountDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}