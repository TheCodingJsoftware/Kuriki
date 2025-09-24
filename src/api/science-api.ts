const API_ENDPOINT = "https://hbnitv.net/api/kuriki/science/1999-2000";

export class KurikiScienceAPI {
    static async getAllOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const result = await response.json();
        return Object.values(result.data);
    }

    static async getClusters(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/clusters`);
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
