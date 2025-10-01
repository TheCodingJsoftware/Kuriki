import { KurikiMathematicsAPI } from "@api/mathematics-api";
import { cachedFetch } from "@utils/cache-fetch";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { Strand } from "@models/strand";
import { Skill } from "@models/skill";

export const MathematicsRepo = {
    async getOutcomes(): Promise<MathematicsOutcome[]> {
        return cachedFetch<MathematicsOutcome>(
            "mathematics_2013-2014",
            "outcomes",
            () => KurikiMathematicsAPI.getAllOutcomes(),
            "all",
            raw => new MathematicsOutcome(raw)
        );
    },

    async getStrands(): Promise<Strand[]> {
        return cachedFetch<Strand>(
            "mathematics_2013-2014",
            "strands",
            () => KurikiMathematicsAPI.getStrands(),
            "all",
            raw => new Strand(raw.id, raw.name)
        );
    },

    async getSkills(): Promise<Skill[]> {
        return cachedFetch<Skill>(
            "mathematics_2013-2014",
            "skills",
            () => KurikiMathematicsAPI.getSkills(),
            "all",
            raw => new Skill(raw.id, raw.name)
        );
    },
};
