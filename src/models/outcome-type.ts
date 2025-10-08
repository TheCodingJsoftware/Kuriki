export const outcomeTypeIconDictionary: { [key: string]: string } = {
    "S": "psychology",           // Skills
    "K": "lightbulb",            // Knowledge
    "V": "favorite"              // Values
};

export class OutcomeType {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return outcomeTypeIconDictionary[this.id] ?? "globe";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}