import { DialogComponent } from "@components/common/dialogs/dialog-component";

export class ShareLessonDialog extends DialogComponent {
    constructor() {
        super({
            id: "share-lesson-dialog",
            title: "Share Lesson",
            bodyContent: `<div>

            </div>`,
        });
        this.init();
    }

    init() {

        window.addEventListener("resize", this.handleResize);
        this.handleResize()
    }
}