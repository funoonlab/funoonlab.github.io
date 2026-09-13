(function ($) {
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7_elements.default", function ($scope) {
            the7ApplyColumns($scope.attr("data-id"), $scope.find(".iso-container"), the7GetElementorMasonryColumnsConfig);
            the7ApplyMasonryWidgetCSSGridFiltering($scope.find(".jquery-filter .dt-css-grid"));
        });

        elementorFrontend.hooks.addAction("frontend/element_ready/the7-wc-products.default", function ($scope) {
            the7ApplyColumns($scope.attr("data-id"), $scope.find(".iso-container"), the7GetElementorMasonryColumnsConfig);
            the7ApplyMasonryWidgetCSSGridFiltering($scope.find(".jquery-filter .dt-css-grid"));

            the7ProductsFixAddToCartStyle($scope);
        });
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-wc-products-carousel.default", the7ProductsFixAddToCartStyle);
    });

    function the7ProductsFixAddToCartStyle($scope) {
        $("body").on("wc_cart_button_updated", function (event, $button) {
            if ($button.attr("data-widget-id") !== $scope.attr("data-id")) {
                return;
            }

            const $addedToCartIcon = $scope.find(".elementor-widget-container > .added-to-cart-icon-template").children().clone();
            const $addedToCartButton = $button.next();

            if ( $button.hasClass("woo-popup-button") ) {
                $addedToCartIcon.addClass("popup-icon");
                $addedToCartButton.wrapInner('<span class="filter-popup"></span>');
            }

            $addedToCartButton.append($addedToCartIcon);
        });
    }

    function the7GetElementorMasonryColumnsConfig($container) {
        var $dataAttrContainer = $container.parent().hasClass("mode-masonry") ? $container.parent() : $container;

        var attrDesktop = "data-desktop-columns-num",
            attrTablet ="data-tablet-columns-num",
            attrMobile = "data-mobile-columns-num";

        if ($dataAttrContainer.hasClass('products-shortcode')){
            attrTablet ="data-v-tablet-columns-num";
            attrMobile = "data-phone-columns-num";
        }

        var containerWidth = $container.width() - 1;
        var breakpoints = elementorFrontend.config.breakpoints;
        var columnsNum = 1;

        const widgetSettings = new The7ElementorSettings($container.closest(".elementor-widget"));
        const widgetColumnsWideDesktopBreakpoint = widgetSettings.getSettings("widget_columns_wide_desktop_breakpoint");

        let switchPointWide = dtLocal.elementor.settings.container_width + 1;
        if (widgetColumnsWideDesktopBreakpoint) {
            switchPointWide = widgetColumnsWideDesktopBreakpoint + 1;
        }

        if (switchPointWide <= window.innerWidth) {
            columnsNum = parseInt($dataAttrContainer.attr("data-wide-desktop-columns-num") )
        }
        else {
            var modernizrMqPoints = [
                {
                    breakpoint: breakpoints.xl,
                    columns: parseInt($dataAttrContainer.attr(attrDesktop))
                },
                {
                    breakpoint: breakpoints.lg,
                    columns: parseInt($dataAttrContainer.attr(attrTablet))
                },
                {
                    breakpoint: breakpoints.md,
                    columns: parseInt($dataAttrContainer.attr(attrMobile))
                }
            ];

            modernizrMqPoints = modernizrMqPoints.sort((a, b) => b.breakpoint - a.breakpoint);

            columnsNum = modernizrMqPoints[0].columns;

            modernizrMqPoints.forEach(function (mgPoint) {
                if (window.innerWidth < mgPoint.breakpoint) {
                    columnsNum = mgPoint.columns;
                }
            });
        }

        return {
            singleWidth: Math.floor(containerWidth / columnsNum) + "px",
            doubleWidth: Math.floor(containerWidth / columnsNum) * 2 + "px",
            columnsNum: columnsNum
        };
    }

})(jQuery);
