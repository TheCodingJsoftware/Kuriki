import { WorksheetsAPI } from "@api/worksheets-api";
import { Outcome } from "@models/outcome";
import { enhanceLinks } from "@utils/enhance-links";

export class WorksheetListContainer {
    readonly element: HTMLDivElement;
    private readonly worksheetList: HTMLOListElement;
    private readonly title: HTMLHeadingElement;
    private readonly outcome: Outcome;
    private observer?: IntersectionObserver;
    private loaded = false;
    private loading = false;
    private emptyMessage?: HTMLParagraphElement;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.element = document.createElement("div");
        this.element.classList.add("worksheet-list-container", "top-padding");

        this.title = document.createElement("h5");
        this.title.innerText = "Worksheets";
        this.element.appendChild(this.title);

        this.worksheetList = document.createElement("ol");
        this.worksheetList.classList.add("worksheet-list", "no-space");
        this.element.appendChild(this.worksheetList);

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
                        this.renderWorksheets();
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
        await this.renderWorksheets(true);
    }

    private async renderWorksheets(force = false) {
        if (this.loading) return;
        this.loading = true;

        try {
            // reset content
            this.worksheetList.innerHTML = "";
            this.title.innerText = "Worksheets";
            this.emptyMessage?.remove();

            const worksheets = await WorksheetsAPI.getByOutcome(this.outcome.outcomeId);

            const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

            const entries = Object.entries(worksheets?.data ?? {}).sort(([, a], [, b]) => {
                const nameCompare = collator.compare(a.data.name, b.data.name);
                if (nameCompare !== 0) return nameCompare;

                return collator.compare(a.data.topic, b.data.topic);
            });

            if (entries.length === 0) {
                this.showEmptyMessage("No worksheets have been added yet.");
                return;
            }

            for (const [id, worksheet] of entries) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.className = "link underline tiny-padding wave small-round";
                a.href = `worksheet.html?id=${id}`;
                a.innerText = `${worksheet.data.name}: ${worksheet.data.topic} by ${worksheet.data.author}`;
                a.title = a.innerText;

                const icon = document.createElement("i");
                icon.innerText = "open_in_new";
                a.appendChild(icon);

                li.appendChild(a);
                this.worksheetList.appendChild(li);
            }

            enhanceLinks(50);
        } catch (err) {
            console.error("Failed to load worksheets:", err);
            this.showEmptyMessage("Failed to load worksheets. Please try again later.");
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
