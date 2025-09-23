import "@utils/theme";
import "@utils/firebase";
import "beercss";
import "material-dynamic-colors";

interface ResourceData {
    name: string;
    description: string;
    url: string;
    category?: string;
    tags?: string[];
}
type ViewMode = "module" | "cozy" | "stream" | "list";

const RESOURCES: ResourceData[] = [
    {
        name: "K-8 Mathematics Framework (2013)",
        description: "Kindergarten to Grade 8 Mathematics – Manitoba Curriculum Framework of Outcomes (2013).",
        url: "https://paperless.pinelandfarms.ca/share/B5cbfQBPG9rot0AoTK1tvCKUAyyz49RIRQa27snIZW1zY8Zk4h",
        category: "Mathematics",
        tags: ["curriculum", "framework", "k-8", "2013"]
    },
    {
        name: "Grades 9-12 Mathematics Framework (2014)",
        description: "Grades 9 to 12 Mathematics – Manitoba Curriculum Framework of Outcomes (2014).",
        url: "https://paperless.pinelandfarms.ca/share/JM3UT0gO8glV7eX0RDpWXpKlnEUkg3OZtX1H7oIYpoVqKavYtB",
        category: "Mathematics",
        tags: ["curriculum", "framework", "9-12", "2014"]
    },
    {
        name: "Grade 12 Calculus & Advanced Math (2019)",
        description: "Grade 12 Introduction to Calculus and Grade 12 Advanced Mathematics – Manitoba Curriculum of Outcomes (2019).",
        url: "https://paperless.pinelandfarms.ca/share/xNRkpi0JFHfLspWmrZv6bhEjiYtfobS1ahvLJw7S8PGQfE9S2O",
        category: "Mathematics",
        tags: ["grade-12", "calculus", "advanced", "2019"]
    },
    {
        name: "All Manitoba Government Mathematics Documents",
        description: "Collection of official Manitoba government mathematics curriculum documents.",
        url: "https://netorg7317916-my.sharepoint.com/:f:/g/personal/jared_pinelandfarms_ca/EmhWCqwtChZEpXp2cD12wBYBThq7WNXv259tKX4JqSjpAQ?e=mHnast",
        category: "Mathematics",
        tags: ["manitoba", "government", "math"]
    },
    {
        name: "Blackline Masters",
        description: "Support materials and reproducible masters for mathematics teaching.",
        url: "https://netorg7317916-my.sharepoint.com/:u:/g/personal/jared_pinelandfarms_ca/EaZp36jvPcZHgdY7HI9RYYsBDXtjioU3O4URyj7duDPGrw?e=0sEv3G",
        category: "Mathematics",
        tags: ["teaching", "resources", "blackline"]
    }
];

class ResourceCard {
    constructor(private data: ResourceData, private sizeClass: string) { }

    render(): HTMLElement {
        const article = document.createElement("article");
        article.classList.add("round", this.sizeClass); // dynamic size
        // --- rest stays same ---
        const h6 = document.createElement("h6");
        h6.textContent = this.data.name;
        article.appendChild(h6);

        if (this.data.description) {
            const p = document.createElement("p");
            p.textContent = this.data.description;
            article.appendChild(p);
        }

        const a = document.createElement("a");
        a.href = this.data.url;
        a.target = "_blank";
        a.classList.add("button", "primary");
        a.innerHTML = `<span>Open</span><i>open_in_new</i>`;
        article.appendChild(a);

        if (this.data.tags?.length) {
            const tagDiv = document.createElement("nav");
            tagDiv.classList.add("row", "wrap", "no-space");
            this.data.tags.forEach(tag => {
                const span = document.createElement("span");
                span.textContent = tag;
                span.classList.add("chip", "small", "tiny-margin");
                tagDiv.appendChild(span);
            });
            article.appendChild(tagDiv);
        }

        return article;
    }
}

class ResourceList {
    constructor(private data: ResourceData) { }

