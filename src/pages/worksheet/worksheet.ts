import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css"
import "beercss";
import "material-dynamic-colors";
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";
import Editor from "@toast-ui/editor";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import "@static/css/lesson.css";
import "flatpickr/dist/themes/dark.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { LessonsAPI } from "@api/lessons-api";
import { ShareWorksheetDialog } from "@components/common/dialogs/share-worksheet-dialog";
import { ContentCopiedSnackbar } from "@components/common/snackbar/content-copied";

type ViewMode = "editor-preview" | "editor-only" | "preview-only";
let autoSaveTimer: number | undefined;
let lessonPlanLoaded: boolean = false;

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

class AssignmentBuilder {
    constructor(
    ) { }

    /** Builds markdown for the Preview */
    buildMarkdown(): string {
        return ``;
    }

}

class Preview {
    private element: HTMLDivElement;
    private viewer: Viewer;
    private lastMarkdown = "";

    constructor(containerId: string = "preview-pane") {
        const container = document.getElementById(containerId) as HTMLDivElement;
        if (!container) throw new Error(`#${containerId} not found`);

        this.element = container;

        const editorTheme = ui("mode") === "dark" ? "dark" : "light";
        this.viewer = new Viewer({
            el: this.element,
            initialValue: "Nothing to preview yet...",
            usageStatistics: false,
            theme: editorTheme,
        });
    }

    update(markdown: string) {
        this.lastMarkdown = markdown || "Nothing to preview yet...";
        this.viewer.setMarkdown(this.lastMarkdown);

        if (lessonPlanLoaded) {
            if (autoSaveTimer) clearTimeout(autoSaveTimer);
            autoSaveTimer = window.setTimeout(() => handleSaveClick(), 5000);
        }
    }

    /** Return the latest Markdown text */
    getMarkdown(): string {
        return this.lastMarkdown;
    }
}

function setupEditorPane() {
}

async function saveWorksheet() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id") || window.location.hash.replace("#", "");
    if (!idParam) {
        alert("No assignment ID in URL.");
        return;
    }

    const assignmentId = parseInt(idParam, 10);

    const data = {
        topic: (document.getElementById("topic-title") as HTMLInputElement)?.value || "",
        name: (document.getElementById("lesson-name") as HTMLInputElement)?.value || "",
        author: (document.getElementById("author-name") as HTMLInputElement)?.value || "",
        gradeLevel: (document.getElementById("grade-level") as HTMLSelectElement)?.value || "",
        date: (document.getElementById("date-time-input") as HTMLInputElement)?.value || "",
        timeLength: (document.getElementById("time-length") as HTMLSelectElement)?.value || "",
        curricularOutcomes: [],
        resourceLinks: [],
        assessmentEvidence: [],
        notes: "",
    };

    // If your field instances are available globally or in scope:
    data.notes = (window as any).lessonNotes.getValue();
    data.curricularOutcomes = (window as any).curricularOutcomesSection.getValue();
    data.resourceLinks = (window as any).resourceLinks.getValue();
    data.assessmentEvidence = (window as any).assessmentEvidence.getValue();

    const outcomes = data.curricularOutcomes;

    try {
        await LessonsAPI.post(assignmentId, data, outcomes);
        // console.log("Lesson saved:", lessonId);
        // alert("Lesson saved successfully!");
    } catch (err) {
        console.error("Failed to save lesson:", err);
        alert("Failed to save lesson. Check console for details.");
    }
}

