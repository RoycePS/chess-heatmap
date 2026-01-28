import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface StatsCardProps {
    totalGames: number;
    bestStreak: number;
    activeDay: string;
    chessComCount: number;
    lichessCount: number;
    chesscomUsername?: string;
    lichessUsername?: string;
}

export function StatsCard({
    totalGames,
    bestStreak,
    activeDay,
    chessComCount,
    lichessCount,
    chesscomUsername,
    lichessUsername
}: StatsCardProps) {
    return (
        <div className="flex flex-col gap-8 rounded-[24px] border border-border/50 bg-card p-8 shadow-sm transition-all hover:shadow-md h-fit">
            <div>
                <h3 className="mb-8 text-2xl font-bold tracking-tight text-foreground/80 text-center">Statistics</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Total Games</span>
                        <span className="text-2xl font-black text-primary">{totalGames.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Best Streak</span>
                        <span className="text-xl font-bold text-foreground">{bestStreak} Days</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Most Active</span>
                        <span className="text-xl font-bold text-foreground">{activeDay}</span>
                    </div>

                    <div className="my-6 h-px w-full bg-border/50" />

                    <div className="space-y-3">
                        {}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#7FA650]"></span>
                                <span className="text-sm font-medium text-muted-foreground">Chess.com</span>
                                {chesscomUsername && (
                                    <a
                                        href={`https: 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-[#7FA650] hover:bg-[#7FA650]/10 transition-colors"
                                        title="View Profile"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <span className="text-lg font-bold text-foreground">{chessComCount.toLocaleString()}</span>
                        </div>

                        {}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#3D85C6]"></span>
                                <span className="text-sm font-medium text-muted-foreground">Lichess</span>
                                {lichessUsername && (
                                    <a
                                        href={`https: 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-[#3D85C6] hover:bg-[#3D85C6]/10 transition-colors"
                                        title="View Profile"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <span className="text-lg font-bold text-foreground">{lichessCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href="/"
                className="mt-2 block w-full rounded-xl border border-input bg-background/50 py-3 text-center text-sm font-medium hover:bg-muted hover:text-foreground transition-all"
            >
                Start New Search
            </Link>
        </div>
    );
}
