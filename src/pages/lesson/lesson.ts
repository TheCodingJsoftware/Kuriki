import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css"
import "beercss";
import "material-dynamic-colors";
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";
import Editor from "@toast-ui/editor";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import type { AssessmentRow } from "@models/assessment-row";
import "@static/css/lesson.css";

import "@toast-ui/editor/dist/toastui-editor.css"; // important
// import "@toast-ui/editor/dist/theme/toastui-editor-dark.css"; // if using dark theme
import { builtInTemplates, LessonTemplate } from "@models/lesson-template";

type ViewMode = "editor-preview" | "editor-only" | "preview-only";

function setupEditorPreviewToggle() {
    const main = document.querySelector("main") as HTMLElement;

    const editorBtn = document.getElementById("editor-preview") as HTMLButtonElement;
    const editorOnlyBtn = document.getElementById("editor-only") as HTMLButtonElement;
    const previewOnlyBtn = document.getElementById("preview-only") as HTMLButtonElement;

    const editorPane = document.getElementById("editor-pane") as HTMLElement;
    const previewPane = document.getElementById("preview-pane") as HTMLElement;

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
    } else {
        // Otherwise fallback to last saved mode or default
        const lastMode = (localStorage.getItem("lessonViewMode") as ViewMode) || "editor-preview";
        applyView(lastMode);
    }
}

interface LessonField<T = any> {
    element: HTMLElement;
    getValue(): T;
    setValue(value: T): void;
}

class TopicInput implements LessonField<string> {
    element: HTMLDivElement;
    input: HTMLInputElement;
    label: HTMLLabelElement;
    tooltip: HTMLDivElement;
    id: string = "topic-title";

    constructor() {
        // wrapper div
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "label");

        // input
        this.input = document.createElement("input");
        this.input.id = this.id;
        this.input.type = "text";

        // label
        this.label = document.createElement("label");
        this.label.textContent = "Topic/Theme/Unit Title";
        this.label.setAttribute("for", this.id);

        // tooltip (inside button, like your HTML)
        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("tooltip", "max", "right");
        this.tooltip.innerHTML = `
            Use the same <strong>unit title</strong> and <strong>author name</strong> for all lesson plans in a unit to ensure they are grouped together.<br><br>
            Leave blank if it is not part of a unit.
        `;

        // assemble
        this.element.appendChild(this.input);
        this.element.appendChild(this.label);
        this.element.appendChild(this.tooltip);
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string) {
        this.input.value = value;
    }
}

class LessonNameInput implements LessonField<string> {
    element: HTMLDivElement;
    input: HTMLInputElement;
    label: HTMLLabelElement;
    id: string = "lesson-name";

    constructor() {
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "label");

        this.input = document.createElement("input");
        this.input.id = this.id;
        this.input.type = "text";

        this.label = document.createElement("label");
        this.label.textContent = "Lesson Name";
        this.label.setAttribute("for", this.id);

        this.element.appendChild(this.input);
        this.element.appendChild(this.label);
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string) {
        this.input.value = value;
    }
}

class AuthorInput implements LessonField<string> {
    element: HTMLDivElement;
    icon: HTMLElement;
    input: HTMLInputElement;
    label: HTMLLabelElement;
    id: string = "author-name";

    constructor() {
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "prefix", "label");

        this.icon = document.createElement("i");
        this.icon.textContent = "group";

        this.input = document.createElement("input");
        this.input.id = this.id;
        this.input.type = "text";

        this.label = document.createElement("label");
        this.label.textContent = "Author(s)";
        this.label.setAttribute("for", this.id);

        this.element.appendChild(this.icon);
        this.element.appendChild(this.input);
        this.element.appendChild(this.label);
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string) {
        this.input.value = value;
    }
}

class GradeLevelSelect implements LessonField<string> {
    element: HTMLDivElement;
    select: HTMLSelectElement;
    label: HTMLLabelElement;
    id: string = "grade-level";

