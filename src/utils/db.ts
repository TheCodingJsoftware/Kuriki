// utils/db.ts
import { openDB, IDBPDatabase, DBSchema } from "idb";

const DB_NAME = "kuriki-cache";
const DB_VERSION = 1;

// Schema definition
interface KurikiCacheDB extends DBSchema {
    cache: {
        key: string;   // cache key
        value: unknown; // value stored (use more specific type if you want)
    };
}

// Create/open DB with schema
export const dbPromise = openDB<KurikiCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db: IDBPDatabase<KurikiCacheDB>) {
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
    return db.get("cache", namespaceKey(subject, entity, key)) as Promise<T | undefined>;
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
