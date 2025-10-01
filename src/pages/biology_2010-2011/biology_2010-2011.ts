import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { BiologyRepo } from "@api/biology-repo";
import { updateMetaColors } from "@utils/theme";
import { MenuButton } from "@components/common/buttons/menu-button";
import { Grade } from "@state/grades";
import { BiologyOutcomeElement } from "@components/biology/outcome-element";
import { BiologyOutcomeCard } from "@components/biology/card-element";
import { BiologyOutcome } from "@models/biology-outcome";
import { Unit } from "@models/unit";

const GRADES: Record<string, Grade> = {
    "Grade 11": "11",
    "Grade 12": "12",
};
const DEFAULT_GRADE: Grade = GRADES["Grade 11"] as Grade;

// ---------------- State ----------------
let searchQuery: string = "";
let selectedGrade: string = DEFAULT_GRADE;
let selectedUnits = new Set<string>();

let allOutcomes: BiologyOutcome[] = [];
let allUnits: Unit[] = [];

// ---------------- URL State Helpers ----------------
type AppState = {
    g: Grade;           // selected grade
    u: string[];      // selected units
    q: string;          // search query
    o?: string | null;  // selected outcome
};

function readStateFromURL(): AppState {
    const url = new URL(location.href);
    const p = url.searchParams;
    return {
        g: (p.get("g") as Grade) || DEFAULT_GRADE,
        u: (p.get("u") || "").split(",").filter(Boolean),
        q: p.get("q") || "",
        o: p.get("o"),
    };
}

function writeStateToURL(state: AppState, replace = false) {
    const url = new URL(location.href);
    const p = url.searchParams;
    p.set("g", state.g);
    state.u.length ? p.set("u", state.u.join(",")) : p.delete("c");
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
    selectedUnits = new Set(state.u);
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
        u: [...selectedUnits],
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
function applyFilters(): BiologyOutcome[] {
    let filtered = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    const valiedUnitIds = new Set(filtered.map(o => o.unit.id));

    selectedUnits = new Set([...selectedUnits].filter(id => valiedUnitIds.has(id)));

    if (selectedUnits.size > 0) {
        filtered = filtered.filter(o => selectedUnits.has(o.unit.id));
    }

    if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
            o.specificLearningOutcome.toLowerCase().includes(q) ||
            o.unit.name.toLowerCase().includes(q) ||
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

    renderUnitMenu(getUniqueClusters(gradeOutcomes));
}

function renderUnitMenu(available: Unit[]) {
    const container = document.getElementById("units") as HTMLDivElement;
    container.innerHTML = "";

    const unitMenu = new MenuButton(
        "Units",
        "category",
        available.map(s => ({ key: s.id, label: s.name }))
    );

    available.forEach(s => {
        if (selectedUnits.has(s.id)) unitMenu.setSelected(s.id, true);
    });

    unitMenu.onToggle.connect(({ key, value }) => {
        value ? selectedUnits.add(key) : selectedUnits.delete(key);
        const state = currentState();
        state.u = [...selectedUnits];
        state.o = null;
        applyStateToUI(state);
        writeStateToURL(state);
    });

    container.appendChild(unitMenu.button);
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

function getUniqueClusters(outcomes: BiologyOutcome[]): Unit[] {
    const map = new Map<string, Unit>();
    for (const o of outcomes) {
        if (!map.has(o.unit.id)) {
            map.set(o.unit.id, o.unit);
        }
    }
    return Array.from(map.values());
}

function loadResetFilterButton() {
    const btn = document.getElementById("reset-filter-button") as HTMLButtonElement;
    btn.addEventListener("click", () => {
        const state = currentState();
        state.u = [];
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

function scrollToOutcome(outcome: BiologyOutcome, push = true) {
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

function loadOutcomes(outcomes: BiologyOutcome[]) {
    const list = document.getElementById("outcomes") as HTMLDivElement;
    const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

    list.innerHTML = "";
    detailsPanel.innerHTML = "";

    outcomes.forEach(o => {
        const outcomeElement = new BiologyOutcomeElement(o);
        outcomeElement.element.addEventListener("click", () => scrollToOutcome(o));
        list.appendChild(outcomeElement.render());

        const card = new BiologyOutcomeCard(o);
        detailsPanel.appendChild(card.render());
    });
}


document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#9ed75b");
    updateMetaColors("#9ed75b");
    enhanceLinks();

    Promise.all([BiologyRepo.getUnits()])
        .then(([units]) => {
            allUnits = units;
        }).catch(err => {
            console.error(err)
        });

    BiologyRepo.getAllOutcomes().then(outcomes => {
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
