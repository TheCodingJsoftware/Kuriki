import "@utils/theme"
import "@utils/firebase";
import "@static/css/style.css"
import "beercss"
import "material-dynamic-colors"
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";
import { initInstall } from "@utils/install";
import { SearchOutcomeDialog } from "@components/common/dialogs/search-outcome-dialog";

document.addEventListener("DOMContentLoaded", () => {
    initInstall();
    const searchButton = document.getElementById("search-button") as HTMLButtonElement;
    searchButton.addEventListener("click", () => {
        new SearchOutcomeDialog();
    });

    const appearanceButton = document.getElementById("appearance-button") as HTMLButtonElement;
    appearanceButton.addEventListener("click", () => {
        new AppearanceDialog();
    });
})