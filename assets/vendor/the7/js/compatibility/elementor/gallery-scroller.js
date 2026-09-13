(function ($) {

    /* #wc gallery scroller
    ================================================== */
    $.productGallery = function (el) {
        var $widget = $(el),
            $mainGallery = $widget.find('.dt-wc-product-gallery'),
            $thumbs = $mainGallery.find('.dt-product-thumbs'),
            $gallery = $mainGallery.find('.dt-product-gallery'),
            $gallerySlider = $gallery.find('.flexslider'),
            $thumbsSlider = $thumbs.find('.flexslider'),
            $videoOverlay = $widget.find(".the7-video-overlay"),
            $videoWrap = $widget.find(".woocommerce-product-gallery_video"),
            product_gallery,
            navSelector = '.flex-direction-nav a',
            isTouchEvents = !!$('html.touchevents').length,
            elementorSettings,
            settings,
            controls,
            autoplay,
            playOnMobile,
            currentDeviceMode,
            methods = {},
            classes = {
                imgZoomHandled: "zoom-handled",
            };
        $widget.vars = { };
        // Store a reference to the slider object
        $.data(el, "productGallery", $widget);
        // Private slider methods
        methods = {
            initVars: function () {
                //update widget width css variable
                $widget.css("--widget-width", $widget.width() + 'px');
                $widget.vars.scrollMode = 'horizontal';
                if ($thumbs.length) {
                    $widget.vars.scrollMode = the7Utils.parseParam($thumbs.attr('data-scroll-mode'), 'horizontal');
                    $widget.vars.thumbGap = the7Utils.parseIntParam($widget.css("--thumbs-spacing"), 0);
                    $widget.vars.colNum = the7Utils.parseIntParam($widget.css("--thumbs-items"), 3);
                }
                $widget.vars.isVertical = $widget.vars.scrollMode === "vertical";
            },
            init: function () {
                methods.initVars();
                elementorSettings = new The7ElementorSettings($widget),
                settings = elementorSettings.getSettings();
                controls = settings['controls'] ? true : false;
                autoplay = settings['autoplay'] ? true : false;
                playOnMobile = settings['play_on_mobile'] ? true : false;
                currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                var $directionNav = $gallerySlider.find(navSelector),
                    animation = the7Utils.parseParam($mainGallery.attr('data-animation'), 'slide'),
                    animationSpeed = animation === "fade" ? 400 : 600,
                    isInit = true,
                    animationLoop = false;
                
                if ($widget.hasClass('lightbox-on-click-y') || $widget.find('.zoom-flash').length) {
                    $widget.find('.dt-gallery-container').initPhotoswipe();
                }
              
                //Zoom click
                $gallery.on('click', '.zoom-flash', function (e) {
                    e.preventDefault();
                    $gallery.find('.flex-active-slide .dt-pswp-item ').trigger('click');
                });
                //handle fake woocommerce-product-gallery__trigger element in order to pass this element to openPhotoswipe
                if ($widget.hasClass('lightbox-on-click-y') && $widget.hasClass('show-image-zoom-yes')){
                    $gallery.on('click', 'img[role="presentation"]', function (e) {
                        $(this).prev('.dt-pswp-item ').trigger('click');
                    });
                }


                $widget.on('woocommerce_gallery_reset_slide_position', methods.onResetSlidePosition);

                if ($gallerySlider.find(".slides > li").length > 1){
                    animationLoop = true;
                }
                $gallery.on('click', '.woocommerce-product-gallery_video', function () {
                    var video = $(this).find('video');
                    // Detect play/pause state of video and toggle
                    if (video.length) {
                        if (video.get(0).paused) {
                            video.get(0).play();
                        } else {
                            video.get(0).pause();
                        }
                    }
                });

                $gallerySlider.flexslider({
                    animation: animation,
                    animationSpeed: animationSpeed,
                    controlNav: false,
                    animationLoop: animationLoop,
                    slideshow: false,
                    customDirectionNav: $directionNav,
                    prevText: '',
                    nextText: '',
                    allowOneSlide: true,
                    before: function (slider) {

                        methods.playPauseVideo(slider, 'pause');
                        $gallery.removeClass('img-slide-active');

                    },
                    after: function (slider) {
                        methods.productInitZoomForCurrentSlide(slider);
                       
                        if (currentDeviceMode === 'desktop' && autoplay || currentDeviceMode === 'mobile' && autoplay && playOnMobile) {
                            methods.playPauseVideo(slider, 'play');
                        }
                        
                        if(!$gallery.find('.woocommerce-product-gallery_video').hasClass('flex-active-slide')){
                            $gallery.addClass('img-slide-active')
                        }
                    },
                    sync: $thumbsSlider,
                    init: function (slider) {
                        if(!$gallery.find('.woocommerce-product-gallery_video').hasClass('flex-active-slide')){
                            $gallery.addClass('img-slide-active')
                        }
                        slider.find('.slides li img').the7ImageRatio();
                        methods.deInitZoomInSlide(slider);
                        if (currentDeviceMode === 'desktop' && autoplay || currentDeviceMode === 'mobile' && autoplay && playOnMobile) {
                            setTimeout(function () {
                                methods.playPauseVideo(slider, 'play');
                            }, 1200);
                        }
                        if ($videoOverlay.length) {
                            $videoWrap.on('click', function (e) {
                                var $this = $(this);
                                // if ($this.hasClass('playing-video')) {
                                // } else {
                                 if (!$this.hasClass('playing-video')) {
                                    $this.find(".the7-video-overlay").remove();
                                    methods.playPauseVideo(slider, 'play');
                                    $this.addClass('playing-video');
                                }
                                
                            });
                        }
                        
                        methods.productInitZoomForCurrentSlide(slider);
                        if (isInit && $thumbsSlider.find(".slides > li").length > 1) {
                            isInit = false;
                            methods.thumbs.init();
                        }
                      
                    },
                    start: function (slider) {
                        $widget.updateGalleryImages();
                        $gallerySlider.css('visibility', 'inherit');
                        //by default viewport added only to slide animation. We need viewport wrapper
                        //to allow nav element overflow it's container
                        if (slider.find(".slides > li").length > 1 && slider.vars.animation === 'fade') {
                            namespace = slider.vars.namespace;
                            slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({
                                "overflow": "hidden",
                                "position": "relative"
                            }).appendTo(slider).append(slider.container);
                        }
                    }
                });
               
                
                

                //allow to initialize single-product.js
                if (typeof wc_single_product_params === 'undefined') {
                    var wc_single_product_params = {};
                }
                
            },
            thumbs: {
                init: function () {
                    var $directionNav = $thumbs.find(navSelector),
                        touch,
                        vertical,
                        reverse,
                        carousel,
                        fade,
                        namespace,
                        asNav,
                        isInit = true;

                    $thumbsSlider.flexslider({
                        animation: "slide",
                        animationLoop: true,
                        controlNav: false,
                        customDirectionNav: $directionNav,
                        move: 1,
                        slideshow: false,
                        itemWidth: 100,
                        itemMargin: $widget.vars.thumbGap,
                        direction: $widget.vars.scrollMode,
                        // mousewheel: directionEnable,
                        prevText: '',
                        nextText: '',
                        directionNav: true,
                        asNavFor: $gallerySlider,
                        init: function (slider) {
                            namespace = slider.vars.namespace;
                            var msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture;
                            touch = (("ontouchstart" in window) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch;
                            vertical = slider.vars.direction === "vertical";
                            reverse = slider.vars.reverse;
                            carousel = (slider.vars.itemWidth > 0);
                            fade = slider.vars.animation === "fade";
                            asNav = slider.vars.asNavFor !== "";
                            if (isInit) {
                                isInit = false;
                                //recalculate columns
                                slider.doMath = function () {
                                    var slide = slider.slides.first(),
                                        slideMargin = slider.vars.itemMargin,
                                        minItems = slider.vars.minItems,
                                        maxItems = slider.vars.maxItems;
                                    if (vertical) {
                                        slider.w = (slider.viewport === undefined) ? slider.height() : slider.viewport.height();
                                        if (slider.isFirefox) {
                                            slider.w = slider.height();
                                        }
                                        slider.h = slide.width();
                                        slider.boxPadding = slide.outerHeight() - slide.height();
                                    } else {
                                        slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
                                        if (slider.isFirefox) {
                                            slider.w = slider.width();
                                        }
                                        slider.h = slide.height();
                                        slider.boxPadding = slide.outerWidth() - slide.width();
                                    }
                                    // CAROUSEL:
                                    if (carousel) {
                                        slider.itemT = slider.vars.itemWidth + slideMargin;
                                        slider.itemM = slideMargin;
                                        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
                                        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
                                        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1))) / minItems :
                                            (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1))) / maxItems :
                                                (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;
                                        slider.visible = Math.floor(slider.w / slider.itemW);
                                        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible) ? slider.vars.move : slider.visible;
                                        slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
                                        slider.last = slider.pagingCount - 1;
                                        slider.limit = (slider.pagingCount === 1) ? 0 :
                                            (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
                                    } else {
                                        slider.itemW = slider.w;
                                        slider.itemM = slideMargin;
                                        slider.pagingCount = slider.count;
                                        slider.last = slider.count - 1;
                                    }
                                    slider.computedW = slider.itemW - slider.boxPadding;
                                    slider.computedM = slider.itemM;
                                };
                                //allow to navigate from start to end
                                slider.canAdvance = function (target, fromNav) {
                                    // ASNAV:
                                    var last = (asNav) ? slider.pagingCount - 1 : slider.last;
                                    return (fromNav) ? true :
                                        (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
                                            (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? true :
                                                (target === slider.currentSlide && !asNav) ? false :
                                                    (slider.vars.animationLoop) ? true :
                                                        (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
                                                            (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
                                                                true;
                                };

                                //dirty hack to fix thumbnail scroll
                                slider.flexAnimate = function (target, pause, override, withSync, fromNav) {
                                    if (!slider.vars.animationLoop && target !== slider.currentSlide) {
                                        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                                    }

                                    if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

                                    if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
                                        if (asNav && withSync) {
                                            var master = $(slider.vars.asNavFor).data('flexslider');
                                            slider.atEnd = target === 0 || target === slider.count - 1;
                                            master.flexAnimate(target, true, false, true, fromNav);
                                            slider.direction = (slider.currentItem < target) ? "next" : "prev";
                                            master.direction = slider.direction;
                                            slider.currentItem = target;
                                            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
                                            if (slider.currentItem >= slider.currentSlide + slider.visible) {
                                                target = slider.currentItem - slider.visible + 1;
                                            } else if (slider.currentItem < slider.currentSlide) {
                                                target = slider.currentItem;
                                            } else {
                                                return true;
                                            }
                                        }

                                        slider.animating = true;
                                        slider.animatingTo = target;

                                        // SLIDESHOW:
                                        if (pause) {
                                            slider.pause();
                                        }

                                        // API: before() animation Callback
                                        slider.vars.before(slider);


                                        // !CAROUSEL:
                                        // CANDIDATE: slide active class (for add/remove slide)
                                        if (!carousel) {
                                            slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');
                                        }

                                        // INFINITE LOOP:
                                        // CANDIDATE: atEnd
                                        slider.atEnd = target === 0 || target === slider.last;

                                        // DIRECTIONNAV:
                                        if (slider.vars.directionNav) {
                                            var disabledClass = namespace + 'disabled';
                                            if (slider.pagingCount === 1) {
                                                slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
                                            } else if (!slider.vars.animationLoop) {
                                                if (slider.animatingTo === 0) {
                                                    slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
                                                } else if (slider.animatingTo === slider.last) {
                                                    slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
                                                } else {
                                                    slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
                                                }
                                            } else {
                                                slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
                                            }
                                        }

                                        if (target === slider.last) {
                                            // API: end() of cycle Callback
                                            slider.vars.end(slider);
                                            // SLIDESHOW && !INFINITE LOOP:
                                            if (!slider.vars.animationLoop) {
                                                slider.pause();
                                            }
                                        }

                                        // SLIDE:
                                        if (!fade) {
                                            var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
                                                margin, slideString, calcNext;

                                            // INFINITE LOOP / REVERSE:
                                            if (carousel) {
                                                margin = slider.vars.itemMargin;
                                                calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
                                                slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
                                            } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
                                                slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
                                            } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
                                                slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
                                            } else {
                                                slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
                                            }
                                            slider.setProps(slideString, "", slider.vars.animationSpeed);
                                            if (slider.transitions) {
                                                if (!slider.vars.animationLoop || !slider.atEnd) {
                                                    slider.animating = false;
                                                    slider.currentSlide = slider.animatingTo;
                                                }

                                                // Unbind previous transitionEnd events and re-bind new transitionEnd event
                                                slider.container.unbind("webkitTransitionEnd transitionend");
                                                slider.container.bind("webkitTransitionEnd transitionend", function () {
                                                    clearTimeout(slider.ensureAnimationEnd);
                                                    slider.wrapup(dimension);
                                                });

                                                // Insurance for the ever-so-fickle transitionEnd event
                                                clearTimeout(slider.ensureAnimationEnd);
                                                slider.ensureAnimationEnd = setTimeout(function () {
                                                    slider.wrapup(dimension);
                                                }, slider.vars.animationSpeed + 100);

                                            } else {
                                                slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function () {
                                                    slider.wrapup(dimension);
                                                });
                                            }
                                        } else { // FADE:
                                            if (!touch) {
                                                slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
                                                slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);
                                            } else {
                                                slider.slides.eq(slider.currentSlide).css({
                                                    "opacity": 0,
                                                    "zIndex": 1
                                                });
                                                slider.slides.eq(target).css({"opacity": 1, "zIndex": 2});
                                                slider.wrapup(dimension);
                                            }
                                        }
                                    }
                                };
                                slider.find('.slides li img').the7ImageRatio();
                                methods.calculateProductThumbnailSize(true);
                                slider.css('visibility', 'inherit');
                            }
                        },
                        start: function (slider) {
                            //custom mousewheel:
                            var prevTime = 0;

                            slider.on('wheel', function (event) {
                                if (slider.count <= slider.visible ){
                                    return true;
                                }
                                var deltaY = event.originalEvent.deltaY;
                                var currTime = new Date().getTime();

                                if (currTime - prevTime < 1000) {
                                    return false;
                                }
                                var goPos;
                                if (deltaY < 0) {
                                    goPos = slider.getTarget('prev');
                                } else {
                                    goPos = slider.getTarget('next');
                                }

                                slider.flexAnimate(goPos, slider.vars.pauseOnAction);
                                prevTime = currTime;
                                return false;
                            });
                        }
                    })
                }
            },
            prepareImages: function ($thumbs, isPreserve) {
                $thumbs.the7ImageRatio('update', isPreserve);
            },
            deInitZoom: function ($target){
                $target.hasClass(classes.imgZoomHandled);
                {
                    $target.removeClass(classes.imgZoomHandled);
                    $target.trigger('zoom.destroy');
                }
            },
            deInitZoomInSlide: function (slider){
                slider.slides.each(function (index, target) {
                    methods.deInitZoom( $(target));
                });
            },
            productInitZoomForCurrentSlide: function (slider) {
                if (typeof $.fn.zoom !== "function") return;
                var imageZoom = $widget.hasClass('show-image-zoom-yes');
                var $zoomTarget = slider.slides.eq(slider.currentSlide);
                if (isTouchEvents || !imageZoom) {
                    methods.deInitZoom($zoomTarget);
                    return false;
                }

                if ($zoomTarget.hasClass(classes.imgZoomHandled)){
                    return false;
                }

                $zoomTarget.addClass(classes.imgZoomHandled);
                var enableZoom = false;
                var galleryWidth = slider.computedW;
                $zoomTarget.each(function (index, target) {
                    var image = $(target).find('img');

                    if (image.data('large_image_width') > galleryWidth) {
                        enableZoom = true;
                        return false;
                    }
                });

                // But only zoom if the img is larger than its container.
                if (enableZoom) {
                    var zoom_options = {
                        touch: false
                    };

                    $zoomTarget.zoom(zoom_options);
                    setTimeout(function () {
                        if ($zoomTarget.find(':hover').length) {
                            $zoomTarget.trigger('mouseover');
                        }
                    }, 100);
                }
            },
            playPauseVideo: function (slider, control){
                var currentSlide, slideType, startTime, player, video, playOnMobile, mute, loop;
                currentSlide = slider.slides.eq(slider.currentSlide);
                playOnMobile = settings['play_on_mobile'] ? true : false;
                mute = settings['mute'] ? true : false;
                loop = settings['loop'] ? true : false;
                var iframe = currentSlide.find("iframe");

                if (iframe.length > 0) {
                    slideType = iframe.attr("title").split(" ")[0];
                } else {
                    slideType = 'video';
                }
                player = iframe.get(0);

                if (slideType === "vimeo") {
                    switch (control) {
                        case "play":
                            if ((startTime != null && startTime > 0) && !currentSlide.hasClass('started')) {
                                currentSlide.addClass('started');
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
                    
                } else if (slideType === "video") {
                    video = currentSlide.find("video").get(0);
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
            calculateProductThumbnailSize: function (isSetup) {
                var thumbSliderData = $thumbsSlider.data("flexslider");
                if (typeof thumbSliderData === 'undefined') {
                    return false;
                }

                var directionEnable = true,
                    elH = 0,
                    colNum = $widget.vars.colNum,
                    thumbGap = $widget.vars.thumbGap,
                    $thumbLi = $thumbsSlider.find('.slides li');

                $widget.clearPrecisionSizes();
                if ($widget.vars.isVertical) {
                    elH = $gallerySlider.outerHeight();
                } else {
                    elH = $gallerySlider.outerWidth();
                }

                var thumbSize = elH / colNum - thumbGap + thumbGap / colNum;
                thumbSize = Math.round(thumbSize);
                if ($thumbLi.length <= colNum) {
                    directionEnable = false;
                }

                if (directionEnable) {
                    $thumbsSlider.removeClass('stop-transition');
                } else {
                    $thumbsSlider.addClass('stop-transition');
                }

                //apply custom height and round all sizes to be pixel perfect
                if ($widget.vars.isVertical) {
                    var containerHeight = ((thumbSize + thumbGap) * colNum) - thumbGap;
                    $thumbsSlider.css({
                        height: containerHeight,
                        width: Math.ceil($thumbsSlider.width())
                    });
                    $thumbLi.css({
                        height: thumbSize
                    });
                    $thumbsSlider.find('.slides').css({
                        height: (thumbSize + thumbGap) * $thumbLi.length
                    });

                    $gallerySlider.css({
                        height: containerHeight,
                        width: Math.ceil($gallery.width())
                    });
                } else {
                    var containerWidth = ((thumbSize + thumbGap) * colNum) - thumbGap;
                    $thumbsSlider.css({
                        width: containerWidth
                    });

                    $gallerySlider.css({
                        width: containerWidth
                    });
                }
                //reinitialize main gallery
                var gallerySliderData = $gallerySlider.data("flexslider");
                if (typeof gallerySliderData !== 'undefined') {
                    gallerySliderData.doMath();
                    gallerySliderData.setup();
                    gallerySliderData.setProps();
                }
                if (isSetup) {
                    $widget.updateThumbnailImages();
                    $widget.updateGalleryImages();
                    thumbSliderData.vars.direction = $widget.vars.scrollMode;
                    thumbSliderData.vars.itemMargin = thumbGap;
                    thumbSliderData.vars.directionNav = directionEnable;
                    thumbSliderData.vars.itemWidth = thumbSize;
                    thumbSliderData.doMath();
                    thumbSliderData.setup();
                    thumbSliderData.setProps();
                }
                return true;
            },
            onResetSlidePosition: function () {
                /* var thumbSliderData = $thumbsSlider.data("flexslider");
                 if (typeof thumbSliderData !== 'undefined') {
                     thumbSliderData.flexslider( 0 );
                 }*/
                var slider = $gallerySlider.data("flexslider");
                if (typeof slider !== 'undefined') {
                    slider.flexslider(0, slider.vars.pauseOnAction, false, true);
                }
            },
           
        };

        //global functions
        $widget.clearPrecisionSizes = function () {
            $gallerySlider.css({
                width: '',
                height: ''
            });
            if ($widget.vars.isVertical) {
                $thumbsSlider.css({
                    width: ''
                });
            } else {
                $thumbsSlider.css({
                    width: '',
                    height: ''
                });
            }
        };

        $widget.refresh = function () {
            methods.initVars();
            if (methods.calculateProductThumbnailSize(false)) {
                //timeout should be more than 100ms to wait while productMainSlider will recalculate image size according to the new data
                setTimeout(function () {
                    methods.calculateProductThumbnailSize(true);
                }, 150)
            }
        };

        $widget.updateGalleryImages = function ($thumbLi) {
            var isPreserve = $widget.hasClass("preserve-gallery-ratio-y");
            if (typeof $thumbLi === 'undefined') {
                $thumbLi = $gallerySlider.find('.slides li');
            }
            methods.prepareImages($thumbLi, isPreserve);
        };

        $widget.updateThumbnailImages = function ($thumbLi) {
            var isPreserve = $widget.hasClass("preserve-thumb-ratio-y");
            if (typeof $thumbLi === 'undefined') {
                $thumbLi = $thumbsSlider.find('.slides li');
            }
            methods.prepareImages($thumbLi, isPreserve);
        };

        methods.init();
    };


    $.productNavigation = function (el) {
        var $widget = $(el),
            $thumbs = $widget.find('.the7-product-navigation .img-ratio-wrapper'),
            methods = {};
        // Store a reference to the slider object
        $.data(el, "productNavigation", $widget);
        // Private slider methods
        methods = {
            init: function () {
                $thumbs.find('img').the7ImageRatio();
                $widget.refresh();
                $(window).on("debouncedresize", function () {
                    $widget.refresh();
                });
            }
        };
        $widget.refresh = function ($thumbLi) {
            var isPreserve = $widget.hasClass("preserve-img-ratio-y");
            if (typeof $thumbLi === 'undefined') {
                $thumbLi = $thumbs;
            }
            $thumbLi.the7ImageRatio('update', isPreserve);
        };

        methods.init();
    };

    /**
     * Sets product images for the chosen variation
     */
    $(document).on('found_variation reset_image', 'form.cart', function (event, variation) {
        var $form = $(this);
        var $widget = $('.elementor-widget-the7-woocommerce-product-images');
        dt_variations_image_update(variation, $widget, $form);
    });

    function dt_variations_image_update(variation, $widget, $form) {
        var $product_gallery = $widget.find('.dt-product-gallery'),
            $thumbs = $widget.find('.dt-product-thumbs .slides'),
            $thumbs_li = $thumbs.find('li:eq(0)'),
            galleryData = $widget.data('productGallery');
        if (variation && variation.image && variation.image.src && variation.image.src.length > 1) {
            var $thumbs_img = $thumbs_li.find('img'),
                $product_img_wrap = $product_gallery
                    .find('.woocommerce-product-gallery__image:not(.clone), .woocommerce-product-gallery__image--placeholder')
                    .eq(0),
                $product_img = $product_img_wrap.find('.wp-post-image'),
                zoomTarget = $product_gallery.find('.zoomImg'),
                $product_link = $product_img_wrap.find('a').eq(0);

            dt_variations_image_reset($widget);
            // See if gallery has a matching image we can slide to.
            var slideToImage = $thumbs.find('li img[data-src="' + variation.image.full_src + '"]');

            if (slideToImage.length > 0) {
                slideToImage.trigger('click');
                $form.attr('dt-current-image', variation.image_id);
                window.setTimeout(function () {
                    $product_gallery.trigger('woocommerce_gallery_init_zoom');
                }, 20);
                return;
            }

            $product_img.wc_set_variation_attr('src', variation.image.src);
            $product_img.wc_set_variation_attr('height', variation.image.src_h);
            $product_img.wc_set_variation_attr('width', variation.image.src_w);
            $product_img.wc_set_variation_attr('srcset', variation.image.srcset);
            $product_img.wc_set_variation_attr('sizes', variation.image.sizes);
            $product_img.wc_set_variation_attr('title', variation.image.title);
            $product_img.wc_set_variation_attr('data-caption', variation.image.caption);
            $product_img.wc_set_variation_attr('alt', variation.image.alt);
            $product_img.wc_set_variation_attr('data-src', variation.image.full_src);
            $product_img.wc_set_variation_attr('data-large_image', variation.image.full_src);
            $product_img.wc_set_variation_attr('data-large_image_width', variation.image.full_src_w);
            $product_img.wc_set_variation_attr('data-large_image_height', variation.image.full_src_h);
            $product_img_wrap.wc_set_variation_attr('data-thumb', variation.image.src);
            $thumbs_img.wc_set_variation_attr('srcset', '');
            $thumbs_img.wc_set_variation_attr('src', variation.image.src);
            $thumbs_img.wc_set_variation_attr('data-src', variation.image.full_src);
            $product_link.wc_set_variation_attr('href', variation.image.full_src);
            $product_link.wc_variations_image_update(variation);
            zoomTarget.attr('src', variation.image.src); // Change main image source
			zoomTarget.attr('srcset', variation.image.srcset);
			zoomTarget.attr('data-large_image', variation.image.full_src);
			zoomTarget.attr('data-large_image_width', variation.image.full_src_w);
			zoomTarget.attr('data-large_image_height', variation.image.full_src_h);
        } else {
            dt_variations_image_reset($widget);
        }

        if (typeof galleryData !== 'undefined') {
            galleryData.updateThumbnailImages($thumbs_li);
            galleryData.updateGalleryImages($product_gallery.find('.slides li:eq(0)'));
        }

        window.setTimeout(function () {
            wc_maybe_trigger_slide_position_reset(variation, $widget, $form);
            $product_gallery.trigger('woocommerce_gallery_init_zoom');
        }, 20);
    }

    /**
     * Reset main image to defaults.
     */
    function dt_variations_image_reset($widget) {
        var $product_gallery = $widget.find('.dt-product-gallery'),
            $thumbs = $widget.find('.dt-product-thumbs .slides'),
            $thumbs_li = $thumbs.find('li:eq(0)'),
            $thumbs_img = $thumbs_li.find('img'),
            $product_img_wrap = $product_gallery
                .find('.woocommerce-product-gallery__image, .woocommerce-product-gallery__image--placeholder')
                .eq(0),
            $product_img = $product_img_wrap.find('.wp-post-image'),
            $product_link = $product_img_wrap.find('a').eq(0);

        $product_img.wc_reset_variation_attr('src');
        $product_img.wc_reset_variation_attr('width');
        $product_img.wc_reset_variation_attr('height');
        $product_img.wc_reset_variation_attr('srcset');
        $product_img.wc_reset_variation_attr('sizes');
        $product_img.wc_reset_variation_attr('title');
        $product_img.wc_reset_variation_attr('data-caption');
        $product_img.wc_reset_variation_attr('alt');
        $product_img.wc_reset_variation_attr('data-src');
        $product_img.wc_reset_variation_attr('data-large_image');
        $product_img.wc_reset_variation_attr('data-large_image_width');
        $product_img.wc_reset_variation_attr('data-large_image_height');
        $product_img_wrap.wc_reset_variation_attr('data-thumb');
        $thumbs_img.wc_reset_variation_attr('src');
        $thumbs_img.wc_reset_variation_attr('srcset');
        $thumbs_img.wc_reset_variation_attr('data-src');
        $product_link.wc_reset_variation_attr('href');
    }

    /**
     * Reset the slide position if the variation has a different image than the current one
     */
    function wc_maybe_trigger_slide_position_reset(variation, $widget, $form) {
        var $product_gallery = $widget.find('.dt-product-gallery'),
            new_image_id = (variation && variation.image_id) ? variation.image_id : '';

        if ($form.attr('dt-current-image') !== new_image_id) {
            reset_slide_position = true;
        }

        $form.attr('dt-current-image', new_image_id);

        if (reset_slide_position) {
            $product_gallery.trigger('woocommerce_gallery_reset_slide_position');
        }
    }

    //FlexSlider: Plugin Function
    $.fn.productGallery = function () {
        return this.each(function () {
            if (typeof $.fn.flexslider !== "function") {
                console.error("Cannot initialize productGallery, flexslider library not found!");
                return;
            }
            if ($(this).data('productGallery') !== undefined) {
                $(this).removeData("productGallery")
            }
            new $.productGallery(this);
        });
    };

    $.fn.productNavigation = function () {
        return this.each(function () {
            if (typeof $.fn.the7ImageRatio !== "function") {
                console.error("Cannot initialize the7ImageRatio, the7-main library not found!");
                return;
            }
            if ($(this).data('productNavigation') !== undefined) {
                $(this).removeData("productNavigation")
            }
            new $.productNavigation(this);
        });
    };

    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-images.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.productGallery();
                var debounceResize = debounce(function () {
                    var galleryData = $widget.data('productGallery');
                    if (typeof galleryData !== 'undefined') {
                        galleryData.refresh();
                    }
                }, 250, false);
                var $gallery = $widget.find(".dt-wc-product-gallery");
                var lastWidth = $gallery.width();

                function checkWidthChanges() {
                    if ($gallery.width() !== lastWidth) {
                        debounceResize();
                        lastWidth = $gallery.width();
                    }
                }

                setInterval(checkWidthChanges, 100);
            });
        });

        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-navigation.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.productNavigation();
                var debounceResize = debounce(function () {
                    var data = $widget.data('productNavigation');
                    if (typeof data !== 'undefined') {
                        data.refresh();
                    }
                }, 600, false);
            });
        });

        function debounce(func, wait, immediate) {
            if (immediate === void 0) {
                immediate = false;
            }
            var timeout;
            return function () {
                var context = this, args = arguments;
                timeout !== null && clearTimeout(timeout);
                timeout = window.setTimeout(function () {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args);
                }, wait);
                if (immediate && !timeout)
                    func.apply(context, args);
            };
        }
    });
})(jQuery);
