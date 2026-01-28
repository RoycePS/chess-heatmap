import { z } from "zod";


export interface PlatformProfile {
    username: string;
    platform: "chesscom" | "lichess";
    url: string;
    avatar?: string;
    title?: string;  
    country?: string;  
    joinedDate?: number;  
    lastOnline?: number;  
    followers?: number;
    isStreamer?: boolean;
}

export interface PlatformRatings {
    bullet?: { rating: number; rd?: number; prog?: number; peak?: number };
    blitz?: { rating: number; rd?: number; prog?: number; peak?: number };
    rapid?: { rating: number; rd?: number; prog?: number; peak?: number };
    classical?: { rating: number; rd?: number; prog?: number; peak?: number };  
    puzzle?: { rating: number };
}

export interface CombinedProfile {
    chesscom?: PlatformProfile;
    lichess?: PlatformProfile;
    ratings: {
        chesscom?: PlatformRatings;
        lichess?: PlatformRatings;
    };
    errors?: {
        chesscom?: string;
        lichess?: string;
    };
}


const LichessProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    url: z.string(),
    title: z.string().optional(),
    online: z.boolean().optional(),
    createdAt: z.number().optional(),  
    seenAt: z.number().optional(),  
    profile: z.object({
        country: z.string().optional(),
        location: z.string().optional(),
        bio: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    }).optional(),
    perfs: z.object({
        bullet: z.object({ rating: z.number(), rd: z.number(), prog: z.number() }).optional(),
        blitz: z.object({ rating: z.number(), rd: z.number(), prog: z.number() }).optional(),
        rapid: z.object({ rating: z.number(), rd: z.number(), prog: z.number() }).optional(),
        classical: z.object({ rating: z.number(), rd: z.number(), prog: z.number() }).optional(),
        puzzle: z.object({ rating: z.number() }).optional(),
    }).optional(),
    count: z.object({
        followers: z.number().optional(),
    }).optional(),
    disabled: z.boolean().optional(),
    closed: z.boolean().optional(),
    tosViolation: z.boolean().optional(),
}).passthrough();

