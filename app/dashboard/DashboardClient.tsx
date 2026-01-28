"use client";

import { useEffect, useState, useMemo } from "react";
import { SmartCache } from "@/app/lib/smart-cache";


import { AlertTriangle } from "lucide-react";
import { Heatmap } from "@/app/components/Heatmap";
import { GamesGraph } from "@/app/components/GamesGraph";
import { StatsCard } from "@/app/components/StatsCard";
import { ExportPanel } from "@/app/components/ExportPanel";
import { LoadingSkeleton } from "@/app/components/LoadingSkeleton";
import { ClientYearWrapper } from "./ClientYearWrapper";
import { ProfileHeader } from "@/app/components/ProfileHeader";
import { RatingsOverview } from "@/app/components/RatingsOverview";
import { InsightsPanel } from "@/app/components/InsightsPanel";
import { GameBreakdown } from "@/app/components/GameBreakdown";
import { CombinedProfile } from "@/app/lib/profile-data";
import { ChessHeatmapData, EMPTY_DATA, GameBreakdown as GameBreakdownData } from "@/app/lib/chess-data";
import { getJoinYears, generateYearRange } from "@/app/lib/user-profile";
import { downloadPNG, downloadPNGMultiYear, downloadSVG, generateEmbedCode } from "@/app/lib/export";
import { ExportDropdown } from "@/app/components/ExportDropdown";

function generateFilename(
    chesscomUsername?: string,
    lichessUsername?: string,
    year?: string,
    ext: string = 'png'
): string {
    let username = 'user';
    if (chesscomUsername && lichessUsername) {
        username = `${chesscomUsername}-${lichessUsername}`;
    } else if (chesscomUsername) {
        username = chesscomUsername;
    } else if (lichessUsername) {
        username = lichessUsername;
    }
    const yearPart = year === 'all' ? 'all-years' : year || 'data';
    return `chessheat-${username.toLowerCase()}-${yearPart}.${ext}`;
}

interface DashboardClientProps {
    chesscomUsername?: string;
    lichessUsername?: string;
    year: string;
}

