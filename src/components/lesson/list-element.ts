import type { LessonRecord } from "@api/lessons-api";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { BiologyOutcomeElement } from "@components/biology/outcome-element";
import { OutcomeCardDialog } from "@components/common/dialogs/outcome-card-dialog";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";
import { MathematicsOutcomeElement } from "@components/mathematics/outcome-element";
import { ScienceOutcomeCard } from "@components/science/card-element";
import { ScienceOutcomeElement } from "@components/science/outcome-element";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { SocialStudiesOutcomeElement } from "@components/social_studies/outcome-element";
import { BiologyOutcome } from "@models/biology-outcome";
import type { ILesson } from "@models/lesson";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { ScienceOutcome } from "@models/science-outcome";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { OutcomeFinder } from "@utils/outcome-finder";

export class LessonList {
    readonly element: HTMLElement;
    readonly header: HTMLElement;
    readonly lessonName: HTMLSpanElement;
    readonly topicTitle: HTMLSpanElement;
    readonly author: HTMLSpanElement;
    readonly outcomesContainer: HTMLElement;
    readonly lessonId: string;
    readonly lesson: LessonRecord;

    constructor(lessonId: string, lesson: LessonRecord) {
        this.lessonId = lessonId;
        this.lesson = lesson;

        const data: ILesson = this.lesson.data;

        // ---------- Container ----------
        const container = document.createElement("div");
        container.classList.add("lesson-list", "wave");

        const details = document.createElement("details");
        container.appendChild(details);

        const summary = document.createElement("summary");
        summary.classList.add("row", "align-center");
        details.appendChild(summary);

        // ---------- Header ----------
        this.header = document.createElement("header");
        this.header.classList.add("vertical", "align-center");

        this.lessonName = document.createElement("span");
        this.lessonName.classList.add("bold", "wrap");
        this.lessonName.innerText = data.name || "Untitled Lesson";

        this.topicTitle = document.createElement("span");
        this.topicTitle.classList.add("italic", "wrap");
        this.topicTitle.innerText = data.topic;

        this.author = document.createElement("span");
        this.author.classList.add("italic", "wrap");
        this.author.innerText = `by ${data.author}`;

        this.header.appendChild(this.lessonName);
        this.header.appendChild(this.topicTitle);
        this.header.appendChild(this.author);

        const spacer = document.createElement("div");
        spacer.classList.add("max");

        this.outcomesContainer = document.createElement("nav")
        this.outcomesContainer.classList.add("row", "wrap", "no-space", "padding")

        // ---------- Outcomes ----------
        if (data.curricularOutcomes.length === 0) {
            const p = document.createElement("p");
            p.textContent = "No outcomes selected";
            this.outcomesContainer.appendChild(p);
        }

        const openButton = document.createElement("a");
        openButton.classList.add("button");
        openButton.innerHTML = `<i>open_in_new</i><span>Open</span>`;
        openButton.href = `/lesson.html?id=${this.lessonId}`

        summary.appendChild(this.header);
        summary.appendChild(spacer);
        summary.append(openButton);

        // ---------- Assemble ----------
        details.append(summary);
        details.append(this.outcomesContainer);

        const headerRow = document.createElement("hr");

        container.appendChild(headerRow);

        this.element = container;

        this.loadOutcomes();
    }

    async loadOutcomes() {
        if (this.lesson.data.curricularOutcomes.length === 0) {
            return;
        }

        this.outcomesContainer.innerHTML = '';
        for (const id of this.lesson.data.curricularOutcomes) {

            const outcome = await OutcomeFinder.getById(id);
            let outcomeElement: HTMLElement;

            if (outcome instanceof MathematicsOutcome) {
                const el = new MathematicsOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new MathematicsOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                })
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof SocialStudiesOutcome) {
                const el = new SocialStudiesOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new SocialStudiesOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                })
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
                })
                el.showIcon();
                outcomeElement = el.render();
            } else {
                continue;
            }

            this.outcomesContainer.appendChild(outcomeElement);
        }
    }

    public render(): HTMLElement {
        return this.element;
    }
}
