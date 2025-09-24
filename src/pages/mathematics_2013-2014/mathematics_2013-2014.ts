import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { Skill } from "@models/skill";
import { enhanceLinks } from "@utils/enhance-links";
import { Strand } from "@models/strand";
import { MenuButton } from "@components/common/buttons/menu-button";
import { SkillElement } from "@components/mathematics/skill-element"
import { StrandElement } from "@components/mathematics/strand-element"
import { DEFAULT_GRADE, GRADES } from "@state/grades";
import { MathematicsRepo } from "@api/mathematics-repo";
import { Storage } from "@utils/storage";
import { updateMetaColors } from "@utils/theme";

let searchQuery: string = "";
let selectedGrade: string = "K";
let selectedStrands = new Set<string>();
let selectedSkills = new Set<string>();
let allOutcomes: MathematicsOutcome[] = [];
let allStrands: Strand[] = [];
let allSkills: Skill[] = [];

function applyFilters(): MathematicsOutcome[] {
    let filtered = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;


    const validStrandIds = new Set(filtered.map(o => o.strand.strandId));
    const validSkillIds = new Set(filtered.flatMap(o => Array.from(o.skills).map(s => s.skillId)));

    // prune irrelevant selections
    selectedStrands = new Set([...selectedStrands].filter(id => validStrandIds.has(id)));
    selectedSkills = new Set([...selectedSkills].filter(id => validSkillIds.has(id)));

    if (selectedStrands.size > 0) {
        filtered = filtered.filter(o => selectedStrands.has(o.strand.strandId));
    }

    if (selectedSkills.size > 0) {
        filtered = filtered.filter(o =>
            Array.from(o.skills).some(s => selectedSkills.has(s.skillId))
        );
    }

    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
            o.specificLearningOutcome.toLowerCase().includes(query) ||
            o.generalLearningOutcomes.some(g => g.toLowerCase().includes(query)) ||
            o.strand.strandName.toLowerCase().includes(query) ||
            Array.from(o.skills).some(s =>
                s.skillName.toLowerCase().includes(query) ||
                s.skillId.toLowerCase().includes(query)
            )
        );
    }

    return filtered;
}

function updateMenusForGrade() {
    // outcomes for this grade
    const gradeOutcomes = selectedGrade
        ? allOutcomes.filter(o => o.grade === selectedGrade)
        : allOutcomes;

    const gradeStrands = getUniqueStrands(gradeOutcomes);
    renderStrandMenu(gradeStrands);

    const gradeSkills = getUniqueSkills(gradeOutcomes);
    renderSkillMenu(gradeSkills);
}

function renderUI() {
    const filtered = applyFilters();

    loadOutcomes(filtered);

    // Restore last outcome if present
    if (selectedGrade) {
        const savedOutcomeId = Storage.get(`selectedOutcome:${selectedGrade}`, null);
        if (savedOutcomeId) {
            const found = filtered.find(o => o.outcomeId === savedOutcomeId);
            if (found) loadOutcome(found);
        }
    }
}

function renderStrandMenu(available: Strand[]) {
    const container = document.getElementById("strands");
    if (!container) return;
    container.innerHTML = "";

    // build menu items
    const strandMenu = new MenuButton(
        "Strands",
        "category",
        available.map(s => ({ key: s.strandId, label: s.strandName }))
    );

    // restore selection from state
    available.forEach(s => {
        if (selectedStrands.has(s.strandId)) {
            strandMenu.setSelected(s.strandId, true);
        }
    });

    strandMenu.onToggle.connect(({ key, value }) => {
        if (value) {
            selectedStrands.add(key);
        } else {
            selectedStrands.delete(key);
        }
        if (selectedGrade) {
            Storage.set(
                `selectedStrands:${selectedGrade}`,
                [...selectedStrands]
            );
        }
        renderUI();
    });

    container.appendChild(strandMenu.button);
}

function renderSkillMenu(available: Skill[]) {
    const container = document.getElementById("skills");
    if (!container) return;
    container.innerHTML = "";

    const skillMenu = new MenuButton(
        "Skills",
        "task_alt",
        available.map(s => ({ key: s.skillId, label: s.skillName }))
    );

    available.forEach(s => {
        if (selectedSkills.has(s.skillId)) {
            skillMenu.setSelected(s.skillId, true);
        }
    });

    skillMenu.onToggle.connect(({ key, value }) => {
        if (value) {
            selectedSkills.add(key);
        } else {
            selectedSkills.delete(key);
        }
        if (selectedGrade) {
            Storage.set(
                `selectedSkills:${selectedGrade}`,
                [...selectedSkills]
            );
        }
        renderUI();
    });

    container.appendChild(skillMenu.button);
}

