function getPreferredMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadTheme(overideMode?: string) {
    const mode = localStorage.getItem("mode");
    if (mode) {
        ui("mode", mode);
    } else {
        ui("mode", getPreferredMode());
    }
    const themeColor = localStorage.getItem("theme") || "#ffb870";
    ui("theme", themeColor);

    updateTileColor(themeColor);
}


export function invertImages() {
    let mode = ui("mode");
    const images = document.querySelectorAll<HTMLImageElement>('img:not(.ignore-invert)');
    if (images) {
        for (let i = 0; i < images.length; i++) {
            const image = images[i]
            if (image) {
                if (mode === "light") {
                    image.style.filter = 'invert(0)';
                } else {
                    image.style.filter = 'invert(0.9)';
                }
            }
        }
    }
}

function updateTileColor(color: string) {
    let metaTag = document.querySelector<HTMLMetaElement>('meta[name="msapplication-TileColor"]');
    if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = "msapplication-TileColor";
        document.head.appendChild(metaTag);
    }
    metaTag.content = color;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    ui('mode', newTheme);
});

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    invertImages();
})