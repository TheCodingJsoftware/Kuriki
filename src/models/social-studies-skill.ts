import { SkillType } from '@models/skill-type';

export class SocialStudiesSkill {
    private _data: {
        outcomeId: string;
        grade: string;
        skillType: SkillType;
        specificLearningOutcome: string;
    };

    constructor(data: {
        outcome_id: string;
        grade: string;
        skill_type: Record<string, string>;
        specific_learning_outcome: string;
    }) {
        const [id, name] = Object.entries(data.skill_type ?? {})[0] ?? ['', ''];
        const skillType = new SkillType(id, name);

        this._data = {
            outcomeId: data.outcome_id ?? '',
            grade: data.grade ?? '',
            skillType,
            specificLearningOutcome: data.specific_learning_outcome ?? ''
        };
    }

    get outcomeId() { return this._data.outcomeId; }
    get grade() { return this._data.grade; }
    get skillType() { return this._data.skillType; }
    get specificLearningOutcome() { return this._data.specificLearningOutcome; }
}