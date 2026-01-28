import { NextRequest, NextResponse } from "next/server";
import { getCombinedProfile } from "@/app/lib/profile-data";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const chesscom = searchParams.get("chesscom") || undefined;
    const lichess = searchParams.get("lichess") || undefined;

    if (!chesscom && !lichess) {
        return NextResponse.json({ error: "At least one username is required" }, { status: 400 });
    }

    try {
        const data = await getCombinedProfile(chesscom, lichess);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
    }
}
