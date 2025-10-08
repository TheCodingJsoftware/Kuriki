import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";
import { CURRICULA } from "@models/curricula";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { getMathematicsKeywords, highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { Storage } from "@utils/storage";

export class MathematicsOutcomeElement {
    element: HTMLElement;
    outcome: MathematicsOutcome;

    constructor(outcome: MathematicsOutcome) {
        this.outcome = outcome;

        const el = document.createElement("button");
        el.classList.add("mathematics", "left-align", "outcome", "responsive", "small-margin")
        el.dataset.outcomeId = outcome.outcomeId;
        el.dataset.grade = outcome.grade;
        el.dataset.specificLearningOutcome = outcome.specificLearningOutcome;
        el.dataset.generalLearningOutcome = outcome.generalLearningOutcomes.join(', ');
        el.dataset.strand = outcome.strand.name;

        const savedOutcomeId = Storage.get(`selectedOutcome:${outcome.grade}`, null);
        if (savedOutcomeId === outcome.outcomeId) {
            el.classList.add("selected");
        }

        const icon = document.createElement("i");
        icon.classList.add("hidden");
        icon.innerHTML = CURRICULA["mathematics_2013-2014"].icon;
        el.appendChild(icon);

        const span = document.createElement("span");
        span.innerHTML = `<strong>${outcome.outcomeId}</strong>${getMathematicsKeywords(this.outcome)}`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "top", "max");

        const tooltipTitle = document.createElement("h6");
        tooltipTitle.innerText = outcome.outcomeId;

        const tooltipStrand = document.createElement("b");
        tooltipStrand.innerText = outcome.strand.name;

        const tooltipDescription = document.createElement("p");
        tooltipDescription.innerHTML = highlightKeywords(
            `${outcome.specificLearningOutcome} [${outcome.skills.toArray().map(s => s.id).join(", ")}]`,
            mathematicsQuickSearchKeyWords
        );

        const tooltipActions = document.createElement("nav");
        const copyOutcome = document.createElement("a");
        copyOutcome.classList.add("inverse-link");
        copyOutcome.innerText = "Copy Outcome";
        copyOutcome.addEventListener("click", (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(this.outcome.toString());
            new CopiedOutcomeSnackbar();
        });

        tooltipActions.appendChild(copyOutcome);

        tooltip.appendChild(tooltipTitle);
        tooltip.appendChild(tooltipStrand);
        tooltip.appendChild(tooltipDescription);
        tooltip.appendChild(tooltipActions);

        el.appendChild(span);
        el.appendChild(tooltip);

        this.element = el;
    }

    render(): HTMLElement {
        return this.element;
    }

    showTooltip() {
        this.element.querySelector(".tooltip")!.classList.remove("hidden");
    }

    hideTooltip() {
        this.element.querySelector(".tooltip")!.classList.add("hidden");
    }

    showIcon() {
        this.element.querySelector("i")!.classList.remove("hidden");
    }

    hideIcon() {
        this.element.querySelector("i")!.classList.add("hidden");
    }
}