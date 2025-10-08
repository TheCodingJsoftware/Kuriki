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
            ...this._data,
            unit: new Unit(`${this.grade}.${unitId}`, unitName),
            generalLearningOutcomes: Object.entries(data.general_learning_outcomes).map(([id, description]) => new GeneralLearningOutcome(id, description))
        }
    }

    get unit() { return this._data.unit; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }

    public toString(): string {
        return `${this.outcomeId} ${this.specificLearningOutcome} [${this.generalLearningOutcomes.map(glo => glo.id).join(", ")}]`
    }
}
