import { ArchiveData } from "@models/archive-data";
import { getIcon } from 'material-file-icons';

export class ArchiveList {
    constructor(private data: ArchiveData) { }

    render(): HTMLElement {
        const li = document.createElement("li");
        li.classList.add("wave")
        li.addEventListener("click", () => window.open(this.data.url, "_blank"));

        const icon = getIcon(this.data.icon);
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("file-icon");
        iconDiv.innerHTML = icon.svg; // inject raw SVG
        li.appendChild(iconDiv);

        const maxDiv = document.createElement("div");
        maxDiv.classList.add("max");

        const h6 = document.createElement("h6");
        h6.classList.add("small", "wrap");
        h6.textContent = this.data.name;
        maxDiv.appendChild(h6);

        // if (this.data.description) {
        //     const desc = document.createElement("div");
        //     desc.classList.add("wrap", "no-line")
        //     desc.textContent = this.data.description;
        //     maxDiv.appendChild(desc);
        // }
        li.appendChild(maxDiv);
        return li;
    }
}