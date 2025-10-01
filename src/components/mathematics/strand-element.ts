import { Strand } from "@models/strand";

export class StrandElement {
    element: HTMLElement;
    strand: Strand;

    constructor(strand: Strand) {
        this.strand = strand;
        const el = document.createElement("button");
        el.classList.add("strand", "tiny-margin", "chip");
        el.dataset.strandId = strand.id;
        el.dataset.strandName = strand.name;
        el.setAttribute("aria-pressed", "false");

        const icon = document.createElement("i");
        icon.innerHTML = strand.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${strand.id}] ${strand.name}`;

        el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (strand: Strand, el: StrandElement) => void) {
        this.element.addEventListener("click", () => handler(this.strand, this));
    }
}
