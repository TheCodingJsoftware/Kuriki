const RESOURCE_API_ENDPOINT = "https://hbnitv.net/api/kuriki/resources";

type Resource = {
    status: string;
    data: string[];
};

export class ResourceAPI {
    static async getAll() {
        const res = await fetch(RESOURCE_API_ENDPOINT);
        if (!res.ok) throw new Error(`ResourceAPI GET all failed: ${res.statusText}`);
        return res.json();
    }

    static async getByOutcome(outcomeId: string): Promise<Resource> {
        const url = `${RESOURCE_API_ENDPOINT}?outcomeId=${encodeURIComponent(outcomeId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`ResourceAPI GET by outcomeId failed: ${res.statusText}`);
        return res.json();
    }

    static async getByUrl(urlString: string): Promise<Resource> {
        const url = `${RESOURCE_API_ENDPOINT}?url=${encodeURIComponent(urlString)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`ResourceAPI GET by URL failed: ${res.statusText}`);
        return res.json();
    }

    static async post(url: string, outcomeId: string) {
        const payload = { url, outcomeId };

        const res = await fetch(RESOURCE_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`ResourceAPI POST failed: ${res.statusText}`);
        return res.json();
    }

    static async delete(url: string, outcomeId: string) {
        const params = new URLSearchParams({ url, outcomeId });
        const res = await fetch(`${RESOURCE_API_ENDPOINT}?${params.toString()}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error(`ResourceAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
