'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { startSession } from '@/store/use-session'

export function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        startSession()
    }, [])

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </ThemeProvider>
    )
}
