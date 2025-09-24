import "@utils/theme"
import "@utils/firebase";
import "@static/css/style.css"
import "beercss"
import "material-dynamic-colors"
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";
import { initInstall } from "@utils/install";

document.addEventListener("DOMContentLoaded", () => {
    initInstall();
    const appearanceButton = document.getElementById("appearance-button") as HTMLButtonElement;
    appearanceButton.addEventListener("click", () => {
        new AppearanceDialog();
    });
})