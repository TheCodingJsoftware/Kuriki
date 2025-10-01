import { GeneralLearningOutcome } from "@models/general-learning-outcome";

export class GeneralLearningOutcomeElement {
    element: HTMLElement;
    generalLearningOutcome: GeneralLearningOutcome;

    constructor(generalLearningOutcome: GeneralLearningOutcome) {
        this.generalLearningOutcome = generalLearningOutcome;
        const el = document.createElement("button");
        el.classList.add("skill", "tiny-margin", "chip");
        el.dataset.skillId = generalLearningOutcome.id;
        el.dataset.skillName = generalLearningOutcome.name;
        el.setAttribute("aria-pressed", "false");

        // const icon = document.createElement("i");
        // icon.innerHTML = skillType.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${generalLearningOutcome.id}] ${generalLearningOutcome.name}`;

        // el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (skill: GeneralLearningOutcome, el: GeneralLearningOutcomeElement) => void) {
        this.element.addEventListener("click", () => handler(this.generalLearningOutcome, this));
    }
}
