export class SkillType {
    constructor(
        public skillTypeId: string,
        public skillTypeName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.skillTypeId]: this.skillTypeName };
    }
}