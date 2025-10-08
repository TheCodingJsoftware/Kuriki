import { highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { SkillElement } from "./skill-element";
import { StrandElement } from "./strand-element";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { OutcomeCard } from "@components/common/cards/outcome-card-element";

export class MathematicsOutcomeCard extends OutcomeCard {
    outcome: MathematicsOutcome;

    constructor(outcome: MathematicsOutcome) {
        super(outcome);
        this.outcome = outcome;

        // --- Tags ---
        const strandElement = new StrandElement(this.outcome.strand);
        // if (selectedStrands.has(this.outcome.strand.id)) {
        //     strandElement.setSelected(true);
        // }
        this.tags.appendChild(strandElement.element);

        for (const skill of this.outcome.skills) {
            const skillElement = new SkillElement(skill);
            // if (selectedSkills.has(skill.id)) {
            //     skillElement.setSelected(true);
            // }
            this.tags.appendChild(skillElement.element);
        }

        // --- Specific Learning Outcome ---
        this.specificLearningOutcome.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            mathematicsQuickSearchKeyWords
        );

        // --- General Learning Outcomes ---
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(glo, mathematicsQuickSearchKeyWords);
            this.generalLearningOutcomes.appendChild(li);
        });
    }

    public render(): HTMLElement {
        return this.element;
    }
}
