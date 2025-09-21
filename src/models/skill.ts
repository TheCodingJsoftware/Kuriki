export const skillsIconDictionary: { [key: string]: string } = {
    'C': 'chat',
    'CN': 'link',
    'ME': 'calculate',
    'PS': 'lightbulb',
    'R': 'psychology',
    'T': 'devices',
    'V': 'visibility',
};

export class Skill {
    constructor(
        public skillId: string,
        public skillName: string
    ) { }

    getIcon(): string {
        return skillsIconDictionary[this.skillId] as string;
    }

    toDict(): Record<string, string> {
        return { [this.skillId]: this.skillName };
    }
}
