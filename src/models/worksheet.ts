export enum WorksheetBlockType {
    Question = "question",
    SectionHeader = "header",
    Divider = "divider",
    BlankSpace = "space",
    PageBreak = "break"
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
    questionSpaceSize?: number;

    // -------------------------
    // HEADER FIELDS
    // -------------------------
    headerType?: string;
    title?: string;

    // -------------------------
    // BLANK SPACE
    // -------------------------
    size?: number;

    // -------------------------
    // nothing needed for divider / page break
    // but we could later store custom styles if wanted
    // -------------------------

    hidden?: boolean;
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
    font: string;
    fontSize: number;
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
    font: string = "latin";     // "system" | "latin" | "arial" | "verdana" | "lexend" | "opendyslexic"
    fontSize: number = 12;

    constructor(init?: Partial<Worksheet>) {
        Object.assign(this, init);
    }

    load(data: IWorksheet) {
        Object.assign(this, data);
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
