import { getFromCache, saveToCache } from "./db";

export async function cachedFetch<T, R = any>(
    subject: string,
    entity: string,
    fetcher: () => Promise<R>,     // fetch raw API response
    key: string = "all",
    reviver?: (raw: any) => T      // map raw → model
): Promise<T[]> {
    const cached = await getFromCache<R>(subject, entity, key);
    const data = cached ?? await fetcher();

    if (!cached) {
        await saveToCache(subject, entity, data, key);
    }

    return reviver
        ? (Array.isArray(data) ? data.map(reviver) : [reviver(data)])
        : (Array.isArray(data) ? data : [data]) as T[];
}
