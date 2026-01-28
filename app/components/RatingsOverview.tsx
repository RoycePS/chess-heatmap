"use client";

import { CombinedProfile, PlatformRatings } from "@/app/lib/profile-data";
import { Zap, Clock, Activity, BookOpen, Crown, ChevronDown, ChevronUp } from "lucide-react";

interface RatingsOverviewProps {
    profile: CombinedProfile | null;
    hasInsights?: boolean;
    showInsights?: boolean;
    onToggleInsights?: () => void;
}

export function RatingsOverview({ profile, hasInsights, showInsights, onToggleInsights }: RatingsOverviewProps) {
    if (!profile) return null;

    const getBest = (category: keyof PlatformRatings) => {
        const c = profile.ratings.chesscom?.[category];
        const l = profile.ratings.lichess?.[category];

        if (c && l) {
            return c.rating > l.rating
                ? { val: c, platform: 'chesscom' as const }
                : { val: l, platform: 'lichess' as const };
        }

        if (c) return { val: c, platform: 'chesscom' as const };
        if (l) return { val: l, platform: 'lichess' as const };

        return null;
    };

    const bullet = getBest('bullet');
    const blitz = getBest('blitz');
    const rapid = getBest('rapid');
    const classical = getBest('classical');
    const puzzle = getBest('puzzle');

    const RatingCard = ({
        title,
        data,
        icon: Icon,
        colorClass
    }: {
        title: string;
        data: { val: { rating: number, peak?: number }, platform: 'chesscom' | 'lichess' } | null;
        icon: any;
        colorClass: string;
    }) => {
        if (!data) return null;
        const { val, platform } = data;
        const pfColor = platform === 'chesscom' ? 'text-[#7FA650]' : 'text-[#3D85C6]';

        return (
            <div className={`flex flex-col p-4 rounded-2xl bg-card border border-border/50 shadow-sm relative overflow-hidden group`}>
                <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                    <Icon className="w-12 h-12" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg bg-muted/50 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{title}</span>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">{val.rating}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${pfColor}`}>
                        {platform}
                    </span>
                </div>

                {val.peak && (
                    <div className="text-xs text-muted-foreground mt-1">
                        Peak: <span className="font-semibold">{val.peak}</span>
                    </div>
                )}
            </div>
        );
    };

    const classicalTitle = classical?.platform === 'chesscom' ? 'Daily' : 'Classical';


    return (
        <div className="w-full mb-8">
            <div className="flex items-center gap-3 mb-4 px-1">
                <h3 className="text-lg font-bold text-foreground/80">Current Ratings</h3>
                {hasInsights && onToggleInsights && (
                    <button
                        onClick={onToggleInsights}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showInsights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {showInsights ? "Hide insights" : "View insights"}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <RatingCard title="Bullet" data={bullet} icon={Zap} colorClass="text-orange-500" />
                <RatingCard title="Blitz" data={blitz} icon={Activity} colorClass="text-yellow-500" />
                <RatingCard title="Rapid" data={rapid} icon={Clock} colorClass="text-green-500" />
                <RatingCard title={classicalTitle} data={classical} icon={BookOpen} colorClass="text-blue-500" />
                <RatingCard title="Puzzles" data={puzzle} icon={Crown} colorClass="text-purple-500" />
            </div>
        </div>
    );
}
