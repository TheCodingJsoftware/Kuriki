import { DialogComponent } from "@components/common/dialogs/dialog-component";
import { LinkCopiedSnackbar } from "../snackbar/link-copied";

export class ShareLessonDialog extends DialogComponent {
    constructor() {
        super({
            id: "share-lesson-dialog",
            title: "Share Lesson",
            bodyContent: `<div class="grid">
                <button class="s12 border extra" class="responsive" id="copy-button">
                    <span id="link" class="underline"></span>
                    <i>content_copy</i>
                </button>
                <label class="s12 checkbox">
                    <input type="checkbox" id="share-as-preview">
                    <span>Share as preview only</span>
                </label>
            </div>`,
        });
        this.init();
    }

    private updateLink() {
        const shareAsPreview = this.element.querySelector("#share-as-preview") as HTMLInputElement;
        const linkElement = this.element.querySelector("#link") as HTMLButtonElement;

        let link = window.location.href;

        if (shareAsPreview.checked) {
            link += "#preview-only"
        }
        linkElement.innerText = link;
    }

    init() {
        const copyButton = this.element.querySelector("#copy-button") as HTMLButtonElement;
        copyButton.addEventListener("click", () => {
            const link = this.element.querySelector("#link") as HTMLButtonElement;
            navigator.clipboard.writeText(link.textContent);
            new LinkCopiedSnackbar();
        })

        const shareAsPreview = this.element.querySelector("#share-as-preview") as HTMLInputElement;
        shareAsPreview.addEventListener("input", () => {
            this.updateLink();
            localStorage.setItem("shareAsPreview", shareAsPreview.checked ? "true" : "false");
        })

        shareAsPreview.checked = localStorage.getItem("shareAsPreview") === "true";

        window.addEventListener("resize", this.handleResize);
        this.handleResize()
        this.updateLink();
    }
}