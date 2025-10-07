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


export class SearchOutcomeDialog extends DialogComponent {
    allMathematicsOutcomes: MathematicsOutcome[] = [];
    allSocialStudiesOutcomes: SocialStudiesOutcome[] = [];
    allBiologyOutcomes: BiologyOutcome[] = [];
    allScienceOutcomes: ScienceOutcome[] = [];

    private fuse: Fuse<Outcome> | null = null;

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

    async getAllOutcomes() {
        const [ss, math, bio, sci] = await Promise.all([
            SocialStudiesRepo.getOutcomes(),
            MathematicsRepo.getOutcomes(),
            BiologyRepo.getOutcomes(),
            ScienceRepo.getOutcomes(),
        ]);

        this.allSocialStudiesOutcomes = ss;
        this.allMathematicsOutcomes = math;
        this.allBiologyOutcomes = bio;
        this.allScienceOutcomes = sci;

        const allOutcomes: Outcome[] = [
            ...ss,
            ...math,
            ...bio,
            ...sci,
        ];

        // Configure Fuse
        this.fuse = new Fuse(allOutcomes, {
            keys: ["specificLearningOutcome", "specificLearningOutcomes"],
            threshold: 0.4,        // fuzziness (lower = stricter, higher = more matches)
            ignoreLocation: true,  // don't force match near beginning of string
            minMatchCharLength: 2, // only match queries of length >= 2
            includeScore: true
        });

    }

    search(query: string) {
        const resultsContainer = this.element.querySelector("#results") as HTMLDivElement;
        resultsContainer.innerHTML = "";

        // search once
        const results: Outcome[] = this.searchInOutcomes(query);

        for (const outcome of results.slice(0, this.MAX_RESULTS)) {
            if (outcome instanceof MathematicsOutcome) {
                const mathematicsElement = new MathematicsOutcomeElement(outcome);
                mathematicsElement.showIcon();
                mathematicsElement.element.addEventListener("click", () => {
                    window.location.href = `/mathematics_2013-2014.html?g=${outcome.grade}&o=${outcome.outcomeId}`;
                });
                resultsContainer.appendChild(mathematicsElement.render());
            }
            else if (outcome instanceof SocialStudiesOutcome) {
                const socialStudiesElement = new SocialStudiesOutcomeElement(outcome);
                socialStudiesElement.showIcon();
                socialStudiesElement.element.addEventListener("click", () => {
                    window.location.href = `/social_studies_2003.html?g=${outcome.grade}&o=${outcome.outcomeId}`;
                });
                resultsContainer.appendChild(socialStudiesElement.render());
            }
            else if (outcome instanceof BiologyOutcome) {
                const biologyElement = new BiologyOutcomeElement(outcome);
                biologyElement.showIcon();
                biologyElement.element.addEventListener("click", () => {
                    window.location.href = `/biology_2010-2011.html?g=${outcome.grade}&o=${outcome.outcomeId}`;
                });
                resultsContainer.appendChild(biologyElement.render());
            }
            else if (outcome instanceof ScienceOutcome) {
                const scienceElement = new ScienceOutcomeElement(outcome);
                scienceElement.showIcon();
                scienceElement.element.addEventListener("click", () => {
                    window.location.href = `/science_1999-2000.html?g=${outcome.grade}&o=${outcome.outcomeId}`;
                });
                resultsContainer.appendChild(scienceElement.render());
            }
        }

        if (!query) {
            resultsContainer.innerHTML = `<p>Type to search outcomes...</p>`;
            return;
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = `<p>No results found</p>`;
        }
    }

    searchInOutcomes(query: string): Outcome[] {
        if (!this.fuse || !query) return [];
        const results = this.fuse.search(query, { limit: 50 }); // limit to 50 results
        return results.map(r => r.item);
    }

    async init() {
        const searchInput = this.element.querySelector("#search input") as HTMLInputElement;

        // restore last query
        const lastQuery = localStorage.getItem("searchDialogQuery") ?? "";
        if (lastQuery) {
            searchInput.value = lastQuery;
            // run search immediately so results appear
            debounce(() => this.search(lastQuery), 150)();
        }

        searchInput.addEventListener("input", debounce(() => {
            const query = searchInput.value;
            localStorage.setItem("searchDialogQuery", query); // save query
            this.search(query);
        }, 150));

        if (searchInput) {
            setTimeout(() => searchInput.focus(), 200); // defer until DOM paint
        }

        await this.getAllOutcomes();
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }
}