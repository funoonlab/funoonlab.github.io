(function ($) {
    "use strict";
    $.the7MenuCart = function (el) {
        let $widget = $(el), elementorSettings, settings,
            $cartBtn = $widget.find('.dt-menu-cart__toggle'),
            $popupButton = $widget.find('.the7-popup-button-link'),
            methods = {};
        // Store a reference to the object
        $.data(el, "the7MenuCart", $widget);
        const classes = {
           emptyCart: "dt-empty-cart"
        };

        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);
                $widget.refresh();
            },
            bindEvents: function () {
                if ($cartBtn.hasClass('has-popup')) {

                    if (typeof settings !== 'undefined') {
                        if (settings['popup_action_adding_product'] == 'yes') {
                            elementorFrontend.elements.$body.on('added_to_cart', methods.displayPopup);
                            
                        }
                    }
                }
                elementorFrontend.elements.$body.on('wc_fragments_loaded wc_fragments_refreshed', methods.onFragmentRefresh);
            },
            unBindEvents: function () {
                $cartBtn.off('click', methods.displayPopup);
                elementorFrontend.elements.$body.off('added_to_cart', methods.displayPopup);
                elementorFrontend.elements.$body.off('wc_fragments_loaded wc_fragments_refreshed', methods.onFragmentRefresh);
            },
            onFragmentRefresh: function (e) {
                const $cartCount = $widget.find('.dt-cart-subtotal').attr('data-product-count');
                $widget.find('[data-counter]').attr('data-counter', $cartCount);
                $widget.find('.dt-cart-indicator').text('(' + $cartCount + ')');
                if ($cartCount > 0) {
                    $widget.removeClass(classes.emptyCart);
                } else {
                    $widget.addClass(classes.emptyCart);
                }
            },
            displayPopup: function (e, p) {
                if (p && p.e_manually_triggered){ //do not open popup on page save
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                $cartBtn.find('.dt-menu-cart__toggle_button').trigger( "click" );
            },
        };
        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("the7MenuCart");
        };
        methods.init();
    };

    $.fn.the7MenuCart = function () {
        return this.each(function () {
            var widgetData = $(this).data('the7MenuCart');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.the7MenuCart(this);
        });
    };

    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-menu-cart.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.the7MenuCart();
            })
        });

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-woocommerce-menu-cart", refresh);
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                'popup_action_adding_product',
            ];
            const controlName = controlView.model.get('name');
            if ( (-1 !== refresh_controls.indexOf(controlName))) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('the7MenuCart');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    $widget.the7MenuCart();
                }
            }
        }
    });
})(jQuery);
