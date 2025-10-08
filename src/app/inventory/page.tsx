import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Track stock levels across all locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>View current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">247 Items</div>
            <p className="text-sm text-gray-500">Across 3 locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items below par level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">12 Items</div>
            <p className="text-sm text-gray-500">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
            <CardDescription>Current inventory value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">$18,450</div>
            <p className="text-sm text-gray-500">As of today</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-blue-700">
          Full inventory management features are being developed. This includes:
        </p>
        <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
          <li>Real-time inventory tracking</li>
          <li>Location-based organization</li>
          <li>Historical data visualization</li>
          <li>Automated reorder suggestions</li>
        </ul>
      </div>
    </div>
  );
}