(function ($) {

    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7_photo-scroller.default", function ($scope, $) {
             $scope.find(".photoSlider").photoSlider();
             $scope.find(".full-screen-btn").off("click").on("click", function(e) {
                 e.preventDefault();
             });
        });
    });

})(jQuery);

