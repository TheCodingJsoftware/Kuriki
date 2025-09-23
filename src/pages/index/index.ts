import "@utils/theme"
import "@utils/firebase";
import "@static/css/style.css"
import "beercss"
import "material-dynamic-colors"
import { AppearanceDialog } from "@components/common/dialogs/appearance-dialog";

document.addEventListener("DOMContentLoaded", () => {
    const appearanceButton = document.getElementById("appearance-button");
    appearanceButton?.addEventListener("click", () => {
        new AppearanceDialog();
    });
})