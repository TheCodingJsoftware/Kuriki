import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { BiologyRepo } from "@api/biology-repo";
import { updateMetaColors } from "@utils/theme";


document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#9ed75b");
    updateMetaColors("#9ed75b");
    enhanceLinks();

    BiologyRepo.getAllOutcomes().then(outcomes => {
        console.log(outcomes);
    })
});