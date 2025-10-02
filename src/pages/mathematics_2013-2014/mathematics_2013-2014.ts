import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { Skill } from "@models/skill";
import { enhanceLinks } from "@utils/enhance-links";
import { Strand } from "@models/strand";
import { MenuButton } from "@components/common/buttons/menu-button";
import { MathematicsRepo } from "@api/mathematics-repo";
import { updateMetaColors } from "@utils/theme";
import { Grade } from "@state/grades";
import { MathematicsOutcomeElement } from "@components/mathematics/outcome-element";
import { MathematicsOutcomeCard } from "@components/mathematics/card-element";

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
    "Grade 9": "9",
    "Grade 10 Essentials": "10E",
    "Grade 10 Introduction to Applied and Pre-Calculus": "10I",
    "Grade 11 Applied": "11A",
    "Grade 11 Essentials": "11E",
    "Grade 11 Pre-Calculus": "11P",
    "Grade 12 Applied": "12A",
    "Grade 12 Essentials": "12E",
    "Grade 12 Pre-Calculus": "12P",
};
const DEFAULT_GRADE: Grade = GRADES["Kindergarten"] as Grade;

// ---------------- State ----------------
let searchQuery: string = "";
let selectedGrade: string = DEFAULT_GRADE;
let selectedStrands = new Set<string>();
let selectedSkills = new Set<string>();

let allOutcomes: MathematicsOutcome[] = [];
let allStrands: Strand[] = [];
let allSkills: Skill[] = [];

// ---------------- URL State Helpers ----------------
type AppState = {
    g: Grade;           // selected grade
    str: string[];      // selected strands
    skl: string[];      // selected skills
    q: string;          // search query
    o?: string | null;  // selected outcome
};

function readStateFromURL(): AppState {
    const url = new URL(location.href);
    const p = url.searchParams;
    return {
        g: (p.get("g") as Grade) || DEFAULT_GRADE,
        str: (p.get("str") || "").split(",").filter(Boolean),
        skl: (p.get("skl") || "").split(",").filter(Boolean),
        q: p.get("q") || "",
        o: p.get("o"),
    };
}

function writeStateToURL(state: AppState, replace = false) {
    const url = new URL(location.href);
    const p = url.searchParams;
    p.set("g", state.g);
    state.str.length ? p.set("str", state.str.join(",")) : p.delete("str");
    state.skl.length ? p.set("skl", state.skl.join(",")) : p.delete("skl");
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
    selectedStrands = new Set(state.str);
    selectedSkills = new Set(state.skl);
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
        str: [...selectedStrands],
        skl: [...selectedSkills],
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
function applyFilters(): MathematicsOutcome[] {
    let filtered = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    const validStrandIds = new Set(filtered.map(o => o.strand.id));
    const validSkillIds = new Set(filtered.flatMap(o => Array.from(o.skills).map(s => s.id)));

    selectedStrands = new Set([...selectedStrands].filter(id => validStrandIds.has(id)));
    selectedSkills = new Set([...selectedSkills].filter(id => validSkillIds.has(id)));

    if (selectedStrands.size > 0) {
        filtered = filtered.filter(o => selectedStrands.has(o.strand.id));
    }

    if (selectedSkills.size > 0) {
        filtered = filtered.filter(o =>
            Array.from(o.skills).some(s => selectedSkills.has(s.id))
        );
    }

    if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
            o.specificLearningOutcome.toLowerCase().includes(q) ||
            o.generalLearningOutcomes.some(g => g.toLowerCase().includes(q)) ||
            o.strand.name.toLowerCase().includes(q) ||
            Array.from(o.skills).some(s =>
                s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
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

    renderStrandMenu(getUniqueStrands(gradeOutcomes));
    renderSkillMenu(getUniqueSkills(gradeOutcomes));
}

function renderStrandMenu(available: Strand[]) {
    const container = document.getElementById("strands") as HTMLDivElement;
    container.innerHTML = "";

    const strandMenu = new MenuButton(
        "Strands",
        "category",
        available.map(s => ({ key: s.id, label: s.name }))
    );

    available.forEach(s => {
        if (selectedStrands.has(s.id)) strandMenu.setSelected(s.id, true);
    });

    strandMenu.onToggle.connect(({ key, value }) => {
        value ? selectedStrands.add(key) : selectedStrands.delete(key);
        const state = currentState();
        state.str = [...selectedStrands];
        state.o = null;
        applyStateToUI(state);
        writeStateToURL(state);
    });

    container.appendChild(strandMenu.button);
}

function renderSkillMenu(available: Skill[]) {
    const container = document.getElementById("skills") as HTMLDivElement;
    container.innerHTML = "";

    const skillMenu = new MenuButton(
        "Skills",
        "task_alt",
        available.map(s => ({ key: s.id, label: s.name }))
    );

    available.forEach(s => {
        if (selectedSkills.has(s.id)) skillMenu.setSelected(s.id, true);
    });

    skillMenu.onToggle.connect(({ key, value }) => {
        value ? selectedSkills.add(key) : selectedSkills.delete(key);
        const state = currentState();
        state.skl = [...selectedSkills];
        state.o = null;
        applyStateToUI(state);
        writeStateToURL(state);
    });

    container.appendChild(skillMenu.button);
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

function getUniqueStrands(outcomes: MathematicsOutcome[]): Strand[] {
    const map = new Map<string, Strand>();
    for (const o of outcomes) {
        if (!map.has(o.strand.id)) {
            map.set(o.strand.id, o.strand);
        }
    }
    return Array.from(map.values());
}

function getUniqueSkills(outcomes: MathematicsOutcome[]): Skill[] {
    const map = new Map<string, Skill>();
    for (const o of outcomes) {
        for (const s of o.skills) {
            if (!map.has(s.id)) {
                map.set(s.id, s)
            }
        }
    };
    return Array.from(map.values());
}

function loadResetFilterButton() {
    const btn = document.getElementById("reset-filter-button") as HTMLButtonElement;
    btn.addEventListener("click", () => {
        const state = currentState();
        state.str = [];
        state.skl = [];
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

function scrollToOutcome(outcome: MathematicsOutcome, push = true) {
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

function loadOutcomes(outcomes: MathematicsOutcome[]) {
    const list = document.getElementById("outcomes") as HTMLDivElement;
    const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

    list.innerHTML = "";
    detailsPanel.innerHTML = "";

    outcomes.forEach(o => {
        const outcomeElement = new MathematicsOutcomeElement(o);
        outcomeElement.element.addEventListener("click", () => scrollToOutcome(o));
        list.appendChild(outcomeElement.render());

        const card = new MathematicsOutcomeCard(o);
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

// ---------------- Bootstrap ----------------
document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#0061a4");
    updateMetaColors("#0061a4");
    enhanceLinks();

    Promise.all([MathematicsRepo.getStrands(), MathematicsRepo.getSkills()])
        .then(([strands, skills]) => {
            allStrands = strands;
            allSkills = skills;
        }).catch(err => {
            console.error(err)
        });

    MathematicsRepo.getOutcomes().then(outcomes => {
        allOutcomes = outcomes;

        const boot = readStateFromURL();
        applyStateToUI(boot);
        updateMenusForGrade();
        writeStateToURL(currentState(), true);

        loadResetFilterButton();
        loadSearch();
        loadGradeTabs();

        document.getElementById("loading-indicator")?.remove();
    }).catch(err => {
        console.error(err);
    });
});
