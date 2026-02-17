import Image from 'next/image'

export function Logo({ className = "h-10", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {/* The Icon (Fixed Aspect Ratio) */}
            <div className={`relative ${className} aspect-square`}>
                <Image
                    src="/logo-light.png"
                    alt="Apna Logo"
                    fill
                    className="block dark:hidden object-contain"
                    priority
                />
                <Image
                    src="/logo-dark.png"
                    alt="Apna Logo"
                    fill
                    className="hidden dark:block object-contain"
                    priority
                />
            </div>
            {/* The Text (Only visible if showText is true) */}
            {showText && (
                <span className="font-bold text-xl tracking-wide flex items-baseline">
                    <span className="text-blue-500 dark:text-blue-400">APNA</span>
                    <span className="text-purple-600 dark:text-purple-400">.SELECT</span>
                </span>
            )}
        </div>
    )
}
