jQuery(function ($) {
    $.popupToggleButtonWidget = function (el) {
        let $widget = $(el);
        let $document = $(document);
        let $hambrger = $widget.find(".the7-hamburger");
        let methods = {};
        let classActive = "active";
        let blockClick = false;

        // Private methods.
        methods = {
            init: function (event) {
                function onPopupShow(event, id, $modal) {
                    $widget.addClass(classActive);
                    $document.off('elementor/popup/show', onPopupShow);
                    $document.on('elementor/popup/hide', onPopupHide);
                }

                function onPopupHide(event, id, $modal) {
                    $widget.removeClass(classActive);
                    $document.off('elementor/popup/hide', onPopupHide);
                    blockClick = true;
                    setTimeout(() => {
                        blockClick = false;
                    }, 50);
                }

                $hambrger.on("click", function (e) {
                    // e.preventDefault();
                    if (!$widget.hasClass(classActive) && !blockClick) {
                        $document.on('elementor/popup/show', onPopupShow);
                    } else {
                        e.stopPropagation()
                    }
                })
            }
        };

        methods.init();
    };

    $.fn.popupToggleButtonWidget = function () {
        return this.each(function () {
            if ($(this).data("popupToggleButtonWidget") !== undefined) {
                $(this).removeData("popupToggleButtonWidget")
            }
            new $.popupToggleButtonWidget(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-toggle-popup-widget.default", function ($widget, $) {
            $(function () {
                $widget.popupToggleButtonWidget();
            })
        });
    });
})(jQuery);
