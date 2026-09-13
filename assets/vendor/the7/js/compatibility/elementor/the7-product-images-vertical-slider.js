jQuery(function ($) {
    $.verticalProductSlider = function (el) {
        let $widget = $(el),
            methods,
            elementorSettings,
            settings,
            currentDeviceMode,
            autoplay,
            $imgList = $widget.find('.mainImageList'),
            $zoomOnHover = $widget.find('.the7-zoom-on-hover'),
            $imgZoom =  $zoomOnHover.find('img'),
            $thumbsSlider = $widget.find('.thumbs-slides-wrapper'),
            $videoWrap = $widget.find(".gallery-video-wrap"),
            $videoOverlay = $widget.find(".the7-video-overlay"),
            $thumbsSlide = $thumbsSlider.find('.the7-swiper-slide'),
            $bullet = $widget.find('.owl-dot');

            var isUserClicking = false,
                userClickTimeout = null,
                layzrTimeout = null;
        // Store a reference to the object
        $.data(el, "verticalProductSlider", $widget);
        // Private methods
        methods = {
            init: function () {
                $widget.layzrInitialisation();
                $widget.css("--widget-thumbs-height", (window.innerHeight - $widget[0].getBoundingClientRect().top) + 'px');
                $widget.css("--widget-thumbs-position-top", $widget[0].getBoundingClientRect().top + window.scrollY  + 'px');
                elementorSettings = new The7ElementorSettings($widget);
                settings = elementorSettings.getSettings();
                controls = settings['controls'] ? true : false;
                autoplay = settings['video_autoplay'] ? true : false;
                playOnMobile = settings['play_on_mobile'] ? true : false;
                currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                this.initThumb();
                methods.onScrollTargetChanged();
                methods.zoomOnHover();
                methods.clickThumbs();
                if (settings['open_lightbox'] === 'y') {
                    $widget.find('.dt-gallery-container').initPhotoswipe();
                }
                if (settings['open_lightbox'] === 'y' || !controls) {
                    $widget.on('click', 'video', function () {
                        if (this.paused) {
                            this.play();
                        } else {
                            this.pause();
                        }
                    });
                }
                if ($videoOverlay.length && $videoOverlay.is(":visible") && settings['open_lightbox'] !== 'y') {
                    $videoWrap.on('click', function (e) {
                        var $this = $(this);
                        if ($this.hasClass('playing-video')) {
                           // $videoWrap.removeClass('playing-video');
                        } else {
                            $this.find(".the7-video-overlay").remove();
                            methods.playPauseVideo($this, 'play');
                            $this.addClass('playing-video');
                        }
                    
                    });
                } else {
                    if (currentDeviceMode === 'desktop' && autoplay || currentDeviceMode === 'mobile' && autoplay && playOnMobile) {
                        $videoWrap.each(function () {
                            var $this = $(this);
                            methods.playPauseVideo($this, 'play');
                        })
                    }
                }

                //Change variation image in the default drop down mode
                $( '.variations_form' ).on( 'found_variation', function( event, variation ) {
                    var $productSlider = $widget.find( '.dt-gallery-container' );
                    
                    if ( variation && variation.image && variation.image.src ) {
                        var imageSrc = variation.image.src;
                        
                        // Find the corresponding slide/image
                        var $targetSlide = $productSlider.find('img[src="' + imageSrc + '"]');
                
                        if ( $targetSlide.length ) {

                            var scrollToPosition = $targetSlide.offset().top - $widget.offset().top + $widget.scrollTop() + 2;
                            $widget[0].scrollTo({
                                top: scrollToPosition,
                            });
                            
                        }
                    }
                });
                $widget.refresh();
            },
            initThumb: async function () {
                const Swiper = elementorFrontend.utils.swiper;
                if ($thumbsSlider.length) {
                    swiperThumbs = await new Swiper($thumbsSlider, this.getThumbsOptions());
                    $widget.css('opacity', 1);
                }
            },
            getThumbsOptions: function () {
                let thumbsPerView = settings.thumbs_items;

                swiperOptions = {
                    grabCursor: true,
                    //initialSlide: this.getInitialSlide(),
                    observeParents: false,
                    watchSlidesProgress: true,
                    slidesPerView: "auto",
                    speed: 600,
                    threshold: 20,
                    slideClass: 'the7-swiper-slide',
                    direction: 'vertical'
                };
                const navigation = true,
                    pagination = true;
                if (navigation) {
                    swiperOptions.navigation = {
                        prevEl: $thumbsSlider.siblings('.the7-thumbs-swiper-button-prev')[0],
                        nextEl: $thumbsSlider.siblings('.the7-thumbs-swiper-button-next')[0]
                    };
                }

                if (settings.thumbs_spacing) {
                    swiperOptions.spaceBetween = this.getSpaceBetweenThumbs();
                }
                breakpoints = elementorFrontend.config.responsive.activeBreakpoints;
                swiperOptions.breakpoints = {};
                Object.keys(breakpoints).forEach(breakpointName => {
                    let breakPointVal = breakpoints[breakpointName].value;
                    swiperOptions.breakpoints[breakPointVal] = {};
                    
                    if (settings.thumbs_spacing) {
                        swiperOptions.breakpoints[breakPointVal]['spaceBetween'] = methods.getSpaceBetweenThumbs(breakpointName);
                    }

                });

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
            getSpaceBetweenThumbs() {
                let device = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                return The7ElementorSettings.getResponsiveControlValue(settings, 'thumbs_spacing', 'size', device) || 0;

            },
            clickThumbs: function () {
                if ($thumbsSlide.length) {
                    $('.the7-swiper-slide, .owl-dot', $widget).on('click', function (e) {
                        e.preventDefault(); // Prevent the default URL change behavior
                        isUserClicking = true; // Set the flag to true on user click
            
                        var $this = $(this);
                        var targetId = $this[0].getAttribute('href').substring(1); // Get the ID from the href attribute
                        var targetElement = document.getElementById(targetId);
            
                        if (targetElement) {
                            // Smooth scroll to the target element with adjusted offset
                            if ($(targetElement).length) {
                                var scrollToPosition = $(targetElement).offset().top - $widget.offset().top + $widget.scrollTop();
                                $widget[0].scrollTo({
                                    top: scrollToPosition,
                                });
                            }
            
                            // Update thumbnail active state
                            $this.addClass('swiper-slide-thumb-active active').siblings().removeClass('swiper-slide-thumb-active active');
                            // Optional: Initialize lazy loading for images
                            clearTimeout(layzrTimeout);
                            layzrTimeout = setTimeout(function () {
                                $imgList.layzrInitialisation();
                            }, 400);
                        }
            
                        // Reset the flag after a safe timeout to avoid conflicts
                        clearTimeout(userClickTimeout);
                        userClickTimeout = setTimeout(function () {
                            isUserClicking = false;
                        }, 800); // Adjust timeout duration to match scroll animation
                    });
                }
            },
            
            onScrollTargetChanged: function () {
                // Skip scroll-based activation if the user clicked a thumbnail
                if (isUserClicking) return;
            
                var currentTop = $widget.scrollTop(); // Get the current scroll position of the widget
                var widgetOffsetTop = $widget.offset().top; // Get the top offset of the widget
                var elems = $imgList.find('.the7-image-wrapper'); // Find all image wrappers
            
                elems.each(function (index) {
                    var $this = $(this);
                    var elemTop = $this.offset().top - widgetOffsetTop + currentTop; // Element's position relative to the widget
                    var elemHeight = $this.outerHeight();
            
                    // Check if the element's top has reached the top of the widget
                    if (currentTop >= elemTop && currentTop < elemTop + elemHeight) {
                        var id = $this.find('img, video').attr('id'); // Get the ID of the active image
                        var thumbElem = $('.the7-swiper-slide[href="#' + id + '"]'); // Find the corresponding thumbnail
                        var bulletElem = $('.owl-dot[href="#' + id + '"]'); // Find the corresponding thumbnail
            
                        // Activate the thumbnail and slide Swiper to it
                        thumbElem.addClass('swiper-slide-thumb-active').siblings().removeClass('swiper-slide-thumb-active');
                        bulletElem.addClass('active').siblings().removeClass('active');
                        var swiperIndex = thumbElem.index();
                        if (typeof swiperThumbs !== 'undefined') {
                            swiperThumbs.slideTo(swiperIndex);
                        }
            
                        // Optional: Initialize lazy loading for images
                        $imgList.layzrInitialisation();
            
                        return false; // Exit loop after finding the first matching element
                    }
                });
            },

            zoomOnHover() {
                if (settings['zoom_on_hover'] === 'y' && $('.mobile-false').length > 0) {
                    document.querySelectorAll(".the7-zoom-on-hover img").forEach((img) => {
                        img.addEventListener("mousemove", (e) => {
                            const { left, top, width, height } = img.getBoundingClientRect();
                            const x = ((e.clientX - left) / width) * 100;
                            const y = ((e.clientY - top) / height) * 100;
                    
                            img.style.transformOrigin = `${x}% ${y}%`;
                            img.style.transform = "scale(2)";
                        });
                    
                        img.addEventListener("mouseleave", () => {
                            img.style.transform = "scale(1)";
                            img.style.transformOrigin = "center center";
                        });
                    });
                }
            },

            playPauseVideo: function ( element, control){
                var videoType, startTime, player, video, mute, loop;
                settings = elementorSettings.getSettings();
                mute = settings['mute'] ? true : false;
                loop = settings['loop'] ? true : false;
                if (element.find("iframe").length > 0) {
                    videoType = element.find("iframe").attr("title").split(" ")[0];
                } else {
                    videoType = 'video';
                }
                player = element.find("iframe").get(0);

                 if (videoType === "vimeo") {
                    switch (control) {
                        case "play":
                            if ((startTime != null && startTime > 0) && !element.hasClass('started')) {
                                element.addClass('started');
                                methods.postMessageToPlayer(player, {
                                    "method": "setCurrentTime",
                                    "value": startTime
                                });
                            }
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
                 } else if (videoType === "youtube") {
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
                    
                    
                } else if (videoType === "video") {
                    video = element.find("video").get(0);
                    if (video != null) {
                         if (control === "play") {
                            video.play();
                        } else {
                            video.pause();
                        }
                    }
                }
            },
            postMessageToPlayer: function (player, command){
                if (player == null || command == null) return;
                player.contentWindow.postMessage(JSON.stringify(command), "*");
            },
            handleResize: function () {
                methods.getSpaceBetweenThumbs();
                $widget.css("--widget-thumbs-height", (window.innerHeight - $widget[0].getBoundingClientRect().top) + 'px');
                $widget.css("--widget-thumbs-position-top", $widget[0].getBoundingClientRect().top + window.scrollY  + 'px');
                const deviceMode = elementorFrontend.getCurrentDeviceMode();
                if (typeof swiperThumbs !== 'undefined') {
                    if (deviceMode != currentDeviceMode){
                        swiperThumbs.update();
                    }
                }
                currentDeviceMode = deviceMode;
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('the7-resize-width-debounce', methods.handleResize);
                $widget.bind('scroll', methods.onScrollTargetChanged);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width-debounce', methods.handleResize);
            },
            
        };

        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("verticalProductSlider");
        };
        methods.init();
    };
    $.fn.verticalProductSlider = function () {
        return this.each(function () {
            var widgetData = $(this).data('imageBox');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.verticalProductSlider(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-images-vertical-slider.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.verticalProductSlider();
            })
        });

    });
})(jQuery);
