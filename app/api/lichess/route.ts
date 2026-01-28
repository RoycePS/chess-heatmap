import { NextRequest, NextResponse } from "next/server";
import { fetchLichessData } from "@/app/lib/chess-data";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const year = searchParams.get("year");

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    if (!year) {
        return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    try {
        const data = await fetchLichessData(username, year);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Lichess data" }, { status: 500 });
    }
}
