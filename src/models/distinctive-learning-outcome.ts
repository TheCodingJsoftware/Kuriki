export const distinctiveLearningOutcomeIconDictionary: { [key: string]: string } = {
    "A": "diversity_1",          // Aboriginal
    "F": "translate"             // Francophone
};

export class DistinctiveLearningOutcome {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return distinctiveLearningOutcomeIconDictionary[this.id] ?? "globe";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}