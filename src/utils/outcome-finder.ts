import { SocialStudiesRepo } from "@api/social-studies-repo";
import { MathematicsRepo } from "@api/mathematics-repo";
import { BiologyRepo } from "@api/biology-repo";
import { ScienceRepo } from "@api/science-repo";

import { Outcome } from "@models/outcome";

/**
 * A static utility that can search all curriculum repositories
 * and find any Outcome by its ID.
 */
export class OutcomeFinder {
    private static _cache: Map<string, Outcome> = new Map();
    private static _loaded = false;

    /**
     * Loads all outcomes once from every repo and caches them.
     */
    private static async loadAll() {
        if (this._loaded) return;

        const [ss, math, bio, sci] = await Promise.all([
            SocialStudiesRepo.getOutcomes(),
            MathematicsRepo.getOutcomes(),
            BiologyRepo.getOutcomes(),
            ScienceRepo.getOutcomes(),
        ]);

        for (const o of [...ss, ...math, ...bio, ...sci]) {
            this._cache.set(o.outcomeId, o);
        }

        this._loaded = true;
    }

    /**
     * Gets an Outcome by its outcomeId (e.g., "S3-4-01").
     * @returns Promise<Outcome | null>
     */
    static async getById(outcomeId: string): Promise<Outcome | null> {
        // Load everything if not yet loaded
        await this.loadAll();

        // Direct cache lookup
        return this._cache.get(outcomeId) ?? null;
    }

    /**
     * Clears the cache if needed (e.g., when repos are refreshed)
     */
    static clearCache() {
        this._cache.clear();
        this._loaded = false;
    }
}
