

export function OrderTimeline({ events }: { events: any[] }) {
    if (!events || events.length === 0) {
        return <div className="text-muted-foreground text-sm">No tracking updates available yet.</div>
    }

    // Events are passed in DESC order (most recent first)
    // We want to show them effectively as a list where the top one is the latest status.

    return (
        <div className="relative space-y-0 pl-2">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-border" />
            {/* Adjust bottom to not overshoot last item */}

            {events.map((event, index) => {
                const isLatest = index === 0
                return (
                    <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
                        {/* Dot */}
                        <div
                            className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 bg-background z-10 
                                ${isLatest ? 'border-primary' : 'border-muted-foreground/30'}`}
                        >
                            <div className={`w-3 h-3 rounded-full ${isLatest ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        </div>

                        {/* Content */}
                        <div className={`flex flex-col ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <span className="font-bold text-base">{event.status}</span>
                            <span className="text-sm font-medium">{event.description}</span>
                            {event.location && (
                                <span className="text-xs uppercase tracking-wider opacity-80 mt-1">{event.location}</span>
                            )}
                            <span className="text-xs opacity-70 mt-1">
                                {new Date(event.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