export default function DashboardClient({ chesscomUsername, lichessUsername, year }: DashboardClientProps) {
    const [data, setData] = useState<ChessHeatmapData | null>(null);
    const [allYearsData, setAllYearsData] = useState<Record<string, ChessHeatmapData>>({});
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [availableYears, setAvailableYears] = useState<string[]>([new Date().getFullYear().toString()]);
    const [yearsLoading, setYearsLoading] = useState(true);
    const [profile, setProfile] = useState<CombinedProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    const isAllYears = year === "all";

    useEffect(() => {
        if (!profile) return;

        const chesscomJoined = profile.chesscom?.joinedDate;
        const lichessJoined = profile.lichess?.joinedDate;
        const currentYear = new Date().getFullYear();

        let earliestYear = currentYear;

        if (chesscomJoined) {
            const y = new Date(chesscomJoined).getFullYear();
            if (y < earliestYear) earliestYear = y;
        }
        if (lichessJoined) {
            const y = new Date(lichessJoined).getFullYear();
            if (y < earliestYear) earliestYear = y;
        }

        const years = generateYearRange(earliestYear);
        setAvailableYears(years);
        setYearsLoading(false);
    }, [profile]);




    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const params = new URLSearchParams();
                if (chesscomUsername) params.set("chesscom", chesscomUsername);
                if (lichessUsername) params.set("lichess", lichessUsername);

                const cacheKey = `profile:${chesscomUsername || ''}:${lichessUsername || ''}`;
                const cached = SmartCache.get<CombinedProfile>(cacheKey, 'profile');

                if (cached) {
                    setProfile(cached);
                    setProfileLoading(false);
                    return;
                }

                const res = await fetch(`/api/profile?${params.toString()}`);
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) {
                        setProfile(json);
                        SmartCache.set(cacheKey, json, 'profile');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                if (isMounted) setProfileLoading(false);
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [chesscomUsername, lichessUsername]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setLoadingProgress(10);

        const fetchSingleYear = async (targetYear: string): Promise<ChessHeatmapData> => {
            const cacheKey = `data:${chesscomUsername || ''}:${lichessUsername || ''}:${targetYear}`;
            const currentYear = new Date().getFullYear();
            const type = String(currentYear) === targetYear ? 'current-year' : 'static-year';

            const cached = SmartCache.get<ChessHeatmapData>(cacheKey, type);
            if (cached) return cached;

            const params = new URLSearchParams();
            if (chesscomUsername) params.set("chesscom", chesscomUsername);
            if (lichessUsername) params.set("lichess", lichessUsername);
            params.set("year", targetYear);

            const res = await fetch(`/api/combined?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch data");
            const json = await res.json();

            SmartCache.set(cacheKey, json, type);
            return json;
        };

        const fetchData = async () => {
            try {
                if (isAllYears && availableYears.length > 0) {
                    const yearsToFetch = availableYears;
                    const results: Record<string, ChessHeatmapData> = {};


                    for (let i = 0; i < yearsToFetch.length; i++) {
                        const y = yearsToFetch[i];
                        results[y] = await fetchSingleYear(y);
                        if (isMounted) {
                            setLoadingProgress(10 + Math.round((i + 1) / yearsToFetch.length * 80));
                        }
                    }

                    if (isMounted) {
                        setAllYearsData(results);
                        setData(null);
                        setLoadingProgress(100);
                        setLoading(false);
                    }
                } else {

                    setLoadingProgress(50);
                    const json = await fetchSingleYear(year);
                    if (isMounted) {
                        setData(json);
                        setAllYearsData({});
                        setLoadingProgress(100);
                        setLoading(false);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load data. Please try again.");
                    setLoading(false);
                }
            }
        };

        if (!isAllYears || !yearsLoading) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [chesscomUsername, lichessUsername, year, isAllYears, availableYears, yearsLoading]);

    const aggregatedStats = useMemo(() => {
        if (!isAllYears || Object.keys(allYearsData).length === 0) return null;

        let totalGames = 0;
        let chesscomTotal = 0;
        let lichessTotal = 0;
        let bestStreak = 0;
        let activeDayCount = 0;
        let activeDay = "N/A";

        Object.values(allYearsData).forEach(yearData => {
            totalGames += yearData.totalGames;
            chesscomTotal += yearData.chesscomTotal;
            lichessTotal += yearData.lichessTotal;
            if (yearData.bestStreak > bestStreak) bestStreak = yearData.bestStreak;

            Object.entries(yearData.dailyCounts).forEach(([date, stats]) => {
                if (stats.total > activeDayCount) {
                    activeDayCount = stats.total;
                    activeDay = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                }
            });
        });

        return { totalGames, chesscomTotal, lichessTotal, bestStreak, activeDay };
    }, [isAllYears, allYearsData]);

    const allTimeDailyCounts = useMemo(() => {
        if (!isAllYears || Object.keys(allYearsData).length === 0) return {};
        const merged: Record<string, any> = {};
        Object.values(allYearsData).forEach(yearData => {
            Object.assign(merged, yearData.dailyCounts);
        });
        return merged;
    }, [isAllYears, allYearsData]);

    const allTimeBreakdown = useMemo(() => {
        if (!isAllYears || Object.keys(allYearsData).length === 0) return EMPTY_DATA.breakdown;

        const breakdown: GameBreakdownData = {
            speed: { bullet: 0, blitz: 0, rapid: 0, classical: 0, daily: 0, other: 0 },
            result: { win: 0, loss: 0, draw: 0, other: 0 }
        };

        Object.values(allYearsData).forEach(yearData => {
            Object.keys(breakdown.speed).forEach(k => {
                const key = k as keyof GameBreakdownData['speed'];
                breakdown.speed[key] += (yearData.breakdown?.speed?.[key] || 0);
            });
            Object.keys(breakdown.result).forEach(k => {
                const key = k as keyof GameBreakdownData['result'];
                breakdown.result[key] += (yearData.breakdown?.result?.[key] || 0);
            });
        });

        return breakdown;
    }, [isAllYears, allYearsData]);

    const getPlatformLabel = () => {
        if (chesscomUsername && lichessUsername) return "Lichess + Chess.com";
        if (chesscomUsername) return "Chess.com";
        if (lichessUsername) return "Lichess";
        return "Unknown";
    };

    const displayUsername = () => {
        if (chesscomUsername && lichessUsername) {
            return `${chesscomUsername} & ${lichessUsername}`;
        }
        return chesscomUsername || lichessUsername || "";
    };

    const currentStats = isAllYears && aggregatedStats ? aggregatedStats : (data ? {
        totalGames: data.totalGames,
        chesscomTotal: data.chesscomTotal,
        lichessTotal: data.lichessTotal,
        bestStreak: data.bestStreak,
        activeDay: data.activeDay,
    } : null);

    const insightsData = isAllYears ? Object.values(allYearsData)[0] : data;
    const hasInsights = !!(insightsData && Object.keys(insightsData.dailyCounts).length > 0);

    const handlePngExport = async () => {
        setIsExporting(true);
        try {
            if (isAllYears && Object.keys(allYearsData).length > 0) {
                const years = Object.keys(allYearsData).sort((a, b) => parseInt(b) - parseInt(a));
                const yearHeatmaps = years.map(y => {
                    const svg = document.querySelector(`#heatmap-svg-${y}`);
                    if (!svg) throw new Error(`Heatmap for ${y} not found`);
                    return {
                        year: y,
                        svgString: new XMLSerializer().serializeToString(svg)
                    };
                });

                const filename = generateFilename(chesscomUsername, lichessUsername, year, 'png');
                const stats = aggregatedStats || { totalGames: 0, chesscomTotal: 0, lichessTotal: 0, bestStreak: 0, activeDay: "N/A" };

                await downloadPNGMultiYear(yearHeatmaps, filename, {
                    total: stats.totalGames,
                    chesscom: stats.chesscomTotal,
                    lichess: stats.lichessTotal,
                    chesscomUsername,
                    lichessUsername,
                    year
                });
            } else if (data) {
                const svg = document.querySelector("#heatmap-svg");
                if (!svg) throw new Error("Heatmap not found");

                const svgData = new XMLSerializer().serializeToString(svg);
                const filename = generateFilename(chesscomUsername, lichessUsername, year, 'png');

                await downloadPNG(svgData, filename, {
                    total: data.totalGames,
                    chesscom: data.chesscomTotal,
                    lichess: data.lichessTotal,
                    chesscomUsername,
                    lichessUsername,
                    year
                });
            }
        } catch (e) {
            console.error("Export failed:", e);
            alert("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSvgExport = () => {
        try {
            if (isAllYears && Object.keys(allYearsData).length > 0) {
                const years = Object.keys(allYearsData).sort((a, b) => parseInt(b) - parseInt(a));
                const svgParts: string[] = [];
                let totalHeight = 0;
                let maxWidth = 0;
                const padding = 60;

                years.forEach(y => {
                    const svg = document.querySelector(`#heatmap-svg-${y}`);
                    if (svg) {
                        const width = parseInt(svg.getAttribute('width') || '750');
                        const height = parseInt(svg.getAttribute('height') || '120');
                        maxWidth = Math.max(maxWidth, width);

                        const group = `<g transform="translate(0, ${totalHeight})">
                            <text x="0" y="20" fill="#e6edf3" font-size="18" font-weight="bold">${y}</text>
                            <g transform="translate(0, 30)">${svg.innerHTML}</g>
                        </g>`;
                        svgParts.push(group);
                        totalHeight += height + padding;
                    }
                });

                const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${totalHeight}" viewBox="0 0 ${maxWidth} ${totalHeight}">
                    <rect width="100%" height="100%" fill="#0d1117"/>
                    ${svgParts.join('\n')}
                </svg>`;

                const filename = generateFilename(chesscomUsername, lichessUsername, year, 'svg');
                downloadSVG(combinedSvg, filename);
            } else if (data) {
                const svg = document.querySelector("#heatmap-svg");
                if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const filename = generateFilename(chesscomUsername, lichessUsername, year, 'svg');
                    downloadSVG(svgData, filename);
                }
            }
        } catch (e) {
            console.error("Export SVG failed", e);
        }
    };

    const handleCopyEmbed = (type: 'iframe' | 'markdown' | 'html' | 'url') => {
        const code = generateEmbedCode(chesscomUsername, lichessUsername, year, type);
        navigator.clipboard.writeText(code).then(() => {
        });
    };

    return (
        <div className="w-full">
            {profile?.errors && (
                <div className="mb-6 space-y-2">
                    {Object.entries(profile.errors).map(([platform, error]) => (
                        <div key={platform} className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl border border-destructive/20 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <div>
                                <span className="font-bold capitalize">{platform === 'chesscom' ? 'Chess.com' : 'Lichess'}:</span> {error}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ProfileHeader profile={profile} loading={profileLoading} />


            <header className="mb-10 mt-4 md:mt-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Dashboard:</span>
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary whitespace-nowrap">
                        {getPlatformLabel()}
                    </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row items-center gap-2 md:gap-3">
                    <ExportDropdown
                        onExportPng={handlePngExport}
                        onExportSvg={handleSvgExport}
                        onCopyEmbed={handleCopyEmbed}
                        isExporting={isExporting}
                    />
                    {yearsLoading ? (
                        <div className="h-11 w-[120px] animate-pulse rounded-lg bg-card/50 border border-border/50" />
                    ) : (
                        <ClientYearWrapper years={availableYears} currentYear={year} />
                    )}
                </div>
            </header>

            {!profileLoading && profile && (
                <div className="mb-8">
                    <RatingsOverview
                        profile={profile}
                        hasInsights={hasInsights}
                        showInsights={showInsights}
                        onToggleInsights={() => setShowInsights(!showInsights)}
                    />
                    <InsightsPanel
                        data={insightsData}
                        year={isAllYears ? "all" : year}
                        isExpanded={showInsights}
                    />
                </div>
            )}

            {}
            {loading && loadingProgress > 0 && loadingProgress < 100 && (
                <div className="mb-8 w-full max-w-lg mx-auto">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Fetching game data...</span>
                        <span>{loadingProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${loadingProgress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] skew-x-12"></div>
                        </div>
                    </div>
                </div>
            )}

            {loading || (isAllYears && Object.keys(allYearsData).length === 0) ? (
                <LoadingSkeleton />
            ) : error ? (
                <div className="text-center text-red-500 py-20">{error}</div>
            ) : isAllYears ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8 min-h-full order-1">
                            {}
                            <section aria-label="Game Heatmaps" className="space-y-8">
                                {availableYears.map((y) => (
                                    allYearsData[y] && (
                                        <div key={y} className="space-y-2">
                                            <h2 className="text-lg font-bold text-foreground/80 ml-1">{y} Heatmap</h2>
                                            <Heatmap data={allYearsData[y].dailyCounts} year={y} heatmapId={`heatmap-svg-${y}`} />
                                        </div>
                                    )
                                ))}
                            </section>



                            {}
                            <section aria-label="Game Type Breakdown">
                                <GameBreakdown breakdown={allTimeBreakdown} />
                            </section>

                            {}
                            <section aria-label="Seasonality Chart" className="mt-4">
                                <h2 className="mb-2 text-lg font-bold text-foreground/80 ml-1">Seasonality (All Time)</h2>
                                <GamesGraph data={allTimeDailyCounts} year="all" />
                            </section>

                            <section aria-label="Export and Embed Options" className="w-full order-3 lg:order-2">
                                <ExportPanel
                                    chesscomUsername={chesscomUsername}
                                    lichessUsername={lichessUsername}
                                    year="all"
                                    data={Object.values(allYearsData)[0] || EMPTY_DATA}
                                    allYearsData={allYearsData}
                                    onExportPng={handlePngExport}
                                    onExportSvg={handleSvgExport}
                                    onCopyEmbed={handleCopyEmbed}
                                    isExporting={isExporting}
                                />
                            </section>
                        </div>

                        <aside className="col-span-1 flex flex-col min-h-full order-2 lg:order-3">
                            {currentStats && (
                                <StatsCard
                                    totalGames={currentStats.totalGames}
                                    bestStreak={currentStats.bestStreak}
                                    activeDay={currentStats.activeDay}
                                    chessComCount={currentStats.chesscomTotal}
                                    lichessCount={currentStats.lichessTotal}
                                    chesscomUsername={chesscomUsername}
                                    lichessUsername={lichessUsername}
                                />
                            )}
                        </aside>
                    </div>
                </div>
            ) : data ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8 min-h-full order-1">
                            {}
                            <section aria-label={`${year} Heatmap`} className="flex-1">
                                <Heatmap data={data.dailyCounts} year={year} />
                            </section>

                            {}
                            <section aria-label="Game Type Breakdown">
                                <GameBreakdown breakdown={data.breakdown} />
                            </section>

                            <section aria-label="Activity Graph">
                                <GamesGraph data={data.dailyCounts} year={year} />
                            </section>

                            <section aria-label="Export and Embed Options" className="w-full order-3 lg:order-2">
                                <ExportPanel
                                    chesscomUsername={chesscomUsername}
                                    lichessUsername={lichessUsername}
                                    year={year}
                                    data={data}
                                    onExportPng={handlePngExport}
                                    onExportSvg={handleSvgExport}
                                    onCopyEmbed={handleCopyEmbed}
                                    isExporting={isExporting}
                                />
                            </section>
                        </div>

                        <aside className="col-span-1 flex flex-col min-h-full order-2 lg:order-3">
                            <StatsCard
                                totalGames={data.totalGames}
                                bestStreak={data.bestStreak}
                                activeDay={data.activeDay}
                                chessComCount={data.chesscomTotal}
                                lichessCount={data.lichessTotal}
                                chesscomUsername={chesscomUsername}
                                lichessUsername={lichessUsername}
                            />
                        </aside>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
