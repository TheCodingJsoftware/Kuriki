import { MathematicsOutcome } from "@models/mathematics-outcome";
import { mathematicsQuickSearchKeyWords, socialStudiesQuickSearchKeyWords, scienceQuickSearchKeywords } from "./quick-search-words";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { ScienceOutcome } from "@models/science-outcome";

export function highlightKeywords(text: string, keywords: string[]): string {
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!escaped.length) return text;
    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
    return text.replace(regex, m => `<b>${m}</b>`);
}

export function getMathematicsKeywords(outcome: MathematicsOutcome) {
    const keywords = new Set<string>();
    mathematicsQuickSearchKeyWords.forEach(k => {
        const low = k.toLowerCase();
        if (outcome.specificLearningOutcome.toLowerCase().includes(low)) keywords.add(k);
        outcome.generalLearningOutcomes.forEach(g => {
            if (g.toLowerCase().includes(low)) keywords.add(k);
        });
    });
    return keywords.size > 0 ? `: ${Array.from(keywords).join(", ")}` : "";
}

export function getScienceKeywords(outcome: ScienceOutcome) {
    const keywords = new Set<string>();
    scienceQuickSearchKeywords.forEach(k => {
        const low = k.toLowerCase();
        if (outcome.specificLearningOutcome.toLowerCase().includes(low)) keywords.add(k);
    });
    return keywords.size > 0 ? `: ${Array.from(keywords).join(", ")}` : "";
}

export function getSocialStudiesKeywords(outcome: SocialStudiesOutcome) {
    const keywords = new Set<string>();
    socialStudiesQuickSearchKeyWords.forEach(k => {
        const low = k.toLowerCase();
        if (outcome.specificLearningOutcome.toLowerCase().includes(low)) keywords.add(k);
    });
    return keywords.size > 0 ? `: ${Array.from(keywords).join(", ")}` : "";
}
