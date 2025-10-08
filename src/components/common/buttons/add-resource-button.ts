import { Signal } from "@utils/signal";
import { ResourceAPI } from "@api/resources-api";

export class AddResourceButton {
    readonly button: HTMLButtonElement;
    readonly onClick = new Signal<{ key: string; value: boolean }>();
    readonly onResourceAdded = new Signal<string>();
    private readonly outcomeId: string;

    constructor(outcomeId: string) {
        this.outcomeId = outcomeId;

        this.button = document.createElement("button");
        this.button.id = `${this.outcomeId}-add-resource`;
        this.button.title = "Add Resource";
        this.button.classList.add("add-resource-button", "border");

        const icon = document.createElement("i");
        icon.textContent = "add";

        const label = document.createElement("span");
        label.textContent = "Add Resource";

        this.button.appendChild(icon);
        this.button.appendChild(label);

        this.button.addEventListener("click", async () => {
            const resourceLink = prompt("Enter resource link");
            if (!resourceLink) return;

            try {
                await ResourceAPI.post(resourceLink, this.outcomeId);
                this.onResourceAdded.emit(resourceLink); // ✅ emit success
            } catch (err) {
                console.error("Failed to add resource:", err);
                alert("Failed to add resource.");
            }
        });
    }

    render(): HTMLButtonElement {
        return this.button;
    }
}
