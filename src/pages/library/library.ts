import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css";
import "beercss";
import "material-dynamic-colors";
import { LessonRecord, LessonsAPI } from "@api/lessons-api";
import { LessonCard } from "@components/lesson/card-element";
import { LessonList } from "@components/lesson/list-element";
import { debounce } from "@utils/debounce";

type ViewMode = "grid" | "list";

document.addEventListener("DOMContentLoaded", async () => {
    const libraryDiv = document.getElementById("library") as HTMLDivElement;
    const searchInput = document.querySelector("#search input") as HTMLInputElement;
    const gridButton = document.getElementById("grid-button") as HTMLButtonElement;
    const listButton = document.getElementById("list-button") as HTMLButtonElement;
    const loadingIndicator = document.getElementById("loading-indicator") as HTMLDivElement;

    let viewMode: ViewMode = (localStorage.getItem("libraryViewMode") as ViewMode) || "list";
    let lessons: Record<string, LessonRecord> = {};

    function filterLessons(query: string): Record<string, LessonRecord> {
        const q = query.trim().toLowerCase();
        if (!q) return lessons;

        const filtered: Record<string, LessonRecord> = {};
        for (const [id, lesson] of Object.entries(lessons)) {
            const haystack = `
                ${lesson.data.name}
                ${lesson.data.topic}
                ${lesson.data.author}
                ${lesson.data.gradeLevel}
                ${lesson.data.curricularOutcomes.join(" ")}
                ${lesson.data.resourceLinks.join(" ")}
                ${lesson.data.notes}
            `.toLowerCase();

            if (haystack.includes(q)) filtered[id] = lesson;
        }
        return filtered;
    }

    function render(list: Record<string, LessonRecord>) {
        libraryDiv.innerHTML = "";

        const entries = Object.entries(list).sort(([, a], [, b]) => {
            const nameCompare = a.data.topic.localeCompare(b.data.topic, undefined, { numeric: true });
            if (nameCompare !== 0) return nameCompare;
            return a.data.name.localeCompare(b.data.name, undefined, { numeric: true });
        });

        if (!entries.length) {
            const p = document.createElement("p");
            p.textContent = "No lessons found.";
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
            for (const [id, lesson] of entries) {
                const card = new LessonCard(id, lesson);
                section.appendChild(card.render());
            }
        } else {
            const ul = document.createElement("ul");
            ul.classList.add("list", "border", "s12");
            for (const [id, lesson] of entries) {
                const listItem = new LessonList(id, lesson);
                ul.appendChild(listItem.render());
            }
            section.appendChild(ul);
        }

        libraryDiv.appendChild(section);
    }

    function setView(mode: ViewMode) {
        viewMode = mode;
        localStorage.setItem("libraryViewMode", mode);
        render(filterLessons(searchInput.value));
        document.querySelectorAll("nav.group button").forEach(b => b.classList.remove("active"));
        const activeId = mode === "grid" ? "grid-button" : "list-button";
        document.getElementById(activeId)?.classList.add("active");
    }

    try {
        const res = await LessonsAPI.getAll();
        lessons = res.data;
        loadingIndicator?.remove();
        render(lessons);
        setView(viewMode);
    } catch (err) {
        console.error("Failed to load lessons:", err);
        loadingIndicator?.remove();
        libraryDiv.innerHTML = "<p>Error loading lessons.</p>";
    }

    searchInput.addEventListener("input", debounce(() => {
        render(filterLessons(searchInput.value));
    }));

    gridButton.addEventListener("click", () => setView("grid"));
    listButton.addEventListener("click", () => setView("list"));
});
