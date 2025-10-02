import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { ScienceRepo } from "@api/science-repo";
import { updateMetaColors } from "@utils/theme";
import { MenuButton } from "@components/common/buttons/menu-button";
import { Grade } from "@state/grades";
import { ScienceOutcomeElement } from "@components/science/outcome-element";
import { ScienceOutcomeCard } from "@components/science/card-element";
import { ScienceOutcome } from "@models/science-outcome";
import { Cluster } from "@models/cluster";

const GRADES: Record<string, Grade> = {
    "Kindergarten": "K",
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

// ---------------- State ----------------
let searchQuery: string = "";
let selectedGrade: string = DEFAULT_GRADE;
let selectedClusters = new Set<string>();

let allOutcomes: ScienceOutcome[] = [];
let allClusters: Cluster[] = [];

// ---------------- URL State Helpers ----------------
type AppState = {
    g: Grade;           // selected grade
    c: string[];      // selected clusters
    q: string;          // search query
    o?: string | null;  // selected outcome
};

function readStateFromURL(): AppState {
    const url = new URL(location.href);
    const p = url.searchParams;
    return {
        g: (p.get("g") as Grade) || DEFAULT_GRADE,
        c: (p.get("c") || "").split(",").filter(Boolean),
        q: p.get("q") || "",
        o: p.get("o"),
    };
}

function writeStateToURL(state: AppState, replace = false) {
    const url = new URL(location.href);
    const p = url.searchParams;
    p.set("g", state.g);
    state.c.length ? p.set("c", state.c.join(",")) : p.delete("c");
    state.q ? p.set("q", state.q) : p.delete("q");
    state.o ? p.set("o", state.o) : p.delete("o");
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
        q: searchQuery,
        o: getCurrentlySelectedOutcomeIdOrNull(),
    };
}

function getCurrentlySelectedOutcomeIdOrNull(): string | null {
    const el = document.querySelector<HTMLElement>(".outcome.selected");
    return el?.dataset.outcomeId ?? null;
}

window.addEventListener("popstate", () => {
    const state = readStateFromURL();
    applyStateToUI(state);
});

// ---------------- Filtering ----------------
function applyFilters(): ScienceOutcome[] {
    let filtered = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    const validClusterIds = new Set(filtered.map(o => o.cluster.id));

    selectedClusters = new Set([...selectedClusters].filter(id => validClusterIds.has(id)));

    if (selectedClusters.size > 0) {
        filtered = filtered.filter(o => selectedClusters.has(o.cluster.id));
    }

    if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
            o.specificLearningOutcome.toLowerCase().includes(q) ||
            o.cluster.name.toLowerCase().includes(q) ||
            Array.from(o.generalLearningOutcomes).some(glo =>
                glo.name.toLowerCase().includes(q) || glo.id.toLowerCase().includes(q)
            )
        );
    }

    return filtered;
}

// ---------------- UI Rendering ----------------
function renderUI() {
    loadOutcomes(applyFilters());
}

function updateMenusForGrade() {
    const gradeOutcomes = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    renderClusterMenu(getUniqueClusters(gradeOutcomes));
}

function renderClusterMenu(available: Cluster[]) {
    const container = document.getElementById("clusters") as HTMLDivElement;
    container.innerHTML = "";

    const clusterMenu = new MenuButton(
        "Clusters",
        "category",
        available.map(s => ({ key: s.id, label: s.name }))
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

function getUniqueClusters(outcomes: ScienceOutcome[]): Cluster[] {
    const map = new Map<string, Cluster>();
    for (const o of outcomes) {
        if (!map.has(o.cluster.id)) {
            map.set(o.cluster.id, o.cluster);
        }
    }
    return Array.from(map.values());
}

function loadResetFilterButton() {
    const btn = document.getElementById("reset-filter-button") as HTMLButtonElement;
    btn.addEventListener("click", () => {
        const state = currentState();
        state.c = [];
        state.q = "";
        state.o = null;
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

function scrollToOutcome(outcome: ScienceOutcome, push = true) {
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

function loadOutcomes(outcomes: ScienceOutcome[]) {
    const list = document.getElementById("outcomes") as HTMLDivElement;
    const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

    list.innerHTML = "";
    detailsPanel.innerHTML = "";

    outcomes.forEach(o => {
        const outcomeElement = new ScienceOutcomeElement(o);
        outcomeElement.element.addEventListener("click", () => scrollToOutcome(o));
        list.appendChild(outcomeElement.render());

        const card = new ScienceOutcomeCard(o);
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
    ui("theme", "#78dc77");
    updateMetaColors("#78dc77");
    enhanceLinks();

    Promise.all([ScienceRepo.getClusters()])
        .then(([clusters]) => {
            allClusters = clusters;
        }).catch(err => {
            console.error(err)
        });

    ScienceRepo.getOutcomes().then(outcomes => {
        allOutcomes = outcomes;

        const boot = readStateFromURL();
        applyStateToUI(boot);
        updateMenusForGrade();
        writeStateToURL(currentState(), true);

        loadResetFilterButton();
        loadSearch();
        loadGradeTabs();

        document.getElementById("loading-indicator")?.remove();
    })
});