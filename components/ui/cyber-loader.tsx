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
            {/* Outer Ring - Cyan */}
            <div className={cn(
                sizeClasses[size],
                "border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            )}
            />
            {/* Inner Ring - Purple (Spins reverse) */}
            <div
                className={cn(
                    "absolute rounded-full animate-spin border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent",
                    innerSizeClasses[size]
                )}
                style={{ animationDirection: 'reverse', animationDuration: '1s' }}
            />
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                {loader}
                <div className="mt-4 text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse uppercase">
                    Loading System...
                </div>
            </div>
        )
    }

    return loader
}
