import { highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words"; // consider renaming this to `socialStudiesQuickSearchKeywords`
import { ClusterElement } from "./cluster-element";
import { DistinctiveLearningOutcomeElement } from "./distinctive-learning-outcome-element";
import { GeneralLearningOutcomeElement } from "./general-learning-outcome-element";
import { OutcomeTypeElement } from "./outcome-type-element";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { OutcomeCard } from "@components/common/cards/outcome-card-element";

export class SocialStudiesOutcomeCard extends OutcomeCard {
    outcome: SocialStudiesOutcome;

    constructor(outcome: SocialStudiesOutcome) {
        super(outcome);
        this.outcome = outcome;

        // --- Tags ---
        const clusterElement = new ClusterElement(this.outcome.cluster);
        this.tags.appendChild(clusterElement.element);

        const outcomeTypeElement = new OutcomeTypeElement(this.outcome.outcomeType);
        this.tags.appendChild(outcomeTypeElement.element);

        const generalLearningOutcomeElement = new GeneralLearningOutcomeElement(this.outcome.generalLearningOutcome);
        this.tags.appendChild(generalLearningOutcomeElement.element);

        if (this.outcome.distinctiveLearningOutcome.id) {
            const distinctiveLearningOutcome = new DistinctiveLearningOutcomeElement(
                this.outcome.distinctiveLearningOutcome
            );
            this.tags.appendChild(distinctiveLearningOutcome.element);
        }

        // --- Specific Learning Outcome ---
        this.specificLearningOutcome.classList.add("medium-width");
        this.specificLearningOutcome.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            mathematicsQuickSearchKeyWords
        );
    }

    public render(): HTMLElement {
        return this.element;
    }
}
