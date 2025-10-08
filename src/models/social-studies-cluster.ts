export const clusterIconDictionary: { [key: string]: string } = {
    // --- Kindergarten (K) ---
    "0.1": "person",             // Me
    "0.2": "diversity_3",        // The People Around Me
    "0.3": "public",             // The World Around Me

    // --- Grade 1 ---
    "1.1": "person",             // I Belong
    "1.2": "eco",                // My Environment
    "1.3": "groups",             // Connecting with Others

    // --- Grade 2 ---
    "2.1": "home_work",          // Our Local Community
    "2.2": "flag_circle",        // Communities in Canada
    "2.3": "public",             // The Canadian Community

    // --- Grade 3 ---
    "3.1": "flag",               // Connecting with Canadians
    "3.2": "explore",            // Exploring the World
    "3.3": "public",             // Communities of the World
    "3.4": "temple_buddhist",    // Exploring an Ancient Society

    // --- Grade 4 ---
    "4.1": "terrain",            // Geography of Canada
    "4.2": "park",               // Living in Canada
    "4.3": "signpost",           // Living in Manitoba
    "4.4": "history_edu",        // History of Manitoba
    "4.5": "landscape",          // Canada’s North

    // --- Grade 5 ---
    "5.1": "groups",             // First Peoples
    "5.2": "sailing",            // Early European Colonization (1600–1763)
    "5.3": "shopping_bag",       // Fur Trade
    "5.4": "flag",               // From British Colony to Confederation

    // --- Grade 6 ---
    "6.1": "account_balance",    // Building a Nation (1867–1914)
    "6.2": "military_tech",      // An Emerging Nation (1914–1945)
    "6.3": "diversity_2",        // Shaping Contemporary Canada (1945–Present)
    "6.4": "emoji_flags",        // Canada Today: Democracy & Diversity

    // --- Grade 7 ---
    "7.1": "public",             // World Geography
    "7.2": "handshake",          // Global Quality of Life
    "7.3": "diversity_3",        // Ways of Life in Asia, Africa, or Australasia
    "7.4": "eco",                // Human Impact in Europe or the Americas

    // --- Grade 8 ---
    "8.1": "groups",             // Understanding Societies Past and Present
    "8.2": "temple_hindu",       // Early Societies of Mesopotamia, Egypt, or Indus Valley
    "8.3": "temple_buddhist",    // Ancient Societies of Greece and Rome
    "8.4": "history_edu",        // Transition to Modern World (500–1400)
    "8.5": "lightbulb",          // Shaping the Modern World (1400–1850)
};


export class Cluster {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return clusterIconDictionary[this.id] ?? "globe";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}