import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";
import { BiologyOutcome } from "@models/biology-outcome";
import { getBiologyKeywords, highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";

export class BiologyOutcomeElement {
    element: HTMLElement;
    outcome: BiologyOutcome;

    constructor(outcome: BiologyOutcome) {
        this.outcome = outcome;

        const el = document.createElement("button");
        el.classList.add("left-align", "outcome", "responsive", "small-margin")
        el.dataset.outcomeId = outcome.outcomeId;
        el.dataset.grade = outcome.grade;
        el.dataset.specificLearningOutcome = outcome.specificLearningOutcome;
        el.dataset.generalLearningOutcome = outcome.generalLearningOutcomes.join(', ');
        el.dataset.unit = outcome.unit.name;

        const span = document.createElement("span");
        span.innerHTML = `<b>${outcome.outcomeId}</b>${getBiologyKeywords(this.outcome)}`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "top", "max");

        const tooltipTitle = document.createElement("h6");
        tooltipTitle.innerText = outcome.outcomeId;

        const tooltipCluster = document.createElement("b");
        tooltipCluster.innerText = outcome.unit.name;

        const tooltipDescription = document.createElement("p");
        tooltipDescription.innerHTML = highlightKeywords(
            `${outcome.specificLearningOutcome} [${outcome.generalLearningOutcomes.map(glo => glo.id).join(", ")}]`,
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
        tooltip.appendChild(tooltipCluster);
        tooltip.appendChild(tooltipDescription);
        tooltip.appendChild(tooltipActions);

        el.appendChild(span);
        el.appendChild(tooltip);

        this.element = el;
    }

    render(): HTMLElement {
        return this.element;
    }
}