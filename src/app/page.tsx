import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Smart Bar Inventory</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.0 Demo</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/inventory" className="text-gray-600 hover:text-gray-900 transition-colors">Inventory</Link>
              <Link href="/ingredients" className="text-gray-600 hover:text-gray-900 transition-colors">Ingredients</Link>
              <Link href="/suppliers" className="text-gray-600 hover:text-gray-900 transition-colors">Suppliers</Link>
              <Link href="/exports" className="text-gray-600 hover:text-gray-900 transition-colors">Reports</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Bar Inventory Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Voice-activated counting, automated reordering, and intelligent insights 
            to help you manage inventory efficiently and reduce costs.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 <span>Inventory Tracking</span>
              </CardTitle>
              <CardDescription>
                Track stock levels across multiple locations with real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/inventory">View Inventory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎤 <span>Voice Counting</span>
              </CardTitle>
              <CardDescription>
                Count inventory hands-free with voice recognition technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/voice-count">Start Voice Count</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏪 <span>Supplier Management</span>
              </CardTitle>
              <CardDescription>
                Manage supplier relationships and automate reorder processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/suppliers">Manage Suppliers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 <span>Ingredient Database</span>
              </CardTitle>
              <CardDescription>
                Comprehensive ingredient management with pricing and specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/ingredients">View Ingredients</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📄 <span>Invoice Processing</span>
              </CardTitle>
              <CardDescription>
                Automated invoice processing with OCR and price tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/invoices">Process Invoices</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 <span>Reports & Analytics</span>
              </CardTitle>
              <CardDescription>
                Generate detailed reports and export data for accounting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/exports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">UI Components: Operational</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Database: Configuring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Authentication: Configuring</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Smart Bar Inventory System - Built with Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">
            <span className="inline-flex items-center gap-1">
              🚀 <span>Deployed on Vercel</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}