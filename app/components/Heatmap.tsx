"use client";

import { useState } from "react";
import { DayModal } from "./DayModal";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { DailyStats } from "@/app/lib/chess-data";

interface HeatmapProps {
    data: Record<string, DailyStats>;
    year: string;
    heatmapId?: string;
}

interface ProcessedDay extends DailyStats {
    date: string;
    dateObj: Date;
    level: number;
    isCurrentYear: boolean;
}

const COLORS = {
    light: {
        0: '#EBEDF0',
        1: '#9BE9A8',
        2: '#40C463',
        3: '#30A14E',
        4: '#216E39',
    },
    dark: {
        0: '#161b22',
        1: '#0e4429',
        2: '#006d32',
        3: '#26a641',
        4: '#39d353',
    },
};

export function Heatmap({ data, year, heatmapId }: HeatmapProps) {
    const [selectedDay, setSelectedDay] = useState<ProcessedDay | null>(null);
    const svgId = heatmapId || "heatmap-svg";

    const generateGrid = () => {
        const targetYear = parseInt(year);
        const jan1 = new Date(targetYear, 0, 1);
        const dayOfWeek = jan1.getDay();
        const startDate = new Date(jan1);
        startDate.setDate(jan1.getDate() - dayOfWeek);

        const weeks: ProcessedDay[][] = [];
        const monthLabels: { label: string; weekIndex: number }[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let w = 0; w < 53; w++) {
            const days: ProcessedDay[] = [];
            for (let d = 0; d < 7; d++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + (w * 7) + d);

                const dateStr = current.toISOString().split("T")[0];
                const dayData = data[dateStr] || { total: 0, chesscom: 0, lichess: 0 };
                const isCurrentYear = current.getFullYear() === targetYear;

                if (d === 0 && current.getDate() <= 7 && isCurrentYear) {
                    const monthIdx = current.getMonth();
                    monthLabels.push({ label: months[monthIdx], weekIndex: w });
                }

                let level = 0;
                const count = dayData.total;
                if (count > 0) level = 1;
                if (count >= 5) level = 2;
                if (count >= 10) level = 3;
                if (count >= 18) level = 4;

                days.push({
                    date: dateStr,
                    dateObj: current,
                    ...dayData,
                    level,
                    isCurrentYear
                });
            }
            weeks.push(days);
        }
        return { weeks, monthLabels };
    };

    const { weeks, monthLabels } = generateGrid();

    const cellSize = 14;
    const cellGap = 3;
    const svgWidth = weeks.length * (cellSize + cellGap);
    const svgHeight = 7 * (cellSize + cellGap);

    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <div className="w-full">
            <div className="card min-w-fit rounded-[20px] border border-border bg-card p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold tracking-tight">Activity Overview</h2>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map((l) => (
                            <div
                                key={l}
                                className="h-3 w-3 rounded-[2px]"
                                style={{ backgroundColor: `var(--lvl-${l})` }}
                                aria-hidden="true"
                            />
                        ))}
                        <span>More</span>
                    </div>
                </div>

                <div className="pb-3">
                    <TooltipProvider delayDuration={100}>
                        {}
                        <svg
                            id={svgId}
                            width={svgWidth}
                            height={svgHeight}
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="hidden"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="100%" height="100%" fill={isDark ? '#0d1117' : '#ffffff'} />
                            {weeks.map((week, wIndex) =>
                                week.map((day, dIndex) => (
                                    <rect
                                        key={day.date}
                                        x={wIndex * (cellSize + cellGap)}
                                        y={dIndex * (cellSize + cellGap)}
                                        width={cellSize}
                                        height={cellSize}
                                        rx={2}
                                        fill={colors[day.level as keyof typeof colors]}
                                        opacity={day.isCurrentYear ? 1 : 0.2}
                                    />
                                ))
                            )}
                        </svg>

                        {}
                        <div className="relative h-4 mb-2 w-full">
                            {monthLabels.map(({ label, weekIndex }) => (
                                <span
                                    key={label}
                                    className="absolute text-[9px] sm:text-[10px] text-muted-foreground -translate-x-1/2"
                                    style={{ left: `${(weekIndex / weeks.length) * 100}%` }}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>

                        {}
                        <div className="flex w-full gap-[1px] sm:gap-[3px]" role="grid">
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-1 flex-col gap-[1px] sm:gap-[3px]" role="row">
                                    {week.map((day) => (
                                        <Tooltip key={day.date}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => setSelectedDay(day)}
                                                    className={`
                                                        w-full aspect-square rounded-[1px] sm:rounded-[2px] transition-all hover:ring-1 hover:ring-foreground hover:z-10 focus:outline-none focus:ring-1 focus:ring-primary
                                                        ${!day.isCurrentYear ? "opacity-20 pointer-events-none" : "cursor-pointer"}
                                                    `}
                                                    style={{
                                                        backgroundColor: `var(--lvl-${day.level})`,
                                                    }}
                                                    aria-label={`${day.date}: ${day.total} games`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-center">
                                                <div className="font-bold">
                                                    {day.dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                </div>
                                                <div className="text-muted-foreground text-xs mt-1 space-y-1">
                                                    <div>
                                                        <span className="font-semibold text-foreground">{day.total}</span> games total
                                                    </div>
                                                    {day.total > 0 && (
                                                        <div className="pt-1 border-t border-border/50 flex flex-col gap-0.5">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7FA650]" />
                                                                    Chess.com
                                                                </span>
                                                                <span className="font-mono">{day.chesscom}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#3D85C6]" />
                                                                    Lichess
                                                                </span>
                                                                <span className="font-mono">{day.lichess}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            <DayModal
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                data={selectedDay}
            />
        </div>
    );
}

