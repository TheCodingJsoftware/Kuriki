import { KurikiSocialStudiesAPI } from "@api/social-studies-api";
import { cachedFetch } from "@utils/cache-fetch";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesSkill } from "@models/social-studies-skill";
import { Cluster } from "@models/science-cluster";
import { OutcomeType } from "@models/outcome-type";
import { SkillType } from "@models/skill-type";
import { GlossaryTerm } from "@models/glossary-term";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";
import { DistinctiveLearningOutcome } from "@models/distinctive-learning-outcome";

export const SocialStudiesRepo = {
    async getOutcomes(): Promise<SocialStudiesOutcome[]> {
        return cachedFetch(
            "social_studies_2003",
            "outcomes",
            () => KurikiSocialStudiesAPI.getOutcomes(),
            "all",
            raw => new SocialStudiesOutcome(raw)
        );
    },

    async getSkills(): Promise<SocialStudiesSkill[]> {
        return cachedFetch(
            "social_studies_2003",
            "skills",
            () => KurikiSocialStudiesAPI.getSkills(),
            "all",
            raw => new SocialStudiesSkill(raw)
        );
    },

    async getClusters(): Promise<Cluster[]> {
        return cachedFetch(
            "social_studies_2003",
            "clusters",
            () => KurikiSocialStudiesAPI.getClusters(),
            "all",
            raw => new Cluster(raw.id, raw.name)
        );
    },

    async getSkillTypes(): Promise<SkillType[]> {
        return cachedFetch(
            "social_studies_2003",
            "skillTypes",
            () => KurikiSocialStudiesAPI.getSkillTypes(),
            "all",
            raw => new SkillType(raw.id, raw.name)
        );
    },

    async getOutcomeTypes(): Promise<OutcomeType[]> {
        return cachedFetch(
            "social_studies_2003",
            "outcomeTypes",
            () => KurikiSocialStudiesAPI.getOutcomeTypes(),
            "all",
            raw => new OutcomeType(raw.id, raw.name)
        );
    },

    async getGeneralLearningOutcomes(): Promise<GeneralLearningOutcome[]> {
        return cachedFetch(
            "social_studies_2003",
            "generalLearningOutcomes",
            () => KurikiSocialStudiesAPI.getGeneralLearningOutcomes(),
            "all",
            raw => new GeneralLearningOutcome(raw.id, raw.name)
        );
    },

    async getDistinctiveLearningOutcomes(): Promise<DistinctiveLearningOutcome[]> {
        return cachedFetch(
            "social_studies_2003",
            "distinctiveLearningOutcomes",
            () => KurikiSocialStudiesAPI.getDistinctiveLearningOutcomes(),
            "all",
            raw => new DistinctiveLearningOutcome(raw.id, raw.name)
        );
    },

    async getGlossary(): Promise<GlossaryTerm[]> {
        return cachedFetch(
            "social_studies_2003",
            "glossary",
            () => KurikiSocialStudiesAPI.getGlossary(),
            "all",
            raw => new GlossaryTerm(raw.term, raw.definition)
        );
    },
};
