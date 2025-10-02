import { KurikiBiologyAPI } from '@api/biology-api';
import { cachedFetch } from "@utils/cache-fetch";
import { BiologyOutcome } from "@models/biology-outcome";
import { Unit } from "@models/unit";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";

export const BiologyRepo = {
    async getOutcomes(): Promise<BiologyOutcome[]> {
        return cachedFetch<BiologyOutcome>(
            "biology_2010-2011",
            "outcomes",
            () => KurikiBiologyAPI.getAllOutcomes(),
            "all",
            raw => new BiologyOutcome(raw)
        );
    },

    async getUnits(): Promise<Unit[]> {
        return cachedFetch<Unit>(
            "biology_2010-2011",
            "units",
            () => KurikiBiologyAPI.getUnits(),
            "all",
            raw => new Unit(raw.id, raw.name)
        );
    },

    async getGeneralLearningOutcomes(): Promise<GeneralLearningOutcome[]> {
        return cachedFetch<GeneralLearningOutcome>(
            "biology_2010-2011",
            "general_learning_outcomes",
            () => KurikiBiologyAPI.getGeneralLearningOutcomes(),
            "all",
            raw => new GeneralLearningOutcome(raw.id, raw.description)
        );
    },
};
