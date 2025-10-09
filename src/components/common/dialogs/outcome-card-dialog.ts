import { DialogComponent } from "@components/common/dialogs/dialog-component";

export class OutcomeCardDialog extends DialogComponent {
    private readonly card: HTMLElement;

    constructor(card: HTMLElement) {
        super({
            id: "outcome-card-dialog",
            title: "Outcome",
            bodyContent: `<div id="card-container">

            </div>`,
        });
        this.card = card;
        this.init();
    }

    init() {
        const cardContainer = this.element.querySelector("#card-container") as HTMLElement;
        cardContainer.appendChild(this.card);

        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }
}
