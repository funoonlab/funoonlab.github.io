jQuery(function ($) {
    $.imageBox = function (el) {
        let $widget = $(el),
            methods,
            elementorSettings,
            elementorAnimation,
            elementsWithAnimation,
            settings,
            overlayTemplateExist = false,
            $overlay,
            visibility;
        // Store a reference to the object
        $.data(el, "imageBox", $widget);
        // Private methods
        methods = {
            init: function () {
                $widget.layzrInitialisation();

                $overlay = $widget.find('.the7-overlay-content');
                if ($overlay.length) {
                    overlayTemplateExist = true;
                    elementorAnimation = new The7ElementorAnimation();
                    elementsWithAnimation = elementorAnimation.findAnimationsInNode($overlay);
                }

                elementorSettings = new The7ElementorSettings($widget);
                $widget.refresh();

                if (overlayTemplateExist) {
                    switch (visibility) {
                        case 'hover-hide':
                            elementorAnimation.animateElements(elementsWithAnimation);
                            break;
                    }
                }

                // Support image transitions.
                $widget.one('mouseenter touchstart', function () {
                    $widget.find('.post-thumbnail-rollover img').addClass('run-img-transitions');
                });
            },
            handleResize: function () {
                if (overlayTemplateExist) {
                    visibility = The7ElementorSettings.getResponsiveControlValue(settings, 'hover_visibility');
                    switch (visibility) {
                        case 'always':
                            elementorAnimation.animateElements(elementsWithAnimation);
                            break;
                        case 'disabled':
                            elementorAnimation.resetElements(elementsWithAnimation);
                            break;
                    }
                }
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('the7-resize-width-debounce', methods.handleResize);
                if (overlayTemplateExist) {
                    $widget.on({mouseenter: methods.mouseenter, mouseleave: methods.mouseleave});
                    $widget.on('the7-slide:change', methods.onSlideChange);
                    $widget.on('the7-slide:hide', methods.onSlideHide);
                    $widget.on('the7-slide:init', methods.onSlideInit);
                }
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width-debounce', methods.handleResize);
                if (overlayTemplateExist) {
                    $widget.off({mouseenter: methods.mouseenter, mouseleave: methods.mouseleave});
                    $widget.off('the7-slide:change', methods.onSlideChange);
                    $widget.off('the7-slide:hide', methods.onSlideHide);
                    $widget.off('the7-slide:init', methods.onSlideInit);
                }
            },
            mouseenter: function () {
                switch (visibility) {
                    case 'hover':
                        methods.addAnimation();
                        break;
                    case 'hover-hide':
                        methods.resetAnimation();
                        break;
                }
            },
            mouseleave: function () {
                switch (visibility) {
                    case 'hover':
                        methods.resetAnimation();
                        break;
                    case 'hover-hide':
                        methods.addAnimation();
                        break;
                }
            },

            onSlideChange: function (event) {
                if (overlayTemplateExist) {
                    let visibility_activate = ['always', 'hover-hide'];
                    if (visibility_activate.includes(visibility)) {
                        elementorAnimation.animateElements(elementsWithAnimation);
                    }
                }
            },

            onSlideHide: function (event) {
                if (overlayTemplateExist) {
                    let visibility_activate = ['always', 'hover-hide'];
                    if (visibility_activate.includes(visibility)) {
                        elementorAnimation.resetElements(elementsWithAnimation);
                    }
                }
            },

            onSlideInit: function (event) {
                if (overlayTemplateExist) {
                    let visibility_activate = ['disabled', 'hover']
                    if (visibility_activate.includes(visibility)) {
                        elementorAnimation.resetElements(elementsWithAnimation);
                    }
                }
            },

            onOverlayTransitionsEnd: function (event) {
                if (event.originalEvent.propertyName === "opacity") {
                    elementorAnimation.resetElements(elementsWithAnimation);
                }
            },
            resetAnimation: function () {
                $overlay.on("transitionend", methods.onOverlayTransitionsEnd);
            },
            addAnimation: function () {
                $overlay.off("transitionend", methods.onOverlayTransitionsEnd);
                elementorAnimation.animateElements(elementsWithAnimation);
            }
        };

        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("imageBox");
        };
        methods.init();
    };
    $.fn.imageBox = function () {
        return this.each(function () {
            var widgetData = $(this).data('imageBox');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.imageBox(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7_image_box_widget.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.imageBox();
            })
        });
        elementorFrontend.hooks.addAction("frontend/element_ready/the7_image_box_grid_widget.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.imageBox();
            })
        });
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-image-widget.default", function ($widget, $) {
            $(document).ready(function () {
                if (elementorFrontend.isEditMode()) {
                    The7ElementorAnimation.patchElementsAnimation($widget, 'the7-ignore-anim');
                }
                $widget.imageBox();
            })
        });


        if (!elementorFrontend.isEditMode()) {
            The7ElementorAnimation.patchElementsAnimation($('.elementor-widget-the7-image-widget .the7-overlay-content'), 'the7-ignore-anim');
        }


        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-image-widget", refresh);
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                ...The7ElementorSettings.getResponsiveSettingList('hover_visibility'),
            ];
            const controlName = controlView.model.get('name');
            if (-1 !== refresh_controls.indexOf(controlName)) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('imageBox');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    $widget.imageBox();
                }
            }
        }

    });
})(jQuery);
