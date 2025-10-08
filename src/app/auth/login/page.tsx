import Link from "next/link";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Authentication system is being configured
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              disabled
            />
          </div>
          
          <Button className="w-full" disabled>
            Send Magic Link (Coming Soon)
          </Button>
          
          <div className="text-sm p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Authentication is being set up. For now, you can explore the demo interface.
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">← Back to Demo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}