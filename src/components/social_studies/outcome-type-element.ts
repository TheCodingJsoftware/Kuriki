import { OutcomeType } from "@models/outcome-type";

export class OutcomeTypeElement {
    element: HTMLElement;
    outcomeType: OutcomeType;

    constructor(outcomeType: OutcomeType) {
        this.outcomeType = outcomeType;
        const el = document.createElement("button");
        el.classList.add("outcome-type", "tiny-margin", "chip");
        el.dataset.outcomeTypeId = outcomeType.id;
        el.dataset.outcomeTypeName = outcomeType.name;
        el.setAttribute("aria-pressed", "false");

        // const icon = document.createElement("i");
        // icon.innerHTML = outcomeTypeType.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${outcomeType.id}] ${outcomeType.name}`;

        // el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (outcomeType: OutcomeType, el: OutcomeTypeElement) => void) {
        this.element.addEventListener("click", () => handler(this.outcomeType, this));
    }
}
