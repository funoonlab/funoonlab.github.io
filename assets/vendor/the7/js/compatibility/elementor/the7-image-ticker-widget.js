jQuery(function ($) {
    $.imageTicker = function (el) {
        const $widget = $(el),
            tickerWrapper = $widget.find('.the7-ticker'),
            originalTicker = $widget.find('.the7-ticker-content');
        // Store a reference to the object
        $.data(el, "imageTicker", $widget);
        // Private methods
        methods = {
            init: function () {
                $widget.refresh();

                 $widget.layzrInitialisation();
            },
            duplicateContainer: function () {
                let containerWidth = $widget.offsetWidth;
                let wrapperWidth = originalTicker.scrollWidth;
                const maxClones = 10; 
                let cloneCount = 0;
        
                // Clear any previously added tickers
                tickerWrapper.innerHTML = '';
                // Add the original ticker once
                tickerWrapper.append(originalTicker.clone(true));
                // Duplicate until the total width exceeds the container's width
                while ($('.the7-ticker-content', $widget).width()*cloneCount < $widget.outerWidth()*2) {
                    if (cloneCount >= maxClones) {
                        console.warn("Reached maximum clone limit, exiting loop to avoid infinite loop.");
                        break;
                    }
                    
                    tickerWrapper.append(originalTicker.clone(true));
                    cloneCount++;
                }
                $widget.find(".is-loading").removeClass("is-loading").addClass("is-loaded");
                $(".is-loaded", tickerWrapper).parent().removeClass("layzr-bg");

            },
            
            handleResize: function () {
                methods.duplicateContainer();
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('the7-resize-width-debounce', methods.handleResize);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width-debounce', methods.handleResize);
            },
        };

        $widget.refresh = function () {
            methods.unBindEvents();
            methods.bindEvents();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("imageTicker");
        };
        methods.init();
    };
    $.fn.imageTicker = function () {
        return this.each(function () {
            var widgetData = $(this).data('imageTicker');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.imageTicker(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-image-ticker-widget.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.imageTicker();
            })
        });

    });
})(jQuery);
