jQuery(document).ready(function ($) {
    $.the7Slider = function (el, userSettings) {
        const data = {
            selectors: {
                slider: '.elementor-slides-wrapper:not(.thumbs-slides-wrapper)',
                thumbsSlider: '.thumbs-slides-wrapper',
                slide: 'the7-swiper-slide',
                slideInnerContents: '.the7-slide-content',
                activeSlide: '.swiper-slide-active',
                activeDuplicate: '.swiper-slide-duplicate-active'
            },
            classes: {
                inPlaceTemplateEditable: "elementor-in-place-template-editable"
            },
            attributes: {
                dataAnimation: 'animation'
            },
            changeableProperties: {
                pause_on_hover: 'pauseOnHover',
                autoplay_speed: 'delay',
                transition_speed: 'speed',
                autoplay: 'autoplay'
            }
        };

        let $widget = $(el),
            elementorSettings,
            elementorAnimation,
            settings,
            methods,
            swiper,
            intersectionObserver,
            widgetType,
            $videoOverlay,
            $videoWrap,
            controls,
            autoplay,
            playOnMobile,
            currentDeviceMode,
            swiperThumbs,
            $backupImage,
            $insertedImage,
            elements = {
                $swiperContainer: $widget.find(data.selectors.slider).first(),
                $swiperThumbsContainer: $widget.find(data.selectors.thumbsSlider).first(),
                animatedSlides: {},
                activeElements: []
            };
        elements.$slides = elements.$swiperContainer.find('> .the7-elementor-slides >' + '.' + data.selectors.slide);
        elements.$thumbsSlides = elements.$swiperThumbsContainer.find('> .the7-elementor-slides >' + '.' + data.selectors.slide);

        $widget.vars = {
            sliderInitialized: false,
            isInlineEditing: false
        };
        // Store a reference to the object
        $.data(el, "the7Slider", $widget);
        // Private methods
        methods = {
            initVars: function () {
                //update widget width css variable
                $widget.css("--widget-width", $widget.width() + 'px');
                if (elements.$swiperThumbsContainer.length) {
                    $widget.vars.thumbGap = the7Utils.parseIntParam($widget.css("--thumbs-spacing"), 0);
                    $widget.vars.colNum = the7Utils.parseIntParam($widget.css("--thumbs-items"), 3);
                }
                $widget.vars.isVertical = $widget.vars.scrollMode === "vertical";
            },
            init: function () {

                methods.initVars();
                elementorSettings = new The7ElementorSettings($widget);
                widgetType = elementorSettings.getWidgetType();
                settings = elementorSettings.getSettings();
                $videoOverlay = $widget.find(".the7-video-overlay");
                controls = !!settings['controls'];
                autoplay = !!settings['video_autoplay'];
                playOnMobile = !!settings['play_on_mobile'];
                currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

                elementorAnimation = new The7ElementorAnimation();
                if ($widget[0].classList.contains('elementor-widget-the7-woocommerce-product-images-slider')) {
                    if (settings['open_lightbox'] === 'y') {
                        $widget.find('.the7-elementor-slides').initPhotoswipe();
                    }
                }

                if (elementorFrontend.isEditMode()) {
                    methods.handleCTA();
                }

                this.initThumb().then(() => this.initSlider());
                $widget.css("--widget-height", elements.$swiperContainer.height() + 'px');
                $widget.refresh();
                methods.handleResize = elementorFrontend.debounce(methods.handleResize, 1000);
            },

            runElementHandlers: function (elements) {
                [...elements].flatMap(el => [...el.querySelectorAll('.elementor-element')]).forEach(el => elementorFrontend.elementsHandler.runReadyTrigger(el));
            },

            handleElementHandlers: function (slider) {
                if (!slider) {
                    return;
                }
                const duplicatedSlides = Array.from(slider.slides).filter(slide => slide.classList.contains(slider.params.slideDuplicateClass));
                methods.runElementHandlers(duplicatedSlides);
            },

            handleCTA: function () {
                if (typeof elementorPro === 'undefined') {
                    return;
                }
                const emptyViewContainer = document.querySelector(`[data-id="${elementorSettings.getID()}"] .e-loop-empty-view__wrapper`);
                const emptyViewContainerOld = document.querySelector(`[data-id="${elementorSettings.getID()}"] .e-loop-empty-view__wrapper_old`);

                if (emptyViewContainerOld) {
                    $widget.css('opacity', 1);
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
                if (methods.isLoop()) {
                    const ctaButton = shadowRoot.querySelector('.e-loop-empty-view__box-cta');
                    ctaButton.addEventListener('click', () => {
                        elementorPro.modules.loopBuilder.createTemplate();
                        methods.handleSlider();
                    });
                }
                $widget.css('opacity', 1);
            },
            bindEvents: function () {
                methods.initIntersectionObserver();
                elementorFrontend.elements.$window.on('the7-resize-width', methods.handleResize);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width', methods.handleResize);
                if (intersectionObserver !== undefined) {
                    intersectionObserver.unobserve($widget[0]);
                    intersectionObserver = undefined;
                }
            },
            handleSlider: function () {
                if (!$widget.vars.sliderInitialized) return;
                $widget.vars.isInlineEditing = true;
                $widget.addClass(data.classes.inPlaceTemplateEditable);
                swiper.slideTo(0);
                swiper.autoplay.stop();
                swiper.pagination.destroy();
                swiper.navigation.destroy();
                swiper.allowTouchMove = false;
                swiper.params.autoplay.disableOnInteraction = true;
                swiper.params.autoplay.pauseOnMouseEnter = false;
                swiper.params.autoplay.delay = 1000000; // Add a long delay so that the Swiper does not move while editing the Template. Even though it was paused, it will start again on mouse leave.
                swiper.update();
            },

            handleResize: function () {
                if (!$widget.vars.sliderInitialized) return;
                methods.removeElementsAnimation(true);
                methods.findAnimationInElements();
                methods.updateActiveElements();
                methods.removeElementsAnimation();
                methods.addElementsAnimation();
                currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                const deviceMode = elementorFrontend.getCurrentDeviceMode();
                if (currentDeviceMode === 'mobile' && autoplay && !playOnMobile) {
                    $videoWrap.removeClass('dt-pswp-item-no-click');
                } else if (autoplay && settings['open_lightbox'] === 'y') {
                    $videoWrap.addClass('dt-pswp-item-no-click');
                }
                if (typeof swiperThumbs !== 'undefined') {
                    swiperThumbs.changeDirection(methods.getDirection(currentDeviceMode));
                    if (deviceMode !== currentDeviceMode) {
                        swiperThumbs.update();
                    }
                }
                currentDeviceMode = deviceMode;
            },
            getLoopedSlides: function (slidesPerGroup) {
                let slides = methods.getSlidesCount();
                if (settings['slides_to_scroll'] !== 'all') {
                    return slides;
                }
                return Math.trunc(slides / slidesPerGroup) * slidesPerGroup;
            },
            getSlidesCount: function () {
                return elements.$slides.length;
            },
            initIntersectionObserver: function () {
                if ('yes' !== settings.autoplay) return;
                intersectionObserver = elementorModules.utils.Scroll.scrollObserver({
                    offset: '-15% 0% -15%',
                    callback: event => {
                        if (event.isInViewport) {
                            methods.swiperAutoplayStart();
                        } else {
                            methods.swiperAutoplayStop();
                        }
                    }
                });
                intersectionObserver.observe($widget[0]);
            },
            swiperAutoplayStop() {
                if ($widget.vars.sliderInitialized && !$widget.vars.isInlineEditing) {
                    swiper.autoplay.stop();
                }
            },
            swiperAutoplayStart() {
                if ($widget.vars.sliderInitialized && !$widget.vars.isInlineEditing) {
                    swiper.autoplay.start();
                }
            },
            getEffect() {
                return settings['transition'];
            },
            getSlidesPerView: function (device) {
                if ('slide' === methods.getEffect()) {
                    let slides_per_view = The7ElementorSettings.getResponsiveControlValue(settings, 'slides_per_view', 'size', device)
                    return +slides_per_view || 1;
                    //return Math.min(methods.getSlidesCount(), +slides_per_view || 1);
                }
                return 1;
            },

            isEnoughElements: function (slidesPerView) {
                return slidesPerView < methods.getSlidesCount();
            },
            getSlidesToScroll: function (slidesPerView) {
                let slidesToScroll = 1;
                if ('slide' === methods.getEffect()) {
                    if (settings['slides_to_scroll'] === 'all') {
                        slidesToScroll = slidesPerView;
                    }
                }
                return slidesToScroll;
            },
            getAutoHeight: function () {
                let autoHeight = true;
                if (methods.isLoop()) {
                    autoHeight = false;
                }
                return autoHeight;
            },
            getSwiperOptions: function () {
                let slidesPerView = methods.getSlidesPerView('desktop');

                swiperOptions = {
                    autoplay: this.getAutoplayConfig(),
                    grabCursor: true,
                    initialSlide: this.getInitialSlide(),
                    slidesPerView: slidesPerView,
                    slidesPerGroup: methods.getSlidesToScroll(slidesPerView),
                    loop: methods.isEnableLoop(slidesPerView),
                    loopPreventsSlide: true,
                    pauseOnMouseEnter: true,
                    speed: settings.transition_speed,
                    effect: methods.getEffect(),
                    observeParents: false,
                    observer: true,
                    handleElementorBreakpoints: false,
                    slideClass: data.selectors.slide,
                };
                if (!$widget[0].classList.contains('elementor-widget-the7-woocommerce-product-images-slider')) {
                    swiperOptions.autoHeight = methods.getAutoHeight();
                }

                if (typeof swiperThumbs !== 'undefined') {
                    swiperOptions.thumbs = {
                        swiper: swiperThumbs
                    };
                }
                const navigation = true,
                    pagination = true;
                if (navigation) {
                    swiperOptions.navigation = {
                        prevEl: elements.$swiperContainer.children('.the7-swiper-button-prev')[0],
                        nextEl: elements.$swiperContainer.children('.the7-swiper-button-next')[0]
                    };
                }
                if (pagination) {
                    swiperOptions.pagination = {
                        el: elements.$swiperContainer.children('.swiper-pagination')[0],
                        type: 'bullets',
                        bulletActiveClass: 'active',
                        bulletClass: 'owl-dot',
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<button role="button" class="' + className + '" aria-label="Go to slide ' + index + 1 + '"><span></span></button>';
                        },
                    };
                }
                //if (true === swiperOptions.loop) {
                swiperOptions.loopedSlides = methods.getLoopedSlides(swiperOptions.slidesPerGroup);
                //}
                if ('fade' === swiperOptions.effect) {
                    swiperOptions.fadeEffect = {
                        crossFade: true
                    };
                }
                if (settings.slides_gap) {
                    swiperOptions.spaceBetween = this.getSpaceBetween();
                }
                breakpoints = elementorFrontend.config.responsive.activeBreakpoints;
                swiperOptions.breakpoints = {};
                Object.keys(breakpoints).forEach(breakpointName => {
                    let breakPointVal = breakpoints[breakpointName].value;
                    swiperOptions.breakpoints[breakPointVal] = {};
                    let slidesPerView = methods.getSlidesPerView(breakpointName);
                    if (slidesPerView) {
                        swiperOptions.breakpoints[breakPointVal].slidesPerView = slidesPerView;
                        swiperOptions.breakpoints[breakPointVal].slidesPerGroup = methods.getSlidesToScroll(slidesPerView);
                        swiperOptions.breakpoints[breakPointVal].pagination = {};
                    }
                    if (settings.slides_gap) {
                        swiperOptions.breakpoints[breakPointVal]['spaceBetween'] = methods.getSpaceBetween(breakpointName);
                    }
                });

                let switchPointsWide = dtLocal.elementor.settings.container_width;
                let wideBreakpoint = settings['widget_columns_wide_desktop_breakpoint'];
                if (wideBreakpoint) {
                    switchPointsWide = wideBreakpoint;
                }
                let wideColumns = settings['wide_desk_columns'];
                if (wideColumns) {
                    swiperOptions.breakpoints[switchPointsWide] = {
                        slidesPerView: parseInt(wideColumns),
                        slidesPerGroup: methods.getSlidesToScroll(parseInt(wideColumns))
                    }
                }
                swiperOptions = methods.adjustBreakpointsConfig(swiperOptions);
                if (typeof userSettings !== 'undefined') {
                    swiperOptions = $.extend(true, swiperOptions, userSettings.swiperOptions);
                }

                return swiperOptions;
            },
            getThumbsOptions: function () {
                swiperOptions = {
                    grabCursor: true,
                    initialSlide: this.getInitialSlide(),
                    spaceBetween: this.getSpaceBetweenThumbs(),
                    observeParents: false,
                    watchSlidesProgress: true,
                    slidesPerView: "auto",
                    speed: 600,
                    threshold: 20,
                    slideClass: data.selectors.slide,
                    direction: this.getDirection(),
                    handleElementorBreakpoints: false,
                };
                const navigation = true;
                if (navigation) {
                    swiperOptions.navigation = {
                        prevEl: elements.$swiperThumbsContainer.siblings('.the7-thumbs-swiper-button-prev')[0],
                        nextEl: elements.$swiperThumbsContainer.siblings('.the7-thumbs-swiper-button-next')[0]
                    };
                }

                const breakpointsSettings = {},
                    breakpoints = elementorFrontend.config.responsive.activeBreakpoints;
                Object.keys(breakpoints).forEach(breakpointName => {
                    breakpointsSettings[breakpoints[breakpointName].value] = {
                        direction: this.getDirection(breakpointName),
                        spaceBetween: this.getSpaceBetweenThumbs(breakpointName)
                    };
                });
                swiperOptions.breakpoints = breakpointsSettings;
                swiperOptions = methods.adjustBreakpointsConfig(swiperOptions);
                return swiperOptions;
            },

            // Backwards compatibility for Elementor Pro <2.9.0 (old Swiper version - <5.0.0)
            // In Swiper 5.0.0 and up, breakpoints changed from acting as max-width to acting as min-width
            adjustBreakpointsConfig(config) {
                const elementorBreakpoints = elementorFrontend.config.responsive.activeBreakpoints,
                    elementorBreakpointValues = elementorFrontend.breakpoints.getBreakpointValues();
                    Object.keys(config.breakpoints).forEach(configBPKey => {
                        const configBPKeyInt = parseInt(configBPKey);
                        let breakpointToUpdate;

                        // The `configBPKeyInt + 1` is a BC Fix for Elementor Pro Carousels from 2.8.0-2.8.3 used with Elementor >= 2.9.0
                        if (configBPKeyInt === elementorBreakpoints.mobile.value || configBPKeyInt + 1 === elementorBreakpoints.mobile.value) {
                            // This handles the mobile breakpoint. Elementor's default sm breakpoint is never actually used,
                            // so the mobile breakpoint (md) needs to be handled separately and set to the 0 breakpoint (xs)
                            breakpointToUpdate = 0;
                        } else if (elementorBreakpoints.widescreen && (configBPKeyInt === elementorBreakpoints.widescreen.value || configBPKeyInt + 1 === elementorBreakpoints.widescreen.value)) {
                            // Widescreen is a min-width breakpoint. Since in Swiper >5.0 the breakpoint system is min-width based,
                            // the value we pass to the Swiper instance in this case is the breakpoint from the user, unchanged.
                            return;
                        } else {
                            // Find the index of the current config breakpoint in the Elementor Breakpoints array
                            const currentBPIndexInElementorBPs = elementorBreakpointValues.findIndex(elementorBP => {
                                // BC Fix for Elementor Pro Carousels from 2.8.0-2.8.3 used with Elementor >= 2.9.0
                                return configBPKeyInt === elementorBP || configBPKeyInt + 1 === elementorBP;
                            });

                            if (currentBPIndexInElementorBPs === -1) {
                                return;
                            }

                            // For all other Swiper config breakpoints, move them one breakpoint down on the breakpoint list,
                            // according to the array of Elementor's global breakpoints
                            breakpointToUpdate = elementorBreakpointValues[currentBPIndexInElementorBPs - 1];
                        }
                        config.breakpoints[breakpointToUpdate] = config.breakpoints[configBPKey];

                        // Then reset the settings in the original breakpoint key to the default values
                        config.breakpoints[configBPKey] = {
                            slidesPerView: config.slidesPerView,
                            slidesPerGroup: config.slidesPerGroup ? config.slidesPerGroup : 1
                        };

                        if ("spaceBetween" in config) {
                            config.breakpoints[configBPKey].spaceBetween = config.spaceBetween;
                        }
                    });
                    return config;
            },

            getSpaceBetween() {
                if ('fade' === swiperOptions.effect) {
                    return 0;
                }
                let device = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                return The7ElementorSettings.getResponsiveControlValue(settings, 'slides_gap', 'size', device) || 0;
            },
            getDirection(device) {
                return The7ElementorSettings.getResponsiveControlValue(settings, 'thumbs_direction', '', device) || 'vertical';
            },
            getSpaceBetweenThumbs() {
                let device = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                return The7ElementorSettings.getResponsiveControlValue(settings, 'thumbs_spacing', 'size', device) || 0;
            },
            getAutoplayConfig: function () {
                if ('yes' !== settings.autoplay) {
                    return false;
                }

                return {
                    stopOnLastSlide: true,
                    // Has no effect in infinite mode by default.
                    delay: settings.autoplay_speed,
                    disableOnInteraction: true
                };
            },

            handlePauseOnHover: function () {
                if (!$widget.vars.sliderInitialized) return;

                let toggleOn = false;
                if ('yes' === settings.pause_on_hover) {
                    toggleOn = true;
                }

                if ('yes' !== settings.autoplay) {
                    toggleOn = false;
                }
                if (toggleOn) {
                    elements.$swiperContainer.on({
                        mouseenter: () => {
                            methods.swiperAutoplayStop();
                        },
                        mouseleave: () => {
                            methods.swiperAutoplayStart();
                        }
                    });
                } else {
                    elements.$swiperContainer.off('mouseenter mouseleave');
                }
            },

            getInitialSlide() {
                return 0;
            },
            initThumb: async function () {
                const $thumbsSlider = elements.$swiperThumbsContainer;
                const Swiper = elementorFrontend.utils.swiper;
                if ($thumbsSlider.length) {
                    swiperThumbs = await new Swiper($thumbsSlider, this.getThumbsOptions());
                    methods.updateNav(swiperThumbs);
                    methods.updateBreakpoint(swiperThumbs);
                    methods.loopLazyFix(swiperThumbs);
                    swiperThumbs.on('snapGridLengthChange', methods.updateNav);
                    swiperThumbs.on('breakpoint', methods.updateBreakpoint);
                    methods.handleElementHandlers(swiperThumbs);
                }
            },
            initSlider: async function () {
                const $slider = elements.$swiperContainer;
                if (!$slider.length) return;
                const Swiper = elementorFrontend.utils.swiper;
                swiper = await new Swiper($slider, this.getSwiperOptions()); // Expose the swiper instance in the frontend


                $widget.vars.sliderInitialized = true;
                swiper.navigation.enabled = true;
                if (methods.isEnoughElements(swiper.params.slidesPerView)) {
                    swiper.navigation.enabled = false;
                    swiper.navigation.enabled = false;
                }

                $videoWrap = swiper.slides.find(".gallery-video-wrap");
                methods.clickVideo(swiper);
                methods.updateBreakpoint(swiper);
                methods.loopLazyFix(swiper);
                methods.loopPhotoswipeFix(swiper);
                methods.updateNav(swiper);
                methods.findAnimationInElements();
                $widget.css('opacity', 1);
                methods.updateActiveElements();
                methods.removeElementsAnimation();
                methods.zoomOnHover();
                setTimeout(() => {
                    methods.updateActiveElements();
                    methods.removeElementsAnimation(true);
                    methods.addElementsAnimation();
                }, 300);
                methods.handlePauseOnHover();
                swiper.on('slideChange', function () {
                    methods.playPauseVideo(swiper, 'pause');
                });
                swiper.on('slideChangeTransitionEnd', function () {
                    methods.updateActiveElements();
                    methods.removeElementsAnimation();
                    methods.addElementsAnimation();
                    methods.clickVideo(swiper);

                });
                swiper.on('snapGridLengthChange', methods.updateNav);
                swiper.on('breakpoint', methods.updateBreakpoint);
                methods.handleElementHandlers(swiper);
                $widget.find('.dt-owl-carousel-call, .elementor-owl-carousel-call, .related-projects, .slider-simple:not(.slider-masonry)').trigger('refresh.owl.carousel');
            },
            loopLazyFix: function (slider) {
                if (slider.params.loop) {
                    let $swiperDuplicates = $(slider.wrapperEl).children("." + (slider.params.slideDuplicateClass));
                    $swiperDuplicates.find(".is-loading").removeClass("is-loading");
                    $swiperDuplicates.layzrInitialisation();
                }
            },
            loopPhotoswipeFix: function (slider) {
                if (settings['open_lightbox'] === 'y') {
                    let $swiperDuplicates = $(slider.wrapperEl).children("." + (slider.params.slideDuplicateClass));
                    $swiperDuplicates.initPhotoswipe();
                }
            },
            updateNav: function (slider) {
                if (methods.isEnoughElements(slider.params.slidesPerView)) {
                    if (!slider.navigation.enabled) {
                        slider.navigation.destroy();
                        slider.navigation.init();
                        slider.navigation.update();

                        slider.pagination.destroy();
                        slider.pagination.init();
                        slider.pagination.render();
                        slider.pagination.update();
                        slider.navigation.enabled = true;
                    }
                } else if (slider.navigation.enabled) {
                    slider.navigation.destroy();
                    if (slider.navigation.$nextEl) {
                        slider.navigation.$nextEl.addClass(slider.params.navigation.disabledClass);
                    }
                    if (slider.navigation.$prevEl) {
                        slider.navigation.$prevEl.addClass(slider.params.navigation.disabledClass);
                    }

                    slider.pagination.destroy();
                    if (slider.pagination.$el) {
                        slider.pagination.$el.addClass(slider.params.pagination.hiddenClass);
                    }

                    slider.navigation.enabled = false;
                }
            },
            updateBreakpoint: function (slider) {
                methods.updateScrollSpeed(slider);
                let updateLoop = false;
                let oldLoop = slider.params.loop;
                slider.params.loop = methods.isEnableLoop(slider.params.slidesPerView)

                if (true === slider.params.loop) {
                    let oldLoopedSlides = slider.params.loopedSlides;
                    slider.params.loopedSlides = methods.getLoopedSlides(slider.params.slidesPerGroup);
                    if (slider.params.loopedSlides !== oldLoopedSlides) {
                        updateLoop = true;
                    }
                }
                if (slider.params.loop !== oldLoop && slider.params.loop) {
                    updateLoop = true;
                }
                if (updateLoop) {
                    slider.loopDestroy();
                    slider.loopCreate();
                    slider.updateSlides();
                    methods.loopLazyFix(slider);
                    methods.handleElementHandlers(slider);
                } else if (slider.params.loop !== oldLoop && !slider.params.loop) {
                    slider.loopDestroy();
                    slider.updateSlides();
                }
            },
            isEnableLoop: function (slidesPerView) {
                let result = 'yes' === settings.infinite;
                return result && methods.isEnoughElements(slidesPerView);
            },
            updateScrollSpeed: function (slider) {
                if (!slider.$el[0].classList.contains('thumbs-slides-wrapper')) {
                    slider.params.speed = settings.transition_speed;
                    if (slider.params.slidesPerGroup == slider.params.slidesPerView) {
                        slider.params.speed = slider.params.slidesPerView * settings.transition_speed;
                    }
                }
            },
            updateSwiperOption: function (propertyName) {
                if (!$widget.vars.sliderInitialized) return;

                let respControlNames = ['slides_to_scroll', 'slides_gap', 'slides_per_view'];
                let handled = false;
                respControlNames.forEach(controlName => {
                    if (propertyName.startsWith(controlName)) {
                        swiper.params.breakpoints = this.getSwiperOptions().breakpoints;
                        swiper.currentBreakpoint = false;
                        swiper.update();
                        handled = true;
                        methods.findAnimationInElements();
                        if (propertyName.startsWith('slides_per_view')) {
                            methods.updateActiveElements();
                            methods.addElementsAnimation();
                        }
                    }
                });

                if (handled) {
                    return;
                }

                const newSettingValue = settings[propertyName];
                let propertyToUpdate = data.changeableProperties[propertyName],
                    valueToUpdate = newSettingValue;

                switch (propertyName) {
                    case 'autoplay_speed':
                        swiper.autoplay.stop();
                        propertyToUpdate = 'autoplay';
                        valueToUpdate = {
                            delay: newSettingValue,
                            disableOnInteraction: true
                        };
                        break;
                    case 'pause_on_hover':
                        methods.handlePauseOnHover()
                        break;
                    case 'autoplay':
                        swiper.autoplay.stop();
                        valueToUpdate = methods.getAutoplayConfig()
                        methods.handlePauseOnHover()
                        break;
                }

                if ('pause_on_hover' !== propertyName) {
                    swiper.params[propertyToUpdate] = valueToUpdate;
                }
                swiper.update();
                if ('autoplay' === propertyToUpdate) {
                    if ('yes' === settings.autoplay) {
                        swiper.autoplay.start();
                    }
                }
            },
            isLoop: function () {
                return widgetType === 'the7-slider-loop';
            },

            updateActiveElements: function () {
                if (!swiper.params) return;
                let activeElements = [];

                let slidesPerView = swiper.params.slidesPerView ? swiper.params.slidesPerView : 1;
                let slidesStart = swiper.activeIndex;
                let slidesEnd = slidesStart + slidesPerView

                for (let activeSlideIndex = slidesStart; activeSlideIndex < slidesEnd; activeSlideIndex++) {
                    let activeSlide = elements.animatedSlides[activeSlideIndex];

                    if (activeSlide === undefined) {
                        continue;
                    }
                    //do not alter activeSlide
                    activeElements = $.merge($.merge([], activeSlide), activeElements);
                }

                let $activeDuplicates = $(swiper.slides).filter(data.selectors.activeDuplicate);
                $activeDuplicates.each(function (index) {
                    const duplicateIndex = $(swiper.slides).index($(this));
                    slidesStart = duplicateIndex;
                    slidesEnd = slidesStart + slidesPerView

                    for (let activeSlideIndex = duplicateIndex; activeSlideIndex < slidesEnd; activeSlideIndex++) {

                        const activeDuplicateSlide = elements.animatedSlides[activeSlideIndex];
                        if (activeDuplicateSlide !== undefined) {
                            //do not alter activeSlide
                            activeElements = $.merge($.merge([], activeDuplicateSlide), activeElements);
                        }
                    }
                });
                elements.activeElements = activeElements;
            },
            removeElementsAnimation(isForce = false) {
                if (!$widget.vars.sliderInitialized) return;
                let notActiveElements = [];
                Object.keys(elements.animatedSlides).forEach(function (slideKey) {
                    let e = elements.animatedSlides[slideKey];
                    notActiveElements = $.merge($.merge([], e), notActiveElements);
                });
                if (!isForce) {
                    notActiveElements = notActiveElements.filter(function (e) {
                        let val = $.inArray(e, elements.activeElements)
                        return val < 0
                    })
                }

                notActiveElements.forEach(function (e) {
                    let $element = e.$element.filter('.the7-ignore-anim');
                    if ($element.length) {
                        if (!isForce) {
                            $element.trigger("the7-slide:hide");
                        }
                    } else {
                        elementorAnimation.resetElement(e);
                    }
                });
            },

            addElementsAnimation() {
                if (!$widget.vars.sliderInitialized) return;
                elements.activeElements.forEach(function (e) {
                    let $element = e.$element.filter('.the7-ignore-anim');
                    if ($element.length) {
                        $element.trigger("the7-slide:change");
                    } else {
                        elementorAnimation.animateElement(e);
                    }
                });
            },

            findAnimationInElements() {
                if (!$widget.vars.sliderInitialized) return;
                let animatedSlides = {};

                $(swiper.slides).each(function (index) {
                        const $slide = $(this);
                        let elementsWithAnimation = elementorAnimation.findAnimationsInNode($slide);
                        if (elementsWithAnimation.length) {
                            animatedSlides[index] = elementsWithAnimation;
                        }
                    }
                );
                elements.animatedSlides = animatedSlides;
            },
            zoomOnHover() {
                if (settings['zoom_on_hover'] === 'y' && $('.mobile-false').length > 0) {
                    $('.the7-zoom-on-hover', elements.$swiperContainer).on({
                        mousemove: (e) => {
                            let zoomer = e.currentTarget;
                            let offsetX = e.offsetX ? e.offsetX : 0;
                            let offsetY = e.offsetX ? e.offsetY : 0;

                            let x = (offsetX / zoomer.offsetWidth) * 100
                            let y = (offsetY / zoomer.offsetHeight) * 100
                            zoomer.style.backgroundPosition = `${x}% ${y}%`;
                        },
                    });
                }
            },

            postMessageToPlayer: function (player, command) {
                if (player == null || command == null) return;
                player.contentWindow.postMessage(JSON.stringify(command), "*");
            },
            clickVideo: function (slider) {
                if ($videoOverlay.length && $videoOverlay.is(":visible") && settings['open_lightbox'] !== 'y') {
                    $videoWrap.parent().on('click', function (e) {
                        var $this = $(this);
                        if ($this.hasClass('playing-video')) {
                        } else {
                            $this.find(".the7-video-overlay").remove();
                            methods.playPauseVideo(slider, 'play');
                            $this.addClass('playing-video');
                        }

                    });
                } else {
                    if ((currentDeviceMode !== 'mobile' && autoplay || currentDeviceMode === 'mobile' && autoplay && playOnMobile)) {
                        methods.playPauseVideo(slider, 'play');
                    }
                }
            },
            playPauseVideo: function (slider, control) {
                let currentSlide = slider.slides.eq(slider.activeIndex);

                let iframe = currentSlide.find("iframe");
                let slideType = iframe.length > 0 ? iframe.attr("title").split(" ")[0] : "video";
                let player = iframe.length > 0 ? iframe[0] : null;
                let video = currentSlide.find("video")[0];

                let mute = !!settings['mute'];
                let loop = !!settings['loop'];

                if (slideType === "vimeo") {
                    switch (control) {
                        case "play":
                            methods.postMessageToPlayer(player, {
                                "method": "play",
                                "value": 1
                            });
                            break;
                        case "pause":
                            methods.postMessageToPlayer(player, {
                                "method": "pause",
                                "value": 1
                            });
                            break;
                    }
                } else if (slideType === "youtube") {
                    switch (control) {
                        case "play":
                            if (mute) {
                                methods.postMessageToPlayer(player, {
                                    "event": "command",
                                    "func": "mute"
                                });
                            }
                            methods.postMessageToPlayer(player, {
                                "event": "command",
                                "func": "playVideo"
                            });
                            if (loop) {
                                methods.postMessageToPlayer(player, {
                                    "event": "command",
                                    "func": "loop"
                                });
                            }
                            break;
                        case "pause":
                            methods.postMessageToPlayer(player, {
                                "event": "command",
                                "func": "pauseVideo"
                            });
                            break;
                    }

                } else if (slideType === "video" && video) {
                    control === "play" ? video.play() : video.pause();
                }
            },
        };

        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
        };
        this.update = function () {
            if (swiper) {
                swiper.update();
                if (swiperThumbs) {
                    swiperThumbs.update();
                }
            }
        }
        this.delete = function () {
            methods.unBindEvents();
            $widget.removeData("the7Slider");
            if (swiper) {
                swiper.destroy();
            }
        };

        this.updateSwiperOption = function (propertyName) {
            settings = elementorSettings.getSettings();
            methods.updateSwiperOption(propertyName);
        }

        this.onDocumentLoaded = function (document) {
            if (document.config.type === 'loop-item' && methods.isLoop()) {
                if (!$widget.vars.sliderInitialized) return;
                methods.handleSlider();
                let elementsToRemove = ['.swiper-pagination', '.the7-swiper-button'];
                const templateID = document.id;
                elementsToRemove = [...elementsToRemove, 'style#loop-' + templateID, 'link#font-loop-' + templateID, 'style#loop-dynamic-' + templateID];
                elementsToRemove.forEach(elementToRemove => {
                    $widget.find(elementToRemove).remove();
                });
            }
        }
        $widget.getSwiper = function () {
            return swiper;
        }
        this.getSwiper = function () {
            return swiper;
        }
        methods.init();
    };

    $.fn.the7Slider = function (settings) {
        var isCommand = "string" === typeof settings;
        var args = Array.prototype.slice.call(arguments, 1)

        this.each(function () {
            var $this = $(this);
            if (!isCommand) {
                $this.data("the7Slider", new $.the7Slider(this, settings));
                return
            }
            var instance = $this.data("the7Slider");
            if (!instance) {
                throw Error("Trying to perform the `" + settings + "` method prior to initialization")
            }
            if (!instance[settings]) {
                throw ReferenceError("Method `" + settings + "` not found in instance")
            }
            instance[settings].apply(instance, args);
        });
        return this
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-slider.default", widgetHandler);
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-slider-loop.post", widgetHandler);
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-images-slider.default", widgetHandler);

        function widgetHandler($widget, $) {
            $(document).ready(function () {
                if (elementorFrontend.isEditMode()) {
                    The7ElementorAnimation.patchElementsAnimation($widget);
                }
                $widget.the7Slider();

            })
        }

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-slider", refresh);
            elementorEditorAddOnChangeHandler("the7-slider-loop", refresh);
            elementorEditorAddOnChangeHandler("the7-woocommerce-product-images-slider", refresh);
            elementor.on("document:loaded", onDocumentLoaded);
        } else {
            The7ElementorAnimation.patchElementsAnimation($('.elementor-widget-the7-slider-common .the7-swiper-slide'));
        }

        function onDocumentLoaded(document) {
            var $elements = $('.elementor-widget-the7-slider-loop');
            $elements.each(function () {
                const $widget = $(this);
                const widgetData = $widget.data('the7Slider');
                if (typeof widgetData !== 'undefined') {
                    widgetData.onDocumentLoaded(document);
                }
            });
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                "autoplay_speed",
                "pause_on_hover",
                "autoplay",
                "transition_speed",
                ...The7ElementorSettings.getResponsiveSettingList('slides_gap'),
                "slides_to_scroll",
                ...The7ElementorSettings.getResponsiveSettingList('slides_per_view'),
            ];
            const controlName = controlView.model.get('name');
            if (-1 !== refresh_controls.indexOf(controlName)) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('the7Slider');
                if (typeof widgetData !== 'undefined') {
                    widgetData.updateSwiperOption(controlName);
                }
            }
        }

    });
})(jQuery);