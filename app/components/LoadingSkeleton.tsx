export function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse w-full">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
                {}
                <div className="h-[300px] w-full rounded-[20px] bg-card/50 border border-border/50"></div>
                {}
                <div className="h-[150px] w-full rounded-[20px] bg-card/50 border border-border/50"></div>
            </div>

            <aside className="col-span-1">
                {}
                <div className="h-[400px] w-full rounded-[20px] bg-card/50 border border-border/50"></div>
            </aside>
        </div>
    );
}
