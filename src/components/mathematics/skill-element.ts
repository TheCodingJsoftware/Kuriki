import { Skill } from "@models/skill";

export class SkillElement {
    element: HTMLElement;
    skill: Skill;

    constructor(skill: Skill) {
        this.skill = skill;
        const el = document.createElement("button");
        el.classList.add("skill", "tiny-margin", "chip");
        el.dataset.skillId = skill.id;
        el.dataset.skillName = skill.name;
        el.setAttribute("aria-pressed", "false");

        const icon = document.createElement("i");
        icon.innerHTML = skill.getIcon();

        const span = document.createElement("span");
        span.innerText = `[${skill.id}] ${skill.name}`;

        el.appendChild(icon);
        el.appendChild(span);
        this.element = el;
    }

    setSelected(selected: boolean) {
        this.element.classList.toggle("fill", selected);
        this.element.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    onClick(handler: (skill: Skill, el: SkillElement) => void) {
        this.element.addEventListener("click", () => handler(this.skill, this));
    }
}
