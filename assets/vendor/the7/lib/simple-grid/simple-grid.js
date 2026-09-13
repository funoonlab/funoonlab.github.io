(function ($) {
        var The7SimpleMasonry = function (element, userSettings) {
            var $element, elements = {}, settings, updateTimeout;
            var defaultSettings = {
                container: null,
                items: 'article',
                columnsCount: 3,
                verticalSpaceBetween: 30,
                classes: {
                    active: 'sGrid-masonry'
                }
            };

            this.init = function (userSettings) {
                initSettings(userSettings);
                initElements();
                bindEvents();
                run();
            };
            var initElements = function () {
                $element = $(element)
                elements.$container = (settings.container === null) ? $element : $(settings.container);
                elements.$items = elements.$container.children(settings.items);
                elements.$container.addClass(settings.classes.active);
                elements.$window = $(window);
            };
            var initSettings = function (userSettings) {
                settings = $.extend(true, defaultSettings, userSettings)
            };
            var bindEvents = function () {
            };
            var unbindEvents = function () {
            };
            this.update = function () {
                run();
            };

            this.setSettings = function (settings) {
                let $this = this;
                    elements.$items.css({
                        'transition': 'none'
                    });
                    $this.destroy();
                    $this.init(settings);
            };

            this.destroy = function () {
                unbindEvents();
                elements.$container.removeClass(settings.classes.active)
                elements.$items.css({
                    'margin-top': ''
                });
                elements.$container.height('');
            };

            var run = function () {
                var heights = [],
                    distanceFromTop = elements.$container.position().top,
                    columnsCount = settings.columnsCount;
                if (columnsCount <=1 ) return;
                elements.$items.css({
                    'transition': 'none'
                });
                distanceFromTop += parseInt(elements.$container.css('margin-top'), 10);
                elements.$items.each(function (index) {
                    var row = Math.floor(index / columnsCount),
                        $item = $(this),
                        itemHeight = $item[0].getBoundingClientRect().height + settings.verticalSpaceBetween;
                    if (row) {
                        var itemPosition = $item.position(),
                            indexAtRow = index % columnsCount,
                            pullHeight = itemPosition.top - distanceFromTop - heights[indexAtRow];
                        //pullHeight -= parseInt($item.css('margin-top'), 10);
                        pullHeight *= -1;
                        if (pullHeight !== 0) {
                            $item.css('margin-top', pullHeight + 'px');
                        }
                        heights[indexAtRow] += itemHeight;
                    } else {
                        heights.push(itemHeight);
                    }
                });
                elements.$items.css({
                    'transition': ''
                });
            }

            this.init(userSettings);
        };
        $.fn.The7SimpleMasonry = function (settings) {
            var isCommand = "string" === typeof settings;
            var args = Array.prototype.slice.call(arguments, 1)

            this.each(function () {
                var $this = $(this);
                if (!isCommand) {
                    $this.data("the7-simple-masonry", new The7SimpleMasonry(this, settings));
                    return
                }
                var instance = $this.data("the7-simple-masonry");
                if (!instance) {
                    throw Error("Trying to perform the `" + settings + "` method prior to initialization")
                }
                if (!instance[settings]) {
                    throw ReferenceError("Method `" + settings + "` not found in instance")
                }
                instance[settings].apply(instance, args);
                if ("destroy" === settings) {
                    $this.removeData("the7-simple-masonry")
                }
            });
            return this
        };
    }
)(jQuery);
