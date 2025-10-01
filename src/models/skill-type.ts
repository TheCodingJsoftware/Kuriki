export class SkillType {
    constructor(
        public id: string,
        public name: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}