export async function fetchLichessProfileData(username: string): Promise<{ profile: PlatformProfile; ratings: PlatformRatings; error?: string } | { error: string } | null> {
    try {
        const res = await fetch(`https: 
            headers: { Accept: "application/json" },
            next: { revalidate: 300 },
        });

        if (res.status === 404) return { error: "User not found" };
        if (!res.ok) return null;

        const json = await res.json();
        let statusError: string | undefined;

        if (json.disabled || json.closed || json.tosViolation) {
            statusError = "Account closed or violates terms";
        }

        const data = LichessProfileSchema.parse(json);

        const profile: PlatformProfile = {
            username: data.username,
            platform: "lichess",
            url: data.url,
            title: data.title,
            country: data.profile?.country,
            joinedDate: data.createdAt,
            lastOnline: data.seenAt,
            followers: data.count?.followers,
        };

        const ratings: PlatformRatings = {
            bullet: data.perfs?.bullet,
            blitz: data.perfs?.blitz,
            rapid: data.perfs?.rapid,
            classical: data.perfs?.classical,
            puzzle: data.perfs?.puzzle,
        };

        return { profile, ratings, error: statusError };
    } catch (e) {
        console.error("Lichess profile fetch error", e);
        return null;
    }
}


const ChessComProfileSchema = z.object({
    username: z.string(),
    url: z.string(),
    avatar: z.string().optional(),
    title: z.string().optional(),  
    country: z.string().optional(),  
    joined: z.number().optional(),  
    last_online: z.number().optional(),  
    followers: z.number().optional(),
    is_streamer: z.boolean().optional(),
    status: z.string().optional(),
}).passthrough();

const ChessComStatsSchema = z.object({
    chess_bullet: z.object({ last: z.object({ rating: z.number() }), best: z.object({ rating: z.number() }).optional() }).optional(),
    chess_blitz: z.object({ last: z.object({ rating: z.number() }), best: z.object({ rating: z.number() }).optional() }).optional(),
    chess_rapid: z.object({ last: z.object({ rating: z.number() }), best: z.object({ rating: z.number() }).optional() }).optional(),
    chess_daily: z.object({ last: z.object({ rating: z.number() }), best: z.object({ rating: z.number() }).optional() }).optional(),  
    tactics: z.object({ highest: z.object({ rating: z.number() }).optional(), lowest: z.object({ rating: z.number() }).optional() }).optional(),  
}).passthrough();

export async function fetchChessComProfileData(username: string): Promise<{ profile: PlatformProfile; ratings: PlatformRatings; error?: string } | { error: string } | null> {
    try {
        const [profileRes, statsRes] = await Promise.all([
            fetch(`https: 
                headers: { "User-Agent": "ChessHeatmap/1.0" },
                next: { revalidate: 3600 },
            }),
            fetch(`https: 
                headers: { "User-Agent": "ChessHeatmap/1.0" },
                next: { revalidate: 300 },
            })
        ]);

        if (profileRes.status === 404) return { error: "User not found" };

        if (!profileRes.ok || !statsRes.ok) return null;

        const profileJson = await profileRes.json();
        const statsJson = await statsRes.json();

        const profileData = ChessComProfileSchema.parse(profileJson);
        const statsData = ChessComStatsSchema.parse(statsJson);
        let statusError: string | undefined;

        if (profileData.status === 'closed' || profileData.status === 'closed:fair_play_violations') {
            statusError = profileData.status === 'closed:fair_play_violations' ? "Account banned for fair play" : "Account closed";
        }

        let countryCode = undefined;
        if (profileData.country) {
            const parts = profileData.country.split("/");
            countryCode = parts[parts.length - 1];
        }

        const profile: PlatformProfile = {
            username: profileData.username,
            platform: "chesscom",
            url: profileData.url,
            avatar: profileData.avatar,
            title: profileData.title,
            country: countryCode,
            joinedDate: profileData.joined ? profileData.joined * 1000 : undefined,
            lastOnline: profileData.last_online ? profileData.last_online * 1000 : undefined,
            followers: profileData.followers,
            isStreamer: profileData.is_streamer,
        };

        const ratings: PlatformRatings = {
            bullet: statsData.chess_bullet ? { rating: statsData.chess_bullet.last.rating, peak: statsData.chess_bullet.best?.rating } : undefined,
            blitz: statsData.chess_blitz ? { rating: statsData.chess_blitz.last.rating, peak: statsData.chess_blitz.best?.rating } : undefined,
            rapid: statsData.chess_rapid ? { rating: statsData.chess_rapid.last.rating, peak: statsData.chess_rapid.best?.rating } : undefined,
            classical: statsData.chess_daily ? { rating: statsData.chess_daily.last.rating, peak: statsData.chess_daily.best?.rating } : undefined,
            puzzle: statsData.tactics?.highest ? { rating: statsData.tactics.highest.rating } : undefined,
        };

        return { profile, ratings, error: statusError };

    } catch (e) {
        console.error("Chess.com profile fetch error", e);
        return null;
    }
}


export async function getCombinedProfile(
    chesscomUsername?: string,
    lichessUsername?: string
): Promise<CombinedProfile> {
    const [chesscomRes, lichessRes] = await Promise.all([
        chesscomUsername ? fetchChessComProfileData(chesscomUsername) : Promise.resolve(null),
        lichessUsername ? fetchLichessProfileData(lichessUsername) : Promise.resolve(null)
    ]);

    const errors: { chesscom?: string; lichess?: string } = {};
    let chesscomData: { profile: PlatformProfile; ratings: PlatformRatings } | null = null;
    let lichessData: { profile: PlatformProfile; ratings: PlatformRatings } | null = null;

    if (chesscomRes) {
        if ('error' in chesscomRes && !('profile' in chesscomRes)) {
            errors.chesscom = chesscomRes.error;
        } else if (chesscomRes && 'profile' in chesscomRes) {
            chesscomData = chesscomRes;
            if (chesscomRes.error) {
                errors.chesscom = chesscomRes.error;
            }
        }
    }

    if (lichessRes) {
        if ('error' in lichessRes && !('profile' in lichessRes)) {
            errors.lichess = lichessRes.error;
        } else if (lichessRes && 'profile' in lichessRes) {
            lichessData = lichessRes;
            if (lichessRes.error) {
                errors.lichess = lichessRes.error;
            }
        }
    }

    return {
        chesscom: chesscomData?.profile,
        lichess: lichessData?.profile,
        ratings: {
            chesscom: chesscomData?.ratings,
            lichess: lichessData?.ratings,
        },
        errors: Object.keys(errors).length > 0 ? errors : undefined
    };
}