function loadTabs() {
    const tabsElement = document.getElementById("grades");
    if (!tabsElement) return;
    tabsElement.innerHTML = "";

    const savedGrade = Storage.get("selectedGrade", DEFAULT_GRADE);
    if (savedGrade) {
        selectedGrade = savedGrade;
    } else {
        selectedGrade = DEFAULT_GRADE; // default
        Storage.set("selectedGrade", selectedGrade);
    }

    selectedStrands = new Set(
        Storage.get<string[]>(`selectedStrands:${selectedGrade}`, [])
    );

    selectedSkills = new Set(
        Storage.get<string[]>(`selectedSkills:${selectedGrade}`, [])
    );

    for (const [label, value] of Object.entries(GRADES)) {
        const tab = document.createElement("a");
        tab.dataset.grade = value;
        tab.innerText = label;
        if (value === selectedGrade) tab.classList.add("active");

        tab.addEventListener("click", () => {
            tabsElement.querySelectorAll("a").forEach(a => a.classList.remove("active"));
            tab.classList.add("active");

            selectedGrade = value;
            Storage.set("selectedGrade", value);

            // restore per-grade filters on grade switch
            selectedStrands = new Set(
                Storage.get<string[]>(`selectedStrands:${selectedGrade}`, [])
            );

            selectedSkills = new Set(
                Storage.get<string[]>(`selectedSkills:${selectedGrade}`, [])
            );

            searchQuery = Storage.get(`search:${selectedGrade}`, "");
            const input = document.querySelector<HTMLInputElement>("#search input");
            if (input) input.value = searchQuery;

            updateMenusForGrade();
            renderUI();
        });

        tabsElement.appendChild(tab);
    }
}

function getUniqueStrands(outcomes: MathematicsOutcome[]): Strand[] {
    const map = new Map<string, Strand>();

    for (const o of outcomes) {
        const strand = o.strand;
        if (!map.has(strand.strandId)) {
            map.set(strand.strandId, new Strand(strand.strandId, strand.strandName));
        }
    }

    return Array.from(map.values());
}

function getUniqueSkills(outcomes: MathematicsOutcome[]): Skill[] {
    const map = new Map<string, Skill>();

    for (const outcome of outcomes) {
        for (const skill of outcome.skills) {
            if (!map.has(skill.skillId)) {
                map.set(skill.skillId, skill);
            }
        }
    }
    return Array.from(map.values());
}

function highlightKeywords(text: string, keywords: string[]): string {
    // Escape regex special chars in keywords
    const escapedKeywords = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (escapedKeywords.length === 0) return text;

    // Build regex to match any keyword, case-insensitive
    const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

    // Replace matches with <b>wrapped</b>
    return text.replace(regex, (match) => `<b>${match}</b>`);
}

function getKeywords(outcome: MathematicsOutcome) {
    const keywords = new Set<string>();

    mathematicsQuickSearchKeyWords.forEach(keyword => {
        const lowerCaseKeyword = keyword.toLowerCase();

        if (outcome.specificLearningOutcome.toLowerCase().includes(lowerCaseKeyword)) {
            keywords.add(keyword);
        }

        outcome.generalLearningOutcomes.forEach(glo => {
            if (glo.toLowerCase().includes(lowerCaseKeyword)) {
                keywords.add(keyword);
            }
        });
    });

    return keywords.size > 0 ? `: ${Array.from(keywords).join(', ')}` : '';
}

class MathematicsOutcomeElement {
    element: HTMLElement;
    outcome: MathematicsOutcome;

    constructor(outcome: MathematicsOutcome) {
        this.outcome = outcome;

        const el = document.createElement("button");
        el.classList.add("left-align", "outcome", "responsive", "small-margin")
        el.dataset.outcomeId = outcome.outcomeId;
        el.dataset.grade = outcome.grade;
        el.dataset.specificLearningOutcome = outcome.specificLearningOutcome;
        el.dataset.generalLearningOutcome = outcome.generalLearningOutcomes.join(', ');
        el.dataset.strand = outcome.strand.strandName;

        const savedOutcomeId = Storage.get(`selectedOutcome:${outcome.grade}`, null);
        if (savedOutcomeId === outcome.outcomeId) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => {
            loadOutcome(outcome);
        });

        const span = document.createElement("span");
        span.innerHTML = `<b>${outcome.outcomeId}</b>${getKeywords(this.outcome)}`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "top", "max");

        const tooltipTitle = document.createElement("h6");
        tooltipTitle.innerText = outcome.outcomeId;

        const tooltipStrand = document.createElement("b");
        tooltipStrand.innerText = outcome.strand.strandName;

        const tooltipDescription = document.createElement("p");
        tooltipDescription.innerHTML = highlightKeywords(
            `${outcome.specificLearningOutcome} [${outcome.skills.toArray().map(s => s.skillId).join(", ")}]`,
            mathematicsQuickSearchKeyWords
        );

        const tooltipActions = document.createElement("nav");
        const copyOutcome = document.createElement("a");
        copyOutcome.classList.add("inverse-link");
        copyOutcome.innerText = "Copy Outcome";
        copyOutcome.addEventListener("click", (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(`${outcome.outcomeId} ${outcome.specificLearningOutcome} [${outcome.skills.toArray().map(s => s.skillId).join(", ")}]`);
        });

        tooltipActions.appendChild(copyOutcome);

        tooltip.appendChild(tooltipTitle);
        tooltip.appendChild(tooltipStrand);
        tooltip.appendChild(tooltipDescription);
        tooltip.appendChild(tooltipActions);

        el.appendChild(span);
        el.appendChild(tooltip);

        this.element = el;
    }

    render(): HTMLElement {
        return this.element;
    }
}

