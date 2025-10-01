import { highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { SkillElement } from "./skill-element";
import { StrandElement } from "./strand-element";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";

export class MathematicsOutcomeCard {
    private outcome: MathematicsOutcome;
    public element: HTMLElement;

    constructor(outcome: MathematicsOutcome) {
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

        const strandElement = new StrandElement(this.outcome.strand);
        // if (selectedStrands.has(this.outcome.strand.id)) {
        //     strandElement.setSelected(true);
        // }
        skills.appendChild(strandElement.element);

        for (const skill of this.outcome.skills) {
            const skillElement = new SkillElement(skill);
            // if (selectedSkills.has(skill.id)) {
            //     skillElement.setSelected(true);
            // }
            skills.appendChild(skillElement.element);
        }

        // Description
        const description = document.createElement("p");
        description.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            mathematicsQuickSearchKeyWords
        );

        // General Learning Outcomes list
        const list = document.createElement("ul");
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(glo, mathematicsQuickSearchKeyWords);
            list.appendChild(li);
        });

        // Copy button
        const copyOutcome = document.createElement("button");
        copyOutcome.innerText = "Copy Outcome";
        copyOutcome.addEventListener("click", () => {
            navigator.clipboard.writeText(this.outcome.toString());
            new CopiedOutcomeSnackbar();
        });

        // Append children
        container.appendChild(title);
        container.appendChild(skills);
        container.appendChild(description);
        container.appendChild(list);
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