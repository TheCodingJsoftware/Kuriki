import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";
import { CURRICULA } from "@models/curricula";
import { ScienceOutcome } from "@models/science-outcome";
import { getScienceKeywords, highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { Storage } from "@utils/storage";

export class ScienceOutcomeElement {
    element: HTMLElement;
    outcome: ScienceOutcome;

    constructor(outcome: ScienceOutcome) {
        this.outcome = outcome;

        const el = document.createElement("button");
        el.classList.add("science", "left-align", "outcome", "responsive", "small-margin")
        el.dataset.outcomeId = outcome.outcomeId;
        el.dataset.grade = outcome.grade;
        el.dataset.specificLearningOutcome = outcome.specificLearningOutcome;
        el.dataset.generalLearningOutcome = outcome.generalLearningOutcomes.join(', ');
        el.dataset.cluster = outcome.cluster.name;

        const savedOutcomeId = Storage.get(`selectedOutcome:${outcome.grade}`, null);
        if (savedOutcomeId === outcome.outcomeId) {
            el.classList.add("selected");
        }

        const icon = document.createElement("i");
        icon.classList.add("hidden");
        icon.innerHTML = CURRICULA["science_1999-2000"].icon;
        el.appendChild(icon);

        const span = document.createElement("span");
        span.innerHTML = `<b>${outcome.outcomeId}</b>${getScienceKeywords(this.outcome)}`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "top", "max");

        const tooltipTitle = document.createElement("h6");
        tooltipTitle.innerText = outcome.outcomeId;

        const tooltipCluster = document.createElement("b");
        tooltipCluster.innerText = outcome.cluster.name;

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

    showIcon() {
        this.element.querySelector("i")!.classList.remove("hidden");
    }

    hideIcon() {
        this.element.querySelector("i")!.classList.add("hidden");
    }
}