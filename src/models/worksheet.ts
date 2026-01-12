import { OutcomeFinder } from "@utils/outcome-finder";

export enum WorksheetBlockType {
    Question = "question",
    Paragraph = "paragraph",
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
    showSolution?: boolean;
    questionSpaceSize?: number;
    paragraphMarkdown?: string;

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

    /**
     * Returns a full worksheet export as Markdown.
     * (LaTeX is preserved as-is inside markdown strings.)
     */
    async copyAsMarkdown(): Promise<string> {
        const lines: string[] = [];

        const pushIf = (label: string, value: string | undefined) => {
            const v = (value ?? "").trim();
            if (v) lines.push(`- **${label}:** ${v}`);
        };

        const ensureBlankLine = () => {
            if (lines.length === 0) return;
            if (lines[lines.length - 1]?.trim() !== "") lines.push("");
        };

        const md = (s?: string) => (s ?? "").trim();
        const escapeForHeading = (s?: string) => (s ?? "").trim();

        // ---------- Header / Metadata ----------
        const title = escapeForHeading(this.name) || "Worksheet";
        lines.push(`# ${title}`);
        ensureBlankLine();

        // Metadata list
        pushIf("Topic", this.topic);
        pushIf("Grade", this.gradeLevel);
        pushIf("Author", this.author);
        pushIf("Date", this.date);

        const totalPoints = this.getTotalPoints();
        if (totalPoints > 0) lines.push(`- **Total Points:** ${totalPoints}`);

        ensureBlankLine();

        // Outcomes
        if ((this.curricularOutcomes?.length ?? 0) > 0) {
            lines.push(`## Curricular Outcomes`);
            ensureBlankLine();
            for (const outcomeId of this.curricularOutcomes) {
                const outcome = await OutcomeFinder.getById(outcomeId);
                if (outcome) lines.push(outcome.toString());
            }
            ensureBlankLine();
        }

        // Teacher notes
        if (md(this.teacherNotes)) {
            lines.push(`## Teacher Notes`);
            ensureBlankLine();
            lines.push(md(this.teacherNotes));
            ensureBlankLine();
        }

        // ---------- Blocks ----------
        if ((this.blocks?.length ?? 0) > 0) {
            lines.push(`---`);
            ensureBlankLine();

            for (const block of this.blocks) {
                const b = this.blockToMarkdown(block);

                if (b) {
                    lines.push(b.trimEnd());
                    ensureBlankLine();
                }
            }
        }

        // Trim trailing blank lines
        // while (lines.length > 1 && lines[lines.length - 1].trim() === "") {
        //     lines.pop();
        // }

        return lines.join("\n");
    }

    private blockToMarkdown(
        block: WorksheetBlock
    ): string {

        const md = (s?: string) => (s ?? "").trim();
        const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

        switch (block.currentType) {
            case WorksheetBlockType.SectionHeader: {
                const headerText = md(block.title) || "";
                if (!headerText) return "";

                // headerType could be "h1" | "h2" | "h3" ... or something custom; map safely
                const ht = (block.headerType ?? "h2").toLowerCase();
                const level =
                    ht === "h1" ? 1 :
                        ht === "h2" ? 2 :
                            ht === "h3" ? 3 :
                                ht === "h4" ? 4 :
                                    ht === "h5" ? 5 :
                                        ht === "h6" ? 6 : 2;

                return `${"#".repeat(clamp(level, 1, 6))} ${headerText}`;
            }

            case WorksheetBlockType.Paragraph: {
                // Your interface includes paragraphMarkdown (even though it’s under QUESTION FIELDS)
                const text = md(block.paragraphMarkdown);
                return text ? text : "";
            }

            case WorksheetBlockType.Question: {
                const q = md(block.questionMarkdown);
                const a = md(block.answerMarkdown);

                const points = block.points ?? 0;
                const ptsSuffix = points > 0 ? ` (${points} pt${points === 1 ? "" : "s"})` : "";

                const parts: string[] = [];
                if (q) {
                    parts.push(`### Question${ptsSuffix}`);
                    parts.push(q);
                } else {
                    // still emit a heading if empty question but points exist
                    if (points > 0) parts.push(`### Question${ptsSuffix}`);
                }

                const showSolutionFlag = block.showSolution ?? false;

                if (showSolutionFlag && a) {
                    parts.push("");
                    parts.push(`<details>`);
                    parts.push(`<summary>Solution</summary>`);
                    parts.push("");
                    parts.push(a);
                    parts.push("");
                    parts.push(`</details>`);
                }

                // Optional: add a space indicator based on questionSpaceSize (if you want)
                // (Not required; but you can uncomment if you want a visible cue)
                //
                // const space = block.questionSpaceSize ?? 0;
                // if (space > 0) {
                //     parts.push("");
                //     parts.push(`_Space: ${space}_`);
                // }

                return parts.join("\n").trim();
            }

            case WorksheetBlockType.Divider: {
                return `---`;
            }

            case WorksheetBlockType.PageBreak: {
                // Markdown has no official page break; HTML works in many renderers/print pipelines
                return `\n<div style="page-break-after: always;"></div>\n`;
            }

            case WorksheetBlockType.BlankSpace: {
                const size = block.size ?? 0;

                // Represent as a “blank lines” area in Markdown.
                // You can change the visual to underscores or an HTML spacer if preferred.
                const n = clamp(Math.round(size), 1, 20); // cap so it doesn't explode
                const lines: string[] = [];
                lines.push(`_Blank space:_`);
                for (let i = 0; i < n; i++) lines.push(`\n`);
                return lines.join("").trimEnd();
            }

            default:
                return "";
        }
    }
}
