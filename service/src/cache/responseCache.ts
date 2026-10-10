type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 300000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { data, expiresAt });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const globalCache = new ResponseCache(300000);
