import { ArchiveData } from "@models/archive-data";
import { getIcon } from 'material-file-icons';

export class ArchiveCard {
    constructor(private data: ArchiveData) { }

    render(): HTMLElement {
        const article = document.createElement("article");
        article.classList.add("round", "border", "s12", "m6", "l4"); // dynamic size

        const topNav = document.createElement("nav");
        topNav.classList.add("row");
        article.appendChild(topNav);

        const iconData = getIcon(this.data.icon);
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("file-icon", "tiny-margin");
        iconDiv.innerHTML = iconData.svg;
        topNav.appendChild(iconDiv);

        const h6 = document.createElement("span");
        h6.classList.add("large-text", "bold", "max");
        h6.textContent = this.data.name;
        topNav.appendChild(h6);

        if (this.data.description) {
            const p = document.createElement("p");
            p.textContent = this.data.description;
            article.appendChild(p);
        }

        // if (this.data.tags?.length) {
        //     const tagDiv = document.createElement("nav");
        //     tagDiv.classList.add("row", "wrap", "no-space");
        //     this.data.tags.forEach(tag => {
        //         const span = document.createElement("span");
        //         span.textContent = tag;
        //         span.classList.add("chip", "small", "tiny-margin");
        //         tagDiv.appendChild(span);
        //     });
        //     article.appendChild(tagDiv);
        // }

        const actionNav = document.createElement("nav");
        actionNav.classList.add("row", "no-space", "right-align");
        article.appendChild(actionNav);

        const a = document.createElement("a");
        a.href = this.data.url;
        a.target = "_blank";
        a.classList.add("button", "primary");
        a.innerHTML = `<span>Open</span><i>open_in_new</i>`;
        actionNav.appendChild(a);

        return article;
    }
}