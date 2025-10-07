import Fuse from "fuse.js";
import { DialogComponent } from "@components/common/dialogs/dialog-component";
import { SocialStudiesRepo } from "@api/social-studies-repo";
import { MathematicsRepo } from "@api/mathematics-repo";
import { BiologyRepo } from "@api/biology-repo";
import { ScienceRepo } from "@api/science-repo";
import { Outcome } from "@models/outcome";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { BiologyOutcome } from "@models/biology-outcome";
import { ScienceOutcome } from "@models/science-outcome";
import { MathematicsOutcomeElement } from '@components/mathematics/outcome-element';
import { SocialStudiesOutcomeElement } from "@components/social_studies/outcome-element";
import { BiologyOutcomeElement } from "@components/biology/outcome-element";
import { ScienceOutcomeElement } from "@components/science/outcome-element";
import { debounce } from "@utils/debounce";

export class SelectOutcomesDialog extends DialogComponent {
    private fuse: Fuse<Outcome> | null = null;
    private allOutcomes: Outcome[] = [];
    private selected: Set<string> = new Set();
    private resolver?: (value: Outcome[]) => void;

    MAX_RESULTS = 50;

    constructor() {
        super({
            id: "select-outcomes-dialog",
            title: "Select Outcomes",
            bodyContent: `
            <div>
                <div class="margin field label prefix border fill round responsive" id="search">
                    <i>search</i>
                    <input type="text">
                    <label for="search">Search outcomes</label>
                </div>
                <p>Select one or more outcomes below:</p>
                <div id="results"></div>
            </div>`,
            footerContent: `
                <nav class="no-margin bottom right-align surface-container-high">
                    <button class="button border" id="cancel-btn">Cancel</button>
                    <button class="button primary" id="done-btn">Done</button>
                </nav>`,
            isModal: true,
        });
    }

    /** Open the dialog modally and return selected outcomes when done */
    open(): Promise<Outcome[]> {
        return new Promise<Outcome[]>((resolve) => {
            this.resolver = resolve;
            this.init();
        });
    }

    /** Close and resolve modal result */
    private resolveAndClose(outcomes: Outcome[]) {
        if (this.resolver) this.resolver(outcomes);
        super.close();
    }

    async init() {
        const searchInput = this.element.querySelector("#search input") as HTMLInputElement;
        const doneBtn = this.element.querySelector("#done-btn") as HTMLButtonElement;
        const cancelBtn = this.element.querySelector("#cancel-btn") as HTMLButtonElement;

        await this.getAllOutcomes();

        searchInput.addEventListener("input", debounce(() => {
            this.search(searchInput.value);
        }, 150));

        doneBtn.addEventListener("click", () => {
            this.resolveAndClose(this.getSelectedOutcomes());
        });
        cancelBtn.addEventListener("click", () => {
            this.resolveAndClose([]);
        });

        setTimeout(() => searchInput.focus(), 200);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }

    async getAllOutcomes() {
        const [ss, math, bio, sci] = await Promise.all([
            SocialStudiesRepo.getOutcomes(),
            MathematicsRepo.getOutcomes(),
            BiologyRepo.getOutcomes(),
            ScienceRepo.getOutcomes(),
        ]);

        this.allOutcomes = [...ss, ...math, ...bio, ...sci];
        this.fuse = new Fuse(this.allOutcomes, {
            keys: ["specificLearningOutcome", "specificLearningOutcomes"],
            threshold: 0.4,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }

    search(query: string) {
        const resultsContainer = this.element.querySelector("#results") as HTMLDivElement;
        resultsContainer.innerHTML = "";

        if (!query) {
            resultsContainer.innerHTML = `<p>Type to search outcomes...</p>`;
            return;
        }

        const results = this.fuse ? this.fuse.search(query, { limit: this.MAX_RESULTS }) : [];
        const matched = results.map(r => r.item);

        if (matched.length === 0) {
            resultsContainer.innerHTML = `<p>No results found</p>`;
            return;
        }

        for (const outcome of matched) {
            const el = this.createSelectableElement(outcome);
            resultsContainer.appendChild(el);
        }
    }

    createSelectableElement(outcome: Outcome): HTMLElement {
        let wrapper: HTMLElement;

        if (outcome instanceof MathematicsOutcome) {
            const el = new MathematicsOutcomeElement(outcome);
            el.showIcon();
            wrapper = el.render();
        } else if (outcome instanceof SocialStudiesOutcome) {
            const el = new SocialStudiesOutcomeElement(outcome);
            el.showIcon();
            wrapper = el.render();
        } else if (outcome instanceof BiologyOutcome) {
            const el = new BiologyOutcomeElement(outcome);
            el.showIcon();
            wrapper = el.render();
        } else if (outcome instanceof ScienceOutcome) {
            const el = new ScienceOutcomeElement(outcome);
            el.showIcon();
            wrapper = el.render();
        } else {
            const div = document.createElement("div");
            div.textContent = outcome.specificLearningOutcome;
            wrapper = div;
        }

        wrapper.classList.add("selectable-outcome");
        if (this.selected.has(outcome.outcomeId)) wrapper.classList.add("selected");

        wrapper.addEventListener("click", () => {
            if (this.selected.has(outcome.outcomeId)) {
                this.selected.delete(outcome.outcomeId);
                wrapper.classList.remove("selected");
            } else {
                this.selected.add(outcome.outcomeId);
                wrapper.classList.add("selected");
            }
        });

        return wrapper;
    }

    getSelectedOutcomes(): Outcome[] {
        return this.allOutcomes.filter(o => this.selected.has(o.outcomeId));
    }
}