    private options: string[] = [
        "Kindergarten",
        "Kindergarten/Grade 1",
        "Grade 1",
        "Grade 2",
        "Grade 1/2",
        "Grade 3",
        "Grade 4",
        "Grade 3/4",
        "Grade 5",
        "Grade 6",
        "Grade 5/6",
        "Grade 7",
        "Grade 8",
        "Grade 7/8",
        "Grade 9",
        "Grade 10",
        "Grade 9/10",
        "Grade 11",
        "Grade 12",
        "Grade 11/12",
        "S1",
        "S2",
        "10 Essential",
        "10 Introduction to Applied and Pre-Calculus",
        "11 Applied",
        "11 Essential",
        "11 Pre-Calculus",
        "12 Applied",
        "12 Essential",
        "12 Pre-Calculus"
    ];

    constructor() {
        // wrapper div
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "label");

        // select
        this.select = document.createElement("select");
        this.select.id = this.id;

        this.options.forEach(opt => {
            const optionEl = document.createElement("option");
            optionEl.textContent = opt;
            optionEl.value = opt;
            this.select.appendChild(optionEl);
        });

        // label
        this.label = document.createElement("label");
        this.label.textContent = "Grade/Class";
        this.label.setAttribute("for", this.id);

        // assemble
        this.element.appendChild(this.select);
        this.element.appendChild(this.label);
    }

    getValue(): string {
        return this.select.value;
    }

    setValue(value: string) {
        this.select.value = value;
    }
}

class TimeLengthSelect implements LessonField<string> {
    element: HTMLDivElement;
    select: HTMLSelectElement;
    label: HTMLLabelElement;
    icon: HTMLElement;
    id: string = "time-length";

    private options: string[] = [
        "~ 15 minutes",
        "~ 20 minutes",
        "~ 25 minutes",
        "~ 30 minutes",
        "~ 35 minutes",
        "~ 40 minutes",
        "~ 45 minutes",
        "~ 50 minutes",
        "~ 55 minutes",
        "~ 1 hour",
        "~ 1 hour and 10 minutes",
        "~ 1 hour and 15 minutes",
        "~ 1 hour and 30 minutes",
        "~ 1 hour and 45 minutes",
        "~ 2 hours"
    ];

    constructor() {
        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "suffix", "label");

        // select
        this.select = document.createElement("select");
        this.select.id = this.id;

        this.options.forEach(opt => {
            const optionEl = document.createElement("option");
            optionEl.textContent = opt;
            optionEl.value = opt;
            this.select.appendChild(optionEl);
        });

        // label
        this.label = document.createElement("label");
        this.label.textContent = "Time";
        this.label.setAttribute("for", this.id);

        // icon
        this.icon = document.createElement("i");
        this.icon.textContent = "timer";

        // assemble
        this.element.appendChild(this.select);
        this.element.appendChild(this.label);
        this.element.appendChild(this.icon);
    }

    getValue(): string {
        return this.select.value;
    }

    setValue(value: string) {
        this.select.value = value;
    }
}

class DateField implements LessonField<string> {
    element: HTMLDivElement;
    input: HTMLInputElement;
    label: HTMLLabelElement;
    icon: HTMLElement;
    id: string = "date-time-picker";

    constructor() {
        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("field", "prefix", "border", "round", "label");

        // icon
        this.icon = document.createElement("i");
        this.icon.textContent = "event";

        // input
        this.input = document.createElement("input");
        this.input.type = "date";
        this.input.id = this.id;
        this.input.name = "date";

        // label
        this.label = document.createElement("label");
        this.label.textContent = "Date";
        this.label.setAttribute("for", this.id);

        // assemble
        this.element.appendChild(this.icon);
        this.element.appendChild(this.input);
        this.element.appendChild(this.label);
    }

    getValue(): string {
        return this.input.value;
    }

    setValue(value: string) {
        this.input.value = value;
    }
}

class CurricularOutcomesSection implements LessonField<string[]> {
    element: HTMLDivElement;
    header: HTMLHeadingElement;
    list: HTMLDivElement;
    addButton: HTMLButtonElement;
    onChange?: () => void;

    private outcomes: string[] = [];

    constructor() {
        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("s12", "m12", "l12");
        this.element.id = "curricular-outcomes";

        // header
        this.header = document.createElement("h5");
        this.header.textContent = "Curricular Outcomes";

        // list container
        this.list = document.createElement("div");
        this.list.id = "curricular-outcomes-list";

        // add button
        this.addButton = document.createElement("button");
        this.addButton.id = "add-curricular-outcome";
        this.addButton.innerHTML = `<i>add</i><span>Add Outcome</span>`;
        this.addButton.addEventListener("click", () => this.addOutcome());

        // assemble
        this.element.appendChild(this.header);
        this.element.appendChild(this.list);
        this.element.appendChild(this.addButton);
    }

