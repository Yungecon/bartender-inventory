import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VoiceCountPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">🎤 Voice Counting</h1>
        <p className="text-gray-600">Hands-free inventory counting with voice recognition</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>How Voice Counting Works</CardTitle>
            <CardDescription>Simple, hands-free inventory management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
              <div>
                <h4 className="font-medium">Start Voice Session</h4>
                <p className="text-sm text-gray-500">Click the microphone to begin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
              <div>
                <h4 className="font-medium">Speak Your Counts</h4>
                <p className="text-sm text-gray-500">"Tito's Vodka, 3 bottles"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
              <div>
                <h4 className="font-medium">Confirm & Continue</h4>
                <p className="text-sm text-gray-500">System confirms and moves to next item</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Commands</CardTitle>
            <CardDescription>Supported voice patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <code className="text-sm">"[Product name], [number] bottles"</code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <code className="text-sm">"Count [product], [number]"</code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <code className="text-sm">"[Number] [product name]"</code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <code className="text-sm">"Next location" / "Move to bar"</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
            <p className="text-gray-600 mb-4">Voice counting requires microphone access</p>
            <Button size="lg" disabled className="w-full">
              Start Voice Count (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">🚧 Coming Soon</h3>
        <p className="text-red-700">
          Voice counting system is in active development:
        </p>
        <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
          <li>Speech recognition integration</li>
          <li>Voice confirmation system</li>
          <li>Mobile-optimized interface</li>
          <li>Multi-location support</li>
          <li>Offline capability</li>
        </ul>
      </div>
    </div>
  );
}