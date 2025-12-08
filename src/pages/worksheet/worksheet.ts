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

type ViewMode = "editor-preview" | "editor-only" | "preview-only";

let worksheetLoaded = false;
let autoSaveTimer: number | undefined;

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

function addNewBlock(): Block {
    const block = new Block();
    SwapyManager.get()
        .createSlotWithItem(block.id, block.element)
        .slot.element.scrollIntoView(true);
    block.mount();
    SwapyManager.get().update();
    return block;
}

document.addEventListener("DOMContentLoaded", async () => {

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
            // await handleWorksheetSave();
        });
    });

    const blockList = document.querySelector("#block-list") as HTMLElement;
    SwapyManager.init(blockList);

    bindAll("#add-block", (el) => {
        el.addEventListener("click", () => addNewBlock());
    });

    addNewBlock();

    const teacherNotesContainer = document.getElementById("teacher-notes-container") as HTMLElement;
    new Editor({
        el: teacherNotesContainer,
        previewStyle: "vertical",
        height: "250px",
        initialEditType: "wysiwyg",
        usageStatistics: true,
    });

    // -----------------------------
    // Initialize UI
    // -----------------------------
    setupEditorPreviewToggle();
    // setupWorksheetEditorPane();

    // -----------------------------
    // Load worksheet from API
    // -----------------------------
    // await loadWorksheetById();
    // worksheetLoaded = true;

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
        // handleWorksheetSave();
    }
});

// -------------------------------
// Auto-save timer support
// (Preview triggers this)
// -------------------------------
(window as any).queueWorksheetAutoSave = () => {
    if (!worksheetLoaded) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = window.setTimeout(async () => {
        updateSaveButton("saving");
        // await handleWorksheetSave();
    }, 5000);
};
