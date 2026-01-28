"use client";

import { ChessHeatmapData } from "@/app/lib/chess-data";
import { TrendingUp, TrendingDown, Calendar, Minus } from "lucide-react";
import { useMemo } from "react";

interface InsightsPanelProps {
    data: ChessHeatmapData | null;
    year: string;
    isExpanded: boolean;
}

export function InsightsPanel({ data, year, isExpanded }: InsightsPanelProps) {
    const insights = useMemo(() => {
        if (!data || Object.keys(data.dailyCounts).length === 0) return null;

        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let totalGames = 0;
        let daysActive = 0;
        let longestGap = 0;
        let lastDate: number | null = null;

        const dateEntries = Object.entries(data.dailyCounts).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        dateEntries.forEach(([dateStr, stats]) => {
            if (stats.total > 0) {
                const date = new Date(dateStr);
                dayCounts[date.getDay()] += stats.total;
                totalGames += stats.total;
                daysActive++;

                if (lastDate) {
                    const diff = (date.getTime() - lastDate) / (1000 * 3600 * 24);
                    const gap = Math.floor(diff) - 1;
                    if (gap > longestGap) longestGap = gap;
                }
                lastDate = date.getTime();
            }
        });

        const maxDayVal = Math.max(...dayCounts);
        const activeWeekday = dayNames[dayCounts.indexOf(maxDayVal)];
        const avgPerActiveDay = daysActive > 0 ? (totalGames / daysActive).toFixed(1) : "0";

        const midPoint = Math.floor(dateEntries.length / 2);
        const firstHalf = dateEntries.slice(0, midPoint).reduce((acc, curr) => acc + curr[1].total, 0);
        const secondHalf = dateEntries.slice(midPoint).reduce((acc, curr) => acc + curr[1].total, 0);
        const trend = secondHalf > firstHalf ? 'increasing' : secondHalf < firstHalf ? 'decreasing' : 'stable';

        return {
            activeWeekday,
            avgPerActiveDay,
            longestGap,
            trend,
            uniqueDays: daysActive
        };
    }, [data, year]);

    if (!insights) return null;

    return (
        <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-[500px] mb-6' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {}
                <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Activity Trend</span>
                    <div className="flex items-center gap-2 mt-2">
                        {insights.trend === 'increasing' && <TrendingUp className="w-6 h-6 text-green-500" />}
                        {insights.trend === 'decreasing' && <TrendingDown className="w-6 h-6 text-red-500" />}
                        {insights.trend === 'stable' && <Minus className="w-6 h-6 text-yellow-500" />}
                        <span className="text-xl font-bold capitalize">{insights.trend}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">vs. first half of period</span>
                </div>

                {}
                <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Favorite Day</span>
                    <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold truncate" title={insights.activeWeekday}>{insights.activeWeekday}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">Most games played</span>
                </div>

                {}
                <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Intensity</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black">{insights.avgPerActiveDay}</span>
                        <span className="text-xs text-muted-foreground font-medium">games/day</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">On active days</span>
                </div>

                {}
                <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Longest Break</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black">{insights.longestGap}</span>
                        <span className="text-xs text-muted-foreground font-medium">days</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">Consecutive inactive</span>
                </div>
            </div>
        </div>
    );
}
