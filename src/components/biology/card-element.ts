import { highlightKeywords } from "@utils/keywords";
import { biologyQuickSearchKeywords } from "@utils/quick-search-words";
import { UnitElement } from "./unit-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { OutcomeCard } from "@components/common/cards/outcome-card-element";

export class BiologyOutcomeCard extends OutcomeCard {
    outcome: BiologyOutcome;

    constructor(outcome: BiologyOutcome) {
        super(outcome);
        this.outcome = outcome;

        // --- Tags ---
        const unitElement = new UnitElement(this.outcome.unit);
        this.tags.appendChild(unitElement.element);

        // --- Specific Learning Outcome ---
        this.specificLearningOutcome.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            biologyQuickSearchKeywords
        );

        // --- General Learning Outcomes ---
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(`<strong>${glo.id}:</strong> ${glo.name}`, biologyQuickSearchKeywords);
            this.generalLearningOutcomes.appendChild(li);
        });
    }

    public render(): HTMLElement {
        return this.element;
    }
}
