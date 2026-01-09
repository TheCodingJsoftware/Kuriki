import { SwapyManager } from "@components/swapy/swapy-manager";
import { IWorksheetBlock, WorksheetBlock, WorksheetBlockType } from "@models/worksheet";
import Editor from "@toast-ui/editor";
import { Signal } from "@utils/signal";
import { setPreviewActiveBlock } from "./preview";


export type BlockChangedPayload = {
    blockId: string;
    block: IWorksheetBlock;                 // current snapshot
    patch?: Partial<IWorksheetBlock>;       // what changed (optional but useful)
    reason?: string;                       // e.g. "points", "questionMarkdown"
};

export class Block {
    id: string;
    element: HTMLElement;
    public readonly onChanged = new Signal<BlockChangedPayload>();
    public readonly onDelete = new Signal<string>();
    public readonly onDuplicate = new Signal<string>();

    public block: WorksheetBlock;

    hiddenCheckbox!: HTMLInputElement;
    pointsInput!: HTMLInputElement;
    headerTypeInput!: HTMLSelectElement;
    headerTitleInput!: HTMLInputElement;
    questionEditor!: Editor;
    questionSpaceSize!: HTMLInputElement;
    answerEditor!: Editor;
    showAnswerCheckbox!: HTMLInputElement;
    blankSpaceSize!: HTMLInputElement;

    constructor(block: WorksheetBlock) {
        this.id = block.id;
        this.element = document.createElement("article");

        this.block = block;

        // ensure data model id matches runtime id
        this.block.id = this.id;

        this.element.classList.add("round", "no-padding");
        this.render();
    }

    render() {
        const id = this.id;

        this.element.innerHTML = `
        <div class="handle absolute responsive center center-align" style="max-height: 24px; z-index: 1; width: 60%;" data-swapy-handle><i>drag_handle</i></div>
        <div class="padding">
            <div class="row">
                <span class="max bold large-text no-line" id="${id}-title">Block</span>
                <nav class="group split">
                    <button id="${id}-duplicate" class="circle left-round small">
                        <i>control_point_duplicate</i>
                        <div class="tooltip">
                            Duplicate
                        </div>
                    </button>
                    <button class="circle error small no-round" id="${id}-delete">
                        <i>delete</i>
                        <div class="tooltip">
                            Delete
                        </div>
                    </button>
                    <label class="checkbox circle icon small primary small-padding right-round">
                        <input type="checkbox" id="${id}-hidden">
                        <span class="on-primary">
                            <i class="large" style="color: var(--on-primary);">expand_less</i>
                            <i class="large" style="color: var(--on-primary);">expand_more</i>
                        </span>
                    </label>
                </nav>
            </div>
            <div id="${id}-content" class="block-content">
                <nav class="margin max toolbar round scroll surface-container-high" id="${id}-block-type">
                    <a class="active" data-ui="#${id}-question">
                        <i>help</i>
                        <span class="l">Question</span>
                    </a>
                    <a data-ui="#${id}-header">
                        <i>format_h1</i>
                        <span class="l">Header</span>
                    </a>
                    <a data-ui="#${id}-divider">
                        <i>horizontal_rule</i>
                        <span class="l">Divider</span>
                    </a>
                    <a data-ui="#${id}-space">
                        <i>align_space_around</i>
                        <span class="l">Space</span>
                    </a>
                    <a data-ui="#${id}-break">
                        <i>insert_page_break</i>
                        <span class="l">Break</span>
                    </a>
                </nav>
                <div class="page padding active" id="${id}-question">
                    <div class="grid">
                        <div class="s12 m6 l6 prefix field label border round">
                            <i>star</i>
                            <input type="number" id="${id}-points" min="0" value="5">
                            <label>Points</label>
                        </div>
                        <div class="s12 m6 l6 prefix field label border round">
                            <i>align_space_around</i>
                            <input type="number" id="${id}-question-space-size" min="0" value="5">
                            <label>Question Space Size</label>
                        </div>
                    </div>
                    <h6>Question</h6>
                    <div id="${id}-question-container"></div>
                    <h6>Answer (Optional)</h6>
                    <div id="${id}-answer-container"></div>
                    <label class="checkbox">
                        <input type="checkbox" id="${id}-show-answer">
                        <span>Show Answer</span>
                    </label>
                </div>

                <div class="page padding" id="${id}-header">
                    <div class="field label suffix border round">
                        <select id="${id}-header-type">
                            <option>Header 1</option>
                            <option>Header 2</option>
                            <option>Header 3</option>
                            <option>Header 4</option>
                            <option>Header 5</option>
                            <option>Header 6</option>
                        </select>
                        <label>Header</label>
                        <i>arrow_drop_down</i>
                    </div>
                    <div class="field label border round">
                        <input type="text" id="${id}-header-title">
                        <label>Title</label>
                    </div>
                </div>

                <div class="page padding" id="${id}-divider">
                    <hr class="margin">
                </div>

                <div class="page padding" id="${id}-space">
                    <div class="field label border round no-margin">
                        <input type="number" id="${id}-blank-space-size">
                        <label>Blank Space Size</label>
                    </div>
                </div>

                <div class="page padding" id="${id}-break">
                    <div class="page-break-label">Page Break</div>
                </div>
            </div>
        </div>
        `;
    }

