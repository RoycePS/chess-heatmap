

export interface UserProfile {
    username: string;
    joinedYear: number;
    platform: 'chesscom' | 'lichess';
}


export async function fetchChessComProfile(username: string): Promise<UserProfile | null> {
    try {
        const res = await fetch(`https: 
            headers: { 'User-Agent': 'ChessHeatmap/1.0' },
            next: { revalidate: 86400 },  
        });

        if (!res.ok) {
            console.error(`Chess.com profile fetch failed: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (typeof data.joined === 'number') {
            const joinedYear = new Date(data.joined * 1000).getFullYear();
            return {
                username: data.username || username,
                joinedYear,
                platform: 'chesscom',
            };
        }

        return null;
    } catch (error) {
        console.error('Chess.com profile fetch error:', error);
        return null;
    }
}


export async function fetchLichessProfile(username: string): Promise<UserProfile | null> {
    try {
        const res = await fetch(`https: 
            headers: { Accept: 'application/json' },
            next: { revalidate: 86400 },  
        });

        if (!res.ok) {
            console.error(`Lichess profile fetch failed: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (typeof data.createdAt === 'number') {
            const joinedYear = new Date(data.createdAt).getFullYear();
            return {
                username: data.username || username,
                joinedYear,
                platform: 'lichess',
            };
        }

        return null;
    } catch (error) {
        console.error('Lichess profile fetch error:', error);
        return null;
    }
}


export function generateYearRange(joinYear: number, currentYear: number = new Date().getFullYear()): string[] {
    const years: string[] = [];

    const effectiveJoinYear = Math.min(joinYear, currentYear);

    for (let year = currentYear; year >= effectiveJoinYear; year--) {
        years.push(year.toString());
    }

    return years;
}


export async function getJoinYears(
    chesscomUsername?: string,
    lichessUsername?: string
): Promise<{ chesscomYear?: number; lichessYear?: number; earliestYear: number }> {
    const currentYear = new Date().getFullYear();

    const [chesscomProfile, lichessProfile] = await Promise.all([
        chesscomUsername ? fetchChessComProfile(chesscomUsername) : Promise.resolve(null),
        lichessUsername ? fetchLichessProfile(lichessUsername) : Promise.resolve(null),
    ]);

    const chesscomYear = chesscomProfile?.joinedYear;
    const lichessYear = lichessProfile?.joinedYear;

    const years = [chesscomYear, lichessYear].filter((y): y is number => y !== undefined);
    const earliestYear = years.length > 0 ? Math.min(...years) : currentYear;

    return {
        chesscomYear,
        lichessYear,
        earliestYear,
    };
}
