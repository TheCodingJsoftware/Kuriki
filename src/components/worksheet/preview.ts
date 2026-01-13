import { Worksheet, WorksheetBlockType } from "@models/worksheet";
import { renderWorksheetMarkdown } from "@utils/worksheet-preview-renderer";

let activePreviewBlockId: string | null = null;

export class Preview {
    private readonly container: HTMLDivElement;

    constructor(private worksheet: Worksheet) {
        this.container = document.getElementById("preview-pane") as HTMLDivElement;
    }

    public async render() {
        this.container.innerHTML = "";

        const headerElement = document.createElement("div");
        headerElement.innerHTML = `
            <div class="padding bottom-align">
                <div class="left absolute">${escapeHtml(this.worksheet.topic)}</div>
                <h6 class="center absolute">${escapeHtml(this.worksheet.name)}</h6>
                <div class="right absolute">Due: ${escapeHtml(this.worksheet.date)}</div>
            </div>
            <hr>
            <nav class="row">
                <div class="worksheet-notes max padding small-text no-line">
                    ${await renderWorksheetMarkdown(this.worksheet.teacherNotes || "")}
                </div>
                <div class="max">Name <hr></div>
            </nav>
            <hr>
            ${this.worksheet.getTotalPoints() > 0 ? `
            <nav class="row right-align">
                <div class="extra extra-margin"><h6>/ ${escapeHtml(String(this.worksheet.getTotalPoints()))} pts</h6></div>
            </nav>` : ``}
        `.trim();

        this.container.append(headerElement);

        for (const block of this.worksheet.blocks) {

            const blockElement = document.createElement("div");
            blockElement.className = "worksheet-block";
            blockElement.id = block.id;

            switch (block.currentType) {

                case WorksheetBlockType.Question: {
                    const space = block.questionSpaceSize ?? 1;
                    const qHtml = await renderWorksheetMarkdown(block.questionMarkdown || "");
                    const sHtml = block.showSolution ? await renderWorksheetMarkdown(block.answerMarkdown || "") : "";

                    blockElement.innerHTML = `
                    <div class="row top-align">
                        <div class="min large">
                            <h6>/${escapeHtml(String(block.points ?? 0))} pts</h6>
                        </div>
                        <div class="max">
                            <div class="worksheet-question">
                            ${qHtml || "<span class='italic'>(no question)</span>"}
                            </div>
                        </div>
                    </div>
                    <div class="question-space" style="min-height:${space * 24}px" data-height="${space * 24}px">
                        ${block.showSolution && (block.answerMarkdown || "").trim()
                            ? `<div class="worksheet-solution">
                                    <span class="italic">Solution</span>${sHtml}
                                </div>`
                            : ""}
                        <span class="height-line"></span>
                    </div>
                    `.trim();

                    break;
                }

                case WorksheetBlockType.Paragraph: {
                    const pHtml = await renderWorksheetMarkdown(block.paragraphMarkdown || "");
                    blockElement.innerHTML = `<div class="worksheet-paragraph">${pHtml}</div>`;
                    break;
                }

                case WorksheetBlockType.SectionHeader: {
                    const titleHtml = await renderWorksheetMarkdown(block.title || "");

                    // "Header 1" → 1, "Header 2" → 2, etc.
                    const level = Number(block.headerType?.replace("Header ", "")) || 1;

                    blockElement.innerHTML = `
                        <div class="worksheet-header">
                            <h${level}>${titleHtml}</h${level}>
                        </div>
                    `.trim();

                    break;
                }

                case WorksheetBlockType.Divider: {
                    blockElement.innerHTML = `<hr />`;
                    break;
                }

                case WorksheetBlockType.BlankSpace: {
                    const size = block.size ?? 1;
                    blockElement.innerHTML = `<div class="blank-space" style="min-height:${size * 24}px" data-height="${size * 24}px">
                        <span class="height-line"></span>
                    </div>`
                    break;
                }

                case WorksheetBlockType.PageBreak: {
                    blockElement.classList.add("page-break");
                    break;
                }

                default: {
                    blockElement.innerHTML = "";
                }
            }

            this.container.append(blockElement);
        }

        // Optional: keep your autosave hook
        (window as any).queueWorksheetAutoSave?.();

        // Re-apply highlight after re-render
        if (activePreviewBlockId) {
            const target = this.container.querySelector<HTMLElement>(
                `.worksheet-block#${CSS.escape(activePreviewBlockId)}`
            );
            target?.classList.add("is-active");
        }

    }
}

function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.innerText = text ?? "";
    return div.innerHTML;
}

export function setPreviewActiveBlock(blockId: string | null, scroll = true) {
    activePreviewBlockId = blockId;

    const pane = document.getElementById("preview-pane");
    if (!pane) return;

    pane.querySelectorAll(".worksheet-block.is-active")
        .forEach(el => el.classList.remove("is-active"));

    if (!blockId) return;

    const target = pane.querySelector<HTMLElement>(`.worksheet-block#${CSS.escape(blockId)}`);
    target?.classList.add("is-active");

    if (scroll) target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
