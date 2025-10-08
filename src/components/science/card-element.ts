import { highlightKeywords } from "@utils/keywords";
import { scienceQuickSearchKeywords } from "@utils/quick-search-words";
import { ClusterElement } from "./cluster-element";
import { ScienceOutcome } from "@models/science-outcome";
import { OutcomeCard } from "@components/common/cards/outcome-card-element";

export class ScienceOutcomeCard extends OutcomeCard {
    outcome: ScienceOutcome;

    constructor(outcome: ScienceOutcome) {
        super(outcome);
        this.outcome = outcome;

        // --- Tags ---
        const clusterElement = new ClusterElement(this.outcome.cluster);
        this.tags.appendChild(clusterElement.element);

        // --- Specific Learning Outcome ---
        this.specificLearningOutcome.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            scienceQuickSearchKeywords
        );

        // --- General Learning Outcomes ---
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(`<strong>${glo.id}:</strong> ${glo.name}`, scienceQuickSearchKeywords);
            this.generalLearningOutcomes.appendChild(li);
        });
    }

    public render(): HTMLElement {
        return this.element;
    }
}
