import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { SocialStudiesRepo } from "@api/social-studies-repo";
import { updateMetaColors } from "@utils/theme";
import { SocialStudiesOutcome } from "@models/social-studies-outcome";
import { SocialStudiesSkill } from "@models/social-studies-skill";
import { Cluster } from "@models/cluster";
import { SkillType } from "@models/skill-type";
import { OutcomeType } from "@models/outcome-type";
import { GeneralLearningOutcome } from "@models/general-learning-outcome";
import { DistinctiveLearningOutcome } from "@models/distinctive-learning-outcome";
import { Grade } from "@state/grades";
import { SocialStudiesOutcomeElement } from "@components/social_studies/outcome-element";
import { SocialStudiesOutcomeCard } from "@components/social_studies/card-element";
import { MenuButton } from "@components/common/buttons/menu-button";


const GRADES: Record<string, Grade> = {
    "Kindergarten": "0",
    "Grade 1": "1",
    "Grade 2": "2",
    "Grade 3": "3",
    "Grade 4": "4",
    "Grade 5": "5",
    "Grade 6": "6",
    "Grade 7": "7",
    "Grade 8": "8",
};
const DEFAULT_GRADE: Grade = GRADES["Kindergarten"] as Grade;

let searchQuery: string = "";

let selectedGrade: string = "0";

let allSkills: SocialStudiesSkill[] = [];
let allSkillTypes: SkillType[] = [];
let selectedSkillTypes = new Set<string>();

let allOutcomes: SocialStudiesOutcome[] = [];
let allClusters: Cluster[] = [];
let allOutcomeTypes: OutcomeType[] = [];
let allGeneralLearningOutcomes: GeneralLearningOutcome[] = [];
let allDistinctiveLearningOutcomes: DistinctiveLearningOutcome[] = [];

let selectedClusters = new Set<string>();
let selectedOutcomeTypes = new Set<string>();
let selectedGeneralLearningOutcomes = new Set<string>();
let selectedDistinctiveLearningOutcomes = new Set<string>();


// ---------------- URL State Helpers ----------------
type AppState = {
    g: Grade;           // selected grade
    c: string[];      // selected clusters
    ot: string[];      // selected outcome types
    st: string[];      // selected skill types
    glo: string[];      // selected general learning outcomes
    dlo: string[];      // selected distinctive learning outcomes
    q: string;          // search query
    o?: string | null;  // selected outcome
    s?: string | null;  // selected skill
};

function readStateFromURL(): AppState {
    const url = new URL(location.href);
    const p = url.searchParams;
    return {
        g: (p.get("g") as Grade) || DEFAULT_GRADE,
        c: (p.get("c") || "").split(",").filter(Boolean),
        ot: (p.get("ot") || "").split(",").filter(Boolean),
        st: (p.get("st") || "").split(",").filter(Boolean),
        glo: (p.get("glo") || "").split(",").filter(Boolean),
        dlo: (p.get("dlo") || "").split(",").filter(Boolean),
        q: p.get("q") || "",
        o: p.get("o"),
        s: p.get("s"),
    };
}

function writeStateToURL(state: AppState, replace = false) {
    const url = new URL(location.href);
    const p = url.searchParams;
    p.set("g", state.g);
    state.c.length ? p.set("c", state.c.join(",")) : p.delete("c");
    state.ot.length ? p.set("ot", state.ot.join(",")) : p.delete("ot");
    state.st.length ? p.set("st", state.st.join(",")) : p.delete("st");
    state.glo.length ? p.set("glo", state.glo.join(",")) : p.delete("glo");
    state.dlo.length ? p.set("dlo", state.dlo.join(",")) : p.delete("dlo");
    state.q ? p.set("q", state.q) : p.delete("q");
    state.o ? p.set("o", state.o) : p.delete("o");
    state.s ? p.set("s", state.s) : p.delete("s");
    url.search = p.toString();

    if (replace) {
        history.replaceState(state, "", url.toString());
    } else {
        history.pushState(state, "", url.toString());
    }
}


function applyStateToUI(state: AppState) {
    selectedGrade = state.g;
    selectedClusters = new Set(state.c);
    selectedOutcomeTypes = new Set(state.ot);
    selectedSkillTypes = new Set(state.st);
    selectedGeneralLearningOutcomes = new Set(state.glo);
    selectedDistinctiveLearningOutcomes = new Set(state.dlo);
    searchQuery = state.q;

    const input = document.querySelector<HTMLInputElement>("#search input");
    if (input) input.value = searchQuery;

    renderUI();

    if (state.o) {
        const found = applyFilters().find(o => o.outcomeId === state.o);
        if (found) scrollToOutcome(found, false);
    }
}

