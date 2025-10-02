import { KurikiScienceAPI } from "@api/science-api";
import { cachedFetch } from "@utils/cache-fetch";
import { ScienceOutcome } from "@models/science-outcome";
import { Cluster } from "@models/cluster";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";

export const ScienceRepo = {
    async getOutcomes(): Promise<ScienceOutcome[]> {
        return cachedFetch<ScienceOutcome>(
            "science_1999-2000",
            "outcomes",
            () => KurikiScienceAPI.getAllOutcomes(),
            "all",
            raw => new ScienceOutcome(raw)
        );
    },

    async getClusters(): Promise<Cluster[]> {
        return cachedFetch<Cluster>(
            "science_1999-2000",
            "clusters",
            () => KurikiScienceAPI.getClusters(),
            "all",
            raw => new Cluster(raw.id, raw.name)
        );
    },

    async getGeneralLearningOutcomes(): Promise<GeneralLearningOutcome[]> {
        return cachedFetch<GeneralLearningOutcome>(
            "science_1999-2000",
            "general_learning_outcomes",
            () => KurikiScienceAPI.getGeneralLearningOutcomes(),
            "all",
            raw => new GeneralLearningOutcome(raw.id, raw.description)
        );
    },
};
