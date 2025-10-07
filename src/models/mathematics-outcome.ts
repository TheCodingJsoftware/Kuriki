import { Strand } from '@models/strand';
import { Skills } from '@models/skills';
import { Skill } from '@models/skill';
import { Outcome, RawOutcome } from '@models/outcome';

export interface RawMathematicsOutcome extends RawOutcome {
    general_learning_outcomes: string[];
    strand: Record<string, string>;
    skills: Record<string, string>;
}

export class MathematicsOutcome extends Outcome<{
    outcomeId: string;
    grade: string;
    specificLearningOutcome: string;
    generalLearningOutcomes: string[];
    strand: Strand;
    skills: Skills;
}> {
    constructor(data: RawMathematicsOutcome) {
        super(data);

        const strandKey = Object.keys(data.strand)[0] as string;
        const strandValue = data.strand[strandKey] as string;
        const strand = new Strand(strandKey, strandValue);

        const skills = new Skills();
        for (const [id, name] of Object.entries(data.skills ?? {})) {
            skills.add(new Skill(id, name));
        }

        this._data = {
            ...this._data,
            generalLearningOutcomes: data.general_learning_outcomes ?? [],
            strand,
            skills
        };
    }

    get strand() { return this._data.strand; }
    get skills() { return this._data.skills; }
    get generalLearningOutcomes() { return this._data.generalLearningOutcomes; }

    public toString(): string {
        return `${this.outcomeId} ${this.specificLearningOutcome} [${this.skills.toArray().map(s => s.id).join(", ")}]`
    }
}