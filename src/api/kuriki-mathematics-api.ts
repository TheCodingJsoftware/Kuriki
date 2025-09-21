import { MathematicsOutcome } from "@models/mathematics-outcome";
import { Skill } from "@models/skill";
import { Strand } from "@models/strand";

const API_ENDPOINT = "https://hbnitv.net/api/kuriki/mathematics/2013-2014";


export class KurikiMathematicsAPI {
    static async getOutcome(id: string): Promise<MathematicsOutcome | undefined> {
        const response = await fetch(`${API_ENDPOINT}/outcomes?id=${encodeURIComponent(id)}`);

        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return new MathematicsOutcome(result.data);
    }

    static async getAllOutcomes(): Promise<MathematicsOutcome[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return Object.values(result.data).map((item: any) => new MathematicsOutcome(item));
    }

    static async getStrands(): Promise<Strand[]> {
        const response = await fetch(`${API_ENDPOINT}/strands`);

        if (!response.ok) {
            throw new Error(`Failed to fetch strands: ${response.statusText}`);
        }

        const result = await response.json();
        // result.data = { "N": "Number Sense", "PR": "Patterns and Relations", ... }
        return Object.entries(result.data).map(
            ([id, name]) => new Strand(id, name as string)
        );
    }

    static async getSkills(): Promise<Skill[]> {
        const response = await fetch(`${API_ENDPOINT}/skills`);

        if (!response.ok) {
            throw new Error(`Failed to fetch skills: ${response.statusText}`);
        }

        const result = await response.json();
        return Object.entries(result.data).map(
            ([id, name]) => new Skill(id, name as string)
        );
    }
}
