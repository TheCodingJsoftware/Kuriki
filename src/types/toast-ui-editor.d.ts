declare module "@toast-ui/editor" {
    export interface EditorOptions {
        el: HTMLElement;
        height?: string;
        previewStyle?: "tab" | "vertical";
        initialEditType?: "markdown" | "wysiwyg";
        initialValue?: string;
        theme?: "dark" | "light";
        usageStatistics?: boolean;
        [key: string]: any; // fallback for untyped options
    }

    export default class Editor {
        constructor(options: EditorOptions);
        getMarkdown(): string;
        setMarkdown(markdown: string): void;
        on(event: string, handler: (...args: any[]) => void): void;
    }
}

declare module "@toast-ui/editor/dist/toastui-editor-viewer" {
    import { EditorOptions } from "@toast-ui/editor";
    interface ViewerOptions extends Partial<EditorOptions> {
        el: HTMLElement;
        initialValue?: string;
        usageStatistics?: boolean;
    }
    export default class Viewer {
        constructor(options: ViewerOptions);
        getMarkdown(): string;
        setMarkdown(markdown: string): void;
    }
}
