import { SnackbarComponent } from "./snackbar";


export class LinkCopiedSnackbar extends SnackbarComponent {
    constructor() {
        super({
            icon: "content_copy",
            message: "Copied to clipboard",
            duration: 1500,
            onClose: () => { }
        });
    }
}