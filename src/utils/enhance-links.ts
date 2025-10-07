import { getUrlMetadata } from "@utils/get-url-metadata";

export async function enhanceLinks() {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a[data-url]");
    const maxLength = 25;

    await Promise.all(Array.from(anchors).map(async (anchor) => {
        const url = anchor.dataset.url!;
        try {
            const title = await getUrlMetadata(url);
            anchor.href = url;

            // Set full text as tooltip
            anchor.title = title;

            // Truncate text if needed
            anchor.innerText = title.length > maxLength
                ? title.substring(0, maxLength) + "..."
                : title;
        } catch {
            anchor.href = url;

            // Set full text as tooltip
            anchor.title = url;

            // Truncate text if needed
            anchor.innerText = url.length > maxLength
                ? url.substring(0, maxLength) + "..."
                : url;
        }
    }));
}
