export const skillTypeIconDictionary: { [key: string]: string } = {
    "ADC": "groups_3",           // Active Democratic Citizenship
    "MI": "manage_search",       // Manage Information and Ideas
    "CT": "psychology_alt",      // Creative and Critical Thinking
    "C": "chat"                  // Communication
};


export class SkillType {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return skillTypeIconDictionary[this.id] ?? "globe";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}