// utils/db.ts
import { openDB } from "idb";

const DB_NAME = "kuriki-cache";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        // Instead of hardcoding, we just create one store for everything.
        // We'll namespace keys as "subject:entity:key"
        if (!db.objectStoreNames.contains("cache")) {
            db.createObjectStore("cache");
        }
    },
});

/**
 * Generate a consistent cache key
 * Example: namespaceKey("social-studies", "outcomes", "all")
 * → "social-studies:outcomes:all"
 */
function namespaceKey(subject: string, entity: string, key: string = "all"): string {
    return `${subject}:${entity}:${key}`;
}

export async function getFromCache<T>(
    subject: string,
    entity: string,
    key: string = "all"
): Promise<T | undefined> {
    const db = await dbPromise;
    return db.get("cache", namespaceKey(subject, entity, key));
}

export async function saveToCache<T>(
    subject: string,
    entity: string,
    value: T,
    key: string = "all"
): Promise<IDBValidKey> {
    const db = await dbPromise;
    return db.put("cache", value, namespaceKey(subject, entity, key));
}
