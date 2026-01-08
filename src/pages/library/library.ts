import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css";
import "beercss";
import "material-dynamic-colors";

import { enhanceLinks } from "@utils/enhance-links";
import { LessonsAPI, type LessonRecord } from "@api/lessons-api";
import { WorksheetsAPI, type WorksheetRecord } from "@api/worksheets-api";

import { LessonCard } from "@components/lesson/card-element";
import { LessonList } from "@components/lesson/list-element";

import { WorksheetCard } from "@components/worksheet/card-element";
import { WorksheetList } from "@components/worksheet/list-element";

import { debounce } from "@utils/debounce";
import { builtInTemplates } from "@models/lesson-template";

import { ResourceAPI } from "@api/resources-api";
import { OutcomeFinder } from "@utils/outcome-finder";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { MathematicsOutcomeElement } from "@components/mathematics/outcome-element";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";
import { OutcomeCardDialog } from "@components/common/dialogs/outcome-card-dialog";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesOutcomeElement } from "@components/social_studies/outcome-element";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { BiologyOutcomeElement } from "@components/biology/outcome-element";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { ScienceOutcome } from "@models/science-outcome";
import { ScienceOutcomeElement } from "@components/science/outcome-element";
import { ScienceOutcomeCard } from "@components/science/card-element";

type ViewMode = "grid" | "list";
type LibraryType = "lesson" | "worksheet" | "resources";

type LibraryConfig<T> = {
    type: Exclude<LibraryType, "resources">;
    emptyText: string;

    getAll(): Promise<{ data: Record<string, T> }>;

    toSearchText(item: T): string;

    getTopic(item: T): string;
    getName(item: T): string;

    renderCard(id: string, item: T): HTMLElement;
    renderListItem(id: string, item: T): HTMLElement;
};

type OutcomeResources = Record<string, string[]>;

