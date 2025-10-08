import type { LessonRecord } from "@api/lessons-api";
import type { ILesson } from "@models/lesson";

export class LessonCard {
    readonly element: HTMLElement;
    readonly header: HTMLElement;
    readonly title: HTMLHeadingElement;
    readonly meta: HTMLDivElement;
    readonly footer: HTMLElement;
    readonly lessonId: string;
    readonly lesson: LessonRecord;

    constructor(lessonId: string, lesson: LessonRecord) {
        this.lessonId = lessonId;
        this.lesson = lesson;

        const data: ILesson = this.lesson.data;

        // ---------- Container ----------
        const container = document.createElement("article");
        container.classList.add("lesson-card", "border", "round", "elevate", "s12", "m6", "l4");

        // ---------- Header ----------
        this.header = document.createElement("header");
        this.header.classList.add("row", "align-center");

        this.title = document.createElement("h4");
        this.title.classList.add("max");
        this.title.innerText = data.name || "Untitled Lesson";

        const tags = document.createElement("nav")
        tags.classList.add("row", "wrap", "no-space")

        const tagEntries: Record<string, string> = {
            "person_3": data.author,
            "grade": data.gradeLevel,
            "time": data.timeLength,
        }

        for (const [icon, label] of Object.entries(tagEntries)) {
            const tag = document.createElement("button");
            tag.classList.add("chip", "tiny-margin");
            tag.innerHTML = `<i>${icon}</i><span>${label}</span>`;
            tags.appendChild(tag);
        }

        for (const outcome of data.curricularOutcomes) {
            const tag = document.createElement("button");
            tag.classList.add("chip", "tiny-margin");
            tag.innerHTML = `<i>${icon}</i><span>${label}</span>`;
            tags.appendChild(tag);
        }

        // ---------- Outcomes ----------
        const outcomesContainer = document.createElement("ul");
        outcomesContainer.classList.add("outcomes", "text-small");
        if (data.curricularOutcomes.length > 0) {
            for (const id of data.curricularOutcomes.slice(0, 3)) {
                const li = document.createElement("li");
                li.textContent = id;
                outcomesContainer.appendChild(li);
            }
            if (data.curricularOutcomes.length > 3) {
                const li = document.createElement("li");
                li.textContent = `+ ${data.curricularOutcomes.length - 3} more...`;
                outcomesContainer.appendChild(li);
            }
        } else {
            const li = document.createElement("li");
            li.textContent = "No outcomes selected";
            outcomesContainer.appendChild(li);
        }

        // ---------- Footer ----------
        this.footer = document.createElement("footer");
        this.footer.classList.add("row", "right-align", "bottom");

        const openButton = document.createElement("button");
        openButton.innerHTML = `< i > open_in_new < /i><span>Open</span > `;

        openButton.addEventListener("click", () => {
            window.open(`/ lesson.html ? id = ${this.lessonId} `, "_blank");
        });

        this.footer.append(openButton);

        // ---------- Assemble ----------
        container.append(this.header, this.meta, outcomesContainer, this.footer);

        this.element = container;
    }

    public render(): HTMLElement {
        return this.element;
    }
}
