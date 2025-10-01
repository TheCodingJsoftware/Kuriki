import { Unit } from "./unit";
import { GeneralLearningOutcome } from "./general-learning-outcome";

export interface RawBiologyOutcome {
    outcome_id: string;
    grade: string;
    specific_learning_outcome: string;
    unit: Record<string, string>;
    general_learning_outcomes: Record<string, string>;
}

export class BiologyOutcome {
    private _data: {
        outcomeId: string;
        grade: string;
        specificLearningOutcome: string;
        unit: Unit;
        generalLearningOutcomes: GeneralLearningOutcome[];
    }

    constructor(data: RawBiologyOutcome) {
        const [unitId, unitName] = Object.entries(data.unit ?? {})[0] ?? ['', ''];

        this._data = {
            outcomeId: data.outcome_id,
            grade: data.grade,
            specificLearningOutcome: data.specific_learning_outcome,
            unit: new Unit(unitId, unitName),
            generalLearningOutcomes: Object.entries(data.general_learning_outcomes).map(([id, description]) => new GeneralLearningOutcome(id, description))
        }
    }
    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get specificLearningOutcome() { return this._data.specificLearningOutcome; }
    get unit() { return this._data.unit; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }
}
