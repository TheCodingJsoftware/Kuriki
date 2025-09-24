import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { ScienceRepo } from "@api/science-repo";
import { updateMetaColors } from "@utils/theme";


document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#78dc77");
    updateMetaColors("#78dc77");
    enhanceLinks();

    ScienceRepo.getAllOutcomes().then(outcomes => {
        console.log(outcomes);
    })
});