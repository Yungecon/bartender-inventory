import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoicesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">📄 Invoice Processing</h1>
        <p className="text-gray-600">Automated invoice processing with OCR technology</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processed This Month</CardTitle>
            <CardDescription>Invoices completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">24</div>
            <p className="text-sm text-gray-500">$12,450 total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">3</div>
            <p className="text-sm text-gray-500">Price deltas detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OCR Accuracy</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">94%</div>
            <p className="text-sm text-gray-500">Auto-processing rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Invoice</CardTitle>
            <CardDescription>Drag and drop or click to upload invoice files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📄</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Drop invoice files here</h3>
              <p className="text-gray-500 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
              <Button disabled>
                Choose Files (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-orange-50 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-orange-700">
          Advanced invoice processing features in development:
        </p>
        <ul className="list-disc list-inside text-orange-700 mt-2 space-y-1">
          <li>OCR text extraction from invoices</li>
          <li>Automated data standardization</li>
          <li>Price delta detection and alerts</li>
          <li>Supplier-specific format handling</li>
          <li>Approval workflow management</li>
        </ul>
      </div>
    </div>
  );
}