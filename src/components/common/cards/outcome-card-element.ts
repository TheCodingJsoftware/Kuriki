import { CopyOutcomeButton } from "@components/common/buttons/copy-outcome-button";
import { AddResourceButton } from "@components/common/buttons/add-resource-button";
import { CreateLessonPlanButton } from "@components/common/buttons/create-lesson-button";
import { ArchiveListContainer } from "@components/common/archives/archive";
import { LessonListContainer } from "@components/common/lessons/lessons";
import { Outcome } from "@models/outcome";

export class OutcomeCard {
    outcome: Outcome;
    readonly element: HTMLElement;
    readonly header: HTMLElement;
    readonly title: HTMLHeadingElement;
    readonly tags: HTMLElement;
    readonly specificLearningOutcome: HTMLParagraphElement;
    readonly generalLearningOutcomes: HTMLUListElement;
    readonly copyButton: CopyOutcomeButton;
    readonly addResourceButton: AddResourceButton;
    readonly createLessonButton: CreateLessonPlanButton;
    readonly resourceList: ArchiveListContainer;
    readonly lessonsList: LessonListContainer;


    constructor(outcome: Outcome) {
        this.outcome = outcome;

        const container = document.createElement("article");
        container.classList.add("outcome-details", "round", "border", "large-width");
        container.dataset.outcomeId = this.outcome.outcomeId;

        this.header = document.createElement("header");
        this.header.classList.add("row");

        // Title
        this.title = document.createElement("h4");
        this.title.classList.add("max");
        this.title.innerText = `${this.outcome.outcomeId}`;
        this.header.appendChild(this.title);

        // Tags
        this.tags = document.createElement("nav");
        this.tags.classList.add("row", "wrap", "no-space")

        // Description
        this.specificLearningOutcome = document.createElement("p");

        // GLOs (Optional)
        this.generalLearningOutcomes = document.createElement("ul");

        this.copyButton = new CopyOutcomeButton(this.outcome.toString());
        this.header.appendChild(this.copyButton.render());

        this.addResourceButton = new AddResourceButton(this.outcome.outcomeId)
        this.addResourceButton.onResourceAdded.connect(async () => {
            await this.resourceList.refresh();
        });

        this.createLessonButton = new CreateLessonPlanButton(this.outcome);
        this.createLessonButton.onLessonCreated.connect(async () => {
            await this.lessonsList.refresh();
        })

        this.resourceList = new ArchiveListContainer(this.outcome);
        this.lessonsList = new LessonListContainer(this.outcome);

        // Append children
        container.appendChild(this.header);
        container.appendChild(this.tags);
        container.appendChild(this.specificLearningOutcome);
        container.appendChild(this.generalLearningOutcomes);
        container.appendChild(document.createElement("hr"));
        container.appendChild(this.lessonsList.render());
        container.appendChild(this.createLessonButton.render());
        container.appendChild(this.resourceList.render());
        container.appendChild(this.addResourceButton.render());

        this.element = container;
    }

    public render(): HTMLElement {
        return this.element;
    }
}