function currentState(): AppState {
    return {
        g: selectedGrade as Grade,
        c: [...selectedClusters],
        ot: [...selectedOutcomeTypes],
        st: [...selectedSkillTypes],
        glo: [...selectedGeneralLearningOutcomes],
        dlo: [...selectedDistinctiveLearningOutcomes],
        q: searchQuery,
        o: getCurrentlySelectedOutcomeIdOrNull(),
        s: getCurrentlySelectedSkillIdOrNull(),
    };
}

function getCurrentlySelectedOutcomeIdOrNull(): string | null {
    const el = document.querySelector<HTMLElement>(".outcome.selected");
    return el?.dataset.outcomeId ?? null;
}

function getCurrentlySelectedSkillIdOrNull(): string | null {
    const el = document.querySelector<HTMLElement>(".skill.selected");
    return el?.dataset.skillId ?? null;
}

window.addEventListener("popstate", () => {
    const state = readStateFromURL();
    applyStateToUI(state);
});

function applyFilters(): SocialStudiesOutcome[] {
    let filtered = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;


    const validClusterIds = new Set(filtered.map(o => o.cluster.id));
    // const valiedSkillTypeIds = new Set(filtered.map(o => o.skillType.id));
    // const validOutcomeTypeIds = new Set(filtered.map(o => o.outcomeType.id));
    // const validGeneralLearningOutcomeIds = new Set(filtered.map(o => o.generalLearningOutcome.id));
    // const validDistinctiveLearningOutcomeIds = new Set(filtered.map(o => o.distinctiveLearningOutcome.id));

    // prune irrelevant selections
    selectedClusters = new Set([...selectedClusters].filter(id => validClusterIds.has(id)));
    // selectedSkillTypes = new Set([...selectedSkillTypes].filter(id => validSkillIds.has(id)));
    // selectedDistinctiveLearningOutcomes = new Set([...selectedDistinctiveLearningOutcomes].filter(id => selectedDistinctiveLearningOutcomes.has(id)));
    // selectedGeneralLearningOutcomes = new Set([...selectedGeneralLearningOutcomes].filter(id => selectedGeneralLearningOutcomes.has(id)));
    // selectedOutcomeTypes = new Set([...selectedOutcomeTypes].filter(id => selectedOutcomeTypes.has(id)));

    if (selectedClusters.size > 0) {
        filtered = filtered.filter(o => selectedClusters.has(o.cluster.id));
    }

    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
            o.cluster.name.toLowerCase().includes(query)
            // o.specificLearningOutcome.toLowerCase().includes(query) ||
            // o.generalLearningOutcome.name.toLowerCase().includes(query) ||
            // o.outcomeType.name.toLowerCase().includes(query) ||
            // o.distinctiveLearningOutcome.name.toLowerCase().includes(query)
        );
    }

    return filtered;
}

// ---------------- UI Rendering ----------------
function renderUI() {
    loadOutcomes(applyFilters());
}

function updateMenusForGrade() {
    // outcomes for this grade
    const gradeOutcomes = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    renderClustersMenu(getUniqueClusters(gradeOutcomes));
    // renderOutcomeTypeMenu(getUniqueOutcomeTypes(gradeOutcomes));
    // renderSkillTypeMenu(getUniqueSkillTypes(gradeOutcomes));
    // renderGeneralLearningOutcomeMenu(getUniqueGeneralLearningOutcomes(gradeOutcomes));
    // renderDistinctiveLearningOutcomeMenu(getUniqueDistinctiveLearningOutcomes(gradeOutcomes));

}

function renderClustersMenu(available: Cluster[]) {
    const container = document.getElementById("clusters") as HTMLDivElement;
    container.innerHTML = "";

    const clusterMenu = new MenuButton(
        "Clusters",
        "category",
        available.map(cls => ({ key: cls.id, label: cls.name }))
    );

    available.forEach(s => {
        if (selectedClusters.has(s.id)) clusterMenu.setSelected(s.id, true);
    });

    clusterMenu.onToggle.connect(({ key, value }) => {
        value ? selectedClusters.add(key) : selectedClusters.delete(key);
        const state = currentState();
        state.c = [...selectedClusters];
        state.o = null;
        applyStateToUI(state);
        writeStateToURL(state);
    });

    container.appendChild(clusterMenu.button);
}


