import { Signal } from "@utils/signal";
import { WorksheetsAPI } from "@api/worksheets-api";
import { Outcome } from "@models/outcome";

export class CreateWorksheetButton {
    readonly button: HTMLButtonElement;
    readonly onClick = new Signal<{ key: string; value: boolean }>();
    readonly onWorksheetCreated = new Signal<number>();
    private readonly outcome: Outcome;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.button = document.createElement("button");
        this.button.id = `${outcome}-create-worksheet`;
        this.button.title = "Create Worksheet";
        this.button.classList.add("create-worksheet-button", "border");

        const icon = document.createElement("i");
        icon.textContent = "add";

        const label = document.createElement("span");
        label.textContent = "Create Worksheet";

        this.button.appendChild(icon);
        this.button.appendChild(label);

        this.button.addEventListener("click", async () => {
            const idKey = Number(new Date().getTime().toString());

            const worksheetData = {
                topic: "",
                name: "",
                author: localStorage.getItem("authorName") || "Anonymous",
                gradeLevel: this.outcome.grade,
                date: new Date().toISOString(),
                curricularOutcomes: [this.outcome.outcomeId],
                teacherNotes: "",
                blocks: [],
                font: "system",
                fontSize: 12
            };

            const outcomes = [this.outcome.outcomeId];

            await WorksheetsAPI.post(idKey, worksheetData, outcomes);

            window.location.href = `/worksheet.html?id=${idKey}`;

            this.onWorksheetCreated.emit(idKey);
        });
    }

    render(): HTMLButtonElement {
        return this.button;
    }
}
