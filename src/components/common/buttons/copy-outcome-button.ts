import { Signal } from "@utils/signal";
import { CopiedOutcomeSnackbar } from "@components/common/snackbar/outcome-copied";

export class CopyOutcomeButton {
    readonly button: HTMLButtonElement;
    readonly onClick = new Signal<{ key: string; value: boolean }>()
    private readonly textToCopy: string

    constructor(textToCopy: string) {
        this.textToCopy = textToCopy;

        this.button = document.createElement("button");
        this.button.classList.add("border");
        this.button.title = "Copy Outcome";

        const icon = document.createElement("i");
        icon.textContent = "content_copy";

        const label = document.createElement("span");
        label.textContent = "Copy Outcome";

        this.button.appendChild(icon);
        this.button.appendChild(label);

        this.button.addEventListener("click", () => {
            navigator.clipboard.writeText(this.textToCopy);
            new CopiedOutcomeSnackbar();
        });
    }

    render(): HTMLButtonElement {
        return this.button;
    }
}
