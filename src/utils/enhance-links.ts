import { getUrlMetadata } from "@utils/get-url-metadata";

export async function enhanceLinks(maxLength = 25) {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a[data-url]");

    await Promise.all(Array.from(anchors).map(async (anchor) => {
        const url = anchor.dataset.url!;
        try {
            const title = await getUrlMetadata(url);
            anchor.href = url;
            anchor.title = title;

            // Find existing text node (ignore <i>, <span>, etc.)
            const textNode = Array.from(anchor.childNodes)
                .find((node) => node.nodeType === Node.TEXT_NODE);

            const displayText = title.length > maxLength
                ? title.substring(0, maxLength) + "..."
                : title;

            if (textNode) {
                textNode.textContent = displayText;
            } else {
                // No text node → append one after existing elements
                anchor.appendChild(document.createTextNode(displayText));
            }
        } catch {
            anchor.href = url;
            anchor.title = url;

            const textNode = Array.from(anchor.childNodes)
                .find((node) => node.nodeType === Node.TEXT_NODE);

            const displayText = url.length > maxLength
                ? url.substring(0, maxLength) + "..."
                : url;

            if (textNode) {
                textNode.textContent = displayText;
            } else {
                anchor.appendChild(document.createTextNode(displayText));
            }
        }
    }));
}
