import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css";
import "beercss";
import "material-dynamic-colors";

import { LessonsAPI, type LessonRecord } from "@api/lessons-api";
import { WorksheetsAPI, type WorksheetRecord } from "@api/worksheets-api"; // adjust if your type name differs

import { LessonCard } from "@components/lesson/card-element";
import { LessonList } from "@components/lesson/list-element";

import { WorksheetCard } from "@components/worksheet/card-element";
import { WorksheetList } from "@components/worksheet/list-element";

import { debounce } from "@utils/debounce";
import { builtInTemplates } from "@models/lesson-template";

type ViewMode = "grid" | "list";
type LibraryType = "lesson" | "worksheet";

type LibraryConfig<T> = {
    type: LibraryType;
    emptyText: string;

    getAll(): Promise<{ data: Record<string, T> }>;

    // used by filter
    toSearchText(item: T): string;

    // used by sort
    getTopic(item: T): string;
    getName(item: T): string;

    // used by render
    renderCard(id: string, item: T): HTMLElement;
    renderListItem(id: string, item: T): HTMLElement;
};

document.addEventListener("DOMContentLoaded", async () => {
    const libraryDiv = document.getElementById("library") as HTMLDivElement;
    const searchInput = document.querySelector("#search input") as HTMLInputElement;
    const gridButton = document.getElementById("grid-button") as HTMLButtonElement;
    const listButton = document.getElementById("list-button") as HTMLButtonElement;
    const loadingIndicator = document.getElementById("loading-indicator") as HTMLDivElement;

    const tabLesson = document.getElementById("tab-lesson") as HTMLAnchorElement;
    const tabWorksheet = document.getElementById("tab-worksheet") as HTMLAnchorElement;

    const backToTopButton = document.getElementById("back-to-top-button") as HTMLButtonElement;

    const createLessonPlanButton = document.getElementById("create-lesson-plan-button") as HTMLButtonElement;
    const createWorksheetButton = document.getElementById("create-worksheet-button") as HTMLButtonElement;

    let viewMode: ViewMode = (localStorage.getItem("libraryViewMode") as ViewMode) || "list";
    let libraryType: LibraryType = (localStorage.getItem("libraryType") as LibraryType) || "lesson";

    // Keep data cached per tab so switching tabs is instant
    const cache: Partial<Record<LibraryType, Record<string, unknown>>> = {};

    const lessonConfig: LibraryConfig<LessonRecord> = {
        type: "lesson",
        emptyText: "No lessons found.",
        getAll: () => LessonsAPI.getAll(),
        toSearchText: (lesson) => `
            ${lesson.data.name}
            ${lesson.data.topic}
            ${lesson.data.author}
            ${lesson.data.gradeLevel}
            ${(lesson.data.curricularOutcomes ?? []).join(" ")}
            ${(lesson.data.resourceLinks ?? []).join(" ")}
            ${lesson.data.notes ?? ""}
        `,
        getTopic: (lesson) => lesson.data.topic ?? "",
        getName: (lesson) => lesson.data.name ?? "",
        renderCard: (id, lesson) => new LessonCard(id, lesson).render(),
        renderListItem: (id, lesson) => new LessonList(id, lesson).render(),
    };

    const worksheetConfig: LibraryConfig<WorksheetRecord> = {
        type: "worksheet",
        emptyText: "No worksheets found.",
        getAll: () => WorksheetsAPI.getAll(),
        toSearchText: (ws) => `
            ${ws.data.name}
            ${ws.data.topic}
            ${ws.data.author}
            ${ws.data.gradeLevel}
            ${(ws.data.curricularOutcomes ?? []).join(" ")}
            ${ws.data.teacherNotes ?? ""}
        `,
        getTopic: (ws) => ws.data.topic ?? "",
        getName: (ws) => ws.data.name ?? "",
        renderCard: (id, ws) => new WorksheetCard(id, ws).render(),
        renderListItem: (id, ws) => new WorksheetList(id, ws).render(),
    };

    function getActiveConfig(): LibraryConfig<any> {
        return libraryType === "lesson" ? lessonConfig : worksheetConfig;
    }

    function setActiveTabUI() {
        // BeerCSS "active" works fine on <a>
        tabLesson?.classList.toggle("active", libraryType === "lesson");
        tabWorksheet?.classList.toggle("active", libraryType === "worksheet");
    }

    function setViewButtonsUI() {
        document.querySelectorAll("nav.group button").forEach(b => b.classList.remove("active"));
        const activeId = viewMode === "grid" ? "grid-button" : "list-button";
        document.getElementById(activeId)?.classList.add("active");
    }

    function filterRecords<T>(records: Record<string, T>, query: string, config: LibraryConfig<T>): Record<string, T> {
        const q = query.trim().toLowerCase();
        if (!q) return records;

        const filtered: Record<string, T> = {};
        for (const [id, item] of Object.entries(records)) {
            const haystack = config.toSearchText(item).toLowerCase();
            if (haystack.includes(q)) filtered[id] = item;
        }
        return filtered;
    }

    function render<T>(records: Record<string, T>, config: LibraryConfig<T>) {
        libraryDiv.innerHTML = "";

        const entries = Object.entries(records).sort(([, a], [, b]) => {
            const t = config.getTopic(a).localeCompare(config.getTopic(b), undefined, { numeric: true });
            if (t !== 0) return t;
            return config.getName(a).localeCompare(config.getName(b), undefined, { numeric: true });
        });

        if (!entries.length) {
            const p = document.createElement("p");
            p.textContent = config.emptyText;
            p.classList.add("s12");
            libraryDiv.appendChild(p);
            return;
        }

        const section = document.createElement("section");
        section.classList.add("border", "round", "padding", "s12");

        if (viewMode === "list") {
            section.classList.add("surface-container", "elevate");
            section.classList.remove("border");
        } else {
            section.classList.remove("surface-container");
        }

        if (viewMode === "grid") {
            section.classList.add("grid");
            for (const [id, item] of entries) section.appendChild(config.renderCard(id, item));
        } else {
            const ul = document.createElement("ul");
            ul.classList.add("list", "border", "s12");
            for (const [id, item] of entries) ul.appendChild(config.renderListItem(id, item));
            section.appendChild(ul);
        }

        libraryDiv.appendChild(section);
    }

    async function ensureLoaded(type: LibraryType) {
        if (cache[type]) return;

        const config = type === "lesson" ? lessonConfig : worksheetConfig;
        const res = await config.getAll();
        cache[type] = res.data as unknown as Record<string, unknown>;
    }

    async function refresh() {
        const config = getActiveConfig();

        libraryDiv.innerHTML = "";
        // Keep indicator if it exists
        loadingIndicator?.classList.remove("hidden");

        try {
            await ensureLoaded(config.type);

            const raw = cache[config.type] as Record<string, any>;
            const filtered = filterRecords(raw, searchInput.value, config);

            loadingIndicator?.remove();
            render(filtered, config);

            setActiveTabUI();
            setViewButtonsUI();
        } catch (err) {
            console.error("Failed to load library:", err);
            loadingIndicator?.remove();
            libraryDiv.innerHTML = `<p>Error loading ${config.type}s.</p>`;
        }
    }

    function setView(mode: ViewMode) {
        viewMode = mode;
        localStorage.setItem("libraryViewMode", mode);
        refresh();
    }

    function setType(type: LibraryType) {
        libraryType = type;
        localStorage.setItem("libraryType", type);
        refresh();
    }

    // initial
    setActiveTabUI();
    setViewButtonsUI();
    await refresh();

    // search
    searchInput.addEventListener("input", debounce(() => refresh(), 150));

    // view mode
    gridButton.addEventListener("click", () => setView("grid"));
    listButton.addEventListener("click", () => setView("list"));

    // tabs
    tabLesson?.addEventListener("click", (e) => {
        e.preventDefault();
        setType("lesson");
    });
    tabWorksheet?.addEventListener("click", (e) => {
        e.preventDefault();
        setType("worksheet");
    });

    // misc
    backToTopButton.addEventListener("click", () => window.scrollTo(0, 0));

    // create buttons stay as-is
    createLessonPlanButton.addEventListener("click", async () => {
        const idKey = Number(new Date().getTime().toString());

        const lessonData = {
            topic: "",
            name: "",
            author: localStorage.getItem("authorName") || "Anonymous",
            gradeLevel: "",
            date: new Date().toISOString(),
            timeLength: "~ 1 hour",
            teacherNotes: "",
            curricularOutcomes: [],
            resourceLinks: [],
            assessmentEvidence: [],
            notes: builtInTemplates[0]!.markdown,
        };

        await LessonsAPI.post(idKey, lessonData, []);
        window.open(`/lesson.html?id=${idKey}`, "_blank");
    });

    createWorksheetButton.addEventListener("click", async () => {
        const idKey = Number(new Date().getTime().toString());

        const worksheetData = {
            topic: "",
            name: "",
            author: localStorage.getItem("authorName") || "Anonymous",
            gradeLevel: "",
            date: new Date().toISOString(),
            teacherNotes: "",
            curricularOutcomes: [],
            blocks: [],
        };

        await WorksheetsAPI.post(idKey, worksheetData, []);
        window.open(`/worksheet.html?id=${idKey}`, "_blank");
    });
});
