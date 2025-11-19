export interface IQuestion {
    question: string;
}

export class Question implements IQuestion {
    question: string;

    constructor(init?: Partial<Question>) {
        this.question = init?.question ?? "";
    }
}

export interface IAssignment {
    topic: string;
    name: string;
    author: string;
    date: string;
    curricularOutcomes: string[];
    questions: Question[];
}

export class Assignment implements IAssignment {
    topic: string;
    name: string;
    author: string;
    gradeLevel: string;
    date: string;
    curricularOutcomes: string[];
    questions: Question[];

    constructor(init?: Partial<Assignment>) {
        this.topic = init?.topic ?? "";
        this.name = init?.name ?? "";
        this.author = init?.author ?? "";
        this.gradeLevel = init?.gradeLevel ?? "";
        this.date = init?.date ?? "";
        this.curricularOutcomes = init?.curricularOutcomes ?? [];
        this.questions = init?.questions ?? [];
    }

    /** Serialize to JSON string */
    toJSON(): string {
        return JSON.stringify(this);
    }

    /** Convert to plain object */
    toObject(): IAssignment {
        return { ...this };
    }

    /** Create Lesson instance from JSON string */
    static fromJSON(json: string): IAssignment {
        const obj = JSON.parse(json);
        return new Assignment(obj);
    }
}
