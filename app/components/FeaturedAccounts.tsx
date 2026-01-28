"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MiniHeatmap } from "./MiniHeatmap";
import { ChessHeatmapData, EMPTY_DATA } from "@/app/lib/chess-data";

export interface FeaturedAccount {
    username: string;
    platform: "chesscom" | "lichess";
    displayName: string;
    profileUrl: string;
}

export const FEATURED_ACCOUNTS: FeaturedAccount[] = [
    {
        username: "EricRosen",
        platform: "lichess",
        displayName: "Eric Rosen",
        profileUrl: "https://lichess.org/@/EricRosen",
    },
    {
        username: "hikaru",
        platform: "chesscom",
        displayName: "Hikaru Nakamura",
        profileUrl: "https://www.chess.com/member/hikaru/",
    },
];

interface FeaturedCardProps {
    account: FeaturedAccount;
    data: ChessHeatmapData | null;
    loading: boolean;
    error: boolean;
    year: string;
}

const dataCache = new Map<string, { data: ChessHeatmapData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;  

export function FeaturedCard({ account, data, loading, error, year }: FeaturedCardProps) {
    const router = useRouter();

    const handleClick = () => {
        const params = new URLSearchParams();
        params.set("platform", account.platform);
        params.set("year", year);

        if (account.platform === "chesscom") {
            params.set("chesscom", account.username);
        } else {
            params.set("lichess", account.username);
        }

        router.push(`/dashboard?${params.toString()}`);
    };

    const platformBadge = account.platform === "chesscom"
        ? { label: "Chess.com", color: "bg-green-600" }
        : { label: "Lichess", color: "bg-white text-black" };

    return (
        <button
            onClick={handleClick}
            className="group flex flex-col gap-4 rounded-[20px] border border-border/50 bg-card p-5 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                        {account.username[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {account.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {data ? `${data.totalGames.toLocaleString()} games in ${year}` : "Loading..."}
                        </div>
                    </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${platformBadge.color}`}>
                    {platformBadge.label}
                </span>
            </div>

            <div className="h-[64px] flex items-center justify-center">
                {loading ? (
                    <div className="w-full h-[56px] animate-pulse rounded-lg bg-muted/50" />
                ) : error ? (
                    <div className="text-xs text-muted-foreground">Failed to load preview</div>
                ) : data ? (
                    <MiniHeatmap data={data.dailyCounts} year={year} />
                ) : null}
            </div>
        </button>
    );
}

export function useFeaturedAccounts() {
    const [accountData, setAccountData] = useState<Record<string, ChessHeatmapData | null>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const currentYear = new Date().getFullYear().toString();

    useEffect(() => {
        const fetchAccount = async (account: FeaturedAccount) => {
            const cacheKey = `${account.platform}-${account.username}-${currentYear}`;

            const cached = dataCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                setAccountData(prev => ({ ...prev, [account.username]: cached.data }));
                setLoading(prev => ({ ...prev, [account.username]: false }));
                return;
            }

            setLoading(prev => ({ ...prev, [account.username]: true }));

            try {
                const params = new URLSearchParams();
                if (account.platform === "chesscom") {
                    params.set("chesscom", account.username);
                } else {
                    params.set("lichess", account.username);
                }
                params.set("year", currentYear);

                const res = await fetch(`/api/combined?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch");

                const data: ChessHeatmapData = await res.json();

                dataCache.set(cacheKey, { data, timestamp: Date.now() });

                setAccountData(prev => ({ ...prev, [account.username]: data }));
            } catch (err) {
                console.error(`Failed to fetch data for ${account.username}:`, err);
                setErrors(prev => ({ ...prev, [account.username]: true }));
                setAccountData(prev => ({ ...prev, [account.username]: EMPTY_DATA }));
            } finally {
                setLoading(prev => ({ ...prev, [account.username]: false }));
            }
        };

        const fetchInOrder = async () => {
            for (const account of FEATURED_ACCOUNTS) {
                await fetchAccount(account);
            }
        };

        fetchInOrder();
    }, [currentYear]);

    return {
        accounts: FEATURED_ACCOUNTS,
        accountData,
        loading,
        errors,
        currentYear
    };
}

export function FeaturedAccounts() {
    const { accounts, accountData, loading, errors, currentYear } = useFeaturedAccounts();

    return (
        <div className="w-full mt-12 animate-in fade-in duration-700 delay-300">
            <h2 className="text-center text-lg font-bold text-foreground/70 mb-6">Featured Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((account) => (
                    <FeaturedCard
                        key={account.username}
                        account={account}
                        data={accountData[account.username] || null}
                        loading={loading[account.username] || false}
                        error={errors[account.username] || false}
                        year={currentYear}
                    />
                ))}
            </div>
        </div>
    );
}
