const RESOURCE_API_ENDPOINT = "https://hbnitv.net/api/kuriki/resources";

export class ResourceAPI {
    /**
     * Fetch all resources or filter by specific outcomeId
     */
    static async get(outcomeId?: string) {
        const url = outcomeId
            ? `${RESOURCE_API_ENDPOINT}?outcomeId=${encodeURIComponent(outcomeId)}`
            : RESOURCE_API_ENDPOINT;

        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`ResourceAPI GET failed: ${res.statusText}`);
        return res.json();
    }

    /**
     * Add a new resource link for a specific outcome.
     * (URL + outcomeId combination must be unique)
     */
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

    /**
     * Delete a resource by URL + outcomeId combination
     */
    static async delete(url: string, outcomeId: string) {
        const params = new URLSearchParams({ url, outcomeId });
        const res = await fetch(`${RESOURCE_API_ENDPOINT}?${params.toString()}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error(`ResourceAPI DELETE failed: ${res.statusText}`);
        return res.json();
    }
}
