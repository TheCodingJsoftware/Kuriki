import { BiologyOutcome } from "@models/biology-outcome";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { ScienceOutcome } from "@models/science-outcome";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesSkill } from "@models/social-studies-skill";

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

    public toString(): string {
        return `${this.outcomeId} ${this.specificLearningOutcome}`
    }
}