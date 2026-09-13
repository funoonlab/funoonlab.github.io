jQuery(function ($) {
    $.productListGallery = function (el) {
        let $widget = $(el),
            methods,
            elementorSettings,
            elementorAnimation,
            elementsWithAnimation,
            settings,
            controls,
            product_gallery,
            overlayTemplateExist = false,
            $gallery = $widget.find(".dt-product-gallery"),
            $videoWrap = $widget.find(".gallery-video-wrap"),
            autoplay,
            playOnMobile,
            currentDeviceMode,
            $videoOverlay,
            visibility;
        // Store a reference to the object
        $.data(el, "productListGallery", $widget);
        // Private methods
        methods = {
            init: function () {
                $widget.layzrInitialisation();


                elementorSettings = new The7ElementorSettings($widget);
                settings = elementorSettings.getSettings();
                controls = settings['controls'] ? true : false;
                autoplay = settings['video_autoplay'] ? true : false;
                playOnMobile = settings['play_on_mobile'] ? true : false;
                currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

                $videoOverlay = $widget.find(".the7-video-overlay");
                $triggerZoom = $widget.find(".woocommerce-product-gallery__trigger");

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
                $widget.refresh();

                if (overlayTemplateExist) {
                    visibility = The7ElementorSettings.getResponsiveControlValue(settings, "hover_visibility");
                    switch (visibility) {
                        case "hover-hide":
                            elementorAnimation.animateElements(elementsWithAnimation);
                            break;
                    }
                }
                //Zoom click
                if ($triggerZoom.length) {
                    $widget.on("click", ".zoom-flash", function (e) {
                        e.preventDefault();
                        $triggerZoom.trigger("click");
                    });
                }

                //allow to initialize single-product.js
                if (typeof wc_single_product_params === "undefined") {
                    var wc_single_product_params = {};
                }

                // Support image transitions.
                $widget.one("mouseenter", function () {
                    $widget.find(".post-thumbnail-rollover img").addClass("run-img-transitions");
                });
            },
            handleResize: function () {
                 currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                if (overlayTemplateExist) {
                    visibility = The7ElementorSettings.getResponsiveControlValue(settings, "hover_visibility");
                    switch (visibility) {
                        case "always":
                            elementorAnimation.animateElements(elementsWithAnimation);
                            break;
                        case "disabled":
                            elementorAnimation.resetElements(elementsWithAnimation);
                            break;
                    }
                }
                if (currentDeviceMode === 'mobile' && autoplay && !playOnMobile) {
                    $videoWrap.removeClass('dt-pswp-item-no-click');
                } else if (autoplay && settings['open_lightbox'] === 'y') {
                     $videoWrap.addClass('dt-pswp-item-no-click');
                }
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on("the7-resize-width-debounce", methods.handleResize);
                if (overlayTemplateExist) {
                    $widget.on({mouseenter: methods.mouseenter, mouseleave: methods.mouseleave});
                }
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off("the7-resize-width-debounce", methods.handleResize);
                if (overlayTemplateExist) {
                    $widget.off({mouseenter: methods.mouseenter, mouseleave: methods.mouseleave});
                }
            },
            mouseenter: function () {
                switch (visibility) {
                    case "hover":
                        methods.addAnimation();
                        break;
                    case "hover-hide":
                        methods.resetAnimation();
                        break;
                }
            },
            mouseleave: function () {
                switch (visibility) {
                    case "hover":
                        methods.resetAnimation();
                        break;
                    case "hover-hide":
                        methods.addAnimation();
                        break;
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
        };

        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("productListGallery");
        };
        methods.init();
    };
    $.fn.productListGallery = function () {
        return this.each(function () {
            var widgetData = $(this).data("productListGallery");
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.productListGallery(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-images-list.default", function ($widget, $) {
            $(document).ready(function () {
                if (elementorFrontend.isEditMode()) {
                    The7ElementorAnimation.patchElementsAnimation($widget);
                }
                $widget.productListGallery();
            })
        });
    });
})(jQuery);
