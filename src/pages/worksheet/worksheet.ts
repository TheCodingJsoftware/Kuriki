import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css";
import "@static/css/worksheet.css";
import "beercss";
import "material-dynamic-colors";
import "@toast-ui/editor/dist/toastui-editor.css";
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";
import { ShareWorksheetDialog } from "@components/common/dialogs/share-worksheet-dialog";
import { ContentCopiedSnackbar } from "@components/common/snackbar/content-copied";
import { Block } from "@components/worksheet/block";
import { SwapyManager } from "@components/swapy/swapy-manager";
import Editor from "@toast-ui/editor";
import { SnackbarComponent } from "@components/common/snackbar/snackbar";
import { WorksheetsAPI } from "@api/worksheets-api";
import { Worksheet, WorksheetBlock, WorksheetBlockType } from "@models/worksheet";
import { Preview } from "@components/worksheet/preview";
import "katex/dist/katex.min.css";
import { CurricularOutcomesSection } from "@components/lesson/curricular-outcome-selection";

type ViewMode = "editor-preview" | "editor-only" | "preview-only";

let worksheetLoaded = false;
let autoSaveTimer: number | undefined;

const worksheet = new Worksheet();
let preview = new Preview(worksheet);
let blocks: Block[] = [];

let topicInput = document.getElementById("topic") as HTMLInputElement;
let nameInput = document.getElementById("name") as HTMLInputElement;
let authorInput = document.getElementById("author") as HTMLInputElement;
let gradeLevelInput = document.getElementById("grade-level") as HTMLInputElement;
let dateInput = document.getElementById("date") as HTMLInputElement;
let teacherNotesEditor: Editor | null = null;
let outcomeContainer = document.getElementById("outcome-container") as HTMLDivElement;
let outcomeSelection = new CurricularOutcomesSection();

topicInput.addEventListener("input", async () => {
    worksheet.topic = topicInput.value;
    if (!worksheetLoaded) return;
    await preview.render();
});

nameInput.addEventListener("input", async () => {
    worksheet.name = nameInput.value;
    if (!worksheetLoaded) return;
    await preview.render();
});

authorInput.addEventListener("input", async () => {
    worksheet.author = authorInput.value;
    if (!worksheetLoaded) return;
    await preview.render();
});

gradeLevelInput.addEventListener("input", async () => {
    worksheet.gradeLevel = gradeLevelInput.value;
    if (!worksheetLoaded) return;
    await preview.render();
});

dateInput.addEventListener("input", async () => {
    worksheet.date = dateInput.value;
    if (!worksheetLoaded) return;
    await preview.render();
});

function setupEditorPreviewToggle() {
    const main = document.querySelector("main") as HTMLElement;

    const editorBtn = document.getElementById("editor-preview") as HTMLButtonElement;
    const editorOnlyBtn = document.getElementById("editor-only") as HTMLButtonElement;
    const previewOnlyBtn = document.getElementById("preview-only") as HTMLButtonElement;

    const editorPane = document.getElementById("editor-container") as HTMLElement;
    const previewPane = document.getElementById("preview-container") as HTMLElement;

    function setActive(button: HTMLButtonElement) {
        [editorBtn, editorOnlyBtn, previewOnlyBtn].forEach(b => b.classList.remove("active"));
        button.classList.add("active");
    }

    function resetGrid(pane: HTMLElement) {
        const toRemove: string[] = [];
        pane.classList.forEach(cls => {
            if (/^(s|m|l)\d+$/.test(cls)) {
                toRemove.push(cls);
            }
        });
        toRemove.forEach(cls => pane.classList.remove(cls));
    }

    function applyView(mode: ViewMode, save = false) {
        switch (mode) {
            case "editor-preview":
                setActive(editorBtn);

                editorPane.classList.remove("hidden");
                previewPane.classList.remove("hidden");

                resetGrid(editorPane);
                resetGrid(previewPane);

                editorPane.classList.add("s12", "m6", "l6");
                previewPane.classList.add("s12", "m6", "l6");
                main.classList.remove("responsive");
                break;

            case "editor-only":
                setActive(editorOnlyBtn);

                editorPane.classList.remove("hidden");
                previewPane.classList.add("hidden");

                resetGrid(editorPane);
                editorPane.classList.add("s12", "m12", "l12");
                main.classList.add("responsive");
                break;

            case "preview-only":
                setActive(previewOnlyBtn);

                previewPane.classList.remove("hidden");
                editorPane.classList.add("hidden");

                resetGrid(previewPane);
                previewPane.classList.add("s12", "m12", "l12");
                main.classList.add("responsive");
                break;
        }

        if (save) {
            localStorage.setItem("lessonViewMode", mode);
        }
    }

    // Attach listeners
    editorBtn.addEventListener("click", () => applyView("editor-preview", true));
    editorOnlyBtn.addEventListener("click", () => applyView("editor-only", true));
    previewOnlyBtn.addEventListener("click", () => applyView("preview-only", true));

    // Load last saved mode or default to "editor-preview"
    // Check URL hash first
    const hash = window.location.hash.replace("#", "") as ViewMode | "";
    if (hash === "editor-preview" || hash === "editor-only" || hash === "preview-only") {
        applyView(hash); // override storage if hash is present
        const editorPreviewToggle = document.getElementById("editor-preview-toggle") as HTMLDivElement;
        editorPreviewToggle.classList.add("hidden");
    } else {
        // Otherwise fallback to last saved mode or default
        const lastMode = (localStorage.getItem("lessonViewMode") as ViewMode) || "editor-preview";
        applyView(lastMode);
    }
}

