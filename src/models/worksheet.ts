export enum WorksheetBlockType {
    Question = "question",
    SectionHeader = "section_header",
    Divider = "divider",
    BlankSpace = "blank_space",
    PageBreak = "page_break"
}

/**
 * Unified block type that stores ALL possible fields.
 * The active UI is determined by `currentType`.
 */
export interface IWorksheetBlock {
    id: string;

    /** Which block type is active (controls UI + preview) */
    currentType: WorksheetBlockType;

    // -------------------------
    // QUESTION FIELDS
    // -------------------------
    points?: number;                    // default 5
    questionMarkdown?: string;
    answerMarkdown?: string;
    showAnswer?: boolean;
    notesMarkdown?: string;

    // -------------------------
    // HEADER FIELDS
    // -------------------------
    title?: string;
    headerType?: string;

    // -------------------------
    // BLANK SPACE
    // -------------------------
    size?: number;

    // -------------------------
    // nothing needed for divider / page break
    // but we could later store custom styles if wanted
    // -------------------------
}

/** List of blocks inside the worksheet */
export type WorksheetBlock = IWorksheetBlock;

export interface IWorksheet {
    topic: string;
    name: string;
    author: string;
    gradeLevel: string;
    date: string;
    teacherNotes: string;
    curricularOutcomes: string[];
    blocks: WorksheetBlock[];
}

export class Worksheet implements IWorksheet {
    topic = "";
    name = "";
    author = "";
    gradeLevel = "";
    date = "";
    teacherNotes = "";
    curricularOutcomes: string[] = [];
    blocks: WorksheetBlock[] = [];

    constructor(init?: Partial<Worksheet>) {
        Object.assign(this, init);
    }

    toJSON(): string {
        return JSON.stringify(this, null, 2);
    }

    toObject(): IWorksheet {
        return { ...this };
    }

    static fromJSON(json: string): Worksheet {
        return new Worksheet(JSON.parse(json));
    }

    /** Sum of all question points */
    getTotalPoints(): number {
        return this.blocks
            .filter(b => b.currentType === WorksheetBlockType.Question)
            .reduce((sum, b) => sum + (b.points ?? 0), 0);
    }
}
