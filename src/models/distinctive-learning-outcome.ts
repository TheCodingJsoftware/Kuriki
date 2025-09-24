export class DistinctiveLearningOutcome {
    constructor(
        public dloId: string,
        public dloName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.dloId]: this.dloName };
    }
}