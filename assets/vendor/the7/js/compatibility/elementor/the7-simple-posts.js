(function ($) {

    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-elements-simple-posts.default", function($scope, $) {
            // Most of the methods here are defined after the document is ready.
            $(function() {
                // Actually show cells with the fade effect.
                window.the7ProcessEffects($scope.find(".wf-cell:not(.shown)"));

                // Init grid js pagination and filtering.
                window.the7ApplyMasonryWidgetCSSGridFiltering($scope.find(".dt-css-grid"));
            });
        });
    });
})(jQuery);
