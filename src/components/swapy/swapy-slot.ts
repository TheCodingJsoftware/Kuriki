import { ISwapySlot, SwapyItem } from "@components/swapy/swapy-item";

export class SwapySlot implements ISwapySlot {
    id: string;
    element: HTMLElement;

    constructor(id: string, item: SwapyItem) {
        this.id = id;

        const slot = document.createElement("div");
        slot.classList.add("slot")
        slot.setAttribute("data-swapy-slot", `slot-${id}`);

        slot.appendChild(item.element);

        this.element = slot;
    }

    setItem(item: SwapyItem) {
        this.element.innerHTML = "";
        this.element.appendChild(item.element);
    }
}
