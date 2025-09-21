import { Signal } from "@utils/signal";

export interface MenuItem {
    key: string;
    label: string;
}

export class MenuButton {
    readonly button: HTMLButtonElement;
    readonly badge: HTMLDivElement;
    readonly onToggle = new Signal<{ key: string; value: boolean }>();
    private readonly menu: HTMLMenuElement;
    private readonly state = new Map<string, boolean>();

    constructor(title: string, iconName: string, items: MenuItem[]) {
        this.button = document.createElement("button");
        this.button.className = "tiny-margin"
        this.button.id = `${title.toLowerCase()}-menu-button`;
        this.button.setAttribute("aria-haspopup", "menu");
        this.button.setAttribute("aria-expanded", "false");
        this.button.title = title;

        const icon = document.createElement("i");
        icon.textContent = "arrow_drop_down";

        const label = document.createElement("span");
        label.textContent = title;

        this.badge = document.createElement("div");
        this.badge.className = "none badge";
        this.badge.style.display = "none";

        this.menu = document.createElement("menu");
        this.menu.className = "no-wrap left";
        this.menu.role = "menu";

        this.button.appendChild(this.badge);
        this.button.appendChild(label);
        this.button.appendChild(icon);
        this.button.appendChild(this.menu);

        this.buildMenu(items);
        this.updateBadge();
    }

    private buildMenu(items: MenuItem[]) {
        this.menu.innerHTML = "";
        this.state.clear();

        const frag = document.createDocumentFragment();

        items.forEach(({ key, label }) => {
            this.state.set(key, false);

            const li = document.createElement("li");
            li.role = "none";

            const a = document.createElement("a");
            a.role = "menuitemcheckbox";
            a.ariaChecked = "false";
            a.dataset.key = key;
            a.textContent = label;

            a.addEventListener("click", e => {
                e.preventDefault();
                const next = !this.state.get(key);
                this.state.set(key, next);
                a.ariaChecked = next ? "true" : "false";
                a.classList.toggle("fill", next);
                this.updateBadge();
                this.onToggle.emit({ key, value: next });
            });

            li.appendChild(a);
            frag.appendChild(li);
        });

        this.menu.appendChild(frag);
    }

    private updateBadge() {
        const activeCount = [...this.state.values()].filter(Boolean).length;
        if (activeCount > 0) {
            this.badge.textContent = String(activeCount);
            this.badge.style.display = "";
        } else {
            this.badge.style.display = "none";
        }
    }

    setSelected(key: string, selected: boolean) {
        if (!this.state.has(key)) return;
        this.state.set(key, selected);
        const link = this.menu.querySelector<HTMLAnchorElement>(`a[data-key="${key}"]`);
        if (link) {
            link.classList.toggle("fill", selected);
            link.ariaChecked = selected ? "true" : "false";
        }
        this.updateBadge();
    }

    getSelected(): string[] {
        return [...this.state.entries()].filter(([, v]) => v).map(([k]) => k);
    }
}
