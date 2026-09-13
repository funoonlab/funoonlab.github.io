(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        $(".the7-overlay-container > .the7-overlay-content").on("transitionend", function (event) {
            if (event.originalEvent.propertyName === "opacity") {
                const $this = $(this);
                $this.css("pointer-events", $this.css("opacity") === "1" ? "auto" : "");
            }
        });
    });
})(jQuery);
