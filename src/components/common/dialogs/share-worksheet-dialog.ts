import { DialogComponent } from "@components/common/dialogs/dialog-component";
import { LinkCopiedSnackbar } from "@components/common/snackbar/link-copied";

export class ShareWorksheetDialog extends DialogComponent {
    constructor() {
        super({
            id: "share-worksheet-dialog",
            title: "Share Worksheet",
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
        const linkElement = this.element.querySelector("#link") as HTMLSpanElement;

        let link = window.location.href;

        // If checkbox is checked but link doesn't already have #preview-only, add it
        if (shareAsPreview.checked && !link.includes("#preview-only")) {
            link += "#preview-only";
        }
        // If unchecked but link includes #preview-only, remove it
        else if (!shareAsPreview.checked && link.includes("#preview-only")) {
            link = link.replace("#preview-only", "");
        }

        linkElement.innerText = link;
    }

    init() {
        const copyButton = this.element.querySelector("#copy-button") as HTMLButtonElement;
        const shareAsPreview = this.element.querySelector("#share-as-preview") as HTMLInputElement;

        // Determine if current URL already has #preview-only
        const isPreviewLink = window.location.href.includes("#preview-only");

        // If yes, lock the checkbox (checked and disabled)
        if (isPreviewLink) {
            shareAsPreview.checked = true;
            shareAsPreview.disabled = true;
        } else {
            // Otherwise, load last saved preference
            shareAsPreview.checked = localStorage.getItem("shareAsPreview") === "true";
            shareAsPreview.disabled = false;
        }

        copyButton.addEventListener("click", () => {
            const link = this.element.querySelector("#link") as HTMLSpanElement;
            navigator.clipboard.writeText(link.textContent || "");
            new LinkCopiedSnackbar();
        });

        shareAsPreview.addEventListener("input", () => {
            this.updateLink();
            localStorage.setItem("shareAsPreview", shareAsPreview.checked ? "true" : "false");
        });

        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        this.updateLink();
    }
}
