import { IWorksheet } from "@models/worksheet";

const WORKSHEET_API_ENDPOINT = "https://hbnitv.net/api/kuriki/worksheets";

export interface WorksheetRecord {
    data: IWorksheet;
    outcomes: string[];
}

export interface WorksheetSingleResponse {
    status: string;
    data: WorksheetRecord;
}

export interface WorksheetAllResponse {
    status: string;
    data: Record<number, WorksheetRecord>;
}

export class WorksheetsAPI {
    static async getAll(): Promise<WorksheetAllResponse> {
        const res = await fetch(WORKSHEET_API_ENDPOINT);
        if (!res.ok) throw new Error(`WorksheetAPI GET all failed: ${res.statusText}`);
        return res.json();
    }

    static async getById(id: number): Promise<WorksheetSingleResponse> {
        const res = await fetch(`${WORKSHEET_API_ENDPOINT}?id=${id}`);
        if (!res.ok) throw new Error(`WorksheetAPI GET by ID failed: ${res.statusText}`);
        return res.json();
    }

    static async getByOutcome(outcomeId: string): Promise<WorksheetAllResponse> {
        const res = await fetch(`${WORKSHEET_API_ENDPOINT}?outcomeId=${encodeURIComponent(outcomeId)}`);
        if (!res.ok) throw new Error(`WorksheetAPI GET by outcomeId failed: ${res.statusText}`);
        return res.json();
    }

    static async post(idKey: number, data: IWorksheet, outcomes: string[]) {
        const payload = { idKey, data, outcomes };

        const res = await fetch(WORKSHEET_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`WorksheetAPI POST failed: ${res.statusText}`);
        return res.json();
    }

    static async delete(idKey: number) {
        const url = `${WORKSHEET_API_ENDPOINT}?id=${idKey}`;
        const res = await fetch(url, { method: "DELETE" });

        if (!res.ok) throw new Error(`WorksheetAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
