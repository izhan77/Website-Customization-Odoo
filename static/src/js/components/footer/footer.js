odoo.define('website_customizations.footer', function (require) {
    "use strict";

    console.log("Custom footer loaded!");

    // Example: simple animation for footer fade in
    document.addEventListener("DOMContentLoaded", function () {
        let footer = document.getElementById("custom_footer");
        if (footer) {
            footer.classList.add("animate-fadeIn");
        }
    });
});
