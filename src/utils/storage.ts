export const Storage = {
    get<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === undefined) return fallback;
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    },

    set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // no-op; quota or private mode
        }
    },

    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch {
            // no-op
        }
    },
};
