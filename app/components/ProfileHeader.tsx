"use client";

import Image from "next/image";
import { CombinedProfile } from "@/app/lib/profile-data";
import { Calendar, Globe, Award, Wifi, ExternalLink } from "lucide-react";

interface ProfileHeaderProps {
    profile: CombinedProfile | null;
    loading?: boolean;
}

export function ProfileHeader({ profile, loading }: ProfileHeaderProps) {
    if (loading) {
        return (
            <div className="w-full rounded-[24px] border border-border/50 bg-card p-6 shadow-sm animate-pulse mb-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <div className="w-24 h-24 rounded-full bg-muted/50 shrink-0" />
                    <div className="space-y-4 w-full">
                        <div className="h-8 w-48 bg-muted/50 rounded-lg" />
                        <div className="flex gap-3">
                            <div className="h-6 w-20 bg-muted/50 rounded-full" />
                            <div className="h-6 w-24 bg-muted/50 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const mainProfile = profile.chesscom || profile.lichess;
    if (!mainProfile) return null;

    const avatarUrl = mainProfile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${mainProfile.username}`;
    const joinedDate = mainProfile.joinedDate ? new Date(mainProfile.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Unknown";
    const lastOnline = mainProfile.lastOnline ? new Date(mainProfile.lastOnline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Unknown";

    let countryCode = mainProfile.country?.toLowerCase();

    if (countryCode === 'xx' || countryCode === 'xa') {
        countryCode = 'un';
    }

    let countryName = mainProfile.country || "";
    try {
        if (countryCode) {
            if (countryCode === 'un') {
                countryName = "International";
            } else {
                const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                countryName = regionNames.of(countryCode.toUpperCase()) || countryName;
            }
        }
    } catch (e) {
    }

    return (
        <div className="w-full rounded-[24px] border border-border/50 bg-card p-6 shadow-sm mb-8 relative overflow-hidden">
            { }
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                { }
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg overflow-hidden relative bg-muted">
                        <Image
                            src={avatarUrl}
                            alt={mainProfile.username}
                            fill
                            className="object-cover"
                            unoptimized={true}
                        />
                    </div>
                    {mainProfile.isStreamer && (
                        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border-2 border-background">
                            LIVE
                        </div>
                    )}
                </div>

                { }
                <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">{mainProfile.username}</h1>
                        {mainProfile.title && (
                            <span className="bg-red-600/10 text-red-600 px-2 py-0.5 rounded-md text-xs font-bold border border-red-600/20 self-center sm:self-auto sm:mb-1.5">
                                {mainProfile.title}
                            </span>
                        )}
                        {countryCode && (
                            <div className="relative w-6 h-4 shadow-sm rounded-sm overflow-hidden self-center sm:self-auto sm:mb-1.5 opacity-80 cursor-help" title={countryName}>
                                <Image
                                    src={`https://flagcdn.com/w40/${countryCode}.png`}
                                    alt={countryName}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                    </div>

                    { }
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground border border-border/50">
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {joinedDate}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground border border-border/50">
                            <Wifi className="w-3.5 h-3.5" />
                            Seen {lastOnline}
                        </div>
                        {profile.chesscom && (
                            <a
                                href={profile.chesscom.url}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7FA650]/10 text-[#7FA650] text-xs font-bold hover:bg-[#7FA650]/20 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Chess.com
                            </a>
                        )}
                        {profile.lichess && (
                            <a
                                href={profile.lichess.url}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D85C6]/10 text-[#3D85C6] text-xs font-bold hover:bg-[#3D85C6]/20 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Lichess
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