function syncWorksheetBlocksFromUI() {
    worksheet.blocks = blocks.map(b => b.toObject());
}


export function updateSaveButton(state: "idle" | "saving" | "success" | "error" = "idle") {
    const buttons = document.querySelectorAll<HTMLButtonElement>("#save-button, .save-button");

    buttons.forEach(btn => {
        const icon = btn.querySelector("i");
        const text = btn.querySelector("div");
        const spinner = btn.querySelector("progress");

        if (!icon || !text || !spinner) return;

        switch (state) {
            case "saving":
                spinner.classList.remove("hidden");
                icon.classList.add("hidden");
                text.textContent = "Saving...";
                btn.classList.add("disabled");
                break;

            case "success":
                spinner.classList.add("hidden");
                icon.classList.remove("hidden");
                text.textContent = "Saved!";
                btn.classList.remove("disabled");
                setTimeout(() => updateSaveButton("idle"), 1500);
                break;

            case "error":
                spinner.classList.add("hidden");
                icon.classList.remove("hidden");
                text.textContent = "Failed!";
                btn.classList.remove("disabled");
                setTimeout(() => updateSaveButton("idle"), 2000);
                break;

            default:
                spinner.classList.add("hidden");
                icon.classList.remove("hidden");
                text.textContent = "Save";
                btn.classList.remove("disabled");
                break;
        }
    });
}

/** Attach handler to all matching elements */
function bindAll(selector: string, handler: (el: HTMLElement) => void) {
    document.querySelectorAll<HTMLElement>(selector).forEach(handler);
}

function uid() {
    return `block-${crypto.randomUUID()}`;
}

function addNewBlock(): Block {
    const blockData = {
        id: uid(),
        currentType: WorksheetBlockType.Question,
        points: 5,
        questionMarkdown: "",
        questionSpaceSize: 5,
        answerMarkdown: "",
        showAnswer: false,
        notesMarkdown: "",
        title: "Block",
        headerType: "Header 1",
        size: 5,
        hidden: false,
    };

    const block = new Block(blockData);
    block.onChanged.connect(async (e) => {
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    })
    block.onDuplicate.connect(async (id) => {
        const b = blocks.find(b => b.id === id);
        if (!b) return;

        const newBlockData = {
            ...b?.block,
            id: uid(),
        }

        const block = addBlock(newBlockData);
        blocks.push(block);
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    })
    block.onDelete.connect(async (id) => {
        blocks = blocks.filter(b => b.id !== id);
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    });
    SwapyManager.get()
        .createSlotWithItem(block.id, block.element)
        .slot.element.scrollIntoView(true);
    block.mount();
    worksheet.blocks.push(blockData);
    SwapyManager.get().update();
    return block;
}

