export const generalLearningOutcomeIconDictionary: { [key: string]: string } = {
    "C": "how_to_vote",          // Citizenship
    "I": "groups",               // Identity, Culture, and Community
    "L": "public",               // The Land: Places and People
    "H": "history_edu",          // Historical Connections
    "G": "public_off",           // Global Interdependence
    "P": "gavel",                // Power and Authority
    "E": "savings"               // Economics and Resources
};

export class GeneralLearningOutcome {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return generalLearningOutcomeIconDictionary[this.id] ?? "globe";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}