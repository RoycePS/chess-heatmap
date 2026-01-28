import { NextRequest, NextResponse } from "next/server";
import { getChessData } from "@/app/lib/chess-data";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const chesscom = searchParams.get("chesscom") || undefined;
    const lichess = searchParams.get("lichess") || undefined;
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    if (!chesscom && !lichess) {
        return NextResponse.json({ error: "At least one username is required" }, { status: 400 });
    }

    try {
        const data = await getChessData(chesscom, lichess, year);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch chess data" }, { status: 500 });
    }
}
