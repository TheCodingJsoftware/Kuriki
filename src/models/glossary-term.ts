export class GlossaryTerm {
    constructor(
        public term: string,
        public definition: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.term]: this.definition };
    }
}