    getBlockType(): string {
        const blockSelection = this.element.querySelector(`#${this.id}-block-type`) as HTMLSelectElement;
        const activeSelection = blockSelection.querySelector("a.active") as HTMLAnchorElement;
        const blockType = activeSelection.getAttribute("data-ui") as string;
        return blockType.replace(`#${this.id}-`, "") || WorksheetBlockType.Question;
    }

    setBlockType(blockType: string) {
        const blockSelection = this.element.querySelector(`#${this.id}-block-type`) as HTMLSelectElement;
        blockSelection.querySelector("a.active")?.classList.remove("active");
        blockSelection.querySelector(`a[data-ui="#${this.id}-${blockType}"]`)?.classList.add("active");
    }

    setHidden(state: boolean) {
        this.block.hidden = state

        if (state) {
            this.element.classList.add("block-collapsed");
        } else {
            this.element.classList.remove("block-collapsed");
        }
    }

    mount() {
        this.pointsInput = this.element.querySelector(`#${this.id}-points`) as HTMLInputElement;
        this.pointsInput.value = this.block.points?.toString() || "5";
        this.pointsInput.addEventListener("input", () => {
            this.block.points = parseInt(this.pointsInput.value);
            this.emitChanged({ points: this.block.points }, "points");
        });

        this.headerTypeInput = this.element.querySelector(`#${this.id}-header-type`) as HTMLSelectElement;
        this.headerTypeInput.value = this.block.headerType ?? "Header 1";
        this.headerTypeInput.addEventListener("change", () => {
            this.block.headerType = this.headerTypeInput.value;
            this.emitChanged({ headerType: this.block.headerType }, "headerType");
        });

        this.headerTitleInput = this.element.querySelector(`#${this.id}-header-title`) as HTMLInputElement;
        this.headerTitleInput.value = this.block.title ?? "";
        this.headerTitleInput.addEventListener("input", () => {
            this.block.title = this.headerTitleInput.value;
            this.emitChanged({ title: this.block.title }, "title");
        });

        this.showAnswerCheckbox = this.element.querySelector(`#${this.id}-show-answer`) as HTMLInputElement;
        this.showAnswerCheckbox.checked = this.block.showAnswer || false;
        this.showAnswerCheckbox.addEventListener("change", () => {
            this.block.showAnswer = this.showAnswerCheckbox.checked;
            this.emitChanged({ showAnswer: this.block.showAnswer }, "showAnswer");
        });

        this.blankSpaceSize = this.element.querySelector(`#${this.id}-blank-space-size`) as HTMLInputElement;
        this.blankSpaceSize.value = this.block.size?.toString() || "1";
        this.blankSpaceSize.addEventListener("input", () => {
            this.block.size = parseInt(this.blankSpaceSize.value);
            this.emitChanged({ size: this.block.size }, "size");
        });

        this.questionSpaceSize = this.element.querySelector(`#${this.id}-question-space-size`) as HTMLInputElement;
        this.questionSpaceSize.value = this.block.questionSpaceSize?.toString() || "1";
        this.questionSpaceSize.addEventListener("input", () => {
            this.block.questionSpaceSize = parseInt(this.questionSpaceSize.value);
            this.emitChanged({ questionSpaceSize: this.block.questionSpaceSize }, "questionSize");
        });


        // Delete behavior
        this.element.querySelector(`#${this.id}-delete`)?.addEventListener("click", () => {
            const slot = this.element.closest("[data-swapy-slot]") as HTMLElement;

            if (slot) {
                slot.remove();              // Remove the whole slot
                SwapyManager.get().update();      // Update Swapy mapping
                this.onDelete.emit(this.id);
            }
        });

        this.element.querySelector(`#${this.id}-duplicate`)?.addEventListener("click", () => {
            this.onDuplicate.emit(this.id);
        })

        // Auto-show correct page when clicking toolbar tabs
        this.element.querySelectorAll(".toolbar a").forEach(a => {
            a.addEventListener("click", () => {
                const next = a.getAttribute("data-ui")?.replace(`#${this.id}-`, "") as WorksheetBlockType;
                this.showPage(a.getAttribute("data-ui")!);
                this.block.currentType = next;
                this.emitChanged({ currentType: next }, "currentType");
            });
        });

        // Set block type
        if (!this.block.currentType) this.block.currentType = WorksheetBlockType.Question;
        this.showPage(`#${this.id}-${this.block.currentType}`);
        this.setBlockType(this.block.currentType);

        this.hiddenCheckbox = this.element.querySelector(`#${this.id}-hidden`) as HTMLInputElement;
        this.hiddenCheckbox.checked = this.block.hidden || false;
        this.hiddenCheckbox.addEventListener("change", () => {
            this.setHidden(this.hiddenCheckbox.checked);
        });

        // Restore UI on mount
        this.setHidden(this.hiddenCheckbox.checked);

        const questionEl = this.element.querySelector(`#${this.id}-question-container`) as HTMLElement;
        const answerEl = this.element.querySelector(`#${this.id}-answer-container`) as HTMLElement;

        // Prevent double-init if Swapy re-attaches elements
        if (!this.questionEditor) {
            this.questionEditor = new Editor({
                el: questionEl,
                previewStyle: "vertical",
                height: "250px",
                initialEditType: "wysiwyg",
                usageStatistics: true,
            });
            this.questionEditor.setMarkdown(this.block.questionMarkdown?.replaceAll("$$", "\\$\\$") || "");
            this.questionEditor.on("change", () => {
                this.block.questionMarkdown = this.questionEditor.getMarkdown();
                this.emitChanged({ questionMarkdown: this.block.questionMarkdown }, "questionMarkdown");
                setPreviewActiveBlock(this.id, false)
            });
            this.questionEditor?.on("focus", () => setPreviewActiveBlock(this.id));
        }

        if (!this.answerEditor) {
            this.answerEditor = new Editor({
                el: answerEl,
                previewStyle: "vertical",
                height: "150px",
                initialEditType: "wysiwyg",
                usageStatistics: true,
            });
            this.answerEditor.setMarkdown(this.block.answerMarkdown?.replaceAll("$$", "\\$\\$") || "");
            this.answerEditor.on("change", () => {
                this.block.answerMarkdown = this.answerEditor.getMarkdown();
                this.emitChanged({ answerMarkdown: this.block.answerMarkdown }, "answerMarkdown");
                setPreviewActiveBlock(this.id, false)
            });
            this.answerEditor?.on("focus", () => setPreviewActiveBlock(this.id));
        }

        this.element.addEventListener("dblclick", () => {
            this.hiddenCheckbox.checked = !this.hiddenCheckbox.checked;
            this.setHidden(this.hiddenCheckbox.checked);
        })

        this.element.addEventListener("pointerenter", () => {
            setPreviewActiveBlock(this.id);
        });

        // highlight when any input inside the block gets focus
        this.element.addEventListener("focusin", () => setPreviewActiveBlock(this.id));

        // optional: clear when leaving the block
        // this.element.addEventListener("focusout", (e) => {
        //     // only clear if focus left the whole block
        //     if (!this.element.contains(e.relatedTarget as Node)) setPreviewActiveBlock(null);
        // });
    }

    showPage(selector: string) {
        this.block.currentType = selector.replace(`#${this.id}-`, "") as WorksheetBlockType;

        const pages = this.element.querySelectorAll(".page");
        pages.forEach(p => p.classList.remove("active"));

        const target = this.element.querySelector(selector);
        if (target) target.classList.add("active");

        const title = this.element.querySelector(`#${this.id}-title`) as HTMLDivElement;
        title.innerHTML = `Block <div class="small-text">(${this.block.currentType})</div>`;
    }

    private emitChanged(patch?: Partial<WorksheetBlock>, reason?: string) {
        const payload: BlockChangedPayload = {
            blockId: this.id,
            block: { ...this.block },
            ...(patch !== undefined ? { patch } : {}),
            ...(reason !== undefined ? { reason } : {}),
        };

        this.onChanged.emit(payload);
        console.log("emitChanged", reason);

    }


    destroy() {
        this.onChanged.clear();
    }

    toObject(): WorksheetBlock {
        this.block.currentType = this.getBlockType() as WorksheetBlockType;
        return { ... this.block };
    }
}