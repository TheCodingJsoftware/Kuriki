import { ILesson } from "@models/lesson";

const ASSIGNMENT_API_ENDPOINT = "https://hbnitv.net/api/kuriki/assignments";

export interface AssignmentRecord {
    data: ILesson;
    outcomes: string[];
}

export interface AssignmentSingleResponse {
    status: string;
    data: AssignmentRecord;
}

export interface AssignmentAllResponse {
    status: string;
    data: Record<number, AssignmentRecord>;
}

export class AssignmentsAPI {
    static async getAll(): Promise<AssignmentAllResponse> {
        const res = await fetch(ASSIGNMENT_API_ENDPOINT);
        if (!res.ok) throw new Error(`AssignmentAPI GET all failed: ${res.statusText}`);
        return res.json();
    }

    static async getById(id: number): Promise<AssignmentSingleResponse> {
        const res = await fetch(`${ASSIGNMENT_API_ENDPOINT}?id=${id}`);
        if (!res.ok) throw new Error(`AssignmentAPI GET by ID failed: ${res.statusText}`);
        return res.json();
    }

    static async getByOutcome(outcomeId: string): Promise<AssignmentAllResponse> {
        const res = await fetch(`${ASSIGNMENT_API_ENDPOINT}?outcomeId=${encodeURIComponent(outcomeId)}`);
        if (!res.ok) throw new Error(`AssignmentAPI GET by outcomeId failed: ${res.statusText}`);
        return res.json();
    }

    static async post(idKey: number, data: ILesson, outcomes: string[]) {
        const payload = { idKey, data, outcomes };

        const res = await fetch(ASSIGNMENT_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`LessonAPI POST failed: ${res.statusText}`);
        return res.json();
    }

    static async delete(idKey: number) {
        const url = `${ASSIGNMENT_API_ENDPOINT}?id=${idKey}`;
        const res = await fetch(url, { method: "DELETE" });

        if (!res.ok) throw new Error(`LessonAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