function renderOutcomeDetails(outcome: MathematicsOutcome): HTMLElement {
    const container = document.createElement("article");
    container.classList.add("outcome-details", "round", "border");

    const title = document.createElement("h6");
    title.innerText = `${outcome.outcomeId}${getKeywords(outcome)}`;

    const skills = document.createElement("nav")
    skills.classList.add("row", "wrap", "no-space")

    const strandElement = new StrandElement(outcome.strand);

    if (selectedStrands.has(outcome.strand.strandId)) {
        strandElement.setSelected(true);
    }
    skills.appendChild(strandElement.element);

    for (const skill of outcome.skills) {
        const skillElement = new SkillElement(skill);
        if (selectedSkills.has(skill.skillId)) {
            skillElement.setSelected(true);
        }
        skills.appendChild(skillElement.element);
    }

    const description = document.createElement("p");
    description.innerHTML = highlightKeywords(
        outcome.specificLearningOutcome,
        mathematicsQuickSearchKeyWords
    );

    const list = document.createElement("ul");
    outcome.generalLearningOutcomes.forEach(glo => {
        const li = document.createElement("li");
        li.innerHTML = highlightKeywords(glo, mathematicsQuickSearchKeyWords);
        list.appendChild(li);
    });

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Copy Outcome";
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(`${outcome.outcomeId} ${outcome.specificLearningOutcome} [${outcome.skills.toArray().map(s => s.skillId).join(", ")}]`);
    });

    container.appendChild(title);
    container.appendChild(skills);
    container.appendChild(description);
    container.appendChild(list);
    container.appendChild(copyBtn);

    return container;
}

function loadOutcome(outcome: MathematicsOutcome) {
    Storage.set(`selectedOutcome:${outcome.grade}`, outcome.outcomeId);

    document.querySelectorAll(".outcome").forEach(o => {
        o.classList.remove("selected");
        if (o instanceof HTMLElement && o.dataset.outcomeId === outcome.outcomeId) {
            o.classList.add("selected");
        }
    });

    const detailsPanel = document.getElementById("details-panel");
    if (detailsPanel) {
        detailsPanel.innerHTML = '';
        detailsPanel.appendChild(renderOutcomeDetails(outcome));
    }
}


function loadOutcomes(outcomes: MathematicsOutcome[]) {
    const outcomesElement = document.getElementById("outcomes");
    const detailsPanel = document.getElementById("details-panel");

    if (outcomesElement && detailsPanel) {
        outcomesElement.innerHTML = '';
        detailsPanel.innerHTML = '';

        for (const outcome of outcomes) {
            if (!outcome) continue;
            const outcomeEl = new MathematicsOutcomeElement(outcome);
            outcomesElement.appendChild(outcomeEl.render());
        }
    }
}

function loadResetFilterButton() {
    const resetFilterButton = document.getElementById("reset-filter-button");
    if (resetFilterButton) {
        resetFilterButton.addEventListener("click", () => {
            selectedStrands.clear();
            selectedSkills.clear();
            Storage.set(`selectedStrands:${selectedGrade}`, "[]");
            Storage.set(`selectedSkills:${selectedGrade}`, "[]");

            searchQuery = "";
            Storage.set(`search:${selectedGrade}`, "");
            const input = document.querySelector<HTMLInputElement>("#search input");
            if (input) input.value = "";

            updateMenusForGrade();
            renderUI();
        });
    }
}

function loadSearch() {
    const searchContainer = document.querySelector<HTMLDivElement>("#search");
    if (!searchContainer) return;
    const input = searchContainer.querySelector<HTMLInputElement>("input");
    if (!input) return;

    // load per-grade saved query
    const saved = Storage.get(`search:${selectedGrade}`, null);
    if (saved) {
        searchQuery = saved;
        input.value = saved;
    } else {
        searchQuery = "";
        input.value = "";
    }

    input.addEventListener("input", () => {
        searchQuery = input.value;
        Storage.set(`search:${selectedGrade}`, searchQuery);
        renderUI();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#0061a4");
    updateMetaColors("#0061a4");
    enhanceLinks();

    Promise.all([
        MathematicsRepo.getStrands(),
        MathematicsRepo.getSkills()
    ]).then(([strands, skills]) => {
        allStrands = strands;
        allSkills = skills;
        renderStrandMenu(allStrands);
        renderSkillMenu(allSkills);
    }).catch(err => {
        console.error(err);
    });
    MathematicsRepo.getAllOutcomes().then(outcomes => {
        allOutcomes = outcomes;

        loadTabs();
        renderUI();
        updateMenusForGrade();
        loadResetFilterButton();
        loadSearch();

        const loadingIndicator = document.getElementById("loading-indicator");
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    });

});