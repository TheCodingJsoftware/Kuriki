import { KurikiMathematicsAPI } from "@api/kuriki-mathematics-api";
import type { MathematicsOutcome } from "@models/mathematics-outcome";
import type { Strand } from "@models/strand";
import type { Skill } from "@models/skill";

export const MathematicsRepo = {
    async getAllOutcomes(): Promise<MathematicsOutcome[]> {
        return await KurikiMathematicsAPI.getAllOutcomes();
    },
    async getStrands(): Promise<Strand[]> {
        return await KurikiMathematicsAPI.getStrands();
    },
    async getSkills(): Promise<Skill[]> {
        return await KurikiMathematicsAPI.getSkills();
    },
};
