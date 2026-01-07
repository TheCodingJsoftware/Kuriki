

import { SelectOutcomesDialog } from "@components/common/dialogs/select-outcomes-dialog";
import { Outcome } from "@models/outcome";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { MathematicsOutcomeElement } from "@components/mathematics/outcome-element";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesOutcomeElement } from "@components/social_studies/outcome-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { BiologyOutcomeElement } from "@components/biology/outcome-element";
import { ScienceOutcome } from "@models/science-outcome";
import { ScienceOutcomeElement } from "@components/science/outcome-element";
import { OutcomeFinder } from "@utils/outcome-finder";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { ScienceOutcomeCard } from "@components/science/card-element";
import { OutcomeCardDialog } from "@components/common/dialogs/outcome-card-dialog";
import { LessonField } from "./field";

export class CurricularOutcomesSection implements LessonField<string[]> {
    element: HTMLElement;
    header: HTMLHeadingElement;
    list: HTMLDivElement;
    addButton: HTMLButtonElement;
    onChange?: () => void;

    private outcomes: Map<string, Outcome> = new Map();

    constructor() {
        // wrapper
        this.element = document.createElement("article");
        this.element.classList.add("s12", "m12", "l12", "border", "round");
        this.element.id = "curricular-outcomes";

        // header
        this.header = document.createElement("h5");
        this.header.textContent = "Curricular Outcomes";

        // list container
        this.list = document.createElement("div");
        this.list.id = "curricular-outcomes-list";

        // add button
        this.addButton = document.createElement("button");
        this.addButton.id = "add-curricular-outcome";
        this.addButton.innerHTML = `<i>add</i><span>Add Outcome</span>`;
        this.addButton.addEventListener("click", () => this.addOutcome());

        // assemble
        this.element.appendChild(this.header);
        this.element.appendChild(this.list);
        this.element.appendChild(this.addButton);
    }

    /** Add outcome(s) via dialog, ensuring no duplicates */
    private async addOutcome() {
        const selectOutcomes = new SelectOutcomesDialog();
        const outcomes = await selectOutcomes.open();
        if (outcomes && outcomes.length) {
            for (const outcome of outcomes) {
                if (!this.outcomes.has(outcome.outcomeId)) {
                    this.outcomes.set(outcome.outcomeId, outcome);
                }
            }
            this.renderList();
            this.onChange?.();
        }
    }

    /** Render all outcomes with delete buttons */
    private renderList() {
        this.list.innerHTML = "";

        for (const outcome of this.outcomes.values()) {
            let outcomeElement: HTMLElement;

            if (outcome instanceof MathematicsOutcome) {
                const el = new MathematicsOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new MathematicsOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                })
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof SocialStudiesOutcome) {
                const el = new SocialStudiesOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new SocialStudiesOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                })
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof BiologyOutcome) {
                const el = new BiologyOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new BiologyOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                });
                el.showIcon();
                outcomeElement = el.render();
            } else if (outcome instanceof ScienceOutcome) {
                const el = new ScienceOutcomeElement(outcome);
                el.element.addEventListener("click", () => {
                    const card = new ScienceOutcomeCard(outcome);
                    new OutcomeCardDialog(card.render());
                })
                el.showIcon();
                outcomeElement = el.render();
            } else {
                continue;
            }

            outcomeElement.classList.remove("responsive");
            outcomeElement.classList.add("max");

            const wrapper = document.createElement("div");
            wrapper.classList.add("outcome-wrapper", "row", 'tiny-space', "no-margin");

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("chip", "circle", "error");
            deleteBtn.innerHTML = `<i>delete</i>`;

            deleteBtn.addEventListener("click", () => {
                this.outcomes.delete(outcome.outcomeId);
                this.renderList();
                this.onChange?.();
            });

            wrapper.appendChild(outcomeElement);
            wrapper.appendChild(deleteBtn);
            this.list.appendChild(wrapper);
        }
    }

    /** Returns full Outcome objects */
    getOutcomes(): Outcome[] {
        return Array.from(this.outcomes.values());
    }

    /** Returns only outcome IDs for saving */
    getValues(): string[] {
        return Array.from(this.outcomes.keys());
    }

    getValue(): string[] {
        return this.getValues();
    }

    setValue(value: string[]) {
        this.setValues(value);
    }

    /** Load outcome objects by their IDs */
    async setValues(values: string[]) {
        this.outcomes.clear();
        for (const id of values) {
            const outcome = await OutcomeFinder.getById(id);
            if (outcome) this.outcomes.set(id, outcome);
        }
        this.renderList();
    }
}