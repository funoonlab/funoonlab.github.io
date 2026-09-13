(function ($) {
    $.the7PostLoop = function (el) {
        const data = {
            selectors: {
                gridContainer: '.sGrid-container',
                filterContainer: '.filter',
                filterCategories: '.filter-categories',
                paginator: '.paginator',
                wrapper: '.the7-elementor-widget'
            },
            classes: {
                inPlaceTemplateEditable: "elementor-in-place-template-editable",
                loading: "loading-effect",
                altTemplate: "the7-alternate-templates"
            },
            attr: {
                paged: "data-paged",
                pagenum: "data-page-num",
                paginationMode: "data-pagination-mode"
            }
        };

        let $widget = $(el),
            $wrapper = $widget.find(data.selectors.wrapper).first(),
            elementorSettings,
            settings,
            methods,
            widgetType,
            widgetId,
            elements;

        $widget.vars = {
            masonryActive: false,
            filteradeActive: false,
            useCustomPagination: false,
            isInlineEditing: false,
            effectsTimer: null,
            effectsTimerEnable: false,
            ajaxLoading: false
        };

        // Store a reference to the object
        $.data(el, "the7PostLoop", $widget);
        // Private methods
        methods = {
            init: function () {
                elementorSettings = new The7ElementorSettings($widget);

                widgetId = elementorSettings.getID();
                widgetType = elementorSettings.getWidgetType();
                settings = elementorSettings.getSettings();
                methods.initElements();
                methods.bindEvents();
                $widget.refresh();
                if (elementorFrontend.isEditMode()) {
                    methods.handleCTA();
                    // Filter active item class handling since it's not included in filtrade.
                    window.the7ApplyGeneralFilterHandlers(elements.$filterCategories);
                }
                $widget.refresh = elementorFrontend.debounce($widget.refresh, 300);
            },

            initElements: function () {
                elements = {
                    $gridContainer: $wrapper.children(data.selectors.gridContainer).first(),
                    $filterContainer: $wrapper.children(data.selectors.filterContainer).first(),

                    $paginator: $wrapper.children(data.selectors.paginator).first(),
                };
                elements.$filterCategories = elements.$filterContainer.find(data.selectors.filterCategories).first();
                elements.$filterItems = elements.$filterCategories.find('> a');
            },
            onFilterBtnClick(e) {
                if ($widget.vars.useCustomPagination) {
                    elements.$gridContainerr.resetEffects();
                    $(e.target).removeClass("act");
                    methods.addLoadingAnimation();
                }
            },

            onStandardPaginationBtnClick(e) {
                methods.addLoadingAnimation();
            },

            onAjaxPaginationBtnClick(e) {
                e.preventDefault();

                if (elementorFrontend.isEditMode()) {
                    return;
                }

                if ($widget.vars.ajaxLoading) {
                    return;
                }

                let $this = $(this);

                let isMore = false;
                let currPage = parseInt($wrapper.attr(data.attr.paged));
                let paged = isMore ? currPage + 1 : parseInt($this.attr(data.attr.pagenum));

                if (paged === currPage) {
                    return;
                }
                $widget.vars.ajaxLoading = true;

                let nextHref = methods.updateURLQueryString($this.attr('href'));
                let ajaxData = methods.getAjaxData();
                //ajaxData.data.paged = paged;

                methods.addLoadingAnimation();
                $.ajax({
                    type: "GET",
                    url: nextHref,
                    data: ajaxData,
                    error: function (response) {
                    },
                    success: function (response) {
                        if (response) {
                            elements.$gridContainer.The7SimpleFilterade('destroy');
                            // update current page field
                            let $resp_wrapper = $(response).find(`.elementor-element-${widgetId} ${data.selectors.wrapper}`).first();
                            if ($resp_wrapper.length === 0) {
                                console.log('Cannot loads ajax data');
                                return;
                            }
                            let $resp_gridContainer = $resp_wrapper.children(data.selectors.gridContainer).first();
                            let $resp_paginator = $resp_wrapper.children(data.selectors.paginator).first();
                            elements.$gridContainer.replaceWith($resp_gridContainer);
                            elements.$paginator.replaceWith($resp_paginator);

                            let $resp_wrapper_paged = $resp_wrapper.attr(data.attr.paged);

                            $wrapper.attr(data.attr.paged, $resp_wrapper_paged);

                            $widget.vars.filteradeActive = false;
                            $widget.vars.useCustomPagination = false;
                            $widget.vars.masonryActive = false;
                            methods.initElements();
                            methods.unBindEvents();
                            methods.bindEvents();
                            methods.handleElementHandlers();
                            $widget.refresh();
                            elements.$gridContainer.The7SimpleFilterade('paginationScroll', elements.$paginator);
                        }
                    },
                    complete: function () {
                        methods.removeLoadingAnimation();
                        $widget.vars.ajaxLoading = false;
                    }
                });
            },
            initPagination: function () {
                if (!$widget.vars.useCustomPagination) {
                    let paginationMode = $wrapper.attr(data.attr.paginationMode);
                    if (paginationMode === 'ajax_pagination') {
                        elements.$paginator.find('a').on("click", methods.onAjaxPaginationBtnClick);
                        $widget.vars.useCustomPagination = true;
                    } else if (paginationMode === 'standard') {
                        elements.$paginator.find('a').on("click", methods.onStandardPaginationBtnClick);
                        $widget.vars.useCustomPagination = true;
                    }
                    else if ($wrapper.hasClass(data.classes.altTemplate)){
                        $widget.vars.useCustomPagination = true;
                    }
                }
            },
            getClosestDataElementorId: function () {
                const $closestParent = $widget.closest('[data-elementor-id]');
                return $closestParent ? $closestParent.data('elementor-id') : 0;
            },

            getAjaxData: function () {
                return {
                    "the7-widget-post-id": elementorFrontend.config.post.id || methods.getClosestDataElementorId(),
                    "the7-widget-content": widgetId
                };
            },
            updateURLQueryString: function (nextPageUrl) {
                const currentUrl = new URL(window.location.href);
                const targetUrl = new URL(nextPageUrl);
                currentUrl.pathname = targetUrl.pathname
                const currentParams = currentUrl.searchParams;
                const targetParams = targetUrl.searchParams;
                targetParams.forEach((value, key) => {
                    currentParams.set(key, value);
                });

                //for 1 page
                if (!targetParams.has('the7-page-' + widgetId)) {
                    currentParams.delete('the7-page-' + widgetId);
                }

                history.pushState(null, '', currentUrl.href);
                return currentUrl.href;
            },

            initFilter: function () {
                let config = methods.getFilterConfig()
                if (!$widget.vars.filteradeActive) {
                    elements.$gridContainer.The7SimpleFilterade(config);
                    $widget.vars.filteradeActive = true;
                } else {
                    elements.$gridContainer.The7SimpleFilterade('update', config);
                }
            },
            getFilterConfig: function () {
                let config = the7ShortcodesFilterConfig(elements.$filterContainer);

                config.paginationMode = $wrapper.attr(data.attr.paginationMode);

                config.pageLimit = $wrapper.attr("data-post-limit");
                config.pageControls = $wrapper.children(".paginator, .paginator-more-button");

                config.pagesToShow = $wrapper.hasClass("show-all-pages") ? 999 : 5;

                config.pagerClass = "page-numbers filter-item";
                config.nodesSelector = '> .wf-cell'

                config.usePaginationScroll = settings['pagination_scroll'] === 'y';
                config.scrollPagesOffset = settings['pagination_scroll_offset'] ? settings['pagination_scroll_offset'].size : 0

                config.infinityScroll = $wrapper.hasClass("lazy-loading-mode");

                let show_categories_filter = The7ElementorSettings.getResponsiveControlValue(settings, 'show_categories_filter');

                if ($widget.vars.useCustomPagination || show_categories_filter === 'hide') {
                    config.useFilters = false;
                    config.useSorting = false;
                }
                return config;
            },
            handleLoadingEffects: function () {
                if ($widget.vars.effectsTimerEnable) {
                    clearTimeout($widget.vars.effectsTimer);
                    $widget.vars.effectsTimer = setTimeout(function () {
                        $widget.vars.effectsTimerEnable = false;
                        methods.processEffects();
                        elementorFrontend.elements.$window.on('scroll', methods.handleLoadingEffects);
                    }, 500)
                } else {
                    methods.processEffects();
                }
            },

            addLoadingAnimation: function () {
                $widget.addClass(data.classes.loading);
            },
            removeLoadingAnimation: function () {
                $widget.removeClass(data.classes.loading);
            },

            processEffects: function () {
                let $el = elements.$gridContainer.children('.wf-cell:not(.shown)');
                window.the7ProcessEffects($el);
            },

            handleElementHandlers: function () {
                const loopItems = elements.$gridContainer.find('.e-loop-item');
                runElementHandlers(loopItems);
            },
            handleCTA: function () {
                if (elementorPro === 'undefined') {
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
                const ctaButton = shadowRoot.querySelector('.e-loop-empty-view__box-cta');
                ctaButton.addEventListener('click', () => {
                    elementorPro.modules.loopBuilder.createTemplate();
                    methods.handlePostEdit();
                });
                $widget.css('opacity', 1);
            },
            bindEvents: function () {
                elementorFrontend.elements.$window.on('scroll', methods.handleLoadingEffects);
                elementorFrontend.elements.$window.on('the7-resize-width', methods.handleResize);

                elements.$gridContainer.on('beforeSwitchPage', methods.onBeforeSwitchPage);
                elements.$gridContainer.on('updateReady', methods.onFilteradeUpdateReady);

                elements.$filterItems.on('click', methods.onFilterBtnClick);

            },
            unBindEvents: function () {
                elementorFrontend.elements.$window.off('scroll', methods.handleLoadingEffects);
                elementorFrontend.elements.$window.off('the7-resize-width', methods.handleResize);


                elements.$gridContainer.off('beforeSwitchPage', methods.onBeforeSwitchPage);
                elements.$gridContainer.off('updateReady', methods.onFilteradeUpdateReady);
                elements.$filterItems.off('click', methods.onFilterBtnClick);
            },
            onBeforeSwitchPage: function () {
                elementorFrontend.elements.$window.off('scroll', methods.handleLoadingEffects);
                $widget.vars.effectsTimerEnable = true;
            },
            onFilteradeUpdateReady: function (e, source) {
                if (source !== 'loadMoreButton') {
                    elements.$gridContainer.resetEffects();
                }
                methods.handleLoadingEffects();
                methods.updateSimpleMasonry();
            },
            handleResize: function () {
                methods.initFilter();
                if (methods.isMasonryEnabled()) {
                    if (!$widget.vars.masonryActive) {
                        elements.$gridContainer.The7SimpleMasonry(methods.getMasonryConfig());
                        $widget.vars.masonryActive = true;
                    } else {
                        methods.updateSimpleMasonry();
                    }
                } else {
                    if ($widget.vars.masonryActive) {
                        elements.$gridContainer.The7SimpleMasonry('destroy');
                        $widget.vars.masonryActive = false;
                    }
                }
            },
            updateSimpleMasonry() {
                if ($widget.vars.masonryActive) {
                    elements.$gridContainer.The7SimpleMasonry('setSettings', methods.getMasonryConfig());
                }
            },

            getMasonryConfig: function () {
                return {
                    items: '.wf-cell.visible',
                    columnsCount: +The7ElementorSettings.getResponsiveControlValue(settings, 'columns', 'size') || 0,
                    verticalSpaceBetween: +The7ElementorSettings.getResponsiveControlValue(settings, 'rows_gap', 'size') || 0
                }
            },
            isMasonryEnabled: function () {
                return !!settings['layout'];
            },

            handlePostEdit() {
                $widget.vars.isInlineEditing = true;
                $widget.addClass(data.classes.inPlaceTemplateEditable);
            },

            updateOption: function (propertyName) {
                const newSettingValue = settings[propertyName];
            },
        };

        //global functions
        $widget.refresh = function () {
            settings = elementorSettings.getSettings();
            methods.initPagination();
            methods.handleResize();
        };
        $widget.delete = function () {
            methods.unBindEvents();
            $widget.removeData("the7PostLoop");
        };

        $widget.onDocumentLoaded = function (document) {
            if (document.config.type === 'loop-item') {
                methods.handlePostEdit();

                let elementsToRemove = [];
                const templateID = document.id;
                elementsToRemove = [...elementsToRemove, 'style#loop-' + templateID, 'link#font-loop-' + templateID, 'style#loop-dynamic-' + templateID];
                elementsToRemove.forEach(elementToRemove => {
                    $widget.find(elementToRemove).remove();
                });
            }
        }

        methods.init();
    };

    $.fn.the7PostLoop = function () {
        return this.each(function () {
            var widgetData = $(this).data('the7PostLoop');
            if (widgetData !== undefined) {
                widgetData.delete();
            }
            new $.the7PostLoop(this);
        });
    };


    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-post-loop.post", widgetHandler);

        function widgetHandler($widget, $) {
            $(document).ready(function () {
                $widget.the7PostLoop();
            })
        }

        if (elementorFrontend.isEditMode()) {
            elementorEditorAddOnChangeHandler("the7-post-loop", refresh);
            elementor.on("document:loaded", onDocumentLoaded);
        }

        function onDocumentLoaded(document) {
            var $elements = $('.elementor-widget-the7-post-loop');
            $elements.each(function () {
                const $widget = $(this);
                const widgetData = $widget.data('the7PostLoop');
                if (typeof widgetData !== 'undefined') {
                    widgetData.onDocumentLoaded(document);
                }
            });
        }

        function refresh(controlView, widgetView) {
            let refresh_controls = [
                'layout',
                ...The7ElementorSettings.getResponsiveSettingList('columns'),
                ...The7ElementorSettings.getResponsiveSettingList('rows_gap'),
                ...The7ElementorSettings.getResponsiveSettingList('columns_gap'),
                'pagination_scroll_offset',
                'pagination_scroll'
            ];
            const controlName = controlView.model.get('name');
            if (-1 !== refresh_controls.indexOf(controlName)) {
                const $widget = $(widgetView.$el);
                const widgetData = $widget.data('the7PostLoop');
                if (typeof widgetData !== 'undefined') {
                    widgetData.refresh(controlName);
                }
            }
        }
    });
})(jQuery);