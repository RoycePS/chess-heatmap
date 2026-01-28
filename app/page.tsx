"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/app/components/Navbar";
import { useFeaturedAccounts, FeaturedCard, FeaturedAccount } from "@/app/components/FeaturedAccounts";

type Platform = "chesscom" | "lichess" | "both";

export default function LandingPage() {
    const router = useRouter();
    const [chesscomUsername, setChesscomUsername] = useState("");
    const [lichessUsername, setLichessUsername] = useState("");
    const [platform, setPlatform] = useState<Platform>("both");
    const [loading, setLoading] = useState(false);

    const { accounts, accountData, loading: featuredLoading, errors, currentYear } = useFeaturedAccounts();
    const ericRosen = accounts.find(a => a.username === "EricRosen");
    const hikaru = accounts.find(a => a.username === "hikaru");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let valid = false;
        if (platform === "chesscom" && chesscomUsername.trim()) valid = true;
        if (platform === "lichess" && lichessUsername.trim()) valid = true;
        if (platform === "both" && (chesscomUsername.trim() || lichessUsername.trim())) valid = true;

        if (!valid) return;

        setLoading(true);
        const params = new URLSearchParams();
        params.set("platform", platform);
        const year = new Date().getFullYear().toString();
        params.set("year", year);

        if (platform === "chesscom" || platform === "both") {
            if (chesscomUsername.trim()) params.set("chesscom", chesscomUsername.trim());
        }
        if (platform === "lichess" || platform === "both") {
            if (lichessUsername.trim()) params.set("lichess", lichessUsername.trim());
        }

        router.push(`/dashboard?${params.toString()}`);
    };

    const renderFeaturedCard = (account: FeaturedAccount | undefined) => {
        if (!account) return null;
        return (
            <div className="w-full max-w-[320px] mx-auto lg:mx-0">
                <FeaturedCard
                    account={account}
                    data={accountData[account.username] || null}
                    loading={featuredLoading[account.username] || false}
                    error={errors[account.username] || false}
                    year={currentYear}
                />
            </div>
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header>
                <Navbar />
            </header>
            <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center animate-in fade-in duration-700">
                {}
                <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-center justify-center gap-8 lg:gap-12 mt-4 md:mt-0">

                    {}
                    <div className="order-2 lg:order-1 w-full lg:w-auto flex flex-col lg:flex-row items-center justify-center lg:justify-end">
                        <div className="lg:hidden w-full max-w-[320px] text-left text-foreground text-lg font-bold mb-3 mt-10">Featured Players</div>
                        {renderFeaturedCard(ericRosen)}
                    </div>

                    {}
                    <div className="order-1 lg:order-2 w-full max-w-lg space-y-8">
                        <section className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                                Chess Heatmap
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                                Visualize your chess game frequency across Chess.com and Lichess.
                            </p>
                        </section>

                        <section className="rounded-[24px] border border-border/50 bg-card p-2 shadow-sm">
                            {}
                            <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-[20px]" role="group" aria-label="Platform selection">
                                {(["chesscom", "lichess", "both"] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        type="button"
                                        aria-pressed={platform === p}
                                        className={`
                                            relative z-10 rounded-[16px] py-2.5 text-sm font-semibold capitalize transition-all duration-200
                                            ${platform === p
                                                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                            }
                                        `}
                                    >
                                        {p === "chesscom" ? "Chess.com" : p === "lichess" ? "Lichess" : "Combined"}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 p-4 pt-2">
                                {}
                                <div className="space-y-4">
                                    {(platform === "chesscom" || platform === "both") && (
                                        <div className="space-y-1.5 text-left">
                                            <label htmlFor="chesscom" className="text-xs font-medium ml-1 text-muted-foreground">Chess.com Username</label>
                                            <input
                                                id="chesscom"
                                                type="text"
                                                placeholder="e.g. MagnusCarlsen"
                                                value={chesscomUsername}
                                                onChange={(e) => setChesscomUsername(e.target.value)}
                                                autoComplete="username"
                                                className="h-12 w-full rounded-xl border border-input bg-background/50 px-4 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    )}
                                    {(platform === "lichess" || platform === "both") && (
                                        <div className="space-y-1.5 text-left">
                                            <label htmlFor="lichess" className="text-xs font-medium ml-1 text-muted-foreground">Lichess Username</label>
                                            <input
                                                id="lichess"
                                                type="text"
                                                placeholder="e.g. DrNykterstein"
                                                value={lichessUsername}
                                                onChange={(e) => setLichessUsername(e.target.value)}
                                                autoComplete="username"
                                                className="h-12 w-full rounded-xl border border-input bg-background/50 px-4 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    aria-busy={loading}
                                    className="mt-2 h-12 w-full rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-md hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {loading ? "Generating..." : "Generate Heatmap"}
                                </button>
                            </form>
                        </section>
                    </div>

                    {}
                    <div className="order-3 lg:order-3 w-full lg:w-auto flex justify-center lg:justify-start">
                        {renderFeaturedCard(hikaru)}
                    </div>
                </div>
            </main>
        </div>
    );
}
