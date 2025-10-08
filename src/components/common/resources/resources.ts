import { ResourceAPI } from "@api/resources-api";
import { Outcome } from "@models/outcome";
import { enhanceLinks } from "@utils/enhance-links";

export class ResourceListContainer {
    readonly element: HTMLDivElement;
    private readonly resourceList: HTMLOListElement;
    private readonly title: HTMLHeadingElement;
    private readonly outcome: Outcome;
    private observer?: IntersectionObserver;
    private loaded = false;
    private loading = false;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.element = document.createElement("div");
        this.element.classList.add("resource-list-container", "top-padding");

        this.title = document.createElement("h5");
        this.title.innerText = "Resources";
        this.element.appendChild(this.title);

        this.resourceList = document.createElement("ol");
        this.resourceList.classList.add("resource-list", "no-space");
        this.element.appendChild(this.resourceList);

        this.setupLazyLoad();
    }

    private setupLazyLoad() {
        this.observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !this.loaded) {
                        this.loaded = true;
                        this.observer?.disconnect();
                        this.renderResources();
                    }
                }
            },
            { rootMargin: "100px", threshold: 0.1 }
        );

        this.observer.observe(this.element);
    }

    public async refresh() {
        this.loaded = false;
        await this.renderResources(true);
    }

    private async renderResources(force = false) {
        if (this.loading) return; // prevent duplicate concurrent loads
        this.loading = true;

        try {
            this.element.classList.remove("hidden");
            this.resourceList.innerHTML = "";
            this.title.innerText = "Resources";

            const resources = await ResourceAPI.getByOutcome(this.outcome.outcomeId);

            if (!resources?.data?.length) {
                this.element.classList.add("hidden");
                this.loading = false;
                return;
            }

            for (const resource of resources.data) {
                const li = document.createElement("li");

                const a = document.createElement("a");
                a.className = "link underline tiny-padding wave small-round";
                a.href = resource;
                a.target = "_blank";
                a.dataset.url = resource;
                a.innerText = resource;

                li.appendChild(a);
                this.resourceList.appendChild(li);
            }

            enhanceLinks(50);
        } catch (err) {
            console.error("Failed to load resources:", err);
            this.title.innerText = "Resources (failed to load)";
        } finally {
            this.loading = false;
            this.loaded = true;
        }
    }

    public render(): HTMLDivElement {
        return this.element;
    }
}
