"use client";

import { useMemo } from "react";
import { DailyStats } from "@/app/lib/chess-data";

interface GamesGraphProps {
    data: Record<string, DailyStats>;
    year: string;
}


export function GamesGraph({ data, year }: GamesGraphProps) {
    const monthlyData = useMemo(() => {
        const months = Array(12).fill(null).map(() => ({ total: 0, chesscom: 0, lichess: 0 }));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const isAllYears = year === "all";
        const targetYear = parseInt(year);

        Object.entries(data).forEach(([dateStr, stats]) => {
            const date = new Date(dateStr);
            if (isAllYears || date.getFullYear() === targetYear) {
                const monthIdx = date.getMonth();
                months[monthIdx].total += stats.total;
                months[monthIdx].chesscom += stats.chesscom;
                months[monthIdx].lichess += stats.lichess;
            }
        });

        const maxVal = Math.max(...months.map(m => m.total), 1);

        return months.map((stats, idx) => ({
            month: monthNames[idx],
            ...stats,
            height: (stats.total / maxVal) * 100,
        }));
    }, [data, year]);

    const maxCount = Math.max(...monthlyData.map(m => m.total), 1);

    return (
        <div className="rounded-[20px] border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight text-foreground/80">Games per Month</h3>

                {}
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7FA650]"></span>
                        <span className="text-muted-foreground">Chess.com</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3D85C6]"></span>
                        <span className="text-muted-foreground">Lichess</span>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-[140px]">
                {monthlyData.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col h-full items-center gap-2 group relative">
                        {}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-popover text-popover-foreground text-[10px] p-2 rounded-lg shadow-xl border border-border z-10 whitespace-nowrap min-w-[100px]">
                            <span className="font-bold mb-1.5 text-xs border-b border-border/50 pb-1">{m.month}</span>
                            <div className="flex justify-between gap-3 text-[#7FA650]">
                                <span>Chess.com</span>
                                <span className="font-mono">{m.chesscom}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-[#3D85C6]">
                                <span>Lichess</span>
                                <span className="font-mono">{m.lichess}</span>
                            </div>
                            <div className="flex justify-between gap-3 mt-1.5 pt-1 border-t border-border/50 text-foreground font-semibold">
                                <span>Total</span>
                                <span className="font-mono">{m.total}</span>
                            </div>
                        </div>

                        {}
                        <div
                            className="w-full rounded-sm bg-muted/10 relative flex flex-col justify-end overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ height: "100%" }}
                        >
                            {}
                            <div
                                className="w-full flex flex-col justify-end"
                                style={{ height: `${Math.max(m.height, 1)}%` }}
                            >
                                {}
                                {}
                                <div
                                    className="w-full bg-[#3D85C6] transition-all duration-500 rounded-t-sm"
                                    style={{ height: `${m.total > 0 ? (m.lichess / m.total) * 100 : 0}%` }}
                                />
                                {}
                                <div
                                    className="w-full bg-[#7FA650] transition-all duration-500 rounded-b-sm"
                                    style={{ height: `${m.total > 0 ? (m.chesscom / m.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-[9px] text-muted-foreground font-medium">{m.month}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground/50 font-mono">
                <span>0</span>
                <span>{maxCount} games</span>
            </div>
        </div>
    );
}