function updateSaveButton(state: "idle" | "saving" | "success" | "error" = "idle") {
    // Find all matching buttons (supports duplicates or class-based usage)
    const saveButtons = document.querySelectorAll<HTMLButtonElement>("#save-button, .save-button");

    saveButtons.forEach((saveButton) => {
        const saveIcon = saveButton.querySelector("i");
        const saveText = saveButton.querySelector("div");
        const saveSpinner = saveButton.querySelector("progress");

        if (!saveIcon || !saveText || !saveSpinner) return; // Skip malformed buttons

        switch (state) {
            case "saving":
                saveSpinner.classList.remove("hidden");  // show spinner
                saveIcon.classList.add("hidden");        // hide icon
                saveText.textContent = "Saving...";
                saveButton.classList.add("disabled");
                break;

            case "success":
                saveSpinner.classList.add("hidden");
                saveIcon.classList.remove("hidden");
                saveText.textContent = "Saved!";
                saveButton.classList.remove("disabled");
                setTimeout(() => updateSaveButton("idle"), 1500);
                break;

            case "error":
                saveSpinner.classList.add("hidden");
                saveIcon.classList.remove("hidden");
                saveText.textContent = "Failed!";
                saveButton.classList.remove("disabled");
                setTimeout(() => updateSaveButton("idle"), 2000);
                break;

            case "idle":
            default:
                saveSpinner.classList.add("hidden");
                saveIcon.classList.remove("hidden");
                saveText.textContent = "Save";
                saveButton.classList.remove("disabled");
                break;
        }
    });
}

async function loadWorksheetById() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (!idParam) return;

    const id = parseInt(idParam, 10);
    try {
        const response = await LessonsAPI.getById(id);
        const lesson = response.data;

        if (!lesson || !lesson.data) return;

        // Now safely extract and set field values
        const { data } = lesson;

        (window as any).topicInput.setValue(data.topic || "");
        (window as any).lessonNameInput.setValue(data.name || "");
        (window as any).authorInput.setValue(data.author || "");
        (window as any).gradeLevelSelect.setValue(data.gradeLevel || "");
        (window as any).dateField.setValue(data.date || "");
        (window as any).timeLengthSelect.setValue(data.timeLength || "");
        (window as any).lessonNotes.setValue(data.notes || "");
        await (window as any).curricularOutcomesSection.setValues(data.curricularOutcomes || []);
        (window as any).resourceLinks.setValues(data.resourceLinks || []);
        (window as any).assessmentEvidence.setValues(data.assessmentEvidence || []);
        (window as any).preview.update((window as any).builder.buildMarkdown());

        const progress = document.getElementById("progress") as HTMLDivElement;
        progress.remove();

        const main = document.querySelector("main") as HTMLElement;
        main.classList.remove("hidden");
    } catch (err) {
        console.error("Failed to load lesson:", err);
    }
}

async function handleSaveClick() {
    updateSaveButton("saving");
    clearTimeout(autoSaveTimer);
    try {
        await saveWorksheet();          // reuse your saveLesson() function
        updateSaveButton("success");
    } catch (err) {
        updateSaveButton("error");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Utility to attach an event to all matching elements
    function bindAll(selector: string, handler: (el: HTMLElement) => void) {
        document.querySelectorAll<HTMLElement>(selector).forEach(handler);
    }

    // Appearance dialog buttons
    bindAll("#appearance-button", (el) => {
        el.addEventListener("click", () => new AppearanceDialog());
    });

    // Share lesson buttons
    bindAll("#share-lesson", (el) => {
        el.addEventListener("click", () => new ShareWorksheetDialog());
    });

    // Copy content buttons
    bindAll("#copy-content", (el) => {
        el.addEventListener("click", () => {
            navigator.clipboard.writeText((window as any).preview.getMarkdown());
            new ContentCopiedSnackbar();
        });
    });

    // Save buttons
    bindAll("#save-button", (el) => {
        el.addEventListener("click", handleSaveClick);
    });

    // Initialize editor + load data
    setupEditorPreviewToggle();
    setupEditorPane();
    await loadWorksheetById();
    lessonPlanLoaded = true;
});

document.addEventListener("keydown", (e) => {
    // Check for Ctrl+S (Windows/Linux) or ⌘+S (macOS)
    const isSaveShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";

    if (isSaveShortcut) {
        e.preventDefault();
        handleSaveClick();
    }
});
