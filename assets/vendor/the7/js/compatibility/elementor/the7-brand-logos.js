(function ($) {

    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-brand-logos.default", function($scope, $) {
            // Actually show cells with the fade effect.
            window.the7ProcessEffects($scope.find(".wf-cell:not(.shown)"));

            // Init grid js pagination and filtering.
            window.the7ApplyMasonryWidgetCSSGridFiltering($scope.find(".sGrid-container"));
        });
    });
})(jQuery);