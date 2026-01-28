import { z } from "zod";

export interface DailyStats {
    chesscom: number;
    lichess: number;
    total: number;
}

export interface GameBreakdown {
    speed: {
        bullet: number;
        blitz: number;
        rapid: number;
        classical: number;
        daily: number;
        other: number;
    };
    result: {
        win: number;
        loss: number;
        draw: number;
        other: number;
    };
}

export interface ChessHeatmapData {
    totalGames: number;
    chesscomTotal: number;
    lichessTotal: number;
    dailyCounts: Record<string, DailyStats>;
    bestStreak: number;
    activeDay: string;
    breakdown: GameBreakdown;
}

export const EMPTY_DATA: ChessHeatmapData = {
    totalGames: 0,
    chesscomTotal: 0,
    lichessTotal: 0,
    dailyCounts: {},
    bestStreak: 0,
    activeDay: "N/A",
    breakdown: {
        speed: { bullet: 0, blitz: 0, rapid: 0, classical: 0, daily: 0, other: 0 },
        result: { win: 0, loss: 0, draw: 0, other: 0 }
    }
};

const ChessComArchivesSchema = z.object({
    archives: z.array(z.string()),
});

const ChessComGameSchema = z.object({
    end_time: z.number(),
    time_class: z.string().optional(),
    white: z.object({ username: z.string(), result: z.string() }),
    black: z.object({ username: z.string(), result: z.string() }),
}).passthrough();

const ChessComGamesResponseSchema = z.object({
    games: z.array(ChessComGameSchema),
});

interface FetchResult {
    counts: Record<string, number>;
    total: number;
    breakdown: GameBreakdown;
}

const emptyBreakdown = (): GameBreakdown => ({
    speed: { bullet: 0, blitz: 0, rapid: 0, classical: 0, daily: 0, other: 0 },
    result: { win: 0, loss: 0, draw: 0, other: 0 }
});


export async function fetchLichessData(username: string, year: string): Promise<FetchResult> {
    const counts: Record<string, number> = {};
    let total = 0;
    const breakdown = emptyBreakdown();
    const targetYear = parseInt(year);
    const lowerUsername = username.toLowerCase();

    try {
        const since = new Date(`${year}-01-01`).getTime();
        const until = new Date(`${year}-12-31T23:59:59`).getTime();

        const params = new URLSearchParams({
            moves: "false",
            evals: "false",
            clocks: "false",
            opening: "false",
            since: since.toString(),
            until: until.toString()
        });

        const res = await fetch(`https://lichess.org/api/games/user/${username}?${params.toString()}`, {
            headers: { Accept: "application/x-ndjson" },
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            console.error(`Lichess API error: ${res.status}`);
            return { counts, total, breakdown };
        }

        const reader = res.body?.getReader();
        if (!reader) return { counts, total, breakdown };

        const decoder = new TextDecoder();
        let buffer = "";

        const processGame = (game: any) => {
            if (game.createdAt) {
                const date = new Date(game.createdAt);
                if (date.getFullYear() === targetYear) {
                    const dateStr = date.toISOString().split("T")[0];
                    counts[dateStr] = (counts[dateStr] || 0) + 1;
                    total++;

                    const speed = game.speed;
                    if (speed === 'bullet') breakdown.speed.bullet++;
                    else if (speed === 'blitz') breakdown.speed.blitz++;
                    else if (speed === 'rapid') breakdown.speed.rapid++;
                    else if (speed === 'classical') breakdown.speed.classical++;
                    else breakdown.speed.other++;

                    let result = 'other';
                    if (game.status === 'draw' || game.status === 'stalemate') {
                        result = 'draw';
                    } else if (game.winner) {
                        const isWhite = game.players.white.user?.name?.toLowerCase() === lowerUsername ||
                            game.players.white.user?.id?.toLowerCase() === lowerUsername;

                        if (isWhite && game.winner === 'white') result = 'win';
                        else if (!isWhite && game.winner === 'black') result = 'win';
                        else result = 'loss';
                    } else {
                        result = 'other';
                    }

                    if (result === 'win') breakdown.result.win++;
                    else if (result === 'loss') breakdown.result.loss++;
                    else if (result === 'draw') breakdown.result.draw++;
                    else breakdown.result.other++;
                }
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    processGame(JSON.parse(line));
                } catch (e) { }
            }
        }

        if (buffer.trim()) {
            try {
                processGame(JSON.parse(buffer));
            } catch (e) { }
        }

    } catch (e) {
        console.error("Lichess fetch error", e);
    }

    return { counts, total, breakdown };
}



