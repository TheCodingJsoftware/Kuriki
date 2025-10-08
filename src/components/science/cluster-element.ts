import { Cluster } from "@models/science-cluster";

export class ClusterElement {
    element: HTMLElement;
    cluster: Cluster;

    constructor(cluster: Cluster) {
        this.cluster = cluster;
        const el = document.createElement("button");
        el.classList.add("cluster", "tiny-margin", "chip");
        el.dataset.clusterId = cluster.id;
        el.dataset.clusterName = cluster.name;
        el.setAttribute("aria-pressed", "false");

        const icon = document.createElement("i");
        icon.innerHTML = cluster.getIcon();

        const span = document.createElement("span");
        span.innerText = `${cluster.name}`;

        el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (cluster: Cluster, el: ClusterElement) => void) {
        this.element.addEventListener("click", () => handler(this.cluster, this));
    }
}
