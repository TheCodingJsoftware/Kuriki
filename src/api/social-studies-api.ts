import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesSkill } from "@models/social-studies-skill";
import { Cluster } from "@models/cluster";
import { OutcomeType } from "@models/outcome-type";
import { SkillType } from "@models/skill-type";
import { GlossaryTerm } from "@models/glossary-term";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";
import { DistinctiveLearningOutcome } from "@models/distinctive-learning-outcome";

const API_ENDPOINT = "https://hbnitv.net/api/kuriki/social_studies/2003";

export class KurikiSocialStudiesAPI {
    static async getOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);
        if (!response.ok) throw new Error(`Failed to fetch outcomes: ${response.statusText}`);
        const result = await response.json();
        return Object.values(result.data); // raw objects
    }

    static async getOutcome(id: string): Promise<any | undefined> {
        const response = await fetch(`${API_ENDPOINT}/outcomes?id=${encodeURIComponent(id)}`);
        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch outcome: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data; // raw single object
    }

    static async getSkills(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/skills`);
        if (!response.ok) throw new Error(`Failed to fetch skills: ${response.statusText}`);
        const result = await response.json();
        return Object.values(result.data); // raw
    }

    static async getClusters(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/clusters`);
        if (!response.ok) throw new Error(`Failed to fetch clusters: ${response.statusText}`);
        const result = await response.json();

        return Object.entries(result.data).map(([clusterCode, clusterObj]: [string, any]) => {
            const [id, name] = Object.entries(clusterObj)[0] as [string, string];
            return { id, name }; // raw form
        });
    }

    static async getSkillTypes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/skill_types`);
        if (!response.ok) throw new Error(`Failed to fetch skill types: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getOutcomeTypes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/outcome_types`);
        if (!response.ok) throw new Error(`Failed to fetch outcome types: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getDistinctiveLearningOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/distinctive_learning_outcomes`);
        if (!response.ok) throw new Error(`Failed to fetch distinctive learning outcomes: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getGeneralLearningOutcomes(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/general_learning_outcomes`);
        if (!response.ok) throw new Error(`Failed to fetch general learning outcomes: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([id, name]) => ({ id, name }));
    }

    static async getGlossary(): Promise<any[]> {
        const response = await fetch(`${API_ENDPOINT}/glossary`);
        if (!response.ok) throw new Error(`Failed to fetch glossary: ${response.statusText}`);
        const result = await response.json();
        return Object.entries(result.data).map(([term, definition]) => ({ term, definition }));
    }
}