document.addEventListener("DOMContentLoaded", async () => {
    const libraryDiv = document.getElementById("library") as HTMLDivElement;
    const searchInput = document.querySelector("#search input") as HTMLInputElement;
    const searchOutput = document.querySelector("#search output") as HTMLOutputElement | null;

    const gridButton = document.getElementById("grid-button") as HTMLButtonElement;
    const listButton = document.getElementById("list-button") as HTMLButtonElement;
    const loadingIndicator = document.getElementById("loading-indicator") as HTMLDivElement;

    const tabLesson = document.getElementById("tab-lesson") as HTMLAnchorElement;
    const tabWorksheet = document.getElementById("tab-worksheet") as HTMLAnchorElement;
    const tabResources = document.getElementById("tab-resources") as HTMLAnchorElement;

    const backToTopButton = document.getElementById("back-to-top-button") as HTMLButtonElement;

    const createLessonPlanButton = document.getElementById("create-lesson-plan-button") as HTMLButtonElement;
    const createWorksheetButton = document.getElementById("create-worksheet-button") as HTMLButtonElement;

    let viewMode: ViewMode = (localStorage.getItem("libraryViewMode") as ViewMode) || "list";
    let libraryType: LibraryType = (localStorage.getItem("libraryType") as LibraryType) || "lesson";

    // Cache per tab
    const cache: Partial<Record<LibraryType, Record<string, unknown>>> = {};
    let resources: OutcomeResources | null = null;

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
        tabLesson?.classList.toggle("active", libraryType === "lesson");
        tabWorksheet?.classList.toggle("active", libraryType === "worksheet");
        tabResources?.classList.toggle("active", libraryType === "resources");
    }

    function updateSearchHint() {
        if (!searchOutput) return;

        if (libraryType === "lesson") {
            searchOutput.textContent = "Search: name, topic, author, grade, outcomes, links, notes";
        } else if (libraryType === "worksheet") {
            searchOutput.textContent = "Search: name, topic, author, grade, outcomes, teacher notes";
        } else {
            searchOutput.textContent = "Search: outcome code or URL";
        }
    }

    function setViewButtonsUI() {
        const isResources = libraryType === "resources";

        // resources is always a list
        gridButton.disabled = isResources;
        listButton.disabled = isResources;

        document.querySelectorAll("nav.group button").forEach(b => b.classList.remove("active"));
        if (!isResources) {
            const activeId = viewMode === "grid" ? "grid-button" : "list-button";
            document.getElementById(activeId)?.classList.add("active");
        }
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
    async function renderResources(data: OutcomeResources, query: string) {
        libraryDiv.innerHTML = "";

        const q = query.trim().toLowerCase();

        const entries = Object.entries(data)
            .filter(([outcomeId, links]) => {
                if (!q) return true;
                const hay = `${outcomeId}\n${links.join("\n")}`.toLowerCase();
                return hay.includes(q);
            })
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

        if (!entries.length) {
            const p = document.createElement("p");
            p.textContent = "No resources found.";
            p.classList.add("s12");
            libraryDiv.appendChild(p);
            return;
        }

        // Optional wrapper so layout is consistent (and still separated by articles)
        const wrapper = document.createElement("div");
        wrapper.classList.add("grid", "s12", "border", "round", "padding"); // or just "s12" if you don't want a grid

        for (const [id, links] of entries) {
            const outcome = await OutcomeFinder.getById(id);
            if (!outcome) continue;

            let outcomeElement: HTMLElement | null = null;

            if (outcome instanceof MathematicsOutcome) {
                const el = new MathematicsOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new MathematicsOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                });
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof SocialStudiesOutcome) {
                const el = new SocialStudiesOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new SocialStudiesOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                });
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof BiologyOutcome) {
                const el = new BiologyOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new BiologyOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                });
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof ScienceOutcome) {
                const el = new ScienceOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new ScienceOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                });
                el.showIcon();
                outcomeElement = el.render();
            } else {
                continue;
            }

            // ✅ One container per outcome
            const article = document.createElement("article");
            article.classList.add("round", "border", "padding", "s12", "m6", "l6");

            outcomeElement.classList.add("s12");
            outcomeElement.querySelector(".tooltip")?.classList.add("bottom")
            article.appendChild(outcomeElement);

            const ul = document.createElement("ul");
            ul.classList.add("list", "border", "s12");

            for (const url of links) {
                const li = document.createElement("li");
                li.className = "wave";

                const div = document.createElement("div");
                div.className = "row max";
                const a = document.createElement("a");
                a.className = "max left-align link";
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.dataset.url = url;
                a.textContent = url;
                a.setAttribute("referrer", "noopener noreferrer");
                div.appendChild(a);

                const icon = document.createElement("i");
                icon.textContent = "open_in_new";
                div.appendChild(icon);

                li.appendChild(div);
                ul.appendChild(li);
            }

            article.appendChild(ul);
            wrapper.appendChild(article);
        }

        libraryDiv.appendChild(wrapper);
        enhanceLinks(75);
    }


    async function ensureLoaded(type: Exclude<LibraryType, "resources">) {
        if (cache[type]) return;

        const config = type === "lesson" ? lessonConfig : worksheetConfig;
        const res = await config.getAll();
        cache[type] = res.data as unknown as Record<string, unknown>;
    }

    async function refresh() {
        setActiveTabUI();
        updateSearchHint();
        setViewButtonsUI();

        // Resources tab (always list)
        if (libraryType === "resources") {
            libraryDiv.innerHTML = "";
            loadingIndicator?.classList.remove("hidden");

            try {
                if (!resources) {
                    const res = await ResourceAPI.getAll();
                    // API returns { status, data: Record<string, string[]> }
                    resources = res.data as OutcomeResources;
                }

                loadingIndicator?.remove();
                renderResources(resources, searchInput.value);
            } catch (err) {
                console.error("Failed to load resources:", err);
                loadingIndicator?.remove();
                libraryDiv.innerHTML = "<p>Error loading resources.</p>";
            }

            return;
        }

        // Lessons / Worksheets
        const config = getActiveConfig();

        libraryDiv.innerHTML = "";
        loadingIndicator?.classList.remove("hidden");

        try {
            await ensureLoaded(config.type);

            const raw = cache[config.type] as Record<string, any>;
            const filtered = filterRecords(raw, searchInput.value, config);

            loadingIndicator?.remove();
            render(filtered, config);
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

    tabResources?.addEventListener("click", (e) => {
        e.preventDefault();
        setType("resources");
    });

    // misc
    backToTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });


    // create buttons
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
