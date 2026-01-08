import { WorksheetRecord } from "@api/worksheets-api";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { OutcomeCardDialog } from "@components/common/dialogs/outcome-card-dialog";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";
import { ScienceOutcomeCard } from "@components/science/card-element";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { ScienceOutcome } from "@models/science-outcome";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { IWorksheet } from "@models/worksheet";
import { OutcomeFinder } from "@utils/outcome-finder";

export class WorksheetCard {
    readonly element: HTMLElement;
    readonly header: HTMLElement;
    readonly title: HTMLSpanElement;
    readonly subtitle: HTMLSpanElement;
    readonly footer: HTMLElement;
    readonly outcomesContainer: HTMLElement;
    readonly lessonId: string;
    readonly lesson: WorksheetRecord;

    constructor(worksheetId: string, worksheet: WorksheetRecord) {
        this.lessonId = worksheetId;
        this.lesson = worksheet;

        const data: IWorksheet = this.lesson.data;

        // ---------- Container ----------
        const container = document.createElement("article");
        container.classList.add("lesson-card", "border", "round", "s12", "m6", "l4");

        // ---------- Header ----------
        this.header = document.createElement("header");
        this.header.classList.add("vertical", "align-center");

        this.title = document.createElement("span");
        this.title.classList.add("bold", "large-text");
        this.title.innerText = data.name || "Untitled Lesson";

        this.subtitle = document.createElement("span");
        this.subtitle.classList.add("italic");
        this.subtitle.innerText = `${data.topic || "No topic"} - by ${data.author}`;

        this.header.appendChild(this.title);
        this.header.appendChild(this.subtitle);

        // ---------- Outcomes ----------
        this.outcomesContainer = document.createElement("nav");
        this.outcomesContainer.classList.add("outcomes", "row", "wrap", "no-space");

        if (data.curricularOutcomes.length === 0) {
            const chip = document.createElement("span");
            chip.classList.add("chip");
            chip.innerText = "No outcomes";
            this.outcomesContainer.appendChild(chip);
        } else {
            for (const id of data.curricularOutcomes) {
                const chip = document.createElement("button");
                chip.classList.add("chip", "tiny-margin");
                chip.innerText = id;
                chip.addEventListener("click", async () => {
                    const outcome = await OutcomeFinder.getById(id);
                    if (outcome instanceof MathematicsOutcome) {
                        const card = new MathematicsOutcomeCard(outcome);
                        new OutcomeCardDialog(card.render());
                    } else if (outcome instanceof SocialStudiesOutcome) {
                        const card = new SocialStudiesOutcomeCard(outcome);
                        new OutcomeCardDialog(card.render());
                    } else if (outcome instanceof BiologyOutcome) {
                        const card = new BiologyOutcomeCard(outcome);
                        new OutcomeCardDialog(card.render());
                    } else if (outcome instanceof ScienceOutcome) {
                        const card = new ScienceOutcomeCard(outcome);
                        new OutcomeCardDialog(card.render());
                    } else {
                        return;
                    }
                });
                this.outcomesContainer.appendChild(chip);
            }
        }

        // ---------- Footer ----------
        this.footer = document.createElement("footer");
        this.footer.classList.add("row", "right-align", "bottom");

        const openButton = document.createElement("a");
        openButton.classList.add("button");
        openButton.innerHTML = `<i>open_in_new</i><span>Open</span>`;
        openButton.href = `/lesson.html?id=${this.lessonId}`

        this.footer.append(openButton);

        // ---------- Assemble ----------
        container.append(this.header, this.outcomesContainer, this.footer);

        this.element = container;
    }

    public render(): HTMLElement {
        return this.element;
    }
}
