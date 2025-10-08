export const clusterIconDictionary: { [key: string]: string } = {
    // --- Kindergarten ---
    "K.0": "psychology",                          // Overall Skills and Attitudes
    "K.1": "park",                                // Trees
    "K.2": "palette",                             // Colors
    "K.3": "description",                         // Paper

    // --- Grade 1 ---
    "1.0": "psychology",                          // Overall Skills and Attitudes
    "1.1": "nature",                              // Characteristics and Needs of Living Things
    "1.2": "hearing",                             // The Senses
    "1.3": "category",                            // Characteristics of Objects and Materials
    "1.4": "wb_sunny",                            // Daily and Seasonal Changes

    // --- Grade 2 ---
    "2.0": "psychology",                          // Overall Skills and Attitudes
    "2.1": "pets",                                // Growth and Changes in Animals
    "2.2": "science",                             // Properties of Solids, Liquids & Gases
    "2.3": "directions_run",                      // Position and Motion
    "2.4": "water_drop",                          // Air & Water in the Environment

    // --- Grade 3 ---
    "3.0": "psychology",                          // Overall Skills and Attitudes
    "3.1": "local_florist",                       // Growth and Changes in Plants
    "3.2": "foundation",                          // Materials and Structures
    "3.3": "magnet_on",                           // Forces That Attract or Repel
    "3.4": "compost",                             // Soils in the Environment

    // --- Grade 4 ---
    "4.0": "psychology",                          // Overall Skills and Attitudes
    "4.1": "eco",                                 // Habitats and Communities
    "4.2": "emoji_objects",                       // Light
    "4.3": "graphic_eq",                          // Sound
    "4.4": "terrain",                             // Rocks, Minerals and Erosion

    // --- Grade 5 ---
    "5.0": "psychology",                          // Overall Skills and Attitudes
    "5.1": "favorite",                            // Maintaining a Healthy Body
    "5.2": "science",                             // Properties of and Changes in Substances
    "5.3": "construction",                        // Forces and Simple Machines
    "5.4": "cloud",                               // Weather

    // --- Grade 6 ---
    "6.0": "psychology",                          // Overall Skills and Attitudes
    "6.1": "nature",                              // Diversity of Living Things
    "6.2": "flight_takeoff",                      // Flight
    "6.3": "bolt",                                // Electricity
    "6.4": "public",                              // The Solar System

    // --- Grade 7 ---
    "7.0": "psychology",                          // Overall Skills and Attitudes
    "7.1": "eco",                                 // Interactions Within Ecosystems
    "7.2": "scatter_plot",                        // Particle Theory of Matter
    "7.3": "foundation",                          // Forces and Structures
    "7.4": "terrain",                             // Earth's Crust

    // --- Grade 8 ---
    "8.0": "psychology",                          // Overall Skills and Attitudes
    "8.1": "biotech",                             // Cells and Systems
    "8.2": "visibility",                          // Optics
    "8.3": "waves",                               // Fluids
    "8.4": "water",                               // Water Systems

    // --- Senior 1 (Grade 9) ---
    "S1.0": "psychology",                         // Overall Skills and Attitudes
    "S1.1": "pregnant_woman",                     // Reproduction
    "S1.2": "category",                           // Atoms and Elements
    "S1.3": "bolt",                               // Nature of Electricity
    "S1.4": "explore",                            // Exploration of the Universe

    // --- Senior 2 (Grade 10) ---
    "S2.0": "psychology",                         // Overall Skills and Attitudes
    "S2.1": "forest",                             // Dynamics of Ecosystems
    "S2.2": "science",                            // Chemistry in Action
    "S2.3": "directions_car",                     // In Motion
    "S2.4": "waves",                              // Water Dynamics
};

export class Cluster {
    constructor(
        public id: string,
        public name: string
    ) { }

    getIcon(): string {
        return clusterIconDictionary[this.id] ?? "science";
    }

    toDict(): Record<string, string> {
        return { [this.id]: this.name };
    }
}