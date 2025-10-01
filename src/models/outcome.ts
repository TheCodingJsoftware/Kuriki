import { BiologyOutcome } from "./biology-outcome";
import { MathematicsOutcome } from "./mathematics-outcome";
import { ScienceOutcome } from "./science-outcome";
import { SocialStudiesOutcome } from "./social-studies-outcome";
import { SocialStudiesSkill } from "./social-studies-skill";

export type OutcomeType = MathematicsOutcome | SocialStudiesOutcome | SocialStudiesSkill | BiologyOutcome | ScienceOutcome

export interface RawOutcome {
    outcome_id: string;
    grade: string;
    specific_learning_outcome: string;
}

export class Outcome<T extends {
    outcomeId: string;
    grade: string;
    specificLearningOutcome: string;
} = {
    outcomeId: string;
    grade: string;
    specificLearningOutcome: string;
}> {
    protected _data: T;

    constructor(data: RawOutcome) {
        this._data = {
            outcomeId: data.outcome_id,
            grade: data.grade,
            specificLearningOutcome: data.specific_learning_outcome
        } as T;
    }

    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get specificLearningOutcome() { return this._data.specificLearningOutcome; }
}