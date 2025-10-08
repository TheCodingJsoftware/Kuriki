import "@utils/theme"
import "@utils/firebase";
import "@static/css/style.css"
import "beercss"
import "material-dynamic-colors"
import { LessonsAPI } from "@api/lessons-api";
import { LessonCard } from "@components/lesson/card-element";

document.addEventListener("DOMContentLoaded", async () => {
    await LessonsAPI.getAll().then(res => {
        const library = document.getElementById("library") as HTMLDivElement;
        library.innerHTML = "";

        for (const [lessonId, lesson] of Object.entries(res.data)) {
            console.log(lessonId, lesson);

            const lessonCard = new LessonCard(lessonId, lesson);
            library.appendChild(lessonCard.render());
        }
    })
    const loadingIndicator = document.getElementById("loading-indicator") as HTMLDivElement;
    loadingIndicator.remove();
})