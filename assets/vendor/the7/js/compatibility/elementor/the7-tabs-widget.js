(function ($) {
    "use strict";
    $.the7Tabs = function (el) {
        let $widget = $(el), elementorSettings, settings, methods;
        const $tabTitles = $widget.find('.the7-e-tab-title');
        const $tabContents = $widget.find('.the7-e-tab-content');
        const $navWrapper = $widget.find('.the7-e-tabs-nav-wrapper');
        const $nav = $navWrapper.find('.the7-e-tabs-nav');
        const $tabs = $nav.find('[role="tab"]');
        const $navButtons = $navWrapper.find('.the7-e-tab-nav-button');
        const $navLeftButton = $navWrapper.find('.the7-e-tab-nav-button.left-button');
        const $navRightButton = $navWrapper.find('.the7-e-tab-nav-button.right-button');
        const $navScrollWrapper = $widget.find('.the7-e-tabs-nav-scroll-wrapper');
        const $navTitles = $nav.find('.the7-e-tab-title');
        const $accordionTitles = $widget.find('.the7-e-tabs-content .the7-e-tab-title');
        const classes = {
            active: 'active',
            accordion: 'the7-e-accordion',
            noTransition: "notranstion",
            displayNav: "display-nav",
            hidden: "hidden",
        };

        $widget.vars = {
            showTabFn: 'show',
            hideTabFn: 'hide',
            animationSpeed: 400,
            scrollAnimationSpeed: 300,
            scrollEasing: 'swing',
            defaultActiveTab: 1,
            toggleSelf: false,
            hidePrevious: true,
            isHorizontal: false,
            threshold: 2
        };
        const state = {
            isAccordion: false,
            isNavEnabled: false,
            accordionScrollTop: null,
            initializing: false,
            tabTimeout: null,
        };
        // Store a reference to the object
        $.data(el, 'the7Tabs', $widget);
        // Private methods
        methods = {
            init: function () {
                state.initializing = true;
                elementorSettings = new The7ElementorSettings($widget);
                methods.handleResize = elementorFrontend.debounce(methods.handleResize, 300);
                $widget.refresh();
                methods.changeActiveTab($widget.vars.defaultActiveTab);
                state.initializing = false;
                let currentTab = $tabs.index($tabs.filter('[aria-selected="true"]'));

                // Ensure all tabs are tabbable
                $tabs.attr('tabindex', '0');

                // Focus handling: track current tab
                $tabs.on('focus', function () {
                    currentTab = $tabs.index(this);
                });

                // Keydown events
                $tabs.on('keydown', function (e) {
                    switch (e.key) {
                        case 'ArrowRight': // Move to next tab and activate it
                            e.preventDefault();
                            currentTab = (currentTab + 1) % $tabs.length;
                            const nextTab = $tabs.eq(currentTab);
                            nextTab.focus();
                            methods.changeActiveTab(nextTab.attr('data-tab')); // Activate tab content
                            break;
                        case 'ArrowLeft': // Move to previous tab and activate it
                            e.preventDefault();
                            currentTab = (currentTab - 1 + $tabs.length) % $tabs.length;
                            const prevTab = $tabs.eq(currentTab);
                            prevTab.focus();
                            methods.changeActiveTab(prevTab.attr('data-tab')); // Activate tab content
                            break;
                        case 'Enter': // Activate focused tab
                        case ' ':
                            e.preventDefault();
                            methods.changeActiveTab($tabs.eq(currentTab).attr('data-tab'));
                            break;
                    }
                });

                // Click event to activate tabs
                $tabs.on('click', function (e) {
                    e.preventDefault();
                    methods.changeActiveTab($(e.target).closest('.the7-e-tab-title').attr('data-tab'));
                });
            },
            handleResize: function () {
                if (methods.isAccordionActive()) {
                    if (!state.isAccordion) {
                        $widget.addClass(classes.noTransition);
                        $widget.addClass(classes.accordion);
                        $widget.removeClass(classes.noTransition);
                        state.isAccordion = true;
                    }
                } else {
                    if (state.isAccordion) {
                        $widget.removeClass(classes.accordion);
                        state.isAccordion = false;
                    }
                    if ($widget.vars.isHorizontal && methods.isNavOverflow()) {
                        state.isNavEnabled = true;
                        $navWrapper.addClass(classes.displayNav);
                        methods.updateNav();
                    } else {
                        state.isNavEnabled = false;
                        $navWrapper.removeClass(classes.displayNav);
                    }
                }
            },
            changeActiveTab(tabIndex) {
                const isActiveTab = this.isActiveTab(tabIndex);
                methods.backupActiveTab(tabIndex);
                if (($widget.vars.toggleSelf || !isActiveTab) && $widget.vars.hidePrevious) {
                    methods.deactivateActiveTab();
                }

                if (!$widget.vars.hidePrevious && isActiveTab) {
                    methods.deactivateActiveTab(tabIndex);
                }

                if (!isActiveTab) {
                    methods.activateTab(tabIndex);
                }
            },
            backupActiveTab(tabIndex) {
                state.accordionScrollTop = null;
                if (!state.initializing && state.isAccordion) {
                    const activeFilter = '[data-tab="' + tabIndex + '"]';
                    const $accordionRequestedTitle = $accordionTitles.filter(activeFilter);
                    state.accordionScrollTop = $accordionRequestedTitle.offset().top - $(document).scrollTop()
                }
            },
            activateTab(tabIndex) {
                const
                    activeFilter = '[data-tab="' + tabIndex + '"]',
                    $requestedTitle = $tabTitles.filter(activeFilter),
                    $requestedTabTitle = $navTitles.filter(activeFilter),
                    $requestedContent = $tabContents.filter(activeFilter),
                    animationDuration = 'show' === $widget.vars.showTabFn ? 0 : $widget.vars.animationSpeed;


                $requestedTitle.attr({
                    tabindex: '0',
                    'aria-selected': 'true',
                    'aria-expanded': 'true',
                });
                $requestedContent[$widget.vars.showTabFn](
                    animationDuration,
                    function () {
                        $requestedTitle.addClass(classes.active);
                        clearTimeout( $widget.vars.tabTimeout );
                        $widget.vars.tabTimeout = setTimeout( function() {
                            $requestedContent.addClass(classes.active);
                            $requestedContent.layzrInitialisation();
                        },200)

                        elementorFrontend.elements.$window.trigger('elementor-pro/motion-fx/recalc');

                        if (state.isAccordion && state.accordionScrollTop != null) {
                            const $accordionRequestedTitle = $accordionTitles.filter(activeFilter);
                            $("html, body").scrollTop($accordionRequestedTitle.offset().top - state.accordionScrollTop);
                        }
                    }
                );

                $requestedContent.removeAttr('hidden');
                let navWidth = $navScrollWrapper.width();
                if ($requestedTabTitle.position().left < 0) {
                    methods.scrollToTab($requestedTabTitle, 'left');
                } else if (($requestedTitle.outerWidth(true) + $requestedTabTitle.position().left) > (navWidth)) {
                    methods.scrollToTab($requestedTabTitle, 'right');
                }

            },
            deactivateActiveTab(tabIndex) {
                const
                    activeFilter = tabIndex ? '[data-tab="' + tabIndex + '"]' : '.' + classes.active,
                    $activeTitle = $tabTitles.filter(activeFilter),
                    $activeContent = $tabContents.filter(activeFilter);

                $activeTitle.add($activeContent).removeClass(classes.active);
                $activeTitle.attr({
                    tabindex: '-1',
                    'aria-selected': 'false',
                    'aria-expanded': 'false',
                });
                clearTimeout( $widget.vars.tabTimeout );
                $activeContent[$widget.vars.hideTabFn]();
                $activeContent.attr('hidden', 'hidden');
            },
            isActiveTab(tabIndex) {
                return $tabTitles.filter('[data-tab="' + tabIndex + '"]').hasClass(classes.active);
            },
            bindEvents: function () {
                $tabTitles.on('click', methods.onTabClick);
                if ($widget.vars.isHorizontal) {
                    $navScrollWrapper.on('scroll', methods.updateNav);
                    $navButtons.on('click', methods.onNavButtonClick);
                }
                elementorFrontend.elements.$window.on('the7-resize-width', methods.handleResize);
            },
            unBindEvents: function () {
                $tabTitles.off('click', methods.onTabClick);
                $navScrollWrapper.off('scroll', methods.updateNav);
                $navButtons.off('click', methods.onNavButtonClick);
                elementorFrontend.elements.$window.off('the7-resize-width', methods.handleResize);
            },
            onTabClick: function (e) {
                methods.changeActiveTab($(e.target).closest('.the7-e-tab-title').attr('data-tab'));
            },
            onNavButtonClick: function (e) {
                let $this = $(this);
                let navWidth = $navScrollWrapper.width();
                let isRightButton = false;

                if ($this.hasClass("right-button")) {
                    isRightButton = true;
                }
                $navTitles.each(function () {
                        $this = $(this);
                        if (isRightButton) {
                            if (navWidth < $this.position().left + $this.outerWidth(true) - parseInt($this.css('marginRight'), 10) - $this.next('.item-divider').outerWidth(true)) {
                                methods.scrollToTab($this, 'right');
                                return false;
                            }
                        } else {
                            if ($this.position().left + $this.outerWidth(true) + parseInt($this.next('.item-divider').next('.the7-e-tab-title').css('marginLeft'), 10) + $this.next('.item-divider').outerWidth(true) >= -0.5) {
                                methods.scrollToTab($this, 'left');
                                return false;
                            }
                        }
                    }
                );
            },
            scrollToTab: function ($tabToScrollTo, side) {
                let scrollPos;
                if ($tabToScrollTo.is(':last-of-type')) {
                    scrollPos = $nav.width() - $navScrollWrapper.width();
                    scrollPos = Math.ceil(scrollPos);
                } else if ($tabToScrollTo.is(':first-of-type')) {
                    scrollPos = 0;
                } else {
                    let offset;
                    if (side === 'right') {
                        offset = -($navScrollWrapper.width() - ($tabToScrollTo.outerWidth(true) - parseInt($tabToScrollTo.css('margin-right'), 10)));
                    } else {
                        offset = parseInt($tabToScrollTo.css('margin-left'), 10);
                    }
                    scrollPos = $tabToScrollTo.offset().left + ($navScrollWrapper.scrollLeft() - $navScrollWrapper.offset().left) + offset;
                    //compensateMargin
                    if (side === 'left') {
                        scrollPos -= parseInt($tabToScrollTo.css('marginLeft'), 10) || 0;
                    }
                }
                $navScrollWrapper.animate({scrollLeft: scrollPos}, {
                    queue: true,
                    duration: $widget.vars.animationSpeed
                });
            },
            isAccordionActive: function () {
                const dropdownDeviceMode = settings['accordion_breakpoint'];

                if (!dropdownDeviceMode || dropdownDeviceMode === 'none') {
                    return false;
                }

                if (dropdownDeviceMode === 'widescreen') {
                    return true;
                }

                const currentDeviceMode = elementorFrontend.getCurrentDeviceMode();

                return methods.getBreakpointValue(dropdownDeviceMode) >= methods.getBreakpointValue(currentDeviceMode);
            },
            getBreakpointValue: function (deviceMode) {
                const breakpoints = elementorFrontend.config.responsive.breakpoints;
                const isDesktop = deviceMode === 'desktop';
                const deviceModeToUse = isDesktop ? 'laptop' : deviceMode;
                let breakpointValue = 0;
                if (breakpoints.hasOwnProperty(deviceModeToUse)) {
                    breakpointValue = breakpoints[deviceModeToUse].value + (isDesktop ? 1 : 0);
                }
                return breakpointValue;
            },
            isNavOverflow: function () {
                return $nav.prop('scrollWidth') - $widget.vars.threshold  > $navScrollWrapper.width();
            },
            updateNav: function () {
                if (state.isNavEnabled) {
                    let scrollWidth = $nav.prop('scrollWidth');
                    let width = $navScrollWrapper.outerWidth(true);
                    $navLeftButton.removeClass(classes.hidden);
                    $navRightButton.removeClass(classes.hidden);
                    if ((scrollWidth > $navScrollWrapper.width()) && ($navScrollWrapper.scrollLeft() <= 0)) {
                        $navLeftButton.addClass(classes.hidden);
                    } else if ((scrollWidth > width) && (Math.round(scrollWidth - $navScrollWrapper.scrollLeft() - width) <= 0)) {
                        $navRightButton.addClass(classes.hidden);
                    }
                }
            },
        };
        //global functions
        $widget.refresh = function () {
            $widget.vars.isHorizontal = $widget.hasClass('the7-e-tabs-view-horizontal');
            settings = elementorSettings.getSettings();
            methods.unBindEvents();
            methods.bindEvents();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("the7Tabs");
        };

        methods.init();
    };

    $.fn.the7Tabs = function () {
        return this.each(function () {
            var widgetData = $(this).data('the7Tabs');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.the7Tabs(this);
        });
    };
// Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-tabs.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.the7Tabs();
            })
        });
        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-tabs", refresh);
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                ...The7ElementorSettings.getResponsiveSettingList('tab_header_gap'),
                ...The7ElementorSettings.getResponsiveSettingList('title_padding'),
                ...The7ElementorSettings.getResponsiveSettingList('title_border_width'),
                ...The7ElementorSettings.getResponsiveSettingList('divider_thickness'),
                "accordion_breakpoint",
                "tab_header_min_width",
                "view_type"
            ];
            const controlName = controlView.model.get('name');
            if (-1 !== refresh_controls.indexOf(controlName)) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('the7Tabs');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh();
                } else {
                    $widget.the7Tabs();
                }
            }
        }
    });
})(jQuery);
