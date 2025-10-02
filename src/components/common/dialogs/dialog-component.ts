type DialogPosition = "left" | "right" | "top" | "bottom" | "max";
type DialogWidth = "small-width" | "medium-width" | "large-width";

interface DialogOptions {
    id?: string | undefined;
    title?: string | undefined;
    position?: DialogPosition | null | undefined;
    width?: DialogWidth | null | undefined;
    onClose?: (() => void) | undefined;
    autoRemove?: boolean;
    headerContent?: string | undefined;
    bodyContent?: string | undefined;
    footerContent?: string | undefined;
    isModal?: boolean;
}

export class DialogComponent {
    protected readonly bodyElement: HTMLElement;
    private readonly dialog: HTMLDialogElement;
    private options: DialogOptions;
    private readonly headerElement: HTMLElement;
    private readonly footerElement: HTMLElement;

    constructor(options: DialogOptions = {}) {
        this.headerElement = document.createElement("header");
        this.bodyElement = document.createElement("div");
        this.footerElement = document.createElement("footer");

        this.options = {
            id: options.id,
            title: options.title ?? "Dialog",
            position: options.position ?? null,
            width: options.width ?? null,
            onClose: options.onClose,
            autoRemove: options.autoRemove ?? true,
            headerContent: options.headerContent,
            bodyContent: options.bodyContent,
            footerContent: options.footerContent,
            isModal: options.isModal ?? false
        };

        this.dialog = document.createElement("dialog");

        if (this.options.id) this.dialog.id = this.options.id;
        if (this.options.position) this.dialog.classList.add(this.options.position);
        if (this.options.width) this.dialog.classList.add(this.options.width);
        if (this.options.isModal) this.dialog.classList.add("modal");

        this.createDialogContent();

        this.dialog.addEventListener("close", () => {
            if (this.options.autoRemove) {
                setTimeout(() => this.dialog.remove(), 200);
            }
            this.options.onClose?.();
        });

        document.body.appendChild(this.dialog);
        ui(this.dialog);
        document.addEventListener("keydown", this.handleEscape);
    }

    public get element(): HTMLDialogElement {
        return this.dialog;
    }

    public query<T extends Element>(selector: string): T | null {
        return this.dialog.querySelector(selector);
    }

    public close(): void {
        window.removeEventListener("resize", this.handleResize);
        document.removeEventListener("keydown", this.handleEscape);

        ui(this.dialog)

        if (this.options.autoRemove) {
            setTimeout(() => this.dialog.remove(), 200);
        }

        this.options.onClose?.();
    }


    private createDialogContent(): void {
        const dialogContent = document.createElement("div");

        if (this.options.headerContent) {
            this.headerElement.innerHTML = this.options.headerContent;
            this.headerElement.className = "dialog-header";
        } else {
            this.createDefaultHeader();
        }
        dialogContent.appendChild(this.headerElement);

        if (this.options.bodyContent) {
            this.bodyElement.innerHTML = this.options.bodyContent;
            this.bodyElement.className = "dialog-body";
            dialogContent.appendChild(this.bodyElement);
        } else {
            this.createDefaultBody();
        }

        if (this.options.footerContent) {
            this.footerElement.innerHTML = this.options.footerContent;
            this.footerElement.className = "dialog-footer";
            dialogContent.appendChild(this.footerElement);
        } else {
            this.createDefaultFooter();
        }

        this.dialog.appendChild(dialogContent);
    }

    private createDefaultHeader(): void {
        const nav = document.createElement("nav");
        nav.className = "row";

        const header = document.createElement("h5");
        header.className = "max";
        if (this.options.title) {
            header.innerText = this.options.title;
        }

        const closeButton = document.createElement("button");
        closeButton.className = "circle transparent";
        closeButton.id = "close-button";
        closeButton.innerHTML = "<i>close</i>";
        closeButton.addEventListener("click", () => this.close());

        nav.appendChild(header);
        nav.appendChild(closeButton);

        this.headerElement.appendChild(nav);
    }

    private createDefaultBody(): void {
        const body = document.createElement("div");
        body.className = "dialog-body";
        this.bodyElement.appendChild(body);
    }

    private createDefaultFooter(): void {
        const footer = document.createElement("div");
        footer.className = "dialog-footer";
        this.footerElement.appendChild(footer);
    }

    private handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            if (this.dialog.open) {
                this.dialog.close();
            }
        }
    };

    public handleResize = () => {
        if (window.innerWidth < 600) {
            this.dialog.classList.add("max");
        } else {
            this.dialog.classList.remove("max");
        }
    };

}