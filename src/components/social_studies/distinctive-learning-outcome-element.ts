import { DistinctiveLearningOutcome } from "@models/distinctive-learning-outcome";

export class DistinctiveLearningOutcomeElement {
    element: HTMLElement;
    distinctiveLearningOutcome: DistinctiveLearningOutcome;

    constructor(distinctiveLearningOutcome: DistinctiveLearningOutcome) {
        this.distinctiveLearningOutcome = distinctiveLearningOutcome;
        const el = document.createElement("button");
        el.classList.add("skill", "tiny-margin", "chip");
        el.dataset.skillId = distinctiveLearningOutcome.id;
        el.dataset.skillName = distinctiveLearningOutcome.name;
        el.setAttribute("aria-pressed", "false");

        // const icon = document.createElement("i");
        // icon.innerHTML = skillType.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${distinctiveLearningOutcome.id}] ${distinctiveLearningOutcome.name}`;

        // el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (skill: DistinctiveLearningOutcome, el: DistinctiveLearningOutcomeElement) => void) {
        this.element.addEventListener("click", () => handler(this.distinctiveLearningOutcome, this));
    }
}
