const API_ENDPOINT = "https://hbnitv.net/api/kuriki/biology/2010-2011";

export class KurikiBiologyAPI {
    static async getAllOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.values(result.data);
    }

    static async getUnits(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/units`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getGeneralLearningOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/general_learning_outcomes`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, description]) => ({ id, description }));
    }
}
