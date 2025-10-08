import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">📈 Reports & Analytics</h1>
        <p className="text-gray-600">Export data and generate reports for accounting and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Excel Exports</CardTitle>
            <CardDescription>Accounting-ready spreadsheets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">Ready</div>
            <p className="text-sm text-gray-500">Formatted for QuickBooks, Xero</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Reports</CardTitle>
            <CardDescription>Universal data format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">Available</div>
            <p className="text-sm text-gray-500">Import anywhere</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">Smart</div>
            <p className="text-sm text-gray-500">Daily, weekly, monthly</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Inventory Summary</h4>
                  <p className="text-sm text-gray-500">Current stock levels and values</p>
                </div>
                <Button disabled size="sm">
                  Export (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Purchase History</h4>
                  <p className="text-sm text-gray-500">Invoice and supplier data</p>
                </div>
                <Button disabled size="sm">
                  Export (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Usage Analytics</h4>
                  <p className="text-sm text-gray-500">Consumption patterns and trends</p>
                </div>
                <Button disabled size="sm">
                  Export (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-indigo-700">
          Advanced export and reporting features in development:
        </p>
        <ul className="list-disc list-inside text-indigo-700 mt-2 space-y-1">
          <li>Custom export builder with column selection</li>
          <li>Scheduled report delivery via email</li>
          <li>Excel formatting for accounting software</li>
          <li>Historical data analysis and trends</li>
          <li>Multi-location reporting</li>
        </ul>
      </div>
    </div>
  );
}