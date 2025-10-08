import { LessonsAPI } from "@api/lessons-api";
import { Outcome } from "@models/outcome";
import { enhanceLinks } from "@utils/enhance-links";

export class LessonListContainer {
    readonly element: HTMLDivElement;
    readonly resourceList: HTMLOListElement;
    private readonly outcome: Outcome;
    private observer?: IntersectionObserver;
    private loaded = false;

    constructor(outcome: Outcome) {
        this.outcome = outcome;
        this.element = document.createElement("div");
        this.element.classList.add("resource-list-container");

        this.resourceList = document.createElement("ol");

        // Lazy-load resources when visible
        this.setupLazyLoad();
    }

    private setupLazyLoad() {
        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !this.loaded) {
                    this.loaded = true;
                    this.observer?.disconnect(); // Stop observing
                    this.loadLessons();
                }
            }
        }, {
            rootMargin: "100px", // preload a bit before entering view
            threshold: 0.1,
        });

        this.observer.observe(this.element);
    }

    private async loadLessons() {
        try {
            const lessons = await LessonsAPI.getByOutcome(this.outcome.outcomeId);

            const title = document.createElement("h5");
            title.classList.add("top-padding");
            title.innerText = "Lessons";
            this.element.appendChild(title);

            this.resourceList.classList.add("resource-list", "no-space");
            this.element.appendChild(this.resourceList);

            if (!lessons?.data || Object.keys(lessons.data).length === 0) {
                this.element.classList.add("hidden");
                return;
            }

            for (const [id, lesson] of Object.entries(lessons.data)) {
                const li = document.createElement("li");

                const a = document.createElement("a");
                a.className = "link underline tiny-padding wave small-round";
                a.href = `lesson.html?id=${id}`;
                a.target = "_blank";
                a.innerText = `${lesson.data.name}: ${lesson.data.topic} by ${lesson.data.author}`;

                const icon = document.createElement("i");
                icon.innerText = "open_in_new";
                a.appendChild(icon);

                li.appendChild(a);
                this.resourceList.appendChild(li);
            }
            enhanceLinks(50);
        } catch (err) {
            console.error("Failed to load resources:", err);
        }
    }

    render(): HTMLDivElement {
        return this.element;
    }
}