    private addOutcome() {
        const outcome = prompt("Enter curricular outcome:");
        if (outcome && outcome.trim() !== "") {
            this.outcomes.push(outcome.trim());
            this.renderList();
            this.onChange?.();
        }
    }

    private renderList() {
        this.list.innerHTML = "";
        this.outcomes.forEach((outcome, index) => {
            const chip = document.createElement("button");
            chip.textContent = outcome;

            // delete button (small x)
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("chip", "tiny", "error", "circle");
            removeBtn.innerHTML = `<i>close</i>`;
            removeBtn.addEventListener("click", () => {
                this.outcomes.splice(index, 1);
                this.onChange?.();
                this.renderList();
            });

            chip.appendChild(removeBtn);
            this.list.appendChild(chip);
        });
    }

    getValues(): string[] {
        return this.outcomes;
    }

    getValue(): string[] {
        return this.getValues();
    }

    setValue(value: string[]) {
        this.setValues(value);
    }

    setValues(values: string[]) {
        this.outcomes = values;
        this.renderList();
    }
}

class ToastEditorField implements LessonField<string> {
    element: HTMLDivElement;
    editor: Editor;
    header: HTMLHeadingElement;
    id: string;

    constructor(id: string, labelText: string, helperText?: string) {
        this.id = id;

        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("s12", "m12", "l12", "toast-field");

        // header
        this.header = document.createElement("h6");
        this.header.textContent = labelText;
        this.header.setAttribute("for", this.id);
        this.element.appendChild(this.header);

        // helper (optional)
        if (helperText) {
            const helper = document.createElement("span");
            helper.classList.add("helper", "no-line");
            helper.textContent = helperText;
            this.element.appendChild(helper);
        }

        // container
        const editorContainer = document.createElement("div");
        editorContainer.id = this.id;
        this.element.appendChild(editorContainer);

        // theme
        const editorTheme = ui("mode") === "dark" ? "dark" : "light";
        const initialMarkdown = `
## Cross-Curricular/Real World Connections

<ul><li></li></ul>


| Materials and Resources | Student Specific Planning |
| ----------------------- | ------------------------- |
| Resources (referenced), handouts, ICT, equipment, etc.<ul><li></li></ul> | Considering students' readiness, interests, and learning profile, how will learning tasks for this lesson be differentiated?<ul><li></li></ul> |

## Learning Plan

| Phase | Description | Time |
| ----- | ----------- | ---- |
| Activate |  | 10 minutes |
| Acquire |  | 20 minutes |
| Apply |  | 25 minutes |
| Closure |  | 5 minutes |


## Reflections

<ul><li></li></ul>
`;
        // editor
        this.editor = new Editor({
            el: editorContainer,
            previewStyle: "vertical",
            height: "800px",
            initialEditType: "wysiwyg",
            initialValue: localStorage.getItem(this.id) || initialMarkdown,
            usageStatistics: false,
            theme: editorTheme,
        });

        // save changes
        this.editor.on("change", () => {
            localStorage.setItem(this.id, this.editor.getMarkdown());
        });
    }

    getValue(): string {
        return this.editor.getMarkdown();
    }

    setValue(value: string) {
        this.editor.setMarkdown(value);
    }
}

function loadUserTemplates(): LessonTemplate[] {
    return JSON.parse(localStorage.getItem("userTemplates") || "[]");
}

function saveUserTemplate(name: string, markdown: string) {
    const templates = loadUserTemplates();
    templates.push({ id: `user-${Date.now()}`, name, markdown });
    localStorage.setItem("userTemplates", JSON.stringify(templates));
}

class TemplateSelect {
    element: HTMLDivElement;
    select: HTMLSelectElement;

