(function ($) {
    "use strict";
    $.the7CartWidget = function (el) {
        let $widget = $(el), elementorSettings, settings, methods, itemUpdateTimeout;
        const classes = {
            cartEmpty: 'the7-e-woo-cart-status-cart-empty',
            fragmentContent: 'the7-e-woo-cart-fragment-content',
            fragmentSubtotal: 'the7-e-woo-cart-fragment-subtotal',
        };
        $widget.vars = {
            cartUpdateTimeout: 800,
            supports_html5_storage: true,
        };
        const state = {};
        // Store a reference to the object
        $.data(el, 'the7CartWidget', $widget);
        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);


                try {
                    $widget.vars.supports_html5_storage = ('sessionStorage' in window && window.sessionStorage !== null);
                    window.sessionStorage.setItem('wd', 'test');
                    window.sessionStorage.removeItem('wd');
                } catch (err) {
                    $widget.vars.supports_html5_storage = false;
                }
                $widget.refresh();
            },
            bindEvents: function () {
                elementorFrontend.elements.$body.on('wc_fragments_loaded wc_fragments_refreshed', methods.populateTemplate);
                $widget.on('change input', '.the7-e-mini-cart-product .quantity .qty', methods.updateCartItem);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$body.off('wc_fragments_loaded wc_fragments_refreshed', methods.populateTemplate);
                $widget.off('change input', '.the7-e-mini-cart-product .quantity .qty', methods.updateCartItem);
            },
            populateTemplate: function (e) {
                let $templateEl = $('.the7-e-mini-cart-template');

                let $contentFragment = $templateEl.find('.' + classes.fragmentContent)
                if ($contentFragment.length) {
                    if (!$contentFragment.hasClass(classes.cartEmpty)) {
                        //copy cart content template from the static template
                        let $contentFragment = $templateEl.find('.' + classes.fragmentContent)
                        if ($contentFragment.length) {
                            let $localContent = $widget.find('.' + classes.fragmentContent);
                            $localContent.replaceWith($contentFragment.clone());
                        }
                        //copy cart subtotal template from the static template
                        let $subtotalFragment = $templateEl.find('.' + classes.fragmentSubtotal)
                        if ($subtotalFragment.length) {
                            let $localContent = $widget.find('.' + classes.fragmentSubtotal);
                            $localContent.replaceWith($subtotalFragment.clone());
                        }
                    }
                } else {
                    //use local fragment
                    $contentFragment = $widget.find('.' + classes.fragmentContent)
                }
                //populate cart status from template
                $widget.removeClass(classes.cartEmpty);
                if ($contentFragment.hasClass(classes.cartEmpty)) {
                    $widget.addClass(classes.cartEmpty);
                } else {
                    $(document.body).trigger('the7_wc_init_quantity_buttons');
                }

                $widget.find('.the7_templates > div').each(function () {
                    let className = $(this).attr('class');
                    let $template = $widget.find('.' + className).not(this);
                    if ($template.length) {
                        $template.replaceWith( $(this).clone());
                    }
                });
            },
            updateCartItem: function (e) {
                let isCartFragmentsAvailable = true;
                // wc_cart_fragments_params is required to continue, ensure the object exists
                if (typeof wc_cart_fragments_params === 'undefined') {
                    isCartFragmentsAvailable = false
                }
                clearTimeout(itemUpdateTimeout);
                let input = $(this);
                itemUpdateTimeout = setTimeout(function () {
                    let qtyVal = input.val();
                    let $productItem = input.parents('.the7-e-mini-cart-product');
                    let itemID = $productItem.find('.product-remove .remove').data('cart_item_key');
                    $productItem.addClass('the7-cart-loading');

                    $.ajax({
                        url: dtLocal.ajaxurl,
                        data: {
                            action: 'the7_update_cart_item',
                            item_id: itemID,
                            quantity: qtyVal,
                            get_fragments: isCartFragmentsAvailable,
                        },
                        success: function (data) {
                            // wc_cart_fragments_params is required to continue, ensure the object exists
                            if (isCartFragmentsAvailable) {
                                if (data && data.fragments) {

                                    $.each(data.fragments, function (key, value) {
                                        $(key).replaceWith(value);
                                    });

                                    if ($widget.vars.supports_html5_storage) {
                                        sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
                                        localStorage.setItem(wc_cart_fragments_params.cart_hash_key, data.cart_hash);
                                        sessionStorage.setItem(wc_cart_fragments_params.cart_hash_key, data.cart_hash);

                                        if (data.cart_hash) {
                                            sessionStorage.setItem('wc_cart_created', (new Date()).getTime());
                                        }
                                    }

                                    $(document.body).trigger('wc_fragments_refreshed');
                                }
                            } else {
                                elementorFrontend.elements.$body.trigger('wc_fragment_refresh');
                            }
                        },
                        dataType: 'json',
                        method: 'GET'
                    });
                }, $widget.vars.cartUpdateTimeout);
            },
        };
        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
            methods.populateTemplate();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("the7CartWidget");
        };

        methods.init();
    };

    $.fn.the7CartWidget = function () {
        return this.each(function () {
            var widgetData = $(this).data('the7CartWidget');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.the7CartWidget(this);
        });
    };
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-cart-preview.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.the7CartWidget();
                if (!$widget.hasClass("preserve-img-ratio-y")) {
                    window.the7ApplyWidgetImageRatio($widget);
                }
            })
        });

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-woocommerce-cart-preview", refresh);
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [];
            const controlName = controlView.model.get('name');
            if (controlName == 'item_preserve_ratio') {
                const $widget = $(widgetView.$el);
                $widget.the7WidgetImageRatio("refresh");
            } else if ( (-1 !== refresh_controls.indexOf(controlName))) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('the7CartWidget');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    $widget.the7CartWidget();
                }
            }
        }
    });
})(jQuery);
