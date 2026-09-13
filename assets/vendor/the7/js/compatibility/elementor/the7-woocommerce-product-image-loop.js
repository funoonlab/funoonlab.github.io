(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-loop-product-image.default", function ($widget, $) {
            $(document).ready(function () {
                if (elementorFrontend.isEditMode()) {
                    The7ElementorAnimation.patchElementsAnimation($widget, 'the7-ignore-anim');
                }
                $widget.productSlider();
            })
        });


        if (!elementorFrontend.isEditMode()) {
            The7ElementorAnimation.patchElementsAnimation($('.elementor-widget-the7-woocommerce-loop-product-image .the7-overlay-content'), 'the7-ignore-anim');
        }


        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-woocommerce-loop-product-image", refresh);
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                ...The7ElementorSettings.getResponsiveSettingList('hover_visibility'),
            ];
            const controlName = controlView.model.get('name');
            if (-1 !== refresh_controls.indexOf(controlName)) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('productSlider');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    $widget.productSlider();
                }
            }
        }
    });

    $.productSlider = function (el) {
        const data = {
            selectors: {
                slider: '.elementor-slides-wrapper',
                slide: 'the7-swiper-slide',
                activeSlide: '.swiper-slide-active',
                activeDuplicate: '.swiper-slide-duplicate-active'
            },
        };
        let $widget = $(el),
            methods,
            elementorSettings,
            elementorAnimation,
            elementsWithAnimation,
            settings,
            overlayTemplateExist = false,
            $overlay,
            visibility,
            swiper,
            elements = {
                $swiperContainer: $widget.find(data.selectors.slider),
                animatedSlides: {},
                activeElements: []
            };
            elements.$slides = elements.$swiperContainer.find('.' + data.selectors.slide);
        const $imgSlider = $widget.find(".elementor-slides-wrapper");

        // Store a reference to the object.
        $.data(el, "productSlider", $widget);

        // Private methods.
        methods = {
            init: function () {
                $widget.layzrInitialisation();
                $overlay = $widget.find('.the7-overlay-content');
                if ($overlay.length) {
                    overlayTemplateExist = true;
                    elementorAnimation = new The7ElementorAnimation();
                    elementsWithAnimation = elementorAnimation.findAnimationsInNode($overlay);

                    if($widget.find('a.post-thumbnail-rollover').length && !elementorFrontend.isEditMode()){
                        $overlay.css('cursor', 'pointer');
                        $overlay.on('click', function(e){
                            let $this = $(this),
                                $thisParent = $this.parent();
                            let $imgWrap =  $thisParent.hasClass('product-image-carousel-wrap') ? $thisParent.find('.dt-owl-item.active a.post-thumbnail-rollover') : $thisParent.find('a.post-thumbnail-rollover');
                            if((e.target.tagName.toLowerCase() !== 'a' && !$(e.target).parents('a').length) && e.target.tagName.toLowerCase() !== 'button' ){
                                if(typeof $imgWrap.attr('data-elementor-open-lightbox') != 'undefined'){
                                    //for lighbox
                                    $imgWrap.trigger("click");
                                }else{
                                    //for regular img link
                                    window.location.href = $imgWrap.attr('href');
                                }
                            }
                        })
                    }
                }

                elementorSettings = new The7ElementorSettings($widget);
                settings = elementorSettings.getSettings();
                this.initSlider();
                $widget.refresh();
                 if (overlayTemplateExist) {
                    switch (visibility) {
                        case 'hover-hide':
                            elementorAnimation.animateElements(elementsWithAnimation);
                            break;
                    }
                }
                 // Support image transitions.
                $widget.one('mouseenter touchstart', function() {
                    $widget.find('.post-thumbnail-rollover img').addClass('run-img-transitions');
                });
                
            },
            initSlider: async function () {
                if ($imgSlider.length) {
                     //Swiper
                    const Swiper = elementorFrontend.utils.swiper;
                    swiper = await new Swiper($imgSlider, this.getSwiperOptions());
                    swiper.navigation.enabled = true;
                    if (methods.isEnoughtElements(swiper.params.slidesPerView)) {
                        swiper.navigation.enabled = false;
                    }
                    methods.loopLazyFix();
                    methods.updateNav();
                }
            },
            getSwiperOptions: function () {
                swiperOptions = {
                    grabCursor: true,
                    loop: methods.isEnableLoop(),
                    loopPreventsSlide: true,
                    pauseOnMouseEnter: true,
                    speed: settings['transition_speed'],
                    effect: settings['transition'],
                    slideClass: 'the7-swiper-slide',
                    nested: true,
                };

                const navigation = true,
                    pagination = true;
                if (navigation) {
                    swiperOptions.navigation = {
                        prevEl: elements.$swiperContainer.siblings('.the7-swiper-button-prev')[0],
                        nextEl: elements.$swiperContainer.siblings('.the7-swiper-button-next')[0],
                        disabledClass: 'swiper-button-disabled',
                    };
                }
                if ('fade' === settings['transition']) {
                    swiperOptions.fadeEffect = {
                        crossFade: true
                    };
                }
                if (pagination) {
                    swiperOptions.pagination = {
                        el: elements.$swiperContainer.siblings('.swiper-pagination')[0],
                        type: 'bullets',
                        bulletActiveClass: 'active',
                        bulletClass: 'owl-dot',
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<button role="button" class="' + className + '" aria-label="Go to slide ' + index + 1 + '"><span></span></button>';
                        },
                    };

                }
                return swiperOptions;
            },
            getInitialSlide() {
                return 0;
            },
            loopLazyFix: function () {
                if (swiper.params.loop){
                let $swiperDuplicates = $(swiper.wrapperEl).children("." + (swiper.params.slideDuplicateClass));
                    $swiperDuplicates.find(".is-loading").removeClass("is-loading");
                    $swiperDuplicates.layzrInitialisation();
                }
            },
            isEnableLoop: function (swiper) {
                return methods.getSlidesCount() > 1;
            },
            isEnoughtElements: function (slidesPerView) {
                return slidesPerView < methods.getSlidesCount();
            },
            getSlidesCount: function () {
                return elements.$slides.length;
            },
            updateNav: function () {
                if (methods.isEnoughtElements(swiper.params.slidesPerView)) {
                    if (!swiper.navigation.enabled) {
                        swiper.navigation.destroy();
                        swiper.navigation.init();
                        swiper.navigation.update();

                        swiper.pagination.destroy();
                        swiper.pagination.init();
                        swiper.pagination.render();
                        swiper.pagination.update();
                        swiper.navigation.enabled = true;
                    }
                } else if (swiper.navigation.enabled) {
                    swiper.navigation.destroy();
                    if ( swiper.navigation.$nextEl){
                        swiper.navigation.$nextEl.addClass(swiper.params.navigation.disabledClass);
                    }
                    if ( swiper.navigation.$prevEl) {
                        swiper.navigation.$prevEl.addClass(swiper.params.navigation.disabledClass);
                    }

                    swiper.pagination.destroy();
                    if(swiper.pagination.$el) {
                        swiper.pagination.$el.addClass(swiper.params.pagination.hiddenClass);
                    }

                    swiper.navigation.enabled = false;
                }
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
                    let visibility_activate = ['always', 'hover-hide'];
                    if (visibility_activate.includes(visibility)) {
                        elementorAnimation.resetElements(elementsWithAnimation);
                    }
                }
            },

            onOverlayTransitionsEnd: function (event){
                if (event.originalEvent.propertyName === "opacity") {
                    elementorAnimation.resetElements(elementsWithAnimation);
                }
            },
            resetAnimation: function(){
                $overlay.on("transitionend", methods.onOverlayTransitionsEnd);
            },
            addAnimation: function(){
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
            $widget.removeData("productSlider");
        };
        $widget.getSwiper = function(){
            return swiper;
        }
        methods.init();
    };

    $.fn.productSlider = function () {
        return this.each(function () {
            if ($(this).data("productSlider") !== undefined) {
                $(this).removeData("productSlider")
            }
            new $.productSlider(this);
        });
    };
})(jQuery);