    constructor(onSelect: (t: LessonTemplate) => void) {
        this.element = document.createElement("div");
        this.element.classList.add("field", "border", "round", "label");

        this.select = document.createElement("select");
        this.refresh();

        this.select.addEventListener("change", () => {
            const templates = [...builtInTemplates, ...loadUserTemplates()];
            const selected = templates.find(t => t.id === this.select.value);
            if (selected) onSelect(selected);
        });

        const label = document.createElement("label");
        label.textContent = "Lesson Notes Template";
        this.element.appendChild(this.select);
        this.element.appendChild(label);
    }

    refresh() {
        const userTemplates = loadUserTemplates();
        this.select.innerHTML = `
          <option value="">Choose a template...</option>
          <optgroup label="Built-In">
            ${builtInTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
          </optgroup>
          <optgroup label="My Templates">
            ${userTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
          </optgroup>
        `;
    }
}
class SaveTemplateButton {
    element: HTMLButtonElement;

    constructor(notes: LessonNotesEditor, templateSelect: TemplateSelect) {
        this.element = document.createElement("button");
        this.element.classList.add("chip", "small", "border");
        this.element.innerHTML = `<i>save</i> <span>Save Current as Template</span>`;

        this.element.addEventListener("click", () => {
            const name = prompt("Enter a name for this template:");
            if (!name) return;
            saveUserTemplate(name, notes.getValue());
            templateSelect.refresh(); // update dropdown with new template
        });
    }
}


class LessonNotesEditor extends ToastEditorField {
    constructor() {
        super("lesson-notes", "Lesson Notes");
    }
}

class AssessmentEvidenceSection implements LessonField<AssessmentRow[]> {
    element: HTMLDivElement;
    header: HTMLHeadingElement;
    table: HTMLTableElement;
    tbody: HTMLTableSectionElement;
    addButton: HTMLButtonElement;
    onChange?: () => void;

    private rows: AssessmentRow[] = [];

