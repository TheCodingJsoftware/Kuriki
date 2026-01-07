import { createSwapy } from "swapy";
import { SwapySlot } from "@components/swapy/swapy-slot";
import { SwapyItem } from "@components/swapy/swapy-item";
import { Signal } from "@utils/signal";

export class SwapyManager {
    private static instance: SwapyManager | null = null;
    public readonly onChanged = new Signal<any>();

    private container: HTMLElement;
    private swapy: any;

    private constructor(container: HTMLElement) {
        this.container = container;

        this.swapy = createSwapy(this.container, {
            animation: "spring",
            swapMode: "drop",
            autoScrollOnDrag: true,
        });
        this.swapy.enable(true);
        this.swapy.onSwap((event: any) => {
            this.onChanged.emit(event);
        });
    }

    static init(container: HTMLElement) {
        if (!SwapyManager.instance) {
            SwapyManager.instance = new SwapyManager(container);
        }
        return SwapyManager.instance;
    }

    static get() {
        if (!SwapyManager.instance) {
            throw new Error("SwapyManager not initialized yet.");
        }
        return SwapyManager.instance;
    }

    getItems() {
        return this.container.children;
    }

    createSlotWithItem(id: string, content: HTMLElement) {
        const item = new SwapyItem(id, content);
        const slot = new SwapySlot(id, item);

        this.container.appendChild(slot.element);
        this.update();

        return { slot, item };
    }

    update() {
        queueMicrotask(() => {
            if (this.swapy && !this.swapy.isDragging) {
                this.swapy.update();
            }
        });
    }
}
