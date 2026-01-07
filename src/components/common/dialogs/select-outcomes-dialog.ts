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

/** ------------------------------
 *  SEARCHABLE OUTCOME WRAPPER
 *  ------------------------------ */
type SearchableOutcome = {
    outcomeId: string;
    grade: string;
    text: string;     // merged SLO text
    ref: Outcome;     // reference to actual object
};

export class SelectOutcomesDialog extends DialogComponent {
    private fuse: Fuse<SearchableOutcome> | null = null;
    private index: SearchableOutcome[] = [];   // search index
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
                <div style="max-height: 400px; overflow-y: scroll;" class="small-round" id="results"></div>
            </div>
            <nav class="no-margin bottom right-align surface-container-high">
                <button class="button border" id="cancel-btn">Cancel</button>
                <button class="button primary" id="done-btn">Done</button>
            </nav>`,
        });
    }

    /** Open the dialog modally */
    open(): Promise<Outcome[]> {
        return new Promise((resolve) => {
            this.resolver = resolve;
            this.init();
        });
    }

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
            this.search(searchInput.value.trim());
        }, 150));

        doneBtn.addEventListener("click", () =>
            this.resolveAndClose(this.getSelectedOutcomes())
        );

        cancelBtn.addEventListener("click", () =>
            this.resolveAndClose([])
        );

        setTimeout(() => searchInput.focus(), 200);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }

    /** -------------------------
     *  LOAD + BUILD SEARCH INDEX
     *  ------------------------- */
    async getAllOutcomes() {
        const [ss, math, bio, sci] = await Promise.all([
            SocialStudiesRepo.getOutcomes(),
            MathematicsRepo.getOutcomes(),
            BiologyRepo.getOutcomes(),
            ScienceRepo.getOutcomes(),
        ]);

        this.allOutcomes = [...ss, ...math, ...bio, ...sci];

        // Build a uniform search index
        this.index = this.allOutcomes.map((o) => ({
            outcomeId: o.outcomeId,
            grade: o.grade,
            text: [
                o.specificLearningOutcome,
                (o as any).specificLearningOutcomes?.join(" "),
                (o as any).generalLearningOutcome,
                (o as any).generalLearningOutcomes?.join(" ")
            ].filter(Boolean).join(" "),
            ref: o
        }));

        // Build Fuse
        this.fuse = new Fuse(this.index, {
            keys: ["outcomeId", "grade", "text"],
            threshold: 0.45,           // more tolerant
            ignoreLocation: true,
            minMatchCharLength: 2,
            includeScore: true
        });
    }

    /** -------------------------
     *  SEARCH (Fuse + fallback)
     *  ------------------------- */
    search(query: string) {
        const container = this.element.querySelector("#results") as HTMLDivElement;
        container.innerHTML = "";

        if (!query) {
            container.innerHTML = `<p>Type to search outcomes...</p>`;
            return;
        }

        let fuseResults: Outcome[] = [];

        if (this.fuse) {
            fuseResults = this.fuse.search(query, { limit: this.MAX_RESULTS })
                .map(r => r.item.ref);
        }

        // 🔥 Fallback exact/substring search (fixes full-sentence issues)
        const lower = query.toLowerCase();
        const fallback = this.index
            .filter(o => o.text.toLowerCase().includes(lower))
            .map(o => o.ref);

        // Combine and unique results
        const combined = [...new Map([...fuseResults, ...fallback].map(o => [o.outcomeId, o])).values()];

        if (combined.length === 0) {
            container.innerHTML = `<p>No results found</p>`;
            return;
        }

        for (const outcome of combined.slice(0, this.MAX_RESULTS)) {
            container.appendChild(this.createSelectableElement(outcome));
        }
    }

    /** Render outcome with click handler */
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
            wrapper = document.createElement("div");
            wrapper.textContent = outcome.specificLearningOutcome;
        }

        wrapper.classList.add("selectable-outcome");

        if (this.selected.has(outcome.outcomeId))
            wrapper.classList.add("selected");

        wrapper.addEventListener("click", () => {
            const id = outcome.outcomeId;
            if (this.selected.has(id)) {
                this.selected.delete(id);
                wrapper.classList.remove("selected");
            } else {
                this.selected.add(id);
                wrapper.classList.add("selected");
            }
        });

        return wrapper;
    }

    /** Return selected outcomes */
    getSelectedOutcomes(): Outcome[] {
        return this.allOutcomes.filter(o => this.selected.has(o.outcomeId));
    }
}
