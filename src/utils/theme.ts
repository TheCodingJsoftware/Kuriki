function getPreferredMode() {
    return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function getPrimaryColor(): string {
    // Read from BeerCSS's CSS variable
    return getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "#ffb870"; // fallback
}

function loadTheme(overideMode?: string) {
    const mode = localStorage.getItem("mode") || getPreferredMode();
    ui("mode", overideMode || mode);

    const themeColor = localStorage.getItem("theme") || getPrimaryColor();
    ui("theme", themeColor);

    // Use the current --primary as tile color
    updateTileColor(getPrimaryColor());
}

export function invertImages() {
    let mode = ui("mode");
    const images = document.querySelectorAll<HTMLImageElement>('img:not(.ignore-invert)');
    if (images) {
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if (image) {
                if (mode === "light") {
                    image.style.filter = "invert(0)";
                } else {
                    image.style.filter = "invert(0.9)";
                }
            }
        }
    }
}

function updateTileColor(color: string) {
    let metaTag = document.querySelector<HTMLMetaElement>(
        'meta[name="msapplication-TileColor"]'
    );
    if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = "msapplication-TileColor";
        document.head.appendChild(metaTag);
    }
    metaTag.content = color;

    // also update <meta name="theme-color"> for Chrome mobile address bar
    let themeMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
    );
    if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        document.head.appendChild(themeMeta);
    }
    themeMeta.content = color;
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    const newTheme = e.matches ? "dark" : "light";
    ui("mode", newTheme);
    updateTileColor(getPrimaryColor()); // reapply correct --primary
});

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    invertImages();
});
