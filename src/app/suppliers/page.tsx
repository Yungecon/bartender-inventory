import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuppliersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
        <p className="text-gray-600">Manage vendor relationships and communications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Suppliers</CardTitle>
            <CardDescription>Current vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <p className="text-sm text-gray-500">Verified suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Awaiting delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">3</div>
            <p className="text-sm text-gray-500">Orders in transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">$4,250</div>
            <p className="text-sm text-gray-500">Across all suppliers</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Sample Suppliers</h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Premium Spirits Co.</h4>
                  <p className="text-sm text-gray-500">contact@premiumspirits.com</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">45 Products</div>
                  <div className="text-sm text-gray-500">Last order: 3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Local Wine Distributors</h4>
                  <p className="text-sm text-gray-500">orders@localwine.com</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">28 Products</div>
                  <div className="text-sm text-gray-500">Last order: 1 week ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 p-6 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-purple-700">
          Advanced supplier management features in development:
        </p>
        <ul className="list-disc list-inside text-purple-700 mt-2 space-y-1">
          <li>Automated reorder generation</li>
          <li>Email template management</li>
          <li>Purchase order tracking</li>
          <li>Supplier performance analytics</li>
          <li>Communication history</li>
        </ul>
      </div>
    </div>
  );
}