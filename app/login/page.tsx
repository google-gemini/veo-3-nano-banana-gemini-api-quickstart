'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-elevated rounded-2xl shadow-xl p-8 border border-border border-border">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Welcome to Photoverse
                    </h1>
                    <p className="text-muted-foreground">
                        Sign in to start creating amazing AI images.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-primary/8 rounded-lg border border-primary/25">
                        <h3 className="font-semibold text-foreground mb-1">
                            🎉 Free Trial Included
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            New users get <span className="font-bold">14 days</span> of free access with <span className="font-bold">100 credits</span>.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/25">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-elevated text-foreground border border-input rounded-xl font-medium hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        )}
                        Continue with Google
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
