export class Unit {
    constructor(
        public unitId: string,
        public unitName: string
    ) { }

    toDict(): Record<string, string> {
        return { [this.unitId]: this.unitName };
    }
}