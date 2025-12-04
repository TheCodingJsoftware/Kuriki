import { Signal } from "@utils/signal";
import { LessonsAPI } from "@api/lessons-api";
import { builtInTemplates } from '@models/lesson-template';
import { Outcome } from "@models/outcome";

export class CreateLessonPlanButton {
    readonly button: HTMLButtonElement;
    readonly onClick = new Signal<{ key: string; value: boolean }>();
    readonly onLessonCreated = new Signal<number>();
    private readonly outcome: Outcome;

    constructor(outcome: Outcome) {
        this.outcome = outcome;

        this.button = document.createElement("button");
        this.button.id = `${outcome}-create-lesson`;
        this.button.title = "Create Lesson";
        this.button.classList.add("create-lesson-button", "border");

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
                author: localStorage.getItem("authorName") || "Anonymous",
                gradeLevel: this.outcome.grade,
                date: new Date().toISOString(),
                timeLength: "~ 1 hour",
                teacherNotes: "",
                curricularOutcomes: [this.outcome.outcomeId],
                resourceLinks: [],
                assessmentEvidence: [],
                notes: builtInTemplates[0]!.markdown,
            };

            const outcomes = [this.outcome.outcomeId];

            await LessonsAPI.post(idKey, lessonData, outcomes);

            window.location.href = `/lesson.html?id=${idKey}`;

            this.onLessonCreated.emit(idKey);
        });
    }

    render(): HTMLButtonElement {
        return this.button;
    }
}
