import { highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { ClusterElement } from "./cluster-element";
import { DistinctiveLearningOutcomeElement } from "./distinctive-learning-outcome-element";
import { GeneralLearningOutcomeElement } from './general-learning-outcome-element';
import { OutcomeTypeElement } from "./outcome-type-element";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";

export class SocialStudiesOutcomeCard {
    private outcome: SocialStudiesOutcome;
    public element: HTMLElement;

    constructor(outcome: SocialStudiesOutcome) {
        this.outcome = outcome;

        const container = document.createElement("article");
        container.classList.add("outcome-details", "round", "border", "large-width");
        container.dataset.outcomeId = this.outcome.outcomeId;

        // Title
        const title = document.createElement("h6");
        title.innerText = `${this.outcome.outcomeId}${this.getKeywords()}`;

        // Skills + Strand row
        const elements = document.createElement("nav");
        elements.classList.add("row", "wrap", "no-space");

        const clusterElement = new ClusterElement(this.outcome.cluster);
        // if (selectedStrands.has(this.outcome.strand.id)) {
        //     strandElement.setSelected(true);
        // }
        elements.appendChild(clusterElement.element);

        const outcomeTypeElement = new OutcomeTypeElement(this.outcome.outcomeType);
        // if (selectedSkills.has(skill.id)) {
        //     skillElement.setSelected(true);
        // }
        elements.appendChild(outcomeTypeElement.element);

        const generalLearningOutcomeElement = new GeneralLearningOutcomeElement(this.outcome.generalLearningOutcome);
        // if (selectedSkills.has(skill.id)) {
        //     skillElement.setSelected(true);
        // }
        elements.appendChild(generalLearningOutcomeElement.element);

        if (this.outcome.distinctiveLearningOutcome.id) {
            const distinctiveLearningOutcome = new DistinctiveLearningOutcomeElement(this.outcome.distinctiveLearningOutcome);
            // if (selectedSkills.has(skill.id)) {
            //     skillElement.setSelected(true);
            // }
            elements.appendChild(distinctiveLearningOutcome.element);
        }

        // for (const skill of this.outcome.skills) {
        // const skillElement = new SkillElement(skill);
        // if (selectedSkills.has(skill.id)) {
        //     skillElement.setSelected(true);
        // }
        // skills.appendChild(skillElement.element);
        // }

        // Description
        const description = document.createElement("p");
        description.classList.add("medium-width")
        description.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            mathematicsQuickSearchKeyWords
        );

        // General Learning Outcomes list
        // const list = document.createElement("ul");
        // this.outcome.generalLearningOutcomes.forEach(glo => {
        //     const li = document.createElement("li");
        //     li.innerHTML = highlightKeywords(glo, mathematicsQuickSearchKeyWords);
        //     list.appendChild(li);
        // });

        // Copy button
        const copyOutcome = document.createElement("button");
        copyOutcome.innerText = "Copy Outcome";
        copyOutcome.addEventListener("click", () => {
            navigator.clipboard.writeText(this.outcome.toString());
            new CopiedOutcomeSnackbar();
        });

        // Append children
        container.appendChild(title);
        container.appendChild(elements);
        container.appendChild(description);
        // container.appendChild(list);
        container.appendChild(copyOutcome);

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