function addBlock(block: WorksheetBlock): Block {
    const b = new Block(block);
    b.onChanged.connect(async (e) => {
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    });
    b.onDuplicate.connect(async (id) => {
        const b = blocks.find(b => b.id === id);

        if (!b) return;
        const newBlockData = {
            ...b?.block,
            id: uid(),
        }

        const block = addBlock(newBlockData);
        blocks.push(block);
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    })
    b.onDelete.connect(async (id) => {
        blocks = blocks.filter(b => b.id !== id);
        syncWorksheetBlocksFromUI();
        if (!worksheetLoaded) return;
        await preview.render();
    });
    SwapyManager.get().createSlotWithItem(b.id, b.element)
    b.mount();
    SwapyManager.get().update();
    return b;
}

async function loadWorksheet(id: number) {
    const data = await WorksheetsAPI.getById(id);
    worksheet.load(data.data.data);

    topicInput.value = worksheet.topic;
    nameInput.value = worksheet.name;
    authorInput.value = worksheet.author;
    gradeLevelInput.value = worksheet.gradeLevel;
    dateInput.value = worksheet.date;
    teacherNotesEditor?.setMarkdown(worksheet.teacherNotes?.replaceAll("$$", "\\$\\$"));

    outcomeSelection.setValues(worksheet.curricularOutcomes);
    outcomeContainer.append(outcomeSelection.element);

    worksheet.blocks.forEach(b => {
        const block = addBlock(b);
        blocks.push(block);
    });

    SwapyManager.get().update();
    await preview.render();
}

async function handleWorksheetSave() {
    try {
        const id = getWorksheetId();

        worksheet.topic = topicInput.value;
        worksheet.name = nameInput.value;
        worksheet.author = authorInput.value;
        worksheet.gradeLevel = gradeLevelInput.value;
        worksheet.date = dateInput.value;
        worksheet.teacherNotes = teacherNotesEditor?.getMarkdown() || "";
        worksheet.curricularOutcomes = outcomeSelection.getValues();

        syncWorksheetBlocksFromUI();

        await WorksheetsAPI.post(id, worksheet.toObject(), worksheet.curricularOutcomes)
            .then(() => {
                updateSaveButton("success");
            })
            .catch(() => {
                updateSaveButton("error");
            });
    } catch (err) {
        console.error(err);
        updateSaveButton("error");
    }
}

function getWorksheetId(): number {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    return Number(id);
}

async function loadWorksheetById() {
    const id = getWorksheetId();
    if (id) {
        await loadWorksheet(Number(id));
    } else {
        new SnackbarComponent({
            message: "No worksheet ID found in URL",
            type: "error",
            onClose: () => { }
        });
    }
}

async function swapyOrderChanged(event: any) {
    const map: Map<string, string> | undefined = event?.newSlotItemMap?.asMap;
    if (!map) return;

    // map is: NEW_SLOT_ID -> ITEM_ID   (based on your working example)
    // We want blocks ordered by NEW_SLOT_ID (1..n)
    const entries = Array.from(map.entries()); // [ [newSlotId, itemId], ... ]

    // sort by numeric slot id if your slots are "1", "2", ...
    entries.sort((a, b) => Number(a[0]) - Number(b[0]));

    const orderedItemIds = entries.map(([, itemId]) => itemId);

    const byId = new Map(blocks.map(b => [b.id, b] as const));
    const nextBlocks = orderedItemIds.map(id => byId.get(id)).filter(Boolean) as Block[];

    // Safety: don't apply a bad reorder
    if (nextBlocks.length !== blocks.length) {
        console.warn("Reorder mismatch", {
            orderedItemIds,
            blocks: blocks.map(b => b.id),
            nextBlocks: nextBlocks.map(b => b.id),
            map: entries,
        });
        return;
    }

    blocks = nextBlocks;

    // keep worksheet + preview consistent
    syncWorksheetBlocksFromUI();
    if (!worksheetLoaded) return;
    await preview.render();
}



