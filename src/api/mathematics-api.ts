import { MathematicsOutcome } from "@models/mathematics-outcome";
import { Skill } from "@models/skill";
import { Strand } from "@models/strand";

const API_ENDPOINT = "https://hbnitv.net/api/kuriki/mathematics/2013-2014";


export class KurikiMathematicsAPI {
    static async getAllOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.values(result.data);
    }

    static async getStrands(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/strands`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getSkills(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/skills`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }
}
