"use client";

import { GameBreakdown as GameBreakdownType } from "@/app/lib/chess-data";

interface GameBreakdownProps {
    breakdown: GameBreakdownType;
}

export function GameBreakdown({ breakdown }: GameBreakdownProps) {
    if (!breakdown) return null;

    const totalSpeed = Object.values(breakdown.speed).reduce((a, b) => a + b, 0);
    const totalResult = Object.values(breakdown.result).reduce((a, b) => a + b, 0);

    if (totalSpeed === 0) return null;

    const SpeedBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
        const pct = totalSpeed > 0 ? (value / totalSpeed) * 100 : 0;
        if (pct < 1) return null;  
        return (
            <div className="flex flex-col gap-1 w-full" style={{ width: `${Math.max(pct, 10)}%` }}>
                <div className={`h-2 rounded-full ${color} w-full`}></div>
                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                    <span className="font-semibold">{label}</span>
                    <span>{pct.toFixed(0)}%</span>
                </div>
            </div>
        );
    };

    const ResultDonut = () => {
        const wins = breakdown.result.win;
        const losses = breakdown.result.loss;
        const draws = breakdown.result.draw;

        const winPct = (wins / totalResult) * 100;
        const lossPct = (losses / totalResult) * 100;
        const drawPct = (draws / totalResult) * 100;

        const gradient = `conic-gradient(
            #22c55e 0% ${winPct}%, 
            #ef4444 ${winPct}% ${winPct + lossPct}%, 
            #fbbf24 ${winPct + lossPct}% 100%
        )`;

        return (
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full" style={{ background: gradient }}>
                    <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center flex-col">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                        <span className="text-lg font-black text-foreground">{totalResult.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="font-bold">{wins}</span> Wins
                        <span className="text-muted-foreground">({winPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="font-bold">{losses}</span> Losses
                        <span className="text-muted-foreground">({lossPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="font-bold">{draws}</span> Draws
                        <span className="text-muted-foreground">({drawPct.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {}
            <div className="p-6 rounded-[24px] border border-border/50 bg-card shadow-sm">
                <h3 className="text-lg font-bold text-foreground/80 mb-6">Game Types</h3>

                <div className="space-y-6">
                    {}
                    <div className="flex gap-1 w-full overflow-hidden rounded-full bg-muted/50 h-3">
                        <div style={{ width: `${(breakdown.speed.bullet / totalSpeed) * 100}%` }} className="bg-orange-500 h-full" />
                        <div style={{ width: `${(breakdown.speed.blitz / totalSpeed) * 100}%` }} className="bg-yellow-500 h-full" />
                        <div style={{ width: `${(breakdown.speed.rapid / totalSpeed) * 100}%` }} className="bg-green-500 h-full" />
                        <div style={{ width: `${(breakdown.speed.classical / totalSpeed) * 100}%` }} className="bg-blue-500 h-full" />
                        <div style={{ width: `${(breakdown.speed.daily / totalSpeed) * 100}%` }} className="bg-purple-500 h-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs">Bu</div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Bullet</span>
                                <span className="font-bold">{breakdown.speed.bullet.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-bold text-xs">Bz</div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Blitz</span>
                                <span className="font-bold">{breakdown.speed.blitz.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">Rp</div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Rapid</span>
                                <span className="font-bold">{breakdown.speed.rapid.toLocaleString()}</span>
                            </div>
                        </div>
                        {breakdown.speed.classical > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">Cl</div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-semibold uppercase">Classical <span className="opacity-50 text-[10px]">(Lichess)</span></span>
                                    <span className="font-bold">{breakdown.speed.classical.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                        {breakdown.speed.daily > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">Dl</div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-semibold uppercase">Daily <span className="opacity-50 text-[10px]">(Chess.com)</span></span>
                                    <span className="font-bold">{breakdown.speed.daily.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {}
            <div className="p-6 rounded-[24px] border border-border/50 bg-card shadow-sm">
                <h3 className="text-lg font-bold text-foreground/80 mb-6">Performance</h3>
                <div className="flex items-center justify-center h-full pb-4">
                    <ResultDonut />
                </div>
            </div>
        </div>
    );
}
