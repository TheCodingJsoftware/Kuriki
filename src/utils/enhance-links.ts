import { getUrlMetadata } from "@utils/get-url-metadata";

export async function enhanceLinks() {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a[data-url]");

    await Promise.all(Array.from(anchors).map(async (anchor) => {
        const url = anchor.dataset.url!;
        try {
            const title = await getUrlMetadata(url);
            anchor.href = url;
            anchor.innerText = title;
        } catch {
            anchor.href = url;
            anchor.innerText = url;
        }
    }));
}
