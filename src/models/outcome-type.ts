export class OutcomeType {
    constructor(
        public outcomeTypeId: string,
        public outcomeTypeName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.outcomeTypeId]: this.outcomeTypeName };
    }
}