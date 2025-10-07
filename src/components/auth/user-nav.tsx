'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { User } from '@/lib/auth'

interface UserNavProps {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="font-medium">{user.email}</div>
        <div className="text-gray-500 capitalize">{user.role}</div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  )
}