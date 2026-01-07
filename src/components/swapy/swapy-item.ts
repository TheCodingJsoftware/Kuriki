export interface ISwapySlot {
    id: string;
    element: HTMLElement;
}

export interface ISwapyItem {
    id: string;
    element: HTMLElement;
}


export class SwapyItem implements ISwapyItem {
    id: string;
    element: HTMLElement;

    constructor(id: string, content: HTMLElement) {
        this.id = id;

        const el = document.createElement("div");
        el.dataset.swapyItem = id;
        el.appendChild(content);

        this.element = el;
    }
}
