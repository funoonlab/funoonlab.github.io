jQuery(function ($) {
    $.searchExpandForm = function (el) {
        let $widget = $(el);
        let $searchBtn = $widget.find(".the7-search-form-toggle");
        let $searchBox = $searchBtn.closest(".the7-search-form");
        let $searchInput = $widget.find("input.the7-search-form__input");
        let $searchWrap = $widget.find(".the7-search-expand-wrap");
        let methods = {},
        elementorSettings,
        settings;
        const $page = $("#page");

        // Private methods.
        methods = {
            init: function (event) {
                elementorSettings = new The7ElementorSettings($widget);
                settings = elementorSettings.getSettings();
                $searchBtn.on( "click", function (e) {
                    $searchBox.toggleClass("show-input");
                    if (!$searchBox.hasClass(".show-input")) {
                        $searchInput.val("").attr("value", "");
                    }
                    if ($page.width() - ($searchWrap.offset().left - $page.offset().left) - settings['box_expand_width']['size'] < 0 && settings['position'] === 'right') {
                        $widget.css('--width-unit', $page.width() - $searchWrap.offset().left - $page.offset().left + 'px');
                    } 
                    
                    e.preventDefault();
                });
                elementorFrontend.elements.$body
                    .off("click touchstart", methods.closeOnOuterClickHandler)
                    .on("click touchstart", methods.closeOnOuterClickHandler);
            },
            closeOnOuterClickHandler: function (event) {
                /**
                 * Close dropdown if event path not contains menu wrap object.
                 *
                 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
                 */
                if (event.originalEvent && !event.originalEvent.composedPath().includes($searchBox.get(0))) {
                    $searchBox.removeClass("show-input");
                    $searchInput.val("").attr("value", "");
                    $widget.css('--width-unit', '100vw');
                }
            },
        };

        methods.init();
    };

    $.fn.searchExpandForm = function () {
        return this.each(function () {
            if ($(this).data("searchExpandForm") !== undefined) {
                $(this).removeData("searchExpandForm")
            }
            new $.searchExpandForm(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-search-expand-widget.default", function ($widget, $) {
            $(function () {
                $widget.searchExpandForm();
            })
        });
    });
})(jQuery);
