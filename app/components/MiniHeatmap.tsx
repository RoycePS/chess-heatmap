"use client";

import { DailyStats } from "@/app/lib/chess-data";

interface MiniHeatmapProps {
    data: Record<string, DailyStats>;
    year: string;
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


export function MiniHeatmap({ data, year }: MiniHeatmapProps) {
    const generateGrid = () => {
        const targetYear = parseInt(year);
        const now = new Date();
        const today = now.getFullYear() === targetYear ? now : new Date(targetYear, 11, 31);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 91);

        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        const weeks: { date: string; level: number; isCurrentYear: boolean }[][] = [];

        for (let w = 0; w < 13; w++) {
            const days: { date: string; level: number; isCurrentYear: boolean }[] = [];
            for (let d = 0; d < 7; d++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + (w * 7) + d);

                const dateStr = current.toISOString().split("T")[0];
                const dayData = data[dateStr] || { total: 0 };
                const isCurrentYear = current.getFullYear() === targetYear && current <= now;

                let level = 0;
                const count = dayData.total || 0;
                if (count > 0) level = 1;
                if (count >= 5) level = 2;
                if (count >= 10) level = 3;
                if (count >= 18) level = 4;

                days.push({ date: dateStr, level, isCurrentYear });
            }
            weeks.push(days);
        }
        return weeks;
    };

    const weeks = generateGrid();
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <div className="flex gap-[2px]">
            {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-[2px]">
                    {week.map((day, dIndex) => (
                        <div
                            key={`${wIndex}-${dIndex}`}
                            className="h-[8px] w-[8px] rounded-[1px]"
                            style={{
                                backgroundColor: colors[day.level as keyof typeof colors],
                                opacity: day.isCurrentYear ? 1 : 0.3,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
