import { Unit } from "@models/unit";

export class UnitElement {
    element: HTMLElement;
    unit: Unit;

    constructor(unit: Unit) {
        this.unit = unit;
        const el = document.createElement("button");
        el.classList.add("unit", "tiny-margin", "chip");
        el.dataset.unitId = unit.id;
        el.dataset.unitName = unit.name;
        el.setAttribute("aria-pressed", "false");

        // const icon = document.createElement("i");
        // icon.innerHTML = unit.getIcon();

        const span = document.createElement("span");
        span.innerText = `${unit.name}`;

        // el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (unit: Unit, el: UnitElement) => void) {
        this.element.addEventListener("click", () => handler(this.unit, this));
    }
}
