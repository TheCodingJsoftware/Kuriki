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

// ------------------------------
//  Uniform Search Index Type
// ------------------------------
type SearchableOutcome = {
    outcomeId: string;
    grade: string;
    text: string;
    ref: Outcome;
};

export class SearchOutcomeDialog extends DialogComponent {
    private fuse: Fuse<SearchableOutcome> | null = null;
    private index: SearchableOutcome[] = [];
    MAX_RESULTS = 50;

    constructor() {
        super({
            id: "search-dialog",
            title: "One Stop Search",
            bodyContent: `
            <div>
                <div class="field label prefix border fill round responsive" id="search">
                    <i>search</i>
                    <input type="text">
                    <label for="search">Search outcomes</label>
                </div>
                <p>Press the outcome to open.</p>
                <div id="results"></div>
            </div>`,
        });
        this.init();
    }

    // ------------------------------
    // Load Outcomes + Build Index
    // ------------------------------
    async getAllOutcomes() {
        const [ss, math, bio, sci] = await Promise.all([
            SocialStudiesRepo.getOutcomes(),
            MathematicsRepo.getOutcomes(),
            BiologyRepo.getOutcomes(),
            ScienceRepo.getOutcomes(),
        ]);

        const all: Outcome[] = [...ss, ...math, ...bio, ...sci];

        // Build flattened search index
        this.index = all.map(o => ({
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

        // Build Fuse index
        this.fuse = new Fuse(this.index, {
            keys: ["outcomeId", "grade", "text"],
            threshold: 0.45,
            ignoreLocation: true,
            minMatchCharLength: 2,
            includeScore: true
        });
    }

    // ------------------------------
    // Unified Search (Fuse + fallback)
    // ------------------------------
    searchInOutcomes(query: string): Outcome[] {
        if (!this.fuse || !query) return [];

        const lower = query.toLowerCase();

        // Fuse fuzzy search
        const fuseMatches = this.fuse.search(query, { limit: this.MAX_RESULTS })
            .map(r => r.item.ref);

        // Fallback substring search (fixes full-sentence copy/paste)
        const fallbackMatches = this.index
            .filter(o => o.text.toLowerCase().includes(lower))
            .map(o => o.ref);

        // Combine & dedupe
        return [
            ...new Map([...fuseMatches, ...fallbackMatches]
                .map(o => [o.outcomeId, o])
            ).values()
        ];
    }

    // ------------------------------
    // Main Search Handler
    // ------------------------------
    search(query: string) {
        const resultsContainer = this.element.querySelector("#results") as HTMLDivElement;
        resultsContainer.innerHTML = "";

        if (!query) {
            resultsContainer.innerHTML = `<p>Type to search outcomes...</p>`;
            return;
        }

        const results: Outcome[] = this.searchInOutcomes(query);

        if (results.length === 0) {
            resultsContainer.innerHTML = `<p>No results found</p>`;
            return;
        }

        for (const outcome of results.slice(0, this.MAX_RESULTS)) {
            let element: any;

            if (outcome instanceof MathematicsOutcome) {
                element = new MathematicsOutcomeElement(outcome);
                element.showIcon();
                element.element.addEventListener("click", () =>
                    window.location.href = `/mathematics_2013-2014.html?g=${outcome.grade}&o=${outcome.outcomeId}`
                );
            }
            else if (outcome instanceof SocialStudiesOutcome) {
                element = new SocialStudiesOutcomeElement(outcome);
                element.showIcon();
                element.element.addEventListener("click", () =>
                    window.location.href = `/social_studies_2003.html?g=${outcome.grade}&o=${outcome.outcomeId}`
                );
            }
            else if (outcome instanceof BiologyOutcome) {
                element = new BiologyOutcomeElement(outcome);
                element.showIcon();
                element.element.addEventListener("click", () =>
                    window.location.href = `/biology_2010-2011.html?g=${outcome.grade}&o=${outcome.outcomeId}`
                );
            }
            else if (outcome instanceof ScienceOutcome) {
                element = new ScienceOutcomeElement(outcome);
                element.showIcon();
                element.element.addEventListener("click", () =>
                    window.location.href = `/science_1999-2000.html?g=${outcome.grade}&o=${outcome.outcomeId}`
                );
            }

            resultsContainer.appendChild(element.render());
        }
    }

    // ------------------------------
    // Init Dialog
    // ------------------------------
    async init() {
        const searchInput = this.element.querySelector("#search input") as HTMLInputElement;

        const lastQuery = localStorage.getItem("searchDialogQuery") ?? "";
        if (lastQuery) {
            searchInput.value = lastQuery;
            debounce(() => this.search(lastQuery), 150)();
        }

        searchInput.addEventListener("input", debounce(() => {
            const query = searchInput.value.trim();
            localStorage.setItem("searchDialogQuery", query);
            this.search(query);
        }, 150));

        setTimeout(() => searchInput.focus(), 200);

        await this.getAllOutcomes();
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }
}
