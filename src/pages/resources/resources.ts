import "@utils/theme";
import "@utils/firebase";
import "@static/css/style.css"
import "beercss";
import "material-dynamic-colors";
import { getIcon } from 'material-file-icons';

interface ResourceData {
    icon: string,
    name: string;
    description: string;
    url: string;
    category?: string;
    tags?: string[];
}
type ViewMode = "grid" | "list";

const RESOURCES: ResourceData[] = [
    {
        icon: ".pdf",
        name: "K-8 Mathematics Framework (2013)",
        description: "Manitoba Curriculum Framework of Outcomes (2013).",
        url: "https://paperless.pinelandfarms.ca/share/B5cbfQBPG9rot0AoTK1tvCKUAyyz49RIRQa27snIZW1zY8Zk4h",
        category: "Mathematics",
        tags: ["curriculum", "framework", "k-8", "2013"]
    },
    {
        icon: ".pdf",
        name: "Grades 9-12 Mathematics Framework (2014)",
        description: "Manitoba Curriculum Framework of Outcomes (2014).",
        url: "https://paperless.pinelandfarms.ca/share/JM3UT0gO8glV7eX0RDpWXpKlnEUkg3OZtX1H7oIYpoVqKavYtB",
        category: "Mathematics",
        tags: ["curriculum", "framework", "9-12", "2014"]
    },
    {
        icon: ".pdf",
        name: "Grade 12 Calculus & Advanced Math (2019)",
        description: "Manitoba Curriculum of Outcomes (2019).",
        url: "https://paperless.pinelandfarms.ca/share/xNRkpi0JFHfLspWmrZv6bhEjiYtfobS1ahvLJw7S8PGQfE9S2O",
        category: "Mathematics",
        tags: ["grade-12", "calculus", "advanced", "2019"]
    },
    {
        icon: "",
        name: "All Documents",
        description: "Collection of official Manitoba government mathematics curriculum documents.",
        url: "https://netorg7317916-my.sharepoint.com/:f:/g/personal/jared_pinelandfarms_ca/EmhWCqwtChZEpXp2cD12wBYBThq7WNXv259tKX4JqSjpAQ?e=mHnast",
        category: "Mathematics",
        tags: ["manitoba", "government", "math"]
    },
    {
        icon: "",
        name: "Blackline Masters",
        description: "Support materials and reproducible masters for mathematics teaching.",
        url: "https://netorg7317916-my.sharepoint.com/:u:/g/personal/jared_pinelandfarms_ca/EaZp36jvPcZHgdY7HI9RYYsBDXtjioU3O4URyj7duDPGrw?e=0sEv3G",
        category: "Mathematics",
        tags: ["teaching", "resources", "blackline"]
    },
    {
        icon: ".pdf",
        name: "K-4 Science Framework (1999)",
        description: "Manitoba Curriculum Framework of Outcomes (1999).",
        url: "https://paperless.pinelandfarms.ca/share/ahJ8vYXa79XoTaL75R3r1b871goLzd8HkSmH930BDh9YMu8cdZ",
        category: "Science",
        tags: ["curriculum", "framework", "k-4", "1999"]
    },
    {
        icon: ".pdf",
        name: "5-8 Science Framework (2000)",
        description: "Manitoba Curriculum Framework of Outcomes (2000).",
        url: "https://paperless.pinelandfarms.ca/share/GiTZsiUuJwdVk8KrA88nItXq0CqRgIGj6hYubcnePNJu1XgORB",
        category: "Science",
        tags: ["curriculum", "framework", "k-4", "2000"]
    },
    {
        icon: ".pdf",
        name: "Senior 1 Science Framework (2000)",
        description: "Manitoba Curriculum Framework of Outcomes (2000).",
        url: "https://paperless.pinelandfarms.ca/share/bLqQsE1FxOk9p2x185Dkk97ONqIwZVEAkPi524XSjzlNxj3v7U",
        category: "Science",
        tags: ["curriculum", "framework", "k-4", "2000"]
    },
    {
        icon: "",
        name: "All Documents",
        description: "Collection of official Manitoba government science curriculum documents.",
        url: "https://netorg7317916-my.sharepoint.com/:f:/g/personal/jared_pinelandfarms_ca/EhiJe2WH_5FGh9oyVzfZaxoBKz7An4Kz4ScQ3eDlJWSSwA?e=Vcy4JD",
        category: "Science",
        tags: ["manitoba", "government", "math"]
    },
    {
        icon: "",
        name: "All Documents",
        description: "Collection of official Manitoba government social studies curriculum documents.",
        url: "https://netorg7317916-my.sharepoint.com/:f:/g/personal/jared_pinelandfarms_ca/Eg2gmVKrjMRGp6xVg1dsV0EBg65NatB1KysZYi314vkaUQ?e=5mWYVy",
        category: "Social Studies",
        tags: ["manitoba", "government", "social studies"]
    },
    {
        icon: ".pdf",
        name: "Grade 10 Social Studies Geographic Issues of the 21st Century Framework (2006)",
        description: "Manitoba Curriculum Framework of Outcomes (2006).",
        url: "https://paperless.pinelandfarms.ca/share/NQPPcXvIyvNTyNfQNdxKyZ243j57EUJgjr0PN1LAddap1miX48",
        category: "Social Studies",
        tags: ["curriculum", "framework", "grade 10", "2006"]
    }
];

