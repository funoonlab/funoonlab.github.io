(function ($) {
        var The7Sticky = function (element, userSettings) {
            var $element, isSticky = false, isFollowingParent = false,
                isReachedEffectsPoint = false, elements = {}, settings, timerId, lastScrollTop, oldWidth,
                elementOffsetValue,
                elementWidth;
            var defaultSettings = {
                to: "top",
                offset: 0,
                extraOffset: 0,
                effectsOffset: 0,
                parentBottomOffset: 0,
                parent: false,
                timerInterval: 250,
                classes: {
                    sticky: "sticky",
                    stickyActive: "sticky-active",
                    stickyEffects: "sticky-effects",
                    spacer: "sticky-spacer",
                },
                isRTL: false,
                handleScrollbarWidth: false,
            };
            var initElements = function () {
                $element = $(element).addClass(settings.classes.sticky);
                elements.$window = $(window);
                oldWidth = window.innerWidth;
                if (settings.parent) {
                    elements.$parent = $element.parent();

                    if ('parent' !== settings.parent) {
                        elements.$parent = elements.$parent.closest(settings.parent);
                    }
                }
            };
            var initSettings = function () {
                settings = jQuery.extend(true, defaultSettings, userSettings)
            };
            var bindEvents = function () {
                elements.$window.on('resize', onWindowResize);
                elements.$window.on('resize', onWindowResizeDebounced);
                elements.$window.on("scroll", onWindowScroll);
                timerId = setInterval(onTimerInterval, settings.timerInterval);
            };
            var unbindEvents = function () {
                elements.$window.off("scroll", onWindowScroll).off("resize", onWindowResize).off("resize", onWindowResizeDebounced);
                clearTimeout(timerId);
                timerId = null;
            };
            var init = function () {
                initSettings();
                initElements();
                onWindowResizeDebounced = debounce(onWindowResizeDebounced, 400);
                bindEvents();
                checkPosition()
            };

            const updateElementSizesData = () => {
                elementWidth = getElementOuterSize($element, 'width');
                elementOffsetValue = $element.offset().left;

                if (settings.isRTL) {
                    // `window.innerWidth` includes the scrollbar while `document.body.offsetWidth` doesn't.
                    const documentWidth = settings.handleScrollbarWidth ? window.innerWidth : document.body.offsetWidth;

                    elementOffsetValue = Math.max(documentWidth - elementWidth - elementOffsetValue, 0);
                }
            }
            var backupCSS = function ($elementBackupCSS, backupState, properties) {
                var css = {}, elementStyle = $elementBackupCSS[0].style;
                properties.forEach(function (property) {
                    if (typeof property === 'object') {
                        for (var key in property) {
                            css[key] = property[key];
                        }
                    } else {
                        css[property] = undefined !== elementStyle[property] ? elementStyle[property] : ""
                    }
                });
                $elementBackupCSS.data("the7-css-backup-" + backupState, css)
            };
            var getCSSBackup = function ($elementCSSBackup, backupState) {
                return $elementCSSBackup.data("the7-css-backup-" + backupState)
            };
            var addSpacer = function () {
                elements.$spacer = $element.clone().addClass(settings.classes.spacer).css({
                    visibility: "hidden",
                    transition: "none",
                    animation: "none"
                });
                $element.after(elements.$spacer)
            };
            var removeSpacer = function () {
                elements.$spacer.remove()
            };
            var stickElement = function () {
                backupCSS($element, "unsticky", ['position', 'width', 'margin-top', 'margin-bottom', 'top', 'bottom', 'inset-inline-start']);

                var css = {
                    position: "fixed",
                    width: elementWidth,
                    marginTop: 0,
                    marginBottom: 0
                };

                if (elementOffsetValue) {
                    css['inset-inline-start'] = elementOffsetValue + 'px';
                }

                css[settings.to] = settings.offset;
                css["top" === settings.to ? "bottom" : "top"] = "";

                $element.css(css).addClass(settings.classes.stickyActive);
            };
            var unstickElement = function () {
                $element.css(getCSSBackup($element, "unsticky")).removeClass(settings.classes.stickyActive)
            };
            var followParent = function () {
                backupCSS(elements.$parent, "childNotFollowing", ["position"]);
                elements.$parent.css("position", "relative");
                backupCSS($element, "notFollowing", ["position", "inset-inline-start", "top", "bottom"]);

                const css = {
                    position: 'absolute',
                };
                elementOffsetValue = elements.$spacer.position().left;
                if (settings.isRTL) {
                    const parentWidth = $element.parent().outerWidth(),
                        elementOffsetValueLeft = elements.$spacer.position().left;

                    elementWidth = elements.$spacer.outerWidth();
                    elementOffsetValue = Math.max(parentWidth - elementWidth - elementOffsetValueLeft, 0);
                }
                css['inset-inline-start'] = elementOffsetValue + 'px';
                css[settings.to] = '';
                css['top' === settings.to ? 'bottom' : 'top'] = settings.parentBottomOffset;
                $element.css(css);
                isFollowingParent = true;
            };
            var unfollowParent = function () {
                elements.$parent.css(getCSSBackup(elements.$parent, "childNotFollowing"));
                $element.css(getCSSBackup($element, "notFollowing"));
                isFollowingParent = false
            };
            var getElementOuterSize = function ($elementOuterSize, dimension, includeMargins) {
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
            };
            var getElementViewportOffset = function ($elementViewportOffset) {
                var windowScrollTop = elements.$window.scrollTop()
                    , elementHeight = getElementOuterSize($elementViewportOffset, "height")
                    , viewportHeight = innerHeight
                    , elementOffsetFromTop = $elementViewportOffset.offset().top
                    , distanceFromTop = elementOffsetFromTop - windowScrollTop
                    , topFromBottom = distanceFromTop - viewportHeight;
                return {
                    top: {
                        fromTop: distanceFromTop,
                        fromBottom: topFromBottom
                    },
                    bottom: {
                        fromTop: distanceFromTop + elementHeight,
                        fromBottom: topFromBottom + elementHeight
                    }
                }
            };
            var stick = function () {
                updateElementSizesData();
                addSpacer();
                stickElement();
                isSticky = true;
                $element.trigger("the7-sticky:stick")
            };
            var unstick = function () {
                $element.addClass("notransition-all");
                unstickElement();
                removeSpacer();
                isSticky = false;
                $element.trigger("the7-sticky:unstick")
                $element[0].offsetHeight; // Trigger a reflows
                $element.removeClass("notransition-all");
            };
            var checkParent = function () {
                var elementOffset = getElementViewportOffset($element)
                    , isTop = "top" === settings.to;
                if (isFollowingParent) {
                    var isNeedUnfollowing = isTop ? elementOffset.top.fromTop > settings.offset : elementOffset.bottom.fromBottom < -settings.offset;
                    if (isNeedUnfollowing) {
                        unfollowParent()
                    }
                } else {
                    var parentOffset = getElementViewportOffset(elements.$parent),
                        parentStyle = getComputedStyle(elements.$parent[0]),
                        borderWidthToDecrease = parseFloat(parentStyle[isTop ? "borderBottomWidth" : "borderTopWidth"]) + settings.parentBottomOffset,
                        parentViewportDistance = isTop ? parentOffset.bottom.fromTop - borderWidthToDecrease : parentOffset.top.fromBottom + borderWidthToDecrease,
                        isNeedFollowing = isTop ? parentViewportDistance <= elementOffset.bottom.fromTop : parentViewportDistance >= elementOffset.top.fromBottom;
                    if (isNeedFollowing) {
                        followParent()
                    }
                }
            };
            var checkEffectsPoint = function (distanceFromTriggerPoint) {
                if (isReachedEffectsPoint && -distanceFromTriggerPoint < settings.effectsOffset) {
                    $element.removeClass(settings.classes.stickyEffects);
                    elements.$spacer.removeClass(settings.classes.stickyEffects);
                    isReachedEffectsPoint = false;
                    $element.trigger("the7-sticky:effect-not-active");
                } else if (!isReachedEffectsPoint && -distanceFromTriggerPoint >= settings.effectsOffset) {
                    $element.addClass(settings.classes.stickyEffects);
                    elements.$spacer.addClass(settings.classes.stickyEffects);
                    isReachedEffectsPoint = true;
                    $element.trigger("the7-sticky:effect-active");
                }
            };
            var checkPosition = function () {
                var offset = settings.offset, stickOffset = settings.stickOffset,
                    unStickOffset = settings.unStickOffset, distanceFromTriggerPoint;
                var scrollTop = elements.$window.scrollTop();
                lastScrollTop = scrollTop;

                if (isSticky) {
                    let spacerViewportOffset = getElementViewportOffset(elements.$spacer);
                    distanceFromTriggerPoint = "top" === settings.to ? spacerViewportOffset.top.fromTop - offset + unStickOffset : -spacerViewportOffset.bottom.fromBottom - offset + unStickOffset;
                    if (settings.parent) {
                        checkParent()
                    }

                    if (distanceFromTriggerPoint > 0) {
                        unstick();
                    }
                } else {
                    let elementViewportOffset = getElementViewportOffset($element);
                    distanceFromTriggerPoint = "top" === settings.to ? elementViewportOffset.top.fromTop - offset + stickOffset : -elementViewportOffset.bottom.fromBottom - offset + stickOffset;
                    if (distanceFromTriggerPoint <= 0) {
                        stick();
                        if (settings.parent) {
                            checkParent();
                        }
                    }
                }
                let point = distanceFromTriggerPoint;
                if (scrollTop < 0) {
                    point = 0;
                }
                checkEffectsPoint(point);
            };
            var onWindowScroll = function () {
                checkPosition()
            };
            var onTimerInterval = function () {
                var scrollTop = elements.$window.scrollTop();
                if (lastScrollTop !== scrollTop) {
                    checkPosition();
                }
            };
            var onWindowResizeDebounced = function () {
                onWindowResize(true);
            };
            var onWindowResize = function (updateSpacer = false) {
              
                if (!isSticky) {
                    return;
                }
                if (oldWidth === window.innerWidth && !updateSpacer ) {
                    return;
                }
                oldWidth = window.innerWidth;
                if (updateSpacer === true) {
                    removeSpacer();
                }
                unstickElement();

                updateElementSizesData();

                if (updateSpacer === true) {
                    addSpacer();
                }
                stickElement();
                if (settings.parent) {
                    isFollowingParent = false;
                    checkParent()
                }
                checkPosition();
            };
            var debounce = function (func, wait) {
                let timeout;
                return function () {
                    const context = this,
                        args = arguments;

                    const later = () => {
                        timeout = null;
                        func.apply(context, args);
                    };

                    const callNow = !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);

                    if (callNow) {
                        func.apply(context, args);
                    }
                };
            };
            this.refresh = function () {
                onWindowResize(true);
            };
            this.destroy = function () {
                if (isSticky) {
                    unstick()
                }
                unbindEvents();
                $element.removeClass(settings.classes.sticky)
            };
            init();
        };
        $.fn.The7Sticky = function (settings) {
            var isCommand = "string" === typeof settings;
            this.each(function () {
                var $this = $(this);
                if (!isCommand) {
                    $this.data("the7-sticky", new The7Sticky(this, settings));
                    return
                }
                var instance = $this.data("the7-sticky");
                if (!instance) {
                    throw Error("Trying to perform the `" + settings + "` method prior to initialization")
                }
                if (!instance[settings]) {
                    throw ReferenceError("Method `" + settings + "` not found in sticky instance")
                }
                instance[settings].apply(instance, Array.prototype.slice.call(arguments, 1));
                if ("destroy" === settings) {
                    $this.removeData("the7-sticky")
                }
            });
            return this
        };
    }
)(jQuery);
