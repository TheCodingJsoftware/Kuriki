export const unitIconDictionary: { [key: string]: string } = {
    // --- Grade 11 Units ---
    "11.1": "eco",                  // Diversity of Living Things
    "11.2": "science",              // Evolution
    "11.3": "biotech",              // Genetics
    "11.4": "biotech",              // Biodiversity (placeholder)
    "11.5": "bloodtype",            // Human Systems
    "11.6": "psychology",           // Homeostasis (placeholder)

    // --- Grade 12 Units ---
    "12.1": "science",              // Molecular Biology
    "12.2": "device_thermostat",    // Cell Energy & Metabolism
    "12.3": "psychology",           // Human Physiology
    "12.4": "biotech",              // Biotechnology
    "12.5": "public",               // Ecology
};

export class Unit {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return unitIconDictionary[this.id] ?? "science";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}