    constructor() {
        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("s12", "m12", "l12");
        this.element.id = "assessment-evidence";

        // header
        this.header = document.createElement("h5");
        this.header.textContent = "Assessment Evidence";

        // table
        this.table = document.createElement("table");
        this.table.classList.add("border", "small-round");
        this.table.id = "assessment-evidence-table";

        // table head
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Description</th>
                <th class="min">FOR</th>
                <th class="min">AS</th>
                <th class="min">OF</th>
                <th class="min delete-row-button">Delete</th>
            </tr>
        `;

        // body
        this.tbody = document.createElement("tbody");

        this.table.appendChild(thead);
        this.table.appendChild(this.tbody);

        // add button
        this.addButton = document.createElement("button");
        this.addButton.id = "add-row-button";
        this.addButton.innerHTML = `<i>add</i><span>Add Assessment Evidence</span>`;
        this.addButton.addEventListener("click", () => this.addRow());

        // assemble
        this.element.appendChild(this.header);
        this.element.appendChild(this.table);
        this.element.appendChild(this.addButton);
    }

    addRow(description: string = "", forVal: boolean = false, asVal: boolean = false, ofVal: boolean = false) {
        const row = { description, for: forVal, as: asVal, of: ofVal };
        this.rows.push(row);
        this.onChange?.();
        this.render();
    }

    private removeRow(index: number) {
        this.rows.splice(index, 1);
        this.onChange?.();
        this.render();
    }

    private render() {
        this.tbody.innerHTML = "";
        this.rows.forEach((row, index) => {
            const tr = document.createElement("tr");

            // description
            const descTd = document.createElement("td");
            const descInput = document.createElement("input");
            descInput.type = "text";
            descInput.value = row.description;
            descInput.addEventListener("input", e => {
                row.description = (e.target as HTMLInputElement).value;
                this.onChange?.();
            });
            descTd.appendChild(descInput);

            // FOR
            const forTd = document.createElement("td");
            const forInput = document.createElement("input");
            forInput.type = "checkbox";
            forInput.checked = row.for;
            forInput.addEventListener("change", e => {
                row.for = (e.target as HTMLInputElement).checked;
                this.onChange?.();
            });
            forTd.appendChild(forInput);

            // AS
            const asTd = document.createElement("td");
            const asInput = document.createElement("input");
            asInput.type = "checkbox";
            asInput.checked = row.as;
            asInput.addEventListener("change", e => {
                row.as = (e.target as HTMLInputElement).checked;
                this.onChange?.();
            });
            asTd.appendChild(asInput);

            // OF
            const ofTd = document.createElement("td");
            const ofInput = document.createElement("input");
            ofInput.type = "checkbox";
            ofInput.checked = row.of;
            ofInput.addEventListener("change", e => {
                row.of = (e.target as HTMLInputElement).checked;
                this.onChange?.();
            });
            ofTd.appendChild(ofInput);

            // delete
            const deleteTd = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("chip", "transparent", "circle", "no-border");
            deleteBtn.innerHTML = `<i>close</i>`;
            deleteBtn.addEventListener("click", () => {
                this.removeRow(index);
                this.onChange?.();
            });
            deleteTd.appendChild(deleteBtn);

            tr.appendChild(descTd);
            tr.appendChild(forTd);
            tr.appendChild(asTd);
            tr.appendChild(ofTd);
            tr.appendChild(deleteTd);

            this.tbody.appendChild(tr);
        });
    }

    getValues() {
        return this.rows;
    }

    getValue() {
        return this.getValues();
    }


    setValues(values: AssessmentRow[]) {
        this.rows = values;
        this.render();
    }

    setValue(value: AssessmentRow[]): void {
        this.setValues(value);
    }
}

class ResourceLinksSection implements LessonField<string[]> {
    element: HTMLDivElement;
    header: HTMLHeadingElement;
    helper: HTMLSpanElement;
    list: HTMLDivElement;
    addButton: HTMLButtonElement;
    onChange?: () => void;

    private links: string[] = [];

    constructor() {
        // wrapper
        this.element = document.createElement("div");
        this.element.classList.add("s12", "m12", "l12");
        this.element.id = "resources-section";

        // header
        this.header = document.createElement("h5");
        this.header.textContent = "Resource Links";

        // helper text
        this.helper = document.createElement("span");
        this.helper.textContent = "Link to a resource, such as a website, PDF, or video.";

        // list container
        this.list = document.createElement("div");
        this.list.id = "resource-links";

        // add button
        this.addButton = document.createElement("button");
        this.addButton.id = "add-resource-link";
        this.addButton.innerHTML = `<i>add</i><span>Add Link</span>`;
        this.addButton.addEventListener("click", () => this.addLink());

        // assemble
        this.element.appendChild(this.header);
        this.element.appendChild(this.helper);
        this.element.appendChild(this.list);
        this.element.appendChild(this.addButton);
    }

    private addLink() {
        const url = prompt("Enter resource URL:");
        if (url) {
            this.links.push(url);
            this.onChange?.();
            this.render();
        }
    }

    private render() {
        this.list.innerHTML = "";
        this.links.forEach((link) => {
            const chip = document.createElement("div");
            chip.classList.add("chip");

            const anchor = document.createElement("a");
            anchor.href = link;
            anchor.target = "_blank";
            anchor.textContent = link;

            const removeBtn = document.createElement("button");
            removeBtn.classList.add("link", "no-border", "circle");
            removeBtn.innerHTML = `<i>close</i>`;
            removeBtn.addEventListener("click", () => {
                this.links.splice(this.links.indexOf(link), 1);
                this.onChange?.();
                this.render();
            });

            chip.appendChild(anchor);
            chip.appendChild(removeBtn);
            this.list.appendChild(chip);
        });
    }

    getValues() {
        return this.links;
    }

    getValue() {
        return this.getValues();
    }

    setValues(values: string[]) {
        this.links = values;
        this.render();
    }

    setValue(value: string[]): void {
        this.setValues(value);
    }
}

class LessonBuilder {
    constructor(
        private topic: TopicInput,
        private lessonName: LessonNameInput,
        private author: AuthorInput,
        private grade: GradeLevelSelect,
        private date: DateField,
        private time: TimeLengthSelect,
        private outcomes: CurricularOutcomesSection,
        private resources: ResourceLinksSection,
        private assessment: AssessmentEvidenceSection,
        private notes: LessonNotesEditor
    ) { }

    /** Builds markdown for the Preview */
    buildMarkdown(): string {
        return `
# ${this.lessonName.getValue() || "Untitled Lesson"}
*${this.topic.getValue() || ""}*
**Author:** ${this.author.getValue() || ""}
**Grade:** ${this.grade.getValue() || ""}
**Date:** ${this.date.getValue() || ""}
**Time:** ${this.time.getValue() || ""}

---

## Curricular Outcomes
${this.outcomes.getValue().map(o => `- ${o}`).join("\n") || "_None_"}

---

## Resource Links
${this.resources.getValue().map(l => `- [${l}](${l})`).join("\n") || "_None_"}

---

## Assessment Evidence
| Description | FOR | AS | OF |
|-------------|-----|----|----|
${this.assessment.getValue().map(r =>
            `| ${r.description} | ${r.for ? "✓" : ""} | ${r.as ? "✓" : ""} | ${r.of ? "✓" : ""} |`
        ).join("\n") || "| _No evidence yet_ |  |  |  |"}

---

## Lesson Notes
${this.notes.getValue() || "_Nothing yet_"}
        `;
    }
}


class Preview {
    private element: HTMLDivElement;
    private viewer: Viewer;

    constructor(containerId: string = "preview-pane") {
        const container = document.getElementById(containerId) as HTMLDivElement;
        if (!container) {
            throw new Error(`#${containerId} not found`);
        }

