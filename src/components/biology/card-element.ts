import { highlightKeywords } from "@utils/keywords";
import { scienceQuickSearchKeywords } from "@utils/quick-search-words";
import { UnitElement } from "./unit-element";
import { BiologyOutcome } from "@models/biology-outcome";

export class BiologyOutcomeCard {
    private outcome: BiologyOutcome;
    public element: HTMLElement;

    constructor(outcome: BiologyOutcome) {
        this.outcome = outcome;

        const container = document.createElement("article");
        container.classList.add("outcome-details", "round", "border", "large-width");
        container.dataset.outcomeId = this.outcome.outcomeId;

        // Title
        const title = document.createElement("h6");
        title.innerText = `${this.outcome.outcomeId}${this.getKeywords()}`;

        // Skills + Strand row
        const skills = document.createElement("nav");
        skills.classList.add("row", "wrap", "no-space");

        const unitElement = new UnitElement(this.outcome.unit);
        // if (selectedStrands.has(this.outcome.strand.id)) {
        //     strandElement.setSelected(true);
        // }
        skills.appendChild(unitElement.element);

        // Description
        const description = document.createElement("p");
        description.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            scienceQuickSearchKeywords
        );

        // General Learning Outcomes list
        const list = document.createElement("ul");
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(glo.name, scienceQuickSearchKeywords);
            list.appendChild(li);
        });

        // Copy button
        const copyBtn = document.createElement("button");
        copyBtn.innerText = "Copy Outcome";
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(
                `${this.outcome.outcomeId} ${this.outcome.specificLearningOutcome} [${this.outcome.generalLearningOutcomes.map(glo => glo.id).join(", ")}]`
            );
        });

        // Append children
        container.appendChild(title);
        container.appendChild(skills);
        container.appendChild(description);
        container.appendChild(list);
        container.appendChild(copyBtn);

        this.element = container;
    }

    public render(): HTMLElement {
        return this.element;
    }

    private getKeywords(): string {
        // placeholder: if you have a getKeywords util, call it here
        return "";
    }
}