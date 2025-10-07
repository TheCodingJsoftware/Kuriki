import { Signal } from "@utils/signal";
import { LessonAPI } from "@api/lesson-api";
import { Outcome } from "firebase/ai";
import { builtInTemplates } from '@models/lesson-template';

export class CreateLessonPlanButton {
    readonly button: HTMLButtonElement;
    readonly onClick = new Signal<{ key: string; value: boolean }>();
    readonly onLessonCreated = new Signal<number>(); // ✅ emits dateKey when created
    private readonly outcome: Outcome;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.button = document.createElement("button");
        this.button.id = `${outcome}-create-lesson`;
        this.button.title = "Create Lesson";
        this.button.classList.add("create-lesson-button");

        const icon = document.createElement("i");
        icon.textContent = "add";

        const label = document.createElement("span");
        label.textContent = "Create Lesson";

        this.button.appendChild(icon);
        this.button.appendChild(label);

        this.button.addEventListener("click", async () => {
            const idKey = Number(new Date().getTime().toString());

            const lessonData = {
                topic: "",
                name: "",
                author: "Anonymous",
                gradeLevel: "Kindergarten",
                date: new Date().toISOString(),
                timeLength: "~ 45 minutes",
                curricularOutcomes: [this.outcome],
                resourceLinks: [],
                assessmentEvidence: [],
                notes: builtInTemplates[0]!.markdown,
            };

            const outcomes = [this.outcome];

            await LessonAPI.post(idKey, lessonData, outcomes);

            window.location.href = `/lesson.html?id=${idKey}`;

            this.onLessonCreated.emit(idKey);
        });
    }

    render(): HTMLButtonElement {
        return this.button;
    }
}
