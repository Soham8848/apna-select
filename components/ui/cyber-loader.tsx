import { cn } from "@/lib/utils"

export function CyberLoader({ size = "md", fullScreen = false }: { size?: "sm" | "md" | "lg", fullScreen?: boolean }) {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        md: "w-10 h-10 border-4",
        lg: "w-16 h-16 border-4"
    }

    const innerSizeClasses = {
        sm: "w-3 h-3 border",
        md: "w-6 h-6 border-2",
        lg: "w-10 h-10 border-2"
    }

    const loader = (
        <div className="relative flex items-center justify-center">
            {/* Outer Ring - Zinc/White */}
            <div className={cn(
                sizeClasses[size],
                "border-t-zinc-900 border-b-zinc-900 border-l-transparent border-r-transparent dark:border-t-white dark:border-b-white rounded-full animate-spin"
            )}
            />
            {/* Inner Ring - Blue/Purple (Spins reverse) */}
            <div
                className={cn(
                    "absolute rounded-full animate-spin border-t-transparent border-b-transparent border-l-blue-500 border-r-purple-500",
                    innerSizeClasses[size]
                )}
                style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
            />
            {/* Center pulsing dot based on size */}
            {size !== 'sm' && (
                <div className={cn(
                    "absolute rounded-full bg-zinc-900 dark:bg-white animate-pulse",
                    size === 'lg' ? "w-3 h-3" : "w-1.5 h-1.5"
                )} />
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
                {loader}
                <div className="mt-6 text-sm font-bold tracking-[0.3em] text-zinc-900 dark:text-white animate-pulse uppercase">
                    APNA.SELECT
                </div>
            </div>
        )
    }

    return loader
}
