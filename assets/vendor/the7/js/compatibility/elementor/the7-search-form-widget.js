jQuery(function ($) {
    $.searchForm = function (el) {
        let $widget = $(el),
            $searchInput = $widget.find('.the7-search-form__input'),
            $searchClear = $widget.find('.the7-clear-search');
            methods = {};
        // Private methods
        methods = {
            init: function () {
                if($searchInput.val().length > 0 ){
                    $searchInput.parent().addClass('show-clear');
                }
                $searchInput.focusout(function() {
                    if($searchInput.val().length <= 0 ){
                        $searchInput.parent().removeClass('show-clear');
                    }
                });
                $searchInput.on("keyup", function() {
                    if($searchInput.val().length > 0 ){
                        $searchInput.parent().addClass('show-clear');
                    }
                    else {
                        $searchInput.parent().removeClass('show-clear');
                    }
                });


                $searchClear.click(function(e){
                    $searchClear.parent().removeClass('show-clear');
                    $searchInput.val("").attr("value", "");
                })
            },
        };
        //global functions

        methods.init();
    };

    $.fn.searchForm = function () {
        return this.each(function () {
            if ($(this).data('searchForm') !== undefined) {
                $(this).removeData("searchForm")
            }
            new $.searchForm(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-search-form-widget.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.searchForm();
            })
        });
    });
})(jQuery);
