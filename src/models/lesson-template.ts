export interface LessonTemplate {
    id: string;
    name: string;
    description?: string;
    markdown: string;
}

export const builtInTemplates: LessonTemplate[] = [
    {
        id: "default",
        name: "Default Lesson Plan",
        description: "Cross-curricular, resources, learning plan, reflections.",
        markdown: `
## Cross-Curricular/Real World Connections

*

| Materials and Resources | Student Specific Planning |
| ----------------------- | ------------------------- |
| Resources, handouts, ICT, equipment, etc.<ul><li></li></ul> | Differentiation based on readiness, interests, profile<ul><li></li></ul> |

## Learning Plan

| Phase | Description | Time |
| ----- | ----------- | ---- |
| Activate |  | 10 minutes |
| Acquire |  | 20 minutes |
| Apply |  | 25 minutes |
| Closure |  | 5 minutes |

## Reflections

*
    `
    },
    {
        id: "simple",
        name: "Simple Notes",
        description: "Minimal structure with free-form notes.",
        markdown: `
## Lesson Objectives

<ul><li></li></ul>

## Activities

<ul><li></li></ul>

## Assessment

<ul><li></li></ul>
    `
    },
    {
        id: "daily",
        name: "Daily Snapshot",
        description: "Quick overview of objectives, activities, and homework.",
        markdown: `
## Objectives
-

## Activities
-

## Homework
-
    `
    }
];
