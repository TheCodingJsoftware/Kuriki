import { SkillType } from "@models/skill-type";

export class SkillTypeElement {
    element: HTMLElement;
    skillType: SkillType;

    constructor(skillType: SkillType) {
        this.skillType = skillType;
        const el = document.createElement("button");
        el.classList.add("skill", "tiny-margin", "chip");
        el.dataset.skillId = skillType.id;
        el.dataset.skillName = skillType.name;
        el.setAttribute("aria-pressed", "false");

        // const icon = document.createElement("i");
        // icon.innerHTML = skillType.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${skillType.id}] ${skillType.name}`;

        // el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (skill: SkillType, el: SkillTypeElement) => void) {
        this.element.addEventListener("click", () => handler(this.skillType, this));
    }
}
