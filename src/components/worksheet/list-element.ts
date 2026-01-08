import type { WorksheetRecord } from "@api/worksheets-api";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { OutcomeCardDialog } from "@components/common/dialogs/outcome-card-dialog";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";
import { ScienceOutcomeCard } from "@components/science/card-element";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { ScienceOutcome } from "@models/science-outcome";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { OutcomeFinder } from "@utils/outcome-finder";
import { IWorksheet } from "@models/worksheet";

export class WorksheetList {
    readonly element: HTMLElement;
    readonly header: HTMLElement;
    readonly title: HTMLSpanElement;
    readonly subtitle: HTMLSpanElement;
    readonly outcomesContainer: HTMLElement;
    readonly worksheet: WorksheetRecord;
    readonly worksheetId: string;

    constructor(worksheetId: string, worksheet: WorksheetRecord) {
        this.worksheetId = worksheetId;
        this.worksheet = worksheet;
        const data: IWorksheet = this.worksheet.data;

        const container = document.createElement("li");
        container.classList.add("worksheet-list-item", "wave");
        container.addEventListener("click", () => {
            window.location.href = `/worksheet.html?id=${this.worksheetId}`;
        })

        this.header = document.createElement("div");
        this.header.classList.add("max");

        this.title = document.createElement("h6");
        this.title.classList.add("bold", "small", "wrap");
        this.title.innerText = data.name || "Untitled Worksheet";

        this.subtitle = document.createElement("div");
        this.subtitle.classList.add("italic", "wrap");
        this.subtitle.innerText = `${data.topic || "No topic"} - by ${data.author}`;

        this.header.appendChild(this.title);
        this.header.appendChild(this.subtitle);

        container.appendChild(this.header);

        // ----- Outcomes as chips -----
        this.outcomesContainer = document.createElement("div");
        this.outcomesContainer.classList.add("row", "no-space", "scroll");

        if (data.curricularOutcomes.length === 0) {
            const chip = document.createElement("button");
            chip.classList.add("chip");
            chip.innerText = "No outcomes";
            this.outcomesContainer.appendChild(chip);
        } else {
            for (const id of data.curricularOutcomes) {
                const chip = document.createElement("button");
                chip.classList.add("chip", "tiny-margin");
                chip.innerText = id;
                chip.addEventListener("click", async (event) => {
                    event.stopPropagation();
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

        this.header.append(this.outcomesContainer);

        // ----- Right column (open button) -----
        // const openButton = document.createElement("a");
        // openButton.classList.add("button");
        // openButton.innerHTML = `<i>open_in_new</i><span>Open</span>`;
        // openButton.href = `/lesson.html?id=${this.lessonId}`;

        // container.append(openButton);

        this.element = container;
    }

    render(): HTMLElement {
        return this.element;
    }
}
