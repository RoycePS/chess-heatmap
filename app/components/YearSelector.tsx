"use client";

import { ChevronDown } from "lucide-react";

interface YearSelectorProps {
    years: string[];
    selectedYear: string;
    onSelect: (year: string) => void;
}

export function YearSelector({ years, selectedYear, onSelect }: YearSelectorProps) {
    return (
        <div className="relative min-w-[100px] md:min-w-[120px]">
            <select
                value={selectedYear}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold text-foreground transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
                <option value="all">All Years</option>
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
        </div>
    );
}
