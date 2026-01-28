"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { YearSelector } from "@/app/components/YearSelector";

export function ClientYearWrapper({ years, currentYear }: { years: string[], currentYear: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelect = (year: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("year", year);
        router.push(`/dashboard?${params.toString()}`);
    };

    return <YearSelector years={years} selectedYear={currentYear} onSelect={handleSelect} />;
}
