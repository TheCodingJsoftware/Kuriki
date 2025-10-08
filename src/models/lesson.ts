import type { AssessmentRow } from "@models/assessment-row";

export interface ILesson {
    topic: string;
    name: string;
    author: string;
    gradeLevel: string;
    date: string;
    timeLength: string;      // e.g., "~ 45 minutes"
    curricularOutcomes: string[];
    resourceLinks: string[];
    assessmentEvidence: AssessmentRow[];
    notes: string;           // Markdown from ToastEditorField
}

export class Lesson implements ILesson {
    topic: string;
    name: string;
    author: string;
    gradeLevel: string;
    date: string;
    timeLength: string;      // e.g., "~ 45 minutes"
    curricularOutcomes: string[];
    resourceLinks: string[];
    assessmentEvidence: AssessmentRow[];
    notes: string;           // Markdown from ToastEditorField

    constructor(init?: Partial<Lesson>) {
        this.topic = init?.topic ?? "";
        this.name = init?.name ?? "";
        this.author = init?.author ?? "";
        this.gradeLevel = init?.gradeLevel ?? "";
        this.date = init?.date ?? "";
        this.timeLength = init?.timeLength ?? "";
        this.curricularOutcomes = init?.curricularOutcomes ?? [];
        this.resourceLinks = init?.resourceLinks ?? [];
        this.assessmentEvidence = init?.assessmentEvidence ?? [];
        this.notes = init?.notes ?? "";
    }

    /** Serialize to JSON string */
    toJSON(): string {
        return JSON.stringify(this);
    }

    /** Convert to plain object */
    toObject(): ILesson {
        return { ...this };
    }

    /** Create Lesson instance from JSON string */
    static fromJSON(json: string): ILesson {
        const obj = JSON.parse(json);
        return new Lesson(obj);
    }
}
