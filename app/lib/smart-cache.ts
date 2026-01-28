"use client";



type CacheType = 'profile' | 'current-year' | 'static-year';

interface CacheConfig {
    version: string;
    ttl: Record<CacheType, number>;
}

const CONFIG: CacheConfig = {
    version: "chessheat_v1",
    ttl: {
        'profile': 24 * 60 * 60 * 1000,  
        'current-year': 15 * 60 * 1000,  
        'static-year': Infinity,         
    }
};

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: string;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export class SmartCache {

    
    static get<T>(key: string, type: CacheType): T | null {
        if (memoryCache.has(key)) {
            const entry = memoryCache.get(key) as CacheEntry<T>;
            if (this.isValid(entry, type)) {
                return entry.data;
            } else {
                memoryCache.delete(key);  
            }
        }

        if (typeof window !== 'undefined') {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    const entry = JSON.parse(item) as CacheEntry<T>;
                    if (this.isValid(entry, type)) {
                        memoryCache.set(key, entry);
                        return entry.data;
                    } else {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.warn("SmartCache read error", e);
            }
        }

        return null;
    }

    
    static set<T>(key: string, data: T, type: CacheType): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            version: CONFIG.version
        };

        memoryCache.set(key, entry);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(key, JSON.stringify(entry));
            } catch (e) {
                console.warn("SmartCache write error (Quota exceeded?)", e);
            }
        }
    }

    
    private static isValid(entry: CacheEntry<any>, type: CacheType): boolean {
        if (entry.version !== CONFIG.version) return false;

        const age = Date.now() - entry.timestamp;
        const maxAge = CONFIG.ttl[type];

        return age < maxAge;
    }

    
    static clear(): void {
        memoryCache.clear();
        if (typeof window !== 'undefined') {
            try {
                localStorage.clear();
            } catch (e) { }
        }
    }
}
