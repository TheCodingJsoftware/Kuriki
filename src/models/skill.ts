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
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return skillsIconDictionary[this.id] as string;
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}
