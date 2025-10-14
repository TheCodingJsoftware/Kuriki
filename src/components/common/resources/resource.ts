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
    private emptyMessage?: HTMLParagraphElement;

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
        const detailsPanel = document.getElementById("details-panel") as HTMLDivElement;

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
            {
                root: detailsPanel || null,
                rootMargin: "0px 1000px 0px 1000px", // preload when within 500px horizontally
                threshold: 0.0
            }
        );

        this.observer.observe(this.element);
    }

    public async refresh() {
        this.loaded = false;
        await this.renderResources(true);
    }

    private async renderResources(force = false) {
        if (this.loading) return;
        this.loading = true;

        try {
            this.resourceList.innerHTML = "";
            this.title.innerText = "Resources";
            this.emptyMessage?.remove();

            const resources = await ResourceAPI.getByOutcome(this.outcome.outcomeId);

            const items = resources?.data ?? [];
            if (!items.length) {
                this.showEmptyMessage("No resources linked to this outcome yet.");
                return;
            }

            for (const resource of items) {
                const li = document.createElement("li");

                const a = document.createElement("a");
                a.className = "link underline tiny-padding wave small-round";
                a.href = resource;
                a.target = "_blank";
                a.dataset.url = resource;
                a.innerText = resource;

                const icon = document.createElement("i");
                icon.innerText = "open_in_new";
                a.appendChild(icon);

                li.appendChild(a);
                this.resourceList.appendChild(li);
            }

            enhanceLinks(50);
        } catch (err) {
            console.error("Failed to load resources:", err);
            this.showEmptyMessage("Failed to load resources. Please try again later.");
        } finally {
            this.loading = false;
            this.loaded = true;
        }
    }

    private showEmptyMessage(text: string) {
        this.emptyMessage = document.createElement("p");
        this.emptyMessage.classList.add("text-muted", "small", "tiny-padding");
        this.emptyMessage.innerText = text;
        this.element.appendChild(this.emptyMessage);
    }

    public render(): HTMLDivElement {
        return this.element;
    }
}
