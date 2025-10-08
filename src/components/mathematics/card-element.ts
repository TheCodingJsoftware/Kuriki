import { highlightKeywords } from "@utils/keywords";
import { mathematicsQuickSearchKeyWords } from "@utils/quick-search-words";
import { SkillElement } from "./skill-element";
import { StrandElement } from "./strand-element";
import { MathematicsOutcome } from "@models/mathematics-outcome";
import { CopyOutcomeButton } from "@components/common/buttons/copy-outcome-button";
import { AddResourceButton } from "@components/common/buttons/add-resource-button";
import { CreateLessonPlanButton } from "@components/common/buttons/create-lesson-button";
import { ResourceListContainer } from "@components/common/resources/resources";
import { LessonListContainer } from "@components/common/lessons/lessons";

export class MathematicsOutcomeCard {
    private outcome: MathematicsOutcome;
    public element: HTMLElement;

    constructor(outcome: MathematicsOutcome) {
        this.outcome = outcome;

        const container = document.createElement("article");
        container.classList.add("outcome-details", "round", "border", "large-width");
        container.dataset.outcomeId = this.outcome.outcomeId;

        // Title
        const title = document.createElement("h6");
        title.innerText = `${this.outcome.outcomeId}${this.getKeywords()}`;

        // Skills + Strand row
        const skills = document.createElement("nav");
        skills.classList.add("row", "wrap", "no-space");

        const strandElement = new StrandElement(this.outcome.strand);
        // if (selectedStrands.has(this.outcome.strand.id)) {
        //     strandElement.setSelected(true);
        // }
        skills.appendChild(strandElement.element);

        for (const skill of this.outcome.skills) {
            const skillElement = new SkillElement(skill);
            // if (selectedSkills.has(skill.id)) {
            //     skillElement.setSelected(true);
            // }
            skills.appendChild(skillElement.element);
        }

        // Description
        const description = document.createElement("p");
        description.innerHTML = highlightKeywords(
            this.outcome.specificLearningOutcome,
            mathematicsQuickSearchKeyWords
        );

        // General Learning Outcomes list
        const list = document.createElement("ul");
        this.outcome.generalLearningOutcomes.forEach(glo => {
            const li = document.createElement("li");
            li.innerHTML = highlightKeywords(glo, mathematicsQuickSearchKeyWords);
            list.appendChild(li);
        });

        const copyOutcome = new CopyOutcomeButton(this.outcome.toString());
        const addResource = new AddResourceButton(this.outcome.outcomeId)
        addResource.onResourceAdded.connect(async () => {
            await resourceList.refresh();
        });
        const createNewLesson = new CreateLessonPlanButton(this.outcome.outcomeId);
        createNewLesson.onLessonCreated.connect(async () => {
            await lessonsList.refresh();
        })

        const actionNav = document.createElement("nav");
        actionNav.classList.add("row", "wrap");
        actionNav.appendChild(addResource.render());
        actionNav.appendChild(createNewLesson.render());
        actionNav.appendChild(copyOutcome.render());

        const resourceList = new ResourceListContainer(this.outcome);
        const lessonsList = new LessonListContainer(this.outcome);

        // Append children
        container.appendChild(title);
        container.appendChild(skills);
        container.appendChild(description);
        container.appendChild(list);
        container.appendChild(actionNav);
        container.appendChild(lessonsList.render());
        container.appendChild(resourceList.render());

        this.element = container;
    }

    public render(): HTMLElement {
        return this.element;
    }

    private getKeywords(): string {
        // placeholder: if you have a getKeywords util, call it here
        return "";
    }
}