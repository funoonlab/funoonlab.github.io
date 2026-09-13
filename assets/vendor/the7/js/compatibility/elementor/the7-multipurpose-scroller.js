(function ($) {
    "use strict";

    const multipurposeScroller = function (el) {
        let $widget = $(el), elementorSettings, elementorAnimation, settings, methods, widgetType, animationTimerID;

        // Store a reference to the object
        $.data(el, "multipurposeScroller", $widget);
        const classes = {};
        const state = {};

        const data = {
            selectors: {
                wrapper: '.nativeScroll',
                slider: '.nsContent',
                slides: '> .nsItem'
            },
        };

        let elements = {
            $sliderContainer: $widget.find(data.selectors.slider).first(),
            $sliderWrapper: $widget.find(data.selectors.wrapper).first(),
            animatedSlides: {},
        };
        elements.$slides = elements.$sliderContainer.find(data.selectors.slides);

        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);
                elementorAnimation = new The7ElementorAnimation();
                widgetType = elementorSettings.getWidgetType();
                if (elementorFrontend.isEditMode()) {
                    methods.handleCTA();
                }
                settings = elementorSettings.getSettings();
                methods.bindEvents();
                methods.findAnimationInElements();
                methods.removeElementsAnimation();
                elements.$sliderWrapper.The7MultipurposeScroller();
            },
            //cache animation
            findAnimationInElements: function () {
                elements.animatedSlides = {};

                $(elements.$slides).each(function (index) {
                        const $slide = $(this);
                        let elementsWithAnimation = elementorAnimation.findAnimationsInNode($slide, 'the7-ignore-anim');
                        if (elementsWithAnimation.length) {
                            elements.animatedSlides[index] = elementsWithAnimation;
                        }
                    }
                );
            },
            onActivateAnimation: function (e, $item) {
                let index = elements.$slides.index($item);

                $item.find('.the7-ignore-anim').trigger("the7-slide:change");

                if (index in elements.animatedSlides) {
                    elementorAnimation.animateElements(elements.animatedSlides[index]);
                }
            },
            onDeactivateAnimation: function (e, $item) {

            },
            removeElementsAnimation() {
                let elements_reset = [];
                Object.keys(elements.animatedSlides).forEach(function (slideKey) {
                    let e = elements.animatedSlides[slideKey];
                    elements_reset = $.merge($.merge([], e), elements_reset);
                });
                elementorAnimation.resetElements(elements_reset)
            },
            bindEvents: function () {
                $widget.on('the7-ns:item-active', methods.onActivateAnimation);
                $widget.on('the7-ns:item-not-active', methods.onDeactivateAnimation);

                elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
                    clearTimeout(animationTimerID);
                    animationTimerID = setTimeout(() => {
                        elements.$slides.not('.active').find('.the7-animate').trigger("the7-slide:init");
                    }, 100);
                });
            },
            unBindEvents: function () {
                $widget.off('the7-ns:item-active', methods.onActivateAnimation);
                $widget.off('the7-ns:item-not-active', methods.onDeactivateAnimation);
            },
            handleCTA: function () {
                if (typeof elementorPro === 'undefined') {
                    return;
                }
                const emptyViewContainer = document.querySelector(`[data-id="${elementorSettings.getID()}"] .e-loop-empty-view__wrapper`);
                const emptyViewContainerOld = document.querySelector(`[data-id="${elementorSettings.getID()}"] .e-loop-empty-view__wrapper_old`);

                if (emptyViewContainerOld) {
                    elements.$sliderWrapper.css('opacity', 1);
                    return;
                }

                if (!emptyViewContainer) {
                    return;
                }

                const shadowRoot = emptyViewContainer.attachShadow({
                    mode: 'open'
                });
                shadowRoot.appendChild(elementorPro.modules.loopBuilder.getCtaStyles());
                shadowRoot.appendChild(elementorPro.modules.loopBuilder.getCtaContent(widgetType));
                const ctaButton = shadowRoot.querySelector('.e-loop-empty-view__box-cta');
                ctaButton.addEventListener('click', () => {
                    elementorPro.modules.loopBuilder.createTemplate();
                    //methods.handleSlider();
                });
                elements.$sliderWrapper.css('opacity', 1);
            },
        };
        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            elements.$sliderWrapper.The7MultipurposeScroller('update');
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("multipurposeScroller");
        };
        methods.init();
    };

    $.fn.multipurposeScroller = function () {
        return this.each(function () {
            var widgetData = $(this).data('multipurposeScroller');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new multipurposeScroller(this);
        });
    };

// Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-multipurpose-scroller.post", function ($widget, $) {
            $(function () {
                The7ElementorAnimation.patchElementsAnimation($widget);
                $widget.multipurposeScroller();
            })
        });

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-multipurpose-scroller", refresh);

            function refresh(controlView, widgetView) {
                let refresh_controls = [
                    ...The7ElementorSettings.getResponsiveSettingList('progress_track_width'),
                    ...The7ElementorSettings.getResponsiveSettingList('slides_min_width'),
                    ...The7ElementorSettings.getResponsiveSettingList('slides_gap'),
                    ...The7ElementorSettings.getResponsiveSettingList('slides_inline_padding'),
                    ...The7ElementorSettings.getResponsiveSettingList('slides_per_view'),
                    ...The7ElementorSettings.getResponsiveSettingList('slides_tail'),
                ];
                var controlName = controlView.model.get('name');
                if (-1 !== refresh_controls.indexOf(controlName)) {
                    var $widget = window.jQuery(widgetView.$el);
                    var widgetData = $widget.data('multipurposeScroller');
                    if (typeof widgetData !== 'undefined') {
                        widgetData.refresh();
                    } else {
                        $widget.multipurposeScroller();
                    }
                }
            }

        }
    });
})
(jQuery);
