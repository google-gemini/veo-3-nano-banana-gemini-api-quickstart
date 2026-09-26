'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'

export default function CreditDisplay({ onOpenPricing }: { onOpenPricing?: () => void }) {
    const [credits, setCredits] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // We need an API to fetch credits securely
                const resp = await fetch('/api/user/credits')
                if (resp.ok) {
                    const data = await resp.json()
                    setCredits(data.credits)
                }
            }
            setLoading(false)
        }

        fetchCredits()

        // Listen for credit updates (custom event)
        const handleUpdate = () => fetchCredits()
        window.addEventListener('credits-updated', handleUpdate)

        return () => {
            window.removeEventListener('credits-updated', handleUpdate)
        }
    }, [])

    if (loading || credits === null) return null

    return (
        <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/15 text-warning rounded-full text-sm font-medium border border-warning/35 hover:bg-warning/25 transition-colors"
        >
            <Coins className="w-4 h-4" />
            <span>{credits}</span>
        </button>
    )
}
