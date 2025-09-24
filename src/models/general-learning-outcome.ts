export class GeneralLearningOutcome {
    constructor(
        public gloId: string,
        public gloName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.gloId]: this.gloName };
    }
}