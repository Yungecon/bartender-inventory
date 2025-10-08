import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IngredientsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Ingredient Database</h1>
        <p className="text-gray-600">Manage your complete ingredient catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Ingredients</CardTitle>
            <CardDescription>In database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">156</div>
            <p className="text-sm text-gray-500">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Product types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">8</div>
            <p className="text-sm text-gray-500">Spirits, Wine, Beer, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>Active vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
            <p className="text-sm text-gray-500">Supplier relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Price</CardTitle>
            <CardDescription>Per bottle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">$28.50</div>
            <p className="text-sm text-gray-500">Across all products</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-green-700">
          Complete ingredient management system is in development:
        </p>
        <ul className="list-disc list-inside text-green-700 mt-2 space-y-1">
          <li>Add, edit, and organize ingredients</li>
          <li>Supplier relationship management</li>
          <li>Price tracking and history</li>
          <li>Automated categorization and tagging</li>
          <li>AI-powered ingredient profiles</li>
        </ul>
      </div>
    </div>
  );
}