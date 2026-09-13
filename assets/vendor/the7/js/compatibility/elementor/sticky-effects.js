(function ($) {
    "use strict";
    $.the7StickyRow = function (el) {
        let $widget = $(el),
            elementorSettings,
            settings,
            modelCID,
            // breakpoints,
            effectsActive = false,
            $window = $(window);


        let methods = {};
        $widget.vars = {
            stick: {
                stickOffset: 0,
                currentConfig: null
            },
            scroll: {
                isActive: false,
                timerId: null,
                didScroll: false,
                lastScrollTop: 0,
                delta: 5,
                elementHeight: 0,
                isDown: false,
            },
        };

        let classes = {
            scroll: {
                down: "the7-e-scroll-down",
                noTransition: "notransition-all",
            },
            sticky: {
                sticky: "the7-e-sticky",
                stickyActive: "the7-e-sticky-active",
                stickyEffects: "the7-e-sticky-effects",
                spacer: "the7-e-sticky-spacer",
            }
        }
        // Store a reference to the object
        $.data(el, "the7StickyRow", $widget);
        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);
                modelCID = elementorSettings.getModelCID();
                if (elementorFrontend.isEditMode()) {
                    elementor.channels.data.on('element:destroy', methods.onDestroy);
                }
                methods.bindEvents();
                $widget.refresh();
                methods.toggle = elementorFrontend.debounce(methods.toggle, 300);
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('the7-resize-width', methods.toggle);
                //elementorFrontend.elements.$window.on("scroll", methods.toggle);
                $widget.on('the7-sticky:effect-active', methods.onEffectActive);
                $widget.on('the7-sticky:effect-not-active', methods.onEffectNotActive);
                $widget.on('the7-sticky:stick', methods.activateHideOnScroll);
                $widget.on('the7-sticky:unstick', methods.deactivateHideOnscroll);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width', methods.toggle);
                //elementorFrontend.elements.$window.off('scroll', methods.toggle);
                $widget.off('the7-sticky:effect-active', methods.onEffectActive);
                $widget.off('the7-sticky:effect-not-active', methods.onEffectNotActive);
                $widget.off('the7-sticky:stick', methods.activateHideOnScroll);
                $widget.off('the7-sticky:unstick', methods.deactivateHideOnscroll);
            },
            toggle: function () {
                if (methods.isEffectActive()) {
                    methods.activateEffects();
                } else {
                    methods.deactivateEffects();
                }

                if (methods.isStickyActive()) {
                    const config = methods.getStickyConfig(),
                        isDifferentConfig = JSON.stringify(config) !== JSON.stringify($widget.vars.stick.currentConfig);
                    //reactivate sticky only if different config
                    if ($widget.vars.stick.currentConfig !== null && isDifferentConfig) {
                        $widget.reactivateSticky();
                    } else {
                        methods.activateSticky();
                    }
                } else {
                    methods.deactivateSticky();
                }
                methods.updateHeight();
            },
            isEffectActive: function () {
                if (typeof settings === 'undefined') {
                    return false;
                }
                var currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                if (settings['the7_sticky_effects'] === 'yes') {
                    var devices = settings['the7_sticky_effects_devices'],
                        isCurrentModeActive = !devices || -1 !== devices.indexOf(currentDeviceMode);
                    if (isCurrentModeActive) {
                        return true;
                    }
                }
                return false;
            },
            isScrollUpActive: function () {
                if (typeof settings === 'undefined') {
                    return false;
                }
                var currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                if (settings['the7_sticky_scroll_up'] === 'yes') {
                    var devices = settings['the7_sticky_scroll_up_devices'],
                        isCurrentModeActive = !devices || -1 !== devices.indexOf(currentDeviceMode);
                    if (isCurrentModeActive) {
                        return true;
                    }
                }
                return false;
            },
            isStickyActive: function () {
                if (typeof settings === 'undefined') {
                    return false;
                }
                var currentDeviceMode = elementorFrontend.getCurrentDeviceMode();
                if (settings['the7_sticky_row'] === 'yes' && !settings['sticky']) {
                    var devices = settings['the7_sticky_row_devices'],
                        isCurrentModeActive = !devices || -1 !== devices.indexOf(currentDeviceMode);
                    if (isCurrentModeActive) {
                        return true;
                    }
                }
                return false;
            },
            onEffectActive: function () {
                let $elements = $widget.find('.the7-e-on-sticky-effect-visibility, .elementor-widget-the7_horizontal-menu');
                $elements.each(function () {
                        $(this).trigger('effect-active');
                    }
                );
                methods.updateHeight();
            },
            onEffectNotActive: function () {
                let $elements = $widget.find('.the7-e-on-sticky-effect-visibility');
                $elements.each(function () {
                    $(this).trigger('effect-not-active');
                });
                methods.updateHeight();
            },
            updateHeight: function () {
                if ($widget.vars.scroll.isActive) {
                    $widget.vars.scroll.elementHeight = $widget.outerHeight();
                }
            },
            refresh: function () {
            },
            activateEffects: function () {
                if (effectsActive) {
                    return;
                }
                effectsActive = true;
                $widget.reactivateSticky();
            },
            deactivateEffects: function () {
                if (!effectsActive) {
                    return;
                }
                effectsActive = false;
                $widget.removeClass(classes.sticky.stickyEffects);
                $widget.reactivateSticky();
            },
            getStickyConfig: function () {
                var stickyTo = "top"; // elementorSettings.sticky;
                let stickOffset = 0;
                let unStickOffset = 0;
                let cleanTranslate = true;


                let stickyOptions = {
                    to: stickyTo,
                    offset: elementorSettings.getCurrentDeviceSetting('the7_sticky_row_offset'),
                    effectsOffset: elementorSettings.getCurrentDeviceSetting('the7_sticky_effects_offset'),
                    classes: {...classes.sticky}
                };

                stickyOptions.isScrollupActive = methods.isScrollUpActive();
                if (stickyOptions.isScrollupActive) {
                    let stickOffsetSettings = elementorSettings.getCurrentDeviceSetting('the7_sticky_scroll_up_translate');
                    if (typeof stickOffsetSettings !== 'undefined' && stickOffsetSettings['size']) {
                        stickOffset = stickOffsetSettings['size'];
                    } else {
                        let elementHeight = methods.getElementOuterSize($widget, "height")
                        stickOffset = elementHeight;
                        $widget.css('--the7-sticky-scroll-up-translate', elementHeight + 'px');
                        cleanTranslate = false;
                    }
                    unStickOffset = 1;
                }
                if (cleanTranslate) {
                    $widget.css('--the7-sticky-scroll-up-translate', '');
                }

                $widget.vars.stick.stickOffset = stickOffset;

                stickyOptions.stickOffset = stickOffset;
                stickyOptions.unStickOffset = unStickOffset;

                let $wpAdminBar = elementorFrontend.elements.$wpAdminBar;

                if (!effectsActive) {
                    stickyOptions.classes.stickyEffects = '';
                }

                if ($wpAdminBar.length && 'fixed' === $wpAdminBar.css('position')) {
                    let barH = $wpAdminBar.height();
                    stickyOptions.offset += barH;
                    stickyOptions.extraOffset = barH;
                }

                if (settings['the7_sticky_parent']) {
                    if (methods.isContainer($widget[0].parentElement)) {
                        // TODO: The e-container classes should be removed in the next update.
                        stickyOptions.parent = '.e-container, .e-container__inner, .e-con, .e-con-inner, .elementor-widget-wrap';
                        stickyOptions.parentBottomOffset = elementorSettings.getCurrentDeviceSetting('the7_sticky_parent_bottom_offset');
                    }
                }

                return stickyOptions;
            },
            isContainer: function (element) {
                const containerClasses = [
                    'e-con-inner', 'e-container', 'e-container__inner', 'e-con',];
                return containerClasses.some(containerClass => {
                    return element?.classList.contains(containerClass);
                });
            },
            getElementOuterSize: function ($elementOuterSize, dimension, includeMargins) {
                var computedStyle = getComputedStyle($elementOuterSize[0])
                    , elementSize = parseFloat(computedStyle[dimension])
                    , sides = "height" === dimension ? ["top", "bottom"] : ["left", "right"]
                    , propertiesToAdd = [];
                if ("border-box" !== computedStyle.boxSizing) {
                    propertiesToAdd.push("border", "padding")
                }
                if (includeMargins) {
                    propertiesToAdd.push("margin")
                }
                propertiesToAdd.forEach(function (property) {
                    sides.forEach(function (side) {
                        elementSize += parseFloat(computedStyle[property + "-" + side])
                    })
                });
                return elementSize
            },
            activateSticky: function () {
                if (methods.isStickyInstanceActive() || !methods.isStickyActive() || $widget.hasClass('elementor-sticky')) {
                    return;
                }
                $widget.vars.stick.currentConfig = methods.getStickyConfig();
                $widget.The7Sticky($widget.vars.stick.currentConfig);
            },
            deactivateSticky: function () {
                if (!methods.isStickyInstanceActive()) {
                    return;
                }
                $widget.The7Sticky('destroy');
                $widget.removeClass(classes.sticky.stickyEffects);
                methods.deactivateHideOnscroll();
            },
            activateHideOnScroll: function (event, sticky) {
                if (typeof settings !== 'undefined') {
                    if (methods.isScrollUpActive()) {
                        $widget.vars.scroll.isActive = true;
                        $widget.vars.scroll.didScroll = false;
                        $widget.vars.scroll.lastScrollTop = 0;
                        methods.updateHeight();
                        $window.on('scroll', methods.scrollHandler);
                        methods.scrollIntervalHandler(true);
                        $widget.vars.scroll.timerId = setInterval(methods.scrollIntervalHandler, 200);
                    }
                }
            },
            scrollHandler: function () {
                $widget.vars.scroll.didScroll = true;
            },
            deactivateHideOnscroll: function () {
                if ($widget.vars.scroll.isActive) {
                    $window.off('scroll', methods.scrollHandler);
                    clearTimeout($widget.vars.scroll.timerId);
                    $widget.vars.scroll.timerId = null;
                    $widget.vars.scroll.isActive = false;
                    $widget.removeClass(classes.scroll.down);
                }
            },
            scrollIntervalHandler: function (force) {
                if (force) {
                    $widget.addClass(classes.scroll.noTransition);
                    methods.setHideScroll(true);
                    $widget[0].offsetHeight; // Trigger a reflow
                    $widget.removeClass(classes.scroll.noTransition);
                }
                if ($widget.vars.scroll.didScroll) {
                    $widget.vars.scroll.didScroll = false;
                    let st = $window.scrollTop();
                    // Make sure they scroll more than delta
                    if (Math.abs($widget.vars.scroll.lastScrollTop - st) <= $widget.vars.scroll.delta) {
                        return;
                    }
                    if (st > $widget.vars.scroll.lastScrollTop) {
                        if (!$widget.vars.scroll.isDown && st > $widget.vars.scroll.elementHeight) {
                            // Scroll Down
                            methods.setHideScroll(true);
                        }
                    } else if ($widget.vars.scroll.isDown) {
                        // Scroll Up
                        //if (st + $window.height() < $(document).height()) {
                        methods.setHideScroll(false);
                        //  }
                    }

                    $widget.vars.scroll.lastScrollTop = st;
                }
            },
            setHideScroll: function (isHide) {
                if (isHide) {
                    $widget.addClass(classes.scroll.down);
                    $widget.vars.scroll.isDown = true;
                } else {
                    $widget.removeClass(classes.scroll.down);
                    $widget.vars.scroll.isDown = false;
                }
            },
            getElementOuterSze: function ($elementOuterSize, dimension, includeMargins) {
                var computedStyle = getComputedStyle($elementOuterSize[0])
                    , elementSize = parseFloat(computedStyle[dimension])
                    , sides = "height" === dimension ? ["top", "bottom"] : ["left", "right"]
                    , propertiesToAdd = [];
                if ("border-box" !== computedStyle.boxSizing) {
                    propertiesToAdd.push("border", "padding")
                }
                if (includeMargins) {
                    propertiesToAdd.push("margin")
                }
                propertiesToAdd.forEach(function (property) {
                    sides.forEach(function (side) {
                        elementSize += parseFloat(computedStyle[property + "-" + side])
                    })
                });
                return elementSize
            },
            isStickyInstanceActive: function () {
                return undefined !== $widget.data('the7-sticky');
            },
            onDestroy: function (removedModel) {
                if (removedModel.cid !== modelCID) {
                    return;
                }
                $widget.delete();
            },
        };
        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.toggle();
            methods.refresh();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            methods.deactivateEffects();
            methods.deactivateSticky();
            $widget.removeData("the7StickyRow");
        };
        $widget.reactivateSticky = function () {
            if (!methods.isStickyInstanceActive()) {
                return;
            }
            settings = elementorSettings.getSettings();
            methods.deactivateSticky();
            methods.activateSticky();
        };
        methods.init();
    };

    var the7StickyRow = function ($elements) {
        $elements.each(function () {
            var $this = $(this);
            if ($this.hasClass('the7-e-sticky-yes') || $this.hasClass('the7-e-sticky-row-yes')) {
                if ($this.hasClass("the7-e-sticky-spacer") || $this.hasClass("elementor-inner-section")) {
                    return;
                }
                var widgetData = $(this).data('the7StickyRow');
                if (widgetData !== undefined) {
                    widgetData.delete();
                }
                new $.the7StickyRow(this);
            }
        });
    };

    $.the7StickyEffectElementHide = function (el) {
        var effectOff = '';
        var $widget = $(el),
            elementorSettings,
            modelCID,
            currentEffect = effectOff,
            effectTimeout,
            classes = {
                effect: "the7-e-on-sticky-effect-visibility",
                hide: "the7-e-on-sticky-effect-visibility-hide",
                show: "the7-e-on-sticky-effect-visibility-show",
            };

        var methods = {};
        $widget.vars = {
            animDelay: 500,
        };
        // Store a reference to the object
        $.data(el, "the7StickyEffectElementHide", $widget);
        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);
                modelCID = elementorSettings.getModelCID();
                if (elementorFrontend.isEditMode()) {
                    elementor.channels.data.on('element:destroy', methods.onDestroy);
                }
                $widget.refresh();
                methods.bindEvents();
                methods.toggle = elementorFrontend.debounce(methods.toggle, 300);
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('the7-resize-width', methods.toggle);
                $widget.on('effect-active', methods.onEffectActive);
                $widget.on('effect-not-active', methods.onEffectNotActive);
            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('the7-resize-width', methods.toggle);
                $widget.off('effect-active', methods.onEffectActive);
                $widget.off('effect-not-active', methods.onEffectNotActive);
            },
            toggle: function () {
                var currMode = elementorSettings.getCurrentDeviceSetting('the7_hide_on_sticky_effect');
                if (currMode === undefined) return;
                if (currMode !== effectOff) {
                    methods.activateEffects(currMode);
                } else {
                    methods.deactivateEffects();
                }
            },
            activateEffects: function (currMode) {
                if (currentEffect === currMode || currMode === effectOff) {
                    return;
                }
                $widget.removeClass(classes.hide);
                $widget.removeClass(classes.show);
                $widget.addClass(classes.effect);
                $widget.addClass(classes[currMode]);
                currentEffect = currMode;
            },
            deactivateEffects: function () {
                if (currentEffect === effectOff) {
                    return;
                }
                $widget.removeClass(classes.hide);
                $widget.removeClass(classes.show);
                $widget.removeClass(classes.effect);
                methods.unsetHeight();
                currentEffect = effectOff;
            },
            onDestroy: function (removedModel) {
                if (removedModel.cid !== modelCID) {
                    return;
                }
                $widget.delete();
            },
            getHeight: function () {
                return $widget.outerHeight();
            },
            setHeight: function (height) {
                $widget.css({height: height});
            },
            unsetHeight: function () {
                $widget.css({height: ""});
            },
            updateHeight: function () {
                methods.unsetHeight();
                $widget.removeClass(classes[currentEffect]);
                methods.setHeight(methods.getHeight());
                window.setTimeout(methods.addEffectClass, 1);
            },
            addEffectClass: function () {
                $widget.addClass(classes[currentEffect]);
            },
            onEffectActive: function () {
                switch (currentEffect) {
                    case 'hide':
                        clearTimeout(effectTimeout);
                        methods.updateHeight();
                        break;
                    case 'show':
                        effectTimeout = window.setTimeout(methods.unsetHeight, $widget.vars.animDelay);
                        break;
                }
            },
            onEffectNotActive: function () {
                switch (currentEffect) {
                    case 'hide':
                        effectTimeout = window.setTimeout(methods.unsetHeight, $widget.vars.animDelay);
                        break;
                    case 'show':
                        clearTimeout(effectTimeout);
                        methods.updateHeight();
                        break;
                }
            }
        };
        //global functions
        $widget.refresh = function () {
            methods.toggle();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            methods.deactivateEffects();
            $widget.removeData("the7StickyEffectElementHide");
        };
        methods.init();
    };

    var the7StickyEffectElementHide = function ($elements) {
        $elements.each(function () {
            var $this = $(this);
            if ($this.hasClass("the7-e-sticky-spacer")) {
                return;
            }
            var widgetData = $(this).data('the7StickyEffectElementHide');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.the7StickyEffectElementHide(this);
        });
    };

    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {

        function handleSection($widget) {
            the7StickyRow($widget);
            let elementorSettings = new The7ElementorSettings($widget);
            let settings = elementorSettings.getSettings();
            if (typeof settings !== 'undefined') {
                let list = The7ElementorSettings.getResponsiveSettingList('the7_hide_on_sticky_effect');
                let isActive = list.some(function (item) {
                    return item in settings && settings[item] !== '';
                });
                if (isActive) {
                    the7StickyEffectElementHide($widget);
                }
            }
        }

        function initSections($widgets) {
            $widgets.each(function () {
                var $widget = $(this);
                handleSection($widget);
            });
        }

        function destroySections($widgets) {
            $widgets.each(function () {
                var $widget = $(this);
                var widgetData = $widget.data('the7StickyRow');
                if (widgetData !== undefined) {
                    widgetData.delete();
                }
                widgetData = $(this).data('the7StickyEffectElementHide');
                if (widgetData !== undefined) {
                    widgetData.delete();
                }
            });
        }

        elementorFrontend.elements.$document.on('elementor/popup/show', function (event, id, popupElementorObject) {
            initSections(popupElementorObject.$element.find('.elementor-section, .e-container, .e-con'));
        });

        elementorFrontend.elements.$document.on('elementor/popup/hide', function (event, id, popupElementorObject) {
            destroySections(popupElementorObject.$element.find('.elementor-section, .e-container, .e-con'));
        });

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("section", refresh);
            elementorEditorAddOnChangeHandler("container", refresh);
            elementorFrontend.hooks.addAction("frontend/element_ready/section", function ($widget, $) {
                $(document).ready(function () {
                    handleSection($widget);
                })
            });

            elementorFrontend.hooks.addAction("frontend/element_ready/container", function ($widget, $) {
                $(document).ready(function () {
                    handleSection($widget);
                })
            });
        } else {
            elementorFrontend.on("components:init", function () {
                $(document).ready(function () {
                    initSections($('.elementor-section, .e-container, .e-con'));
                })
            });
        }

        function refresh(controlView, widgetView) {
            var reactivateControls = [
                ...The7ElementorSettings.getResponsiveSettingList('the7_sticky_row_offset'),
                ...The7ElementorSettings.getResponsiveSettingList('the7_sticky_effects_offset'),
                ...The7ElementorSettings.getResponsiveSettingList('the7_sticky_scroll_up_translate'),
                'the7_sticky_scroll_up',
                'the7_sticky_scroll_up_devices',
                'the7_sticky_row_overlap',
                'the7_sticky_effects_devices',
                'the7_sticky_effects',
                'the7_hide_on_sticky_effect',
                'the7_sticky_parent',
                ...The7ElementorSettings.getResponsiveSettingList('the7_sticky_parent_bottom_offset'),
            ];
            var controls = [
                'the7_sticky_row',
                'the7_sticky_row_devices',
                'sticky',
                'flex_direction',
                ...reactivateControls
            ];
            var controlName = controlView.model.get('name');
            if (-1 !== controls.indexOf(controlName)) {
                var $widget = window.jQuery(widgetView.$el);
                var widgetData = $widget.data('the7StickyRow');
                if (typeof widgetData !== 'undefined') {
                    if (-1 !== reactivateControls.indexOf(controlName)) {
                        widgetData.reactivateSticky();
                    } else {
                        widgetData.refresh();
                    }
                } else {
                    the7StickyRow($widget);
                }
            }

            var hide_effect_controls = [
                ...The7ElementorSettings.getResponsiveSettingList('the7_hide_on_sticky_effect'),
            ];
            if (-1 !== hide_effect_controls.indexOf(controlName)) {
                var $widget = window.jQuery(widgetView.$el);
                var widgetData = $widget.data('the7StickyEffectElementHide');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    the7StickyEffectElementHide($widget);
                }
            }

        }
    });
})(jQuery);