function loadGradeTabs() {
    const tabsElement = document.getElementById("grades");
    if (!tabsElement) return;
    tabsElement.innerHTML = "";

    const stateNow = readStateFromURL();
    selectedGrade = stateNow.g;

    for (const [label, value] of Object.entries(GRADES)) {
        const tab = document.createElement("a");
        tab.dataset.grade = value;
        tab.innerText = label;
        if (value === selectedGrade) tab.classList.add("active");

        tab.addEventListener("click", () => {
            tabsElement.querySelectorAll("a").forEach(a => a.classList.remove("active"));
            tab.classList.add("active");

            const state = currentState();
            state.g = value as Grade;
            state.o = null;
            applyStateToUI(state);
            writeStateToURL(state);
            updateMenusForGrade();
        });

        tabsElement.appendChild(tab);
    }
}

function getUniqueClusters(outcomes: SocialStudiesOutcome[]): Cluster[] {
    const map = new Map<string, Cluster>();
    for (const o of outcomes) {
        if (!map.has(o.cluster.id)) {
            map.set(o.cluster.id, o.cluster);
        }
    }
    return Array.from(map.values());
}

function getUniqueOutcomeTypes(outcomes: SocialStudiesOutcome[]): OutcomeType[] {
    const map = new Map<string, OutcomeType>();
    for (const o of outcomes) {
        if (!map.has(o.outcomeType.id)) {
            map.set(o.outcomeType.id, o.outcomeType);
        }
    }
    return Array.from(map.values());
}

function getUniqueSkillTypes(skills: SocialStudiesSkill[]): SkillType[] {
    const map = new Map<string, SkillType>();
    for (const o of skills) {
        if (!map.has(o.skillType.id)) {
            map.set(o.skillType.id, o.skillType);
        }
    }
    return Array.from(map.values());
}

function getUniqueGeneralLearningOutcomes(outcomes: SocialStudiesOutcome[]): GeneralLearningOutcome[] {
    const map = new Map<string, GeneralLearningOutcome>();
    for (const o of outcomes) {
        if (!map.has(o.generalLearningOutcome.id)) {
            map.set(o.generalLearningOutcome.id, o.generalLearningOutcome);
        }
    }
    return Array.from(map.values());
}

function getUniqueDistinctiveLearningOutcomes(outcomes: SocialStudiesOutcome[]): DistinctiveLearningOutcome[] {
    const map = new Map<string, DistinctiveLearningOutcome>();
    for (const o of outcomes) {
        if (o.distinctiveLearningOutcome) {
            if (!map.has(o.distinctiveLearningOutcome.id)) {
                map.set(o.distinctiveLearningOutcome.id, o.distinctiveLearningOutcome);
            }
        }
    }
    return Array.from(map.values());
}

function loadResetFilterButton() {
    const btn = document.getElementById("reset-filter-button") as HTMLButtonElement;
    btn.addEventListener("click", () => {
        const state = currentState();
        state.c = [];
        state.ot = [];
        state.st = [];
        state.glo = [];
        state.dlo = [];
        state.q = "";
        state.o = null;
        state.s = null;
        applyStateToUI(state);
        writeStateToURL(state);
        updateMenusForGrade();
    });
}

function loadSearch() {
    const box = document.querySelector<HTMLDivElement>("#search") as HTMLDivElement;
    const input = box.querySelector<HTMLInputElement>("input") as HTMLInputElement;
    const st = readStateFromURL();
    input.value = st.q;
    searchQuery = st.q;
    let t: number | null = null;
    const flush = (push = false) => {
        const state = currentState();
        state.q = input.value;
        applyStateToUI(state);
        writeStateToURL(state, !push);
    };
    input.addEventListener("input", () => { if (t) clearTimeout(t); t = setTimeout(() => flush(false), 200); });
    input.addEventListener("change", () => flush(true));
}

