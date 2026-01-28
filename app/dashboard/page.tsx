import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/app/components/Navbar";
import DashboardClient from "./DashboardClient";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: { chesscom?: string; lichess?: string; username?: string; platform?: string } }): Promise<Metadata> {
    const user = searchParams.chesscom || searchParams.lichess || searchParams.username;
    if (!user) return { title: "Dashboard" };

    return {
        title: `${user}'s Dashboard`,
        description: `View ${user}'s chess activity heatmap and game statistics.`,
        alternates: {
            canonical: `/user/${user}`,
        }
    };
}

export default function DashboardPage({
    searchParams,
}: {
    searchParams: { chesscom?: string; lichess?: string; year?: string; platform?: string; username?: string };
}) {
    let chesscom = searchParams.chesscom;
    let lichess = searchParams.lichess;

    if (!chesscom && !lichess && searchParams.username) {
        if (searchParams.platform === "chesscom") chesscom = searchParams.username;
        else if (searchParams.platform === "lichess") lichess = searchParams.username;
        else {
            chesscom = searchParams.username;
            lichess = searchParams.username;
        }
    }

    if (!chesscom && !lichess) {
        redirect("/");
    }

    const year = searchParams.year || "all";

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20 w-full animate-in fade-in duration-500">
                <Suspense fallback={<div className="h-[500px] w-full animate-pulse bg-card/20 rounded-[20px]" />}>
                    <DashboardClient
                        chesscomUsername={chesscom}
                        lichessUsername={lichess}
                        year={year}
                    />
                </Suspense>
            </div>
        </div>
    );
}