        this.element = container;

        const editorTheme = ui("mode") === "dark" ? "dark" : "light";
        // mount Toast UI Viewer into the container
        this.viewer = new Viewer({
            el: this.element,
            initialValue: "Nothing to preview yet...",
            usageStatistics: false,
            theme: editorTheme,
        });
    }

    update(markdown: string) {
        this.viewer.setMarkdown(markdown || "Nothing to preview yet...");
    }
}

function setupEditorPane() {
    const topicInput = new TopicInput();
    const lessonNameInput = new LessonNameInput();
    const authorInput = new AuthorInput();
    const gradeLevelSelect = new GradeLevelSelect();
    const dateField = new DateField();
    const timeLengthSelect = new TimeLengthSelect();
    const curricularOutcomesSection = new CurricularOutcomesSection();
    const resourceLinks = new ResourceLinksSection();
    const assessmentEvidence = new AssessmentEvidenceSection();
    const lessonNotes = new LessonNotesEditor();
    const templateSelect = new TemplateSelect((tpl) => {
        if (confirm(`Apply "${tpl.name}" template? This will replace current notes.`)) {
            lessonNotes.setValue(tpl.markdown);
        }
    });
    const saveTemplateBtn = new SaveTemplateButton(lessonNotes, templateSelect);

    const editorPane = document.getElementById("editor-pane")!;
    [
        topicInput,
        lessonNameInput,
        authorInput,
        gradeLevelSelect,
        dateField,
        timeLengthSelect,
        curricularOutcomesSection,
        resourceLinks,
        assessmentEvidence,
        templateSelect,
        saveTemplateBtn,
        lessonNotes
    ].forEach(f => editorPane.appendChild(f.element));

    const preview = new Preview("preview-pane");
    const builder = new LessonBuilder(
        topicInput,
        lessonNameInput,
        authorInput,
        gradeLevelSelect,
        dateField,
        timeLengthSelect,
        curricularOutcomesSection,
        resourceLinks,
        assessmentEvidence,
        lessonNotes
    );

    function updatePreview() {
        preview.update(builder.buildMarkdown());
    }

    // Attach listeners to each field
    [topicInput.input, lessonNameInput.input, authorInput.input, gradeLevelSelect.select,
    dateField.input, timeLengthSelect.select].forEach(el =>
        el.addEventListener("input", updatePreview)
    );

    lessonNotes.editor.on("change", updatePreview);

    // For outcomes/resources/assessment, you’d call updatePreview() at the end of their add/remove handlers:
    // e.g. in CurricularOutcomesSection.addOutcome() → after this.renderList(); call updatePreview()
    curricularOutcomesSection.onChange = updatePreview;
    resourceLinks.onChange = updatePreview;
    assessmentEvidence.onChange = updatePreview;

    updatePreview(); // initial
}


document.addEventListener("DOMContentLoaded", () => {
    const appearanceButton = document.getElementById("appearance-button") as HTMLButtonElement;
    appearanceButton.addEventListener("click", () => {
        new AppearanceDialog();
    });
    setupEditorPreviewToggle();
    setupEditorPane();
});
