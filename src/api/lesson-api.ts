const LESSON_API_ENDPOINT = "http://localhost:5000/api/kuriki/lessons";

export class LessonAPI {
    static async getById(id: number) {
        const res = await fetch(`${LESSON_API_ENDPOINT}?id=${id}`);
        if (!res.ok) throw new Error(`LessonAPI GET failed: ${res.statusText}`);
        return res.json();
    }

    static async post(idKey: number, data: Record<string, any>, outcomes: string[]) {
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
        const res = await fetch(`${LESSON_API_ENDPOINT}/${idKey}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error(`LessonAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
