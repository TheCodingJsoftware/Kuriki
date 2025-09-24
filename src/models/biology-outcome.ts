export interface RawScienceOutcome {
    outcome_id: string;
    grade: string;
    specific_learning_outcome: string;
    unit: Record<string, string>;
    general_learning_outcomes: Record<string, string>;
}

export class BiologyOutcome {
    outcome_id: string;
    grade: string;
    specific_learning_outcome: string;
    unit: { id: string; name: string }[];
    general_learning_outcomes: { id: string; description: string }[];

    constructor(raw: RawScienceOutcome) {
        this.outcome_id = raw.outcome_id;
        this.grade = raw.grade;
        this.specific_learning_outcome = raw.specific_learning_outcome;

        this.unit = Object.entries(raw.unit).map(([id, name]) => ({
            id,
            name,
        }));

        this.general_learning_outcomes = Object.entries(raw.general_learning_outcomes).map(
            ([id, description]) => ({
                id,
                description,
            })
        );
    }
}
