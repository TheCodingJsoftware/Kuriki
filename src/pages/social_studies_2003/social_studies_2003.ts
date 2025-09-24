import "@utils/theme"
import "beercss"
import "material-dynamic-colors"
import "@static/css/style.css"
import { enhanceLinks } from "@utils/enhance-links";
import { SocialStudiesRepo } from "@api/social-studies-repo";
import { updateMetaColors } from "@utils/theme";


document.addEventListener("DOMContentLoaded", () => {
    ui("theme", "#dbc90a");
    updateMetaColors("#dbc90a");
    enhanceLinks();

    SocialStudiesRepo.getAllOutcomes().then(outcomes => {
        console.log(outcomes);
    })
});