export async function fetchChessComData(username: string, year: string): Promise<FetchResult> {
    const counts: Record<string, number> = {};
    let total = 0;
    const breakdown = emptyBreakdown();
    const targetYear = parseInt(year);
    const lowerUsername = username.toLowerCase();

    try {
        const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`, {
            headers: { "User-Agent": "ChessHeatmap/1.0" },
            next: { revalidate: 3600 },
        });

        if (!archivesRes.ok) return { counts, total, breakdown };

        const archivesJson = await archivesRes.json();
        const { archives } = ChessComArchivesSchema.parse(archivesJson);
        const yearArchives = archives.filter(url => url.includes(`/${year}/`));

        const promises = yearArchives.map(async (url) => {
            try {
                const res = await fetch(url, {
                    headers: { "User-Agent": "ChessHeatmap/1.0" },
                    next: { revalidate: 3600 }
                });
                if (!res.ok) return;

                const json = await res.json();
                const data = ChessComGamesResponseSchema.parse(json);

                data.games.forEach(game => {
                    const date = new Date(game.end_time * 1000);
                    if (date.getFullYear() === targetYear) {
                        const dateStr = date.toISOString().split("T")[0];
                        counts[dateStr] = (counts[dateStr] || 0) + 1;
                        total++;

                        const tc = game.time_class;
                        if (tc === 'bullet') breakdown.speed.bullet++;
                        else if (tc === 'blitz') breakdown.speed.blitz++;
                        else if (tc === 'rapid') breakdown.speed.rapid++;
                        else if (tc === 'daily') breakdown.speed.daily++;
                        else breakdown.speed.other++;

                        const isWhite = game.white.username.toLowerCase() === lowerUsername;
                        const userResult = isWhite ? game.white.result : game.black.result;

                        if (userResult === 'win') breakdown.result.win++;
                        else if (['agreed', 'repetition', 'stalemate', 'insufficient', 'timevsinsufficient', '50move'].includes(userResult)) {
                            breakdown.result.draw++;
                        } else {
                            breakdown.result.loss++;
                        }
                    }
                });
            } catch (e) { }
        });

        await Promise.all(promises);

    } catch (e) {
        console.error("Chess.com fetch error", e);
    }
    return { counts, total, breakdown };
}


export async function getChessData(
    chesscomUsername?: string,
    lichessUsername?: string,
    year: string = new Date().getFullYear().toString()
): Promise<ChessHeatmapData> {

    if (!chesscomUsername && !lichessUsername) return EMPTY_DATA;

    const [lichessRes, chesscomRes] = await Promise.all([
        lichessUsername ? fetchLichessData(lichessUsername, year) : Promise.resolve(null),
        chesscomUsername ? fetchChessComData(chesscomUsername, year) : Promise.resolve(null)
    ]);

    const dailyCounts: Record<string, DailyStats> = {};
    let chesscomTotal = 0;
    let lichessTotal = 0;
    const combinedBreakdown = emptyBreakdown();

    if (lichessRes) {
        lichessTotal = lichessRes.total;
        Object.entries(lichessRes.counts).forEach(([date, count]) => {
            if (!dailyCounts[date]) dailyCounts[date] = { chesscom: 0, lichess: 0, total: 0 };
            dailyCounts[date].lichess += count;
            dailyCounts[date].total += count;
        });

        Object.keys(combinedBreakdown.speed).forEach(k => {
            const key = k as keyof GameBreakdown['speed'];
            combinedBreakdown.speed[key] += lichessRes.breakdown.speed[key];
        });
        Object.keys(combinedBreakdown.result).forEach(k => {
            const key = k as keyof GameBreakdown['result'];
            combinedBreakdown.result[key] += lichessRes.breakdown.result[key];
        });
    }

    if (chesscomRes) {
        chesscomTotal = chesscomRes.total;
        Object.entries(chesscomRes.counts).forEach(([date, count]) => {
            if (!dailyCounts[date]) dailyCounts[date] = { chesscom: 0, lichess: 0, total: 0 };
            dailyCounts[date].chesscom += count;
            dailyCounts[date].total += count;
        });

        Object.keys(combinedBreakdown.speed).forEach(k => {
            const key = k as keyof GameBreakdown['speed'];
            combinedBreakdown.speed[key] += chesscomRes.breakdown.speed[key];
        });
        Object.keys(combinedBreakdown.result).forEach(k => {
            const key = k as keyof GameBreakdown['result'];
            combinedBreakdown.result[key] += chesscomRes.breakdown.result[key];
        });
    }

    const sortedDates = Object.keys(dailyCounts).sort();
    let maxGames = 0;
    let activeDay = "N/A";
    let currentStreak = 0;
    const bestStreak = 0;
    let tempBestStreak = 0;
    let tempCurrentStreak = 0;
    let prevDateVal: number | null = null;
    let totalGames = 0;

    sortedDates.forEach((date) => {
        const stats = dailyCounts[date];
        const count = stats.total;
        totalGames += count;

        if (count > maxGames) {
            maxGames = count;
            activeDay = new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }

        const dVal = new Date(date).getTime();
        if (prevDateVal && dVal - prevDateVal <= 93600000) {
            tempCurrentStreak++;
        } else {
            tempCurrentStreak = 1;
        }
        if (tempCurrentStreak > tempBestStreak) tempBestStreak = tempCurrentStreak;
        prevDateVal = dVal;
    });

    return {
        totalGames,
        chesscomTotal,
        lichessTotal,
        dailyCounts,
        bestStreak: tempBestStreak || (totalGames > 0 ? 1 : 0),
        activeDay: activeDay === "N/A" && totalGames > 0 ? "Today" : activeDay,
        breakdown: combinedBreakdown
    };
}
