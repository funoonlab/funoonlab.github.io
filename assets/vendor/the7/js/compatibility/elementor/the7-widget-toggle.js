jQuery(function ($) {
    $.widgetToggle = function (el) {
        var $widget = $(el),
            methods = {};
        $widget.vars = {
            toogleSpeed: 250,
            animationSpeed: 150,
            fadeIn: {opacity: 1},
            fadeOut: {opacity: 0}
        };
        // Store a reference to the object
        $.data(el, "productFilterPrice", $widget);
        // Private methods
        methods = {
            init: function () {
                $widget.find('.the7-toggle-wrap.collapsible').on("click", ".filter-header", function (e) {
                    var $this = $(this),
                        $toggle = $this.parents('.the7-toggle-wrap'),
                        $toggleCont = $toggle.find('.toggle-container');
                    if ($toggle.hasClass('closed')) {
                        $toggleCont.css($widget.vars.fadeOut).slideDown($widget.vars.toogleSpeed).animate(
                            $widget.vars.fadeIn,
                            {
                                duration: $widget.vars.animationSpeed,
                                queue: false,
                            }
                        );
                    } else {
                        $toggleCont.css($widget.vars.fadeOut).slideUp($widget.vars.toogleSpeed);
                    }
                    $toggle.toggleClass('closed');
                });
            },

        };
        //global functions

        methods.init();
    };

    $.fn.widgetToggle = function () {
        return this.each(function () {
            if ($(this).data('widgetToggle') !== undefined) {
                $(this).removeData("widgetToggle")
            }
            new $.widgetToggle(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-taxonomies.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.widgetToggle();
            })
        });
    });
})(jQuery);
