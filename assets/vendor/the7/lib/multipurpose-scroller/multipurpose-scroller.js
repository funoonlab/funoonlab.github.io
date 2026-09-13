(function ($) {
    'use strict';
    let The7MultipurposeScroller = function (element, userSettings) {
        let $element, elements = {}, settings, lazyLoadObserver, activeObserver, layzr, animationId;

        let position = {left: 0, x: 0, dx: 0, dxLast: 0, time: 0, lastTime: 0}, noScroll = true, scrollTimerId;

        let focusUp = 0, focusDown = 0, snapUp = 0, snapDown = 0, inFocus = 0;

        let defaultSettings = {
            arrowScrollMode: "single", // "page" or "single"
            updateFocus: false,
            dragThreshold: 3, //px
            preventClickAfterDrag: true,
            classes: {
                inFocus: 'nsInFocus',
                grab: 'nsGrab',
                active: 'active',
                lazyLoad: 'nsLazyLoad',
                disabled: 'nsDisabled',
                noScroll: 'nsNoScroll'
            },
            elements: {
                arrowLeft: '.nsLeftArrow',
                arrowRight: '.nsRightArrow',
                scroller: '.nsContent',
                scrollerElements: '.nsItem', //children or custom class
                progressTrack: '.nsProgressTrack',
                progressIndicator: '.nsProgressIndicator'
            },
        };

        let init = function (userSettings) {
            initSettings(userSettings);
            initElements();
            if (!elements.$scrollerElements.length) {
                return;
                $element.css('opacity', 1);
            }
            onWindowResizeDebounced = debounce(onWindowResizeDebounced, 250);
            bindEvents();
            update();
            updateFocus();
            layzrInit();
            initObserver();
            $element.css('opacity', 1);
        };
        let initElements = function () {
            $element = $(element)
            elements.$leftArrow = $element.find(settings.elements.arrowLeft);
            elements.$rightArrow = $element.find(settings.elements.arrowRight);
            elements.$scroller = $element.find(settings.elements.scroller);
            elements.$scrollerElements = settings.elements.scrollerElements ? $element.find(settings.elements.scrollerElements) : elements.$scroller.children();
            elements.$progressTrack = $element.find(settings.elements.progressTrack);
            elements.$progressIndicator = $element.find(settings.elements.progressIndicator);
            elements.$window = $(window);
        };
        let initSettings = function (userSettings) {
            settings = $.extend(true, defaultSettings, userSettings)
        };
        let bindEvents = function () {
            elements.$scroller.on("scroll", onScroll);
            elements.$leftArrow.on('click', onArrowClick);
            elements.$rightArrow.on('click', onArrowClick);
            elements.$scroller.on("mousedown", onScrollerMouseDown);
            if (settings.preventClickAfterDrag) {
                elements.$scroller[0].addEventListener('click', onScrollerClick, true);
            }
            elements.$scroller.on("wheel", onScrollerWheel);
            elements.$scroller.on("touchstart", onScrollerTouchStart);

            elements.$window.on('resize', onWindowResizeDebounced);
            elements.$window.on("the7-resize-width-debounce", update);
        };
        let unbindEvents = function () {
            elements.$scroller.off("scroll", onScroll);
            elements.$leftArrow.off('click', onArrowClick);
            elements.$rightArrow.off('click', onArrowClick);
            elements.$scroller.off("mousedown", onScrollerMouseDown);
            if (settings.preventClickAfterDrag) {
                elements.$scroller[0].removeEventListener('click', onScrollerClick, true);
            }

            elements.$scroller.off("wheel", onScrollerWheel);
            elements.$scroller.off("touchstart", onScrollerTouchStart);
            elements.$window.off("the7-resize-width-debounce", update);
            clearTimeout(scrollTimerId);
            scrollTimerId = null;

            stopObserver();
        };


        let debounce = function (func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        let onScroll = function () {
            clearTimeout(scrollTimerId);

            scrollTimerId = setTimeout(function () {
                scrollTimerId = null;
                updateFocus();
                updateScroller();
            }, 50);

            updateScrollIndicator();
        };

        let layzrInit = function () {
            if (typeof Layzr === 'undefined') {
                return;
            }

            layzr = new Layzr({
                selector: '.' + settings.classes.lazyLoad,
                attr: 'data-src',
                attrSrcSet: 'data-srcset',
                retinaAttr: 'data-src-retina',
                hiddenAttr: 'data-src-hidden',
                threshold: 30,
                callback: function () {
                    var $this = $(this);
                    if (!$this.hasClass("is-loaded")) {
                        setTimeout(function () {
                            $this.parent().removeClass("layzr-bg");
                        }, 350);
                    }
                }
            });
        }

        let initObserver = function () {

            settings = $.extend(true, defaultSettings, userSettings)

            if (layzr) {
                lazyLoadObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        let $target = $(entry.target);
                        if (entry.isIntersecting) {
                            let $lazyImg = $target.find('img.lazy-scroll');
                            if ($lazyImg.length) {
                                $lazyImg.addClass(settings.classes.lazyLoad);
                                layzr.updateSelector();
                                layzr.update();
                            }
                            lazyLoadObserver.unobserve(entry.target)
                        }
                    });
                }, {
                    root: elements.$scroller[0],
                    threshold: 0,
                    rootMargin: '100% 100% 100% 100%'
                });
            }

            activeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    let $target = $(entry.target);
                    if (entry.isIntersecting) {
                        $target.addClass(settings.classes.active);
                        $element.trigger('the7-ns:item-active', [$target]);
                    } else {
                        $target.removeClass(settings.classes.active);
                        $element.trigger('the7-ns:item-not-active', [$target]);
                    }
                });
            }, {root: elements.$scroller[0], threshold: 0, rootMargin: '100% 0% 100% 0%'});

            elements.$scrollerElements.each(function () {
                if (lazyLoadObserver) {
                    lazyLoadObserver.observe(this);
                }
                if (activeObserver) {
                    activeObserver.observe(this);
                }
            });
        }

        let stopObserver = function () {
            if (lazyLoadObserver) {
                lazyLoadObserver.disconnect();
            }
            if (activeObserver) {
                activeObserver.disconnect();
            }
        }

        let updateFocus = function () {
            if (settings.updateFocus) {
                findInFocus();
                highlightInFocus(inFocus);
            }
        }

        let getSnapAlign = function () {
            const scrollerEl = elements.$scrollerElements.first()[0];
            return window.getComputedStyle(scrollerEl, null).getPropertyValue("scroll-snap-align");
        }

        let getSnapPoint = function (snapAlign) {
            const scrollerEl = elements.$scrollerElements.first()[0]
            const scroller = elements.$scroller[0];
            let snapPoint = 0;
            switch (snapAlign) {
                case "center":
                    snapPoint = scroller.offsetWidth / 2;
                    break;
                case "end":
                    snapPoint = scroller.offsetWidth - scrollerEl.offsetLeft;
                    break;
                default:
                    snapPoint = scrollerEl.offsetLeft;
            }
            return snapPoint;
        }

        let getPosition = function (element, snapAlign) {
            if (!element) return 0;

            let position = element.offsetLeft;

            switch (snapAlign) {
                case "center":
                    position += element.offsetWidth / 2;
                    break;
                case "end":
                    position += element.offsetWidth;
                    break;
            }
            return position;
        }

        let findInFocus = function () {
            let $scrollerElements = elements.$scrollerElements;
            let snapAlign = getSnapAlign();
            let focusPoint = elements.$scroller.scrollLeft() + getSnapPoint(snapAlign);
            let diff = Infinity;

            for (let i = 0; i < $scrollerElements.length; i++) {
                let iPosition = getPosition($scrollerElements[i], snapAlign);
                let newDiff = Math.abs(focusPoint - iPosition);
                if (newDiff < diff) {
                    diff = newDiff;
                    inFocus = i;
                }
            }

            //console.log("In focus: " + inFocus);
        };

        let highlightInFocus = function (index) {
            if (index < 0 || index > elements.$scrollerElements.length - 1) return;

            elements.$scrollerElements.removeClass(settings.classes.inFocus);
            elements.$scrollerElements.eq(index).addClass(settings.classes.inFocus);
        };

        let findSnap = function () {
            const $scrollerElements = elements.$scrollerElements;
            const snapAlign = getSnapAlign();

            let snapPoint = getSnapPoint(snapAlign);

            const focusPoint = elements.$scroller.scrollLeft() + snapPoint;

            for (let i = 0; i < $scrollerElements.length; i++) {
                const currentElement = $scrollerElements[i];
                const prevElement = i > 0 ? $scrollerElements[i - 1] : null;
                const nextElement = i + 1 < $scrollerElements.length ? $scrollerElements[i + 1] : null;

                let position = getPosition(currentElement, snapAlign);
                let prevPosition = getPosition(prevElement, snapAlign);
                let nextPosition = getPosition(nextElement, snapAlign);

                const diff = Math.round(position - focusPoint);

                if (diff < -1) {
                    if (i < $scrollerElements.length - 1) {
                        focusDown = i;
                        snapDown = position - snapPoint;
                        focusUp = i + 1;
                        snapUp = nextPosition - snapPoint;
                    } else if (i === $scrollerElements.length - 1) {
                        focusDown = i - 1;
                        snapDown = prevPosition - snapPoint;
                        focusUp = i;
                        snapUp = position - snapPoint;
                    }
                } else if (diff >= -1 && diff <= 1) {
                    if (i === 0) {
                        focusDown = i;
                        snapDown = position - snapPoint;
                        focusUp = i + 1;
                        snapUp = nextPosition - snapPoint;
                    } else if (i > 0 && i < $scrollerElements.length - 1) {
                        focusDown = i - 1;
                        snapDown = prevPosition - snapPoint;
                        focusUp = i + 1;
                        snapUp = nextPosition - snapPoint;
                    } else if (i === $scrollerElements.length - 1) {
                        focusDown = i - 1;
                        snapDown = prevPosition - snapPoint;
                        focusUp = i;
                        snapUp = position - snapPoint;
                    }
                } else {
                    break;
                }
            }
        };

        let onScrollerMouseDown = function (e) {
            if (noScroll) return;
            e.preventDefault();
            elements.$scroller.addClass(settings.classes.grab);
            elements.$scroller.css("scroll-behavior", "auto");
            elements.$scroller.css("scroll-snap-type", "none");

            const time = Date.now();

            position = {
                left: elements.$scroller.scrollLeft(), x: e.clientX, dx: 0, time: time, lastTime: time
            };

            cancelAnimationFrame(animationId);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, false);
        };

        let onScrollerClick = function (e) {
            if (noScroll) return;

            if (Math.abs(position.dx) > settings.dragThreshold) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        let onScrollerWheel = function (e) {
            clearScrollerStyles();
        }
        let onScrollerTouchStart = function (e) {
            clearScrollerStyles();
        }
        let clearScrollerStyles = function () {
            cancelAnimationFrame(animationId);
            elements.$scroller.css("scroll-snap-type", "");
            elements.$scroller.css("scroll-behavior", "");
        }

        let onMouseMove = function (e) {
            if (noScroll) return;
            e.preventDefault();

            position.dxLast = position.dx;
            position.lastTime = position.time;
            position.time = Date.now();

            // How far the mouse has been moved
            position.dx = e.clientX - position.x;
            // Scroll the element
            let scrollVal = position.left - position.dx;
            elements.$scroller.scrollLeft(scrollVal);
        };

        let onMouseUp = function (e) {
            elements.$scroller.removeClass(settings.classes.grab);
            if (noScroll) return;


            const snapAlign = getSnapAlign();
            if (snapAlign === "none") {

                const dDistance = position.dxLast - position.dx,
                    dTime = position.time - position.lastTime,
                    multiplier = 16, // Supposed framerate
                    speed = Math.ceil(dDistance / dTime * multiplier),

                    decay = 0.85, // Decay factor for exponential decay
                    threshold = 1; // Small threshold value to stop the animation
                let speedAbs = Math.abs(speed);
                var draw = function () {
                    if (speedAbs > threshold) {
                        let scrollVal = elements.$scroller.scrollLeft();
                        if (speed > 0) {
                            scrollVal += speedAbs;
                        } else {
                            scrollVal -= speedAbs;
                        }
                        elements.$scroller.scrollLeft(scrollVal);
                        speedAbs *= decay; // Apply exponential decay
                        animationId = requestAnimationFrame(draw);
                    } else {
                        cancelAnimationFrame(animationId);
                    }
                };

                draw();

            } else {
                findSnap();
                elements.$scroller.css("scroll-behavior", "");
                if (position.dx < 0) {
                    // Drag right to left
                    elements.$scroller.scrollLeft(snapUp);

                    //console.log("Going UP to: " + focusUp + ", at: " + snapUp);
                } else if (position.dx > 0) {
                    // Drag left to right
                    elements.$scroller.scrollLeft(snapDown);

                    //console.log("Going DOWN to: " + focusDown + ", at: " + snapDown);
                }
            }

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        let onArrowClick = function (e) {
            if (scrollTimerId) return;
            clearScrollerStyles();
            findSnap();
            const isLeft = $(event.target).closest(elements.$leftArrow).length;
            elements.$scroller.scrollLeft(isLeft ? snapDown : snapUp);
        }

        let setDisabled = function ($el, value) {
            $el.toggleClass(settings.classes.disabled, value);
        };

        let updateScroller = function () {
            let scroller = elements.$scroller[0];
            let leftArrow = elements.$leftArrow;
            let rightArrow = elements.$rightArrow;
            let scrollWidth = scroller.scrollWidth;
            let offsetWidth = scroller.offsetWidth;
            let scrollLeft = Math.round(scroller.scrollLeft);

            if (scrollWidth > offsetWidth) {
                $element.toggleClass(settings.classes.noScroll, false);
                noScroll = false;
                scroller.style.cursor = "grab";

                if (scrollLeft <= 0) {
                    setDisabled(leftArrow, true);
                    setDisabled(rightArrow, false);
                } else if (scrollWidth - scrollLeft - offsetWidth <= 0) {
                    setDisabled(leftArrow, false);
                    setDisabled(rightArrow, true);
                } else {
                    setDisabled(leftArrow, false);
                    setDisabled(rightArrow, false);
                }
            } else {
                $element.toggleClass(settings.classes.noScroll, true);
                noScroll = true;
                scroller.style.cursor = "auto";
            }
        };

        let updateScrollIndicator = function () {
            let $progressTrack = elements.$progressTrack,
                $progressIndicator = elements.$progressIndicator,
                $scroller = elements.$scroller;

            let availableTrack = ($progressTrack.innerWidth() - $progressIndicator.outerWidth()) / 100,
                scrollWidth = $scroller[0].scrollWidth - $scroller.innerWidth(),
                scrolled = scrollWidth > 0 ? ($scroller.scrollLeft() / scrollWidth) * 100 : 0,
                position = availableTrack * scrolled;
            $progressIndicator.css('--nsProgressBarTranslateX', `${position}px`);
        };

        let updateProgressIndicator = function () {
            let $scroller = elements.$scroller;
            elements.$progressIndicator.css('width', (($scroller.innerWidth() / $scroller[0].scrollWidth) * 100) + '%');
        };

        let update = function () {
            updateScroller();
            updateProgressIndicator();
            updateScrollIndicator();
        }

        let onWindowResizeDebounced = function () {
            update();
        };

        //public functions
        this.update = function () {
            update();
        };

        this.snapTo = function (n) {
            if (n < 0 || n > elements.$scrollerElements.length - 1) return;

            const element = elements.$scrollerElements[n];
            let snapAlign = getSnapAlign(),
                snapPoint = getSnapPoint(snapAlign),
                iPosition = getPosition(element, snapAlign);

            elements.$scroller.scrollLeft(iPosition - snapPoint);
        };

        this.destroy = function () {
            unbindEvents();
        };

        init(userSettings);
    };

    $.fn.The7MultipurposeScroller = function (settings) {
        const DATA_NAME = "the7-multipurpose-scroller";

        let isCommand = "string" === typeof settings;
        let args = Array.prototype.slice.call(arguments, 1)

        this.each(function () {
            let $this = $(this);
            if (!isCommand) {
                $this.data(DATA_NAME, new The7MultipurposeScroller(this, settings));
                return
            }
            let instance = $this.data(DATA_NAME);
            if (!instance) {
                throw Error("Trying to perform the `" + settings + "` method prior to initialization")
            }
            if (!instance[settings]) {
                throw ReferenceError("Method `" + settings + "` not found in instance")
            }
            instance[settings].apply(instance, args);
            if ("destroy" === settings) {
                $this.removeData(DATA_NAME)
            }
        });
        return this
    };
})(jQuery);
