import { Suspense } from "react";
import { Navbar } from "@/app/components/Navbar";
import DashboardClient from "@/app/dashboard/DashboardClient";
import { Metadata } from "next";

interface UserPageProps {
    params: { username: string };
    searchParams: { year?: string; platform?: string };
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const { username } = params;
    return {
        title: `${username}'s Chess Heatmap`,
        description: `Visualize ${username}'s chess activity and statistics on Chess.com and Lichess. Clean analytics and activity heatmaps.`,
        openGraph: {
            title: `${username}'s Chess Heatmap`,
            description: `Visualize ${username}'s chess activity and statistics on Chess.com and Lichess.`,
            images: [`/api/og?username=${username}`],  
        },
    };
}

export default function UserPage({ params, searchParams }: UserPageProps) {
    const { username } = params;
    const year = searchParams.year || "all";
    const platform = searchParams.platform || "both";

    const chesscom = (platform === "chesscom" || platform === "both") ? username : undefined;
    const lichess = (platform === "lichess" || platform === "both") ? username : undefined;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header>
                <Navbar />
            </header>
            <main className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20 w-full animate-in fade-in duration-500">
                <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-card/20 rounded-[20px]" />}>
                    <DashboardClient
                        chesscomUsername={chesscom}
                        lichessUsername={lichess}
                        year={year}
                    />
                </Suspense>
            </main>
        </div>
    );
}
