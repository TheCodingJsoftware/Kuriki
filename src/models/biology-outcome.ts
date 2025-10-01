import { Unit } from "@models/unit";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";
import { Outcome, RawOutcome } from '@models/outcome';

export interface RawBiologyOutcome extends RawOutcome {
    unit: Record<string, string>;
    general_learning_outcomes: Record<string, string>;
}

export class BiologyOutcome extends Outcome<{
    outcomeId: string;
    grade: string;
    specificLearningOutcome: string;
    unit: Unit;
    generalLearningOutcomes: GeneralLearningOutcome[];
}> {
    constructor(data: RawBiologyOutcome) {
        super(data)

        const [unitId, unitName] = Object.entries(data.unit ?? {})[0] ?? ['', ''];

        this._data = {
            outcomeId: data.outcome_id,
            grade: data.grade,
            specificLearningOutcome: data.specific_learning_outcome,
            unit: new Unit(unitId, unitName),
            generalLearningOutcomes: Object.entries(data.general_learning_outcomes).map(([id, description]) => new GeneralLearningOutcome(id, description))
        }
    }

    get unit() { return this._data.unit; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }
}
