import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";
import { CURRICULA } from "@models/curricula";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { getSocialStudiesKeywords, highlightKeywords } from "@utils/keywords";
import { socialStudiesQuickSearchKeyWords } from "@utils/quick-search-words";
import { Storage } from "@utils/storage";

export class SocialStudiesOutcomeElement {
    element: HTMLElement;
    outcome: SocialStudiesOutcome;

    constructor(outcome: SocialStudiesOutcome) {
        this.outcome = outcome;

        const el = document.createElement("button");
        el.classList.add("social-studies", "left-align", "outcome", "responsive", "small-margin")
        el.dataset.outcomeId = outcome.outcomeId;
        el.dataset.grade = outcome.grade;
        el.dataset.specificLearningOutcome = outcome.specificLearningOutcome;

        const savedOutcomeId = Storage.get(`selectedOutcome:${outcome.grade}`, null);
        if (savedOutcomeId === outcome.outcomeId) {
            el.classList.add("selected");
        }

        const icon = document.createElement("i");
        icon.classList.add("hidden");
        icon.innerHTML = CURRICULA["social_studies_2003"].icon;
        el.appendChild(icon);

        const span = document.createElement("span");
        span.innerHTML = `<b>${outcome.outcomeId}</b>${getSocialStudiesKeywords(this.outcome)}`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "top", "max");

        const tooltipTitle = document.createElement("h6");
        tooltipTitle.innerText = outcome.outcomeId;

        const tooltipCluster = document.createElement("b");
        tooltipCluster.innerText = outcome.cluster.name;

        const tooltipDescription = document.createElement("p");
        tooltipDescription.innerHTML = highlightKeywords(
            `${outcome.specificLearningOutcome}`,
            socialStudiesQuickSearchKeyWords
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