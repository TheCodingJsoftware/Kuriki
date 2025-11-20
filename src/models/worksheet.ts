export enum WorksheetBlockType {
    Question = "question",

    SectionHeader = "section_header",
    Divider = "divider",
    BlankSpace = "blank_space",
    PageBreak = "page_break"
}

export interface IWorksheetBlock {
    id: string;
    type: WorksheetBlockType;
}

export interface IQuestionBlock extends IWorksheetBlock {
    type: WorksheetBlockType.Question;

    /** Question number (1,2,3...) */
    number: number;

    /** How many points this question is worth */
    points: number;

    /** Markdown for the actual question text */
    questionMarkdown: string;

    /** Optional markdown answer */
    answerMarkdown?: string;

    /** Whether to show/print the answer */
    showAnswer?: boolean;

    /** Optional teacher notes (also markdown) */
    notesMarkdown?: string;
}

export interface ISectionHeader extends IWorksheetBlock {
    type: WorksheetBlockType.SectionHeader;
    title: string;
}

export interface IDivider extends IWorksheetBlock {
    type: WorksheetBlockType.Divider;
}

export interface IBlankSpace extends IWorksheetBlock {
    type: WorksheetBlockType.BlankSpace;
    /**
     * Spacing amount (e.g., px, or a multiplier like 1–5)
     * Renderer can decide how to interpret this.
     */
    size: number;
}

export interface IPageBreak extends IWorksheetBlock {
    type: WorksheetBlockType.PageBreak;
}

export type WorksheetBlock =
    | IQuestionBlock
    | ISectionHeader
    | IDivider
    | IBlankSpace
    | IPageBreak;

export interface IWorksheet {
    topic: string;
    name: string;
    author: string;
    gradeLevel: string;
    date: string;
    curricularOutcomes: string[];
    blocks: WorksheetBlock[];
}

export class Worksheet implements IWorksheet {
    topic = "";
    name = "";
    author = "";
    gradeLevel = "";
    date = "";
    curricularOutcomes: string[] = [];
    blocks: WorksheetBlock[] = [];

    constructor(init?: Partial<Worksheet>) {
        Object.assign(this, init);
    }

    /** Convert class to JSON string */
    toJSON(): string {
        return JSON.stringify(this, null, 2);
    }

    /** Convert class to plain JS object */
    toObject(): IWorksheet {
        return { ...this };
    }

    /** Load from JSON string */
    static fromJSON(json: string): Worksheet {
        return new Worksheet(JSON.parse(json));
    }

    /** Sum of all question points */
    getTotalPoints(): number {
        return this.blocks
            .filter(b => b.type === WorksheetBlockType.Question)
            .reduce((sum, b) => {
                const q = b as IQuestionBlock;
                return sum + q.points;
            }, 0);
    }
}
