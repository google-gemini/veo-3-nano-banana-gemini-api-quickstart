'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import CreditDisplay from '@/components/credits/CreditDisplay'
import Image from 'next/image'

export default function LoginButton({ onOpenPricing }: { onOpenPricing?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = createClient()

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        setLoading(false)
    }

    const handleLogout = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        setLoading(false)
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <CreditDisplay onOpenPricing={onOpenPricing} />
                <div className="flex items-center gap-2">
                    {(user.user_metadata.avatar_url || user.user_metadata.picture) && (
                        <Image
                            src={user.user_metadata.avatar_url || user.user_metadata.picture}
                            alt="Avatar"
                            width={32}
                            height={32}
                            className="rounded-full border border-border"
                            unoptimized
                        />
                    )}
                    <span className="text-sm font-medium hidden sm:block">
                        {user.user_metadata.full_name || user.email}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="shrink-0 whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:px-4"
                >
                    {loading ? 'Signing out...' : 'Sign out'}
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={handleLogin}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 sm:px-4"
        >
            {loading ? 'Signing in...' : (
                <>
                    <span className="hidden sm:inline">Sign in with Google</span>
                    <span className="sm:hidden">Sign in</span>
                </>
            )}
        </button>
    )
}