document.addEventListener("DOMContentLoaded", async () => {
    const worksheetDetails = document.querySelector("#worksheet-details") as HTMLDetailsElement;

    // Restore state
    worksheetDetails.open = localStorage.getItem("worksheetDetailsOpen") === "true";

    // Persist state
    worksheetDetails.addEventListener("toggle", () => {
        localStorage.setItem(
            "worksheetDetailsOpen",
            String(worksheetDetails.open)
        );
    });

    // -----------------------------
    // Appearance dialog
    // -----------------------------
    bindAll("#appearance-button", (el) => {
        el.addEventListener("click", () => new AppearanceDialog());
    });

    // -----------------------------
    // Share worksheet dialog
    // -----------------------------
    bindAll("#share-lesson", (el) => {
        el.addEventListener("click", () => new ShareWorksheetDialog());
    });

    // -----------------------------
    // Copy preview markdown
    // -----------------------------
    bindAll("#copy-content", (el) => {
        el.addEventListener("click", () => {
            const md = (window as any).preview?.getMarkdown() || "";
            navigator.clipboard.writeText(md);
            new ContentCopiedSnackbar();
        });
    });

    // -----------------------------
    // Manual save
    // -----------------------------
    bindAll("#save-button", (el) => {
        el.addEventListener("click", async () => {
            updateSaveButton("saving");
            await handleWorksheetSave();
        });
    });

    const blockList = document.querySelector("#block-list") as HTMLElement;
    SwapyManager.init(blockList);
    SwapyManager.get().onChanged.connect((event) => swapyOrderChanged(event));


    bindAll("#add-block", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    bindAll("#add-block-question", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            newBlock.showPage(WorksheetBlockType.Question);
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    bindAll("#add-block-header", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            newBlock.block.currentType = WorksheetBlockType.SectionHeader;
            newBlock.setBlockType(WorksheetBlockType.SectionHeader);
            newBlock.showPage(`#${newBlock.id}-${WorksheetBlockType.SectionHeader}`);
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    bindAll("#add-block-section", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            newBlock.block.currentType = WorksheetBlockType.Divider;
            newBlock.setBlockType(WorksheetBlockType.Divider);
            newBlock.showPage(`#${newBlock.id}-${WorksheetBlockType.Divider}`);
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    bindAll("#add-block-space", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            newBlock.block.currentType = WorksheetBlockType.BlankSpace;
            newBlock.setBlockType(WorksheetBlockType.BlankSpace);
            newBlock.showPage(`#${newBlock.id}-${WorksheetBlockType.BlankSpace}`);
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    bindAll("#add-block-break", (el) => {
        el.addEventListener("click", async () => {
            const newBlock = addNewBlock();
            newBlock.block.currentType = WorksheetBlockType.PageBreak;
            newBlock.setBlockType(WorksheetBlockType.PageBreak);
            newBlock.showPage(`#${newBlock.id}-${WorksheetBlockType.PageBreak}`);
            blocks.push(newBlock);
            if (!worksheetLoaded) return;
            await preview.render();
        });
    });

    const teacherNotesContainer = document.getElementById("teacher-notes-container") as HTMLElement;
    teacherNotesEditor = new Editor({
        el: teacherNotesContainer,
        previewStyle: "vertical",
        height: "250px",
        initialEditType: "wysiwyg",
        usageStatistics: true,
    });
    teacherNotesEditor.on("change", async () => {
        worksheet.teacherNotes = teacherNotesEditor?.getMarkdown() || "";
        if (!worksheetLoaded) return;
        await preview.render();
    });

    // -----------------------------
    // Initialize UI
    // -----------------------------
    setupEditorPreviewToggle();
    // setupWorksheetEditorPane();

    // -----------------------------
    // Load worksheet from API
    // -----------------------------
    await loadWorksheetById();
    worksheetLoaded = true;

    // Remove loading overlay
    document.getElementById("progress")?.remove();
    document.querySelector("main")?.classList.remove("hidden");
});

// -------------------------------
// Ctrl + S → Save worksheet
// -------------------------------
document.addEventListener("keydown", (e) => {
    const isShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
    if (isShortcut) {
        e.preventDefault();
        updateSaveButton("saving");
        handleWorksheetSave();
    }
    // -------------------------------
    // Auto-save timer support
    // (Preview triggers this)
    // -------------------------------
    (window as any).queueWorksheetAutoSave = () => {
        if (!worksheetLoaded) return;
        if (autoSaveTimer) clearTimeout(autoSaveTimer);

        autoSaveTimer = window.setTimeout(async () => {
            updateSaveButton("saving");
            await handleWorksheetSave();
        }, 5000);
    };
});