function scrollToOutcome(outcome: SocialStudiesOutcome, push = true) {
    document.querySelectorAll(".outcome").forEach(o => o.classList.remove("selected"));
    document.querySelectorAll(".outcome-details").forEach(o => o.classList.remove("selected", "flash-border"));

    const match = document.querySelector<HTMLElement>(
        `.outcome[data-outcome-id="${outcome.outcomeId}"]`
    );

    if (match) {
        match.classList.add("selected");
        const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;
        const card = detailsPanel.querySelector(`.outcome-details[data-outcome-id="${outcome.outcomeId}"]`) as HTMLElement;
        card.classList.add("selected", "flash-border")
        card.scrollIntoView({
            behavior: "smooth",   // animate
            block: "center"       // center in viewport
        });
    }

    if (push) {
        const st = currentState();
        st.o = outcome.outcomeId;
        writeStateToURL(st);
    }
}

function loadOutcomes(outcomes: SocialStudiesOutcome[]) {
    const list = document.getElementById("outcomes") as HTMLDivElement;
    const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

    list.innerHTML = "";
    detailsPanel.innerHTML = "";

    outcomes.forEach(o => {
        const outcomeElement = new SocialStudiesOutcomeElement(o);
        outcomeElement.element.addEventListener("click", () => scrollToOutcome(o));
        list.appendChild(outcomeElement.render());

        const card = new SocialStudiesOutcomeCard(o);
        detailsPanel.appendChild(card.render());
    });
}

function goToNextOutcome() {
    const outcomes = applyFilters();
    const currentId = getCurrentlySelectedOutcomeIdOrNull();

    if (!currentId) {
        if (outcomes.length > 0) scrollToOutcome(outcomes[0]!);
        return;
    }

    const idx = outcomes.findIndex(o => o.outcomeId === currentId);
    if (idx >= 0 && idx < outcomes.length - 1) {
        const next = outcomes[idx + 1];
        if (next) scrollToOutcome(next); // ✅ safe
    }
}

function goToPrevOutcome() {
    const outcomes = applyFilters();
    const currentId = getCurrentlySelectedOutcomeIdOrNull();

    if (!currentId) {
        if (outcomes.length > 0) scrollToOutcome(outcomes[outcomes.length - 1]!);
        return;
    }

    const idx = outcomes.findIndex(o => o.outcomeId === currentId);
    if (idx > 0) {
        const prev = outcomes[idx - 1];
        if (prev) scrollToOutcome(prev); // ✅ safe
    }
}


document.addEventListener("keydown", (e) => {
    // Don’t interfere if user is typing in a text field
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
    }

    switch (e.key) {
        case "ArrowDown":
        case "s":
        case "S":
        case "ArrowRight":
        case "d":
        case "D":
            e.preventDefault();
            e.stopPropagation();
            goToNextOutcome();
            break;

        case "ArrowUp":
        case "w":
        case "W":
        case "ArrowLeft":
        case "a":
        case "A":
            e.preventDefault();
            e.stopPropagation();
            goToPrevOutcome();
            break;

        default:
            // Handle number keys 1–9
            if (/^[1-9]$/.test(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                const outcomes = applyFilters();
                const index = parseInt(e.key, 10) - 1; // 1 → index 0
                if (index < outcomes.length) {
                    scrollToOutcome(outcomes[index]!);
                }
            }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#dbc90a");
    updateMetaColors("#dbc90a");
    enhanceLinks();

    Promise.all([
        SocialStudiesRepo.getClusters(),
        SocialStudiesRepo.getSkillTypes(),
        SocialStudiesRepo.getOutcomeTypes(),
        SocialStudiesRepo.getGeneralLearningOutcomes(),
        SocialStudiesRepo.getDistinctiveLearningOutcomes()
    ]).then(([clusters, skillTypes, outcomeTypes, generalLearningOutcomes, distinctiveLearningOutcomes]) => {
        allClusters = clusters;
        allSkillTypes = skillTypes;
        allOutcomeTypes = outcomeTypes;
        allGeneralLearningOutcomes = generalLearningOutcomes;
        allDistinctiveLearningOutcomes = distinctiveLearningOutcomes;
    }).catch(err => {
        console.error(err);
    })

    Promise.all([
        SocialStudiesRepo.getOutcomes(),
        SocialStudiesRepo.getSkills()
    ]).then(([outcomes, skills]) => {
        allOutcomes = outcomes;
        allSkills = skills;

        const boot = readStateFromURL();
        applyStateToUI(boot);
        updateMenusForGrade();
        writeStateToURL(currentState(), true);

        loadResetFilterButton();
        loadSearch();
        loadGradeTabs();

        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }).catch(err => {
        console.error(err);
    })
});