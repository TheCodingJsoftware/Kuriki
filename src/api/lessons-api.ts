import { ILesson } from "@models/lesson";

const LESSON_API_ENDPOINT = "https://hbnitv.net/api/kuriki/lessons";

export interface LessonRecord {
    data: ILesson;
    outcomes: string[];
}

export interface LessonSingleResponse {
    status: string;
    data: LessonRecord;
}

export interface LessonAllResponse {
    status: string;
    data: Record<number, LessonRecord>;
}

export class LessonsAPI {
    static async getAll(): Promise<LessonAllResponse> {
        const res = await fetch(LESSON_API_ENDPOINT);
        if (!res.ok) throw new Error(`LessonAPI GET all failed: ${res.statusText}`);
        return res.json();
    }

    static async getById(id: number): Promise<LessonSingleResponse> {
        const res = await fetch(`${LESSON_API_ENDPOINT}?id=${id}`);
        if (!res.ok) throw new Error(`LessonAPI GET by ID failed: ${res.statusText}`);
        return res.json();
    }

    static async getByOutcome(outcomeId: string): Promise<LessonAllResponse> {
        const res = await fetch(`${LESSON_API_ENDPOINT}?outcomeId=${encodeURIComponent(outcomeId)}`);
        if (!res.ok) throw new Error(`LessonAPI GET by outcomeId failed: ${res.statusText}`);
        return res.json();
    }

    static async post(idKey: number, data: ILesson, outcomes: string[]) {
        const payload = { idKey, data, outcomes };

        const res = await fetch(LESSON_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`LessonAPI POST failed: ${res.statusText}`);
        return res.json();
    }

    static async delete(idKey: number) {
        const url = `${LESSON_API_ENDPOINT}?id=${idKey}`;
        const res = await fetch(url, { method: "DELETE" });

        if (!res.ok) throw new Error(`LessonAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