    render(): HTMLElement {
        const li = document.createElement("li");

        const maxDiv = document.createElement("div");
        maxDiv.classList.add("max");

        const h6 = document.createElement("h6");
        h6.classList.add("small");
        h6.textContent = this.data.name;
        maxDiv.appendChild(h6);

        if (this.data.description) {
            const desc = document.createElement("div");
            desc.textContent = this.data.description;
            maxDiv.appendChild(desc);
        }
        li.appendChild(maxDiv);

        const a = document.createElement("a");
        a.href = this.data.url;
        a.target = "_blank";
        a.classList.add("button", "primary");
        a.innerHTML = `<span>Open</span><i>open_in_new</i>`;
        li.appendChild(a);

        return li;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const resourcesDiv = document.getElementById("resources") as HTMLDivElement;
    const searchInput = document.querySelector("#search input") as HTMLInputElement | null;

    let viewMode: ViewMode = (localStorage.getItem("resourceViewMode") as ViewMode) || "list";

    const groupByCategory = (list: ResourceData[]) =>
        list.reduce<Record<string, ResourceData[]>>((acc, r) => {
            const cat = r.category || "Uncategorized";
            (acc[cat] ||= []).push(r);
            return acc;
        }, {});

    function render(list: ResourceData[]) {
        resourcesDiv.innerHTML = "";
        const grouped = groupByCategory(list);

        for (const [category, items] of Object.entries(grouped)) {
            if (!items.length) continue;
            const sorted = items.slice().sort((a, b) => a.name.localeCompare(b.name));

            const section = document.createElement("section");
            section.classList.add("border", "round", "padding", "s12");

            if (viewMode === "list") {
                section.classList.add("surface-container");
            } else {
                section.classList.remove("surface-container");
            }

            const h5 = document.createElement("h5");
            h5.textContent = category;
            section.appendChild(h5);

            if (viewMode === "list") {
                const ul = document.createElement("ul");
                ul.classList.add("list", "border");
                sorted.forEach(item => ul.appendChild(new ResourceList(item).render()));
                section.appendChild(ul);
            } else {
                const grid = document.createElement("div");
                grid.classList.add("grid");

                const sizeClass =
                    viewMode === "stream" ? "s12" :
                        viewMode === "module" ? "s4" :
                            "s6"; // cozy

                sorted.forEach(item => grid.appendChild(new ResourceCard(item, sizeClass).render()));
                section.appendChild(grid);
            }

            resourcesDiv.appendChild(section);
        }
        if (!resourcesDiv.hasChildNodes()) {
            const p = document.createElement("p");
            p.textContent = "No resources found.";
            p.classList.add("s12");
            resourcesDiv.appendChild(p);
        }
    }

    // search filter logic (unchanged)
    const filterResources = (q: string) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return RESOURCES;
        return RESOURCES.filter(r => {
            const hay = `${r.name} ${r.description} ${(r.tags ?? []).join(" ")}`.toLowerCase();
            return hay.includes(needle);
        });
    };

    const debounce = <T extends (...args: any[]) => void>(fn: T, ms = 150) => {
        let t: number | undefined;
        return (...args: Parameters<T>) => {
            if (t) clearTimeout(t);
            t = window.setTimeout(() => fn(...args), ms);
        };
    };

    render(RESOURCES);

    if (searchInput) {
        searchInput.addEventListener("input", debounce(() => render(filterResources(searchInput.value))));
    }

    // nav buttons
    function setView(mode: ViewMode) {
        viewMode = mode;
        localStorage.setItem("resourceViewMode", mode);
        render(filterResources(searchInput?.value || ""));
        document.querySelectorAll("nav.group button").forEach(b => b.classList.remove("active"));
        const btnId =
            mode === "stream" ? "grid-stream-button" :
                mode === "module" ? "grid-module-button" :
                    mode === "cozy" ? "grid-cozy-button" :
                        "list-button";
        document.getElementById(btnId)?.classList.add("active");
    }

    document.getElementById("grid-stream-button")?.addEventListener("click", () => setView("stream"));
    document.getElementById("grid-module-button")?.addEventListener("click", () => setView("module"));
    document.getElementById("grid-cozy-button")?.addEventListener("click", () => setView("cozy"));
    document.getElementById("list-button")?.addEventListener("click", () => setView("list"));
    setView(viewMode);
});
