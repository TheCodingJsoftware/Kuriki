import { SwapyManager } from "@components/swapy/swapy-manager";
import Editor from "@toast-ui/editor";

let blockCounter = 0;
function uid() {
    return "block-" + (++blockCounter);
}

export class Block {
    id: string;
    element: HTMLElement;

    questionEditor!: Editor;
    answerEditor!: Editor;
    notesEditor!: Editor;

    constructor() {
        this.id = uid();

        this.element = document.createElement("article");

        // Mark this as a swapy item
        this.element.classList.add("round");

        this.render();
    }

    render() {
        const id = this.id;

        this.element.innerHTML = `
            <div class="row">
                <div class="handle" data-swapy-handle><i>drag_indicator</i></div>
                <h6 class="max" id="${id}-title">Block</h6>
                <button id="${id}-duplicate" class="chip square">
                    <i>content_copy</i>
                    <div class="tooltip">
                        Duplicate
                    </div>
                </button>
                <button class="circle error chip" id="${id}-delete">
                    <i>delete</i>
                </button>
                <label class="checkbox icon">
                    <input type="checkbox" id="${id}-hidden">
                    <span>
                        <i>expand_less</i>
                        <i>expand_more</i>
                    </span>
                </label>
            </div>
            <div id="${id}-content" class="block-content">
                <nav class="margin max toolbar round fill">
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
                        <span class="l">Page Break</span>
                    </a>
                </nav>
                <div class="page padding active" id="${id}-question">
                    <div class="prefix field label border round">
                        <i>star</i>
                        <input type="number" id="${id}-points" min="0" value="5">
                        <label>Points</label>
                    </div>
                    <h6>Question</h6>
                    <div id="${id}-question-container"></div>
                    <h6>Answer (Optional)</h6>
                    <div id="${id}-answer-container"></div>
                    <label class="checkbox">
                        <input type="checkbox" id="${id}-show-answer">
                        <span>Show Answer</span>
                    </label>
                    <h6>Teacher Notes (Optional)</h6>
                    <div id="${id}-notes-container"></div>
                </div>

                <div class="page padding" id="${id}-header">
                    <div class="field label suffix border round">
                        <select id="${id}-header-type">
                            <option>Header 1</option>
                            <option>Header 2</option>
                            <option>Header 3</option>
                            <option>Header 4</option>
                            <option>Header 6</option>
                        </select>
                        <label>Header</label>
                        <i>arrow_drop_down</i>
                    </div>
                    <div class="field label border round">
                        <input type="text" id="${id}-title">
                        <label>Title</label>
                    </div>
                </div>

                <div class="page padding" id="${id}-divider">
                    <hr class="margin">
                </div>

                <div class="page padding" id="${id}-space">
                    <div class="field label border round no-margin">
                        <input type="number" id="blank-space-size">
                        <label>Blank Space Size</label>
                    </div>
                </div>

                <div class="page padding" id="${id}-break">
                    <div class="page-break-label">Page Break</div>
                </div>
            </div>
        `;

        // Delete behavior
        this.element.querySelector(`#${id}-delete`)?.addEventListener("click", () => {
            const slot = this.element.closest("[data-swapy-slot]") as HTMLElement;

            if (slot) {
                slot.remove();              // Remove the whole slot
                SwapyManager.get().update();      // Update Swapy mapping
            }
        });

        // Auto-show correct page when clicking toolbar tabs
        this.element.querySelectorAll(".toolbar a").forEach(a => {
            a.addEventListener("click", () => {
                this.showPage(a.getAttribute("data-ui")!);
            });
        });
    }

    setHidden(state: boolean) {
        const content = this.element.querySelector(`#${this.id}-content`) as HTMLElement;

        // Update the block's hidden property
        (this as any).hidden = state;

        if (state) {
            this.element.classList.add("block-collapsed");
        } else {
            this.element.classList.remove("block-collapsed");
        }
    }

    mount() {
        const id = this.id;

        const hiddenCheckbox = this.element.querySelector(`#${id}-hidden`) as HTMLInputElement;
        hiddenCheckbox.addEventListener("change", () => {
            this.setHidden(hiddenCheckbox.checked);
        });

        // Restore UI on mount
        this.setHidden(hiddenCheckbox.checked);

        const questionEl = this.element.querySelector(`#${id}-question-container`) as HTMLElement;
        const answerEl = this.element.querySelector(`#${id}-answer-container`) as HTMLElement;
        const notesEl = this.element.querySelector(`#${id}-notes-container`) as HTMLElement;

        // Prevent double-init if Swapy re-attaches elements
        if (!this.questionEditor) {
            this.questionEditor = new Editor({
                el: questionEl,
                previewStyle: "vertical",
                height: "250px",
                initialEditType: "wysiwyg",
                usageStatistics: true,
            });
        }

        if (!this.answerEditor) {
            this.answerEditor = new Editor({
                el: answerEl,
                previewStyle: "vertical",
                height: "250px",
                initialEditType: "wysiwyg",
                usageStatistics: true,
            });
        }

        if (!this.notesEditor) {
            this.notesEditor = new Editor({
                el: notesEl,
                previewStyle: "vertical",
                height: "250px",
                initialEditType: "wysiwyg",
                usageStatistics: true,
            });
        }
    }

    showPage(selector: string) {
        const pages = this.element.querySelectorAll(".page");
        pages.forEach(p => p.classList.remove("active"));

        const target = this.element.querySelector(selector);
        if (target) target.classList.add("active");
    }
}
