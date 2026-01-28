import { NextRequest, NextResponse } from "next/server";
import { getChessData } from "@/app/lib/chess-data";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const data = await getChessData(username);

    const chessComOnlyCounts: Record<string, number> = {};
    Object.entries(data.dailyCounts).forEach(([date, stats]) => {
        if (stats.chesscom > 0) {
            chessComOnlyCounts[date] = stats.chesscom;
        }
    });

    return NextResponse.json({
        source: "chesscom",
        username,
        totalGames: data.chesscomTotal,
        dailyCounts: chessComOnlyCounts,
    }, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
    });
}