class ResourceCard {
    constructor(private data: ResourceData) { }

    render(): HTMLElement {
        const article = document.createElement("article");
        article.classList.add("round", "border", "s12", "m6", "l4"); // dynamic size

        const topNav = document.createElement("nav");
        topNav.classList.add("row");
        article.appendChild(topNav);

        const iconData = getIcon(this.data.icon);
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("file-icon", "tiny-margin");
        iconDiv.innerHTML = iconData.svg;
        topNav.appendChild(iconDiv);

        const h6 = document.createElement("span");
        h6.classList.add("large-text", "bold", "max");
        h6.textContent = this.data.name;
        topNav.appendChild(h6);

        if (this.data.description) {
            const p = document.createElement("p");
            p.textContent = this.data.description;
            article.appendChild(p);
        }

        // if (this.data.tags?.length) {
        //     const tagDiv = document.createElement("nav");
        //     tagDiv.classList.add("row", "wrap", "no-space");
        //     this.data.tags.forEach(tag => {
        //         const span = document.createElement("span");
        //         span.textContent = tag;
        //         span.classList.add("chip", "small", "tiny-margin");
        //         tagDiv.appendChild(span);
        //     });
        //     article.appendChild(tagDiv);
        // }

        const actionNav = document.createElement("nav");
        actionNav.classList.add("row", "no-space", "right-align");
        article.appendChild(actionNav);

        const a = document.createElement("a");
        a.href = this.data.url;
        a.target = "_blank";
        a.classList.add("button", "primary");
        a.innerHTML = `<span>Open</span><i>open_in_new</i>`;
        actionNav.appendChild(a);

        return article;
    }
}

class ResourceList {
    constructor(private data: ResourceData) { }

    render(): HTMLElement {
        const li = document.createElement("li");
        li.classList.add("wave")
        li.addEventListener("click", () => window.open(this.data.url, "_blank"));

        const icon = getIcon(this.data.icon);
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("file-icon");
        iconDiv.innerHTML = icon.svg; // inject raw SVG
        li.appendChild(iconDiv);

        const maxDiv = document.createElement("div");
        maxDiv.classList.add("max");

        const h6 = document.createElement("h6");
        h6.classList.add("small", "wrap");
        h6.textContent = this.data.name;
        maxDiv.appendChild(h6);

        // if (this.data.description) {
        //     const desc = document.createElement("div");
        //     desc.classList.add("wrap", "no-line")
        //     desc.textContent = this.data.description;
        //     maxDiv.appendChild(desc);
        // }
        li.appendChild(maxDiv);
        return li;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const resourcesDiv = document.getElementById("resources") as HTMLDivElement;
    const searchInput = document.querySelector("#search input") as HTMLInputElement;
    const gridButton = document.getElementById("grid-button") as HTMLButtonElement;
    const listButton = document.getElementById("list-button") as HTMLButtonElement;

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

                sorted.forEach(item => grid.appendChild(new ResourceCard(item).render()));
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

    searchInput.addEventListener("input", debounce(() => render(filterResources(searchInput.value))));

    // nav buttons
    function setView(mode: ViewMode) {
        viewMode = mode;
        localStorage.setItem("resourceViewMode", mode);
        render(filterResources(searchInput.value));
        document.querySelectorAll("nav.group button").forEach(b => b.classList.remove("active"));
        const btnId =
            mode === "grid" ? "grid-button" :
                "list-button";
        document.getElementById(btnId)?.classList.add("active");
    }

    gridButton.addEventListener("click", () => setView("grid"));
    listButton.addEventListener("click", () => setView("list"));
    setView(viewMode);
});
