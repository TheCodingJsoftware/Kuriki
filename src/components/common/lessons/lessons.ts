import { LessonsAPI } from "@api/lessons-api";
import { Outcome } from "@models/outcome";
import { enhanceLinks } from "@utils/enhance-links";

export class LessonListContainer {
    readonly element: HTMLDivElement;
    private readonly lessonList: HTMLOListElement;
    private readonly title: HTMLHeadingElement;
    private readonly outcome: Outcome;
    private observer?: IntersectionObserver;
    private loaded = false;
    private loading = false;
    private emptyMessage?: HTMLParagraphElement;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.element = document.createElement("div");
        this.element.classList.add("lesson-list-container", "top-padding");

        this.title = document.createElement("h5");
        this.title.innerText = "Lessons";
        this.element.appendChild(this.title);

        this.lessonList = document.createElement("ol");
        this.lessonList.classList.add("lesson-list", "no-space");
        this.element.appendChild(this.lessonList);

        this.setupLazyLoad();
    }

    private setupLazyLoad() {
        const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

        this.observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !this.loaded) {
                        this.loaded = true;
                        this.observer?.disconnect();
                        this.renderLessons();
                    }
                }
            },
            {
                root: detailsPanel || null,
                rootMargin: "0px 1000px 0px 1000px", // preload when within 500px horizontally
                threshold: 0.0
            }
        );

        this.observer.observe(this.element);
    }

    public async refresh() {
        this.loaded = false;
        await this.renderLessons(true);
    }

    private async renderLessons(force = false) {
        if (this.loading) return;
        this.loading = true;

        try {
            // reset content
            this.lessonList.innerHTML = "";
            this.title.innerText = "Lessons";
            this.emptyMessage?.remove();

            const lessons = await LessonsAPI.getByOutcome(this.outcome.outcomeId);

            const entries = Object.entries(lessons?.data ?? {});
            if (entries.length === 0) {
                this.showEmptyMessage("No lessons have been added yet.");
                return;
            }

            for (const [id, lesson] of entries) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.className = "link underline tiny-padding wave small-round";
                a.href = `lesson.html?id=${id}`;
                a.innerText = `${lesson.data.name}: ${lesson.data.topic} by ${lesson.data.author}`;
                a.title = a.innerText;

                const icon = document.createElement("i");
                icon.innerText = "open_in_new";
                a.appendChild(icon);

                li.appendChild(a);
                this.lessonList.appendChild(li);
            }

            enhanceLinks(50);
        } catch (err) {
            console.error("Failed to load lessons:", err);
            this.showEmptyMessage("Failed to load lessons. Please try again later.");
        } finally {
            this.loading = false;
            this.loaded = true;
        }
    }

    private showEmptyMessage(text: string) {
        this.emptyMessage = document.createElement("p");
        this.emptyMessage.classList.add("text-muted", "small", "tiny-padding");
        this.emptyMessage.innerText = text;
        this.element.appendChild(this.emptyMessage);
    }

    public render(): HTMLDivElement {
        return this.element;
    }
}
