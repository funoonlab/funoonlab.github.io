(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        The7ElementorSettings = function ($el) {
            this.$widget = $el;
            // Private methods
            var methods = {
                getID: function ($widget) {
                    return $widget.data('id');
                },
                getModelCID: function ($widget) {
                    return $widget.data('model-cid');
                },
                getItems: function (items, itemKey) {
                    if (itemKey) {
                        const keyStack = itemKey.split('.'),
                            currentKey = keyStack.splice(0, 1);

                        if (!keyStack.length) {
                            return items[currentKey];
                        }

                        if (!items[currentKey]) {
                            return;
                        }

                        return methods.getItems(items[currentKey], keyStack.join('.'));
                    }

                    return items;
                }
            };
            The7ElementorSettings.prototype.getWidgetType = function () {
                const widgetType = this.$widget.data('widget_type');
                if (!widgetType) {
                    return null;
                }
                return widgetType.split('.')[0];
            };
            The7ElementorSettings.prototype.getID = function () {
                return methods.getID(this.$widget);
            };

            The7ElementorSettings.prototype.getModelCID = function () {
                return methods.getModelCID(this.$widget);
            };

            The7ElementorSettings.prototype.getCurrentDeviceSetting = function (settingKey) {
                return elementorFrontend.getCurrentDeviceSetting(this.getSettings(), settingKey);
            };

            The7ElementorSettings.prototype.getSettings = function (setting) {
                var elementSettings = {};
                const modelCID = methods.getModelCID(this.$widget);
                if (modelCID) {
                    const settings = elementorFrontend.config.elements.data[modelCID],
                        attributes = settings.attributes;

                    var type = attributes.widgetType || attributes.elType;

                    if (attributes.isInner) {
                        type = 'inner-' + type;
                    }

                    var settingsKeys = elementorFrontend.config.elements.keys[type];

                    if (!settingsKeys) {
                        settingsKeys = elementorFrontend.config.elements.keys[type] = [];

                        $.each(settings.controls, function (name) {
                            if (this.frontend_available) {
                                settingsKeys.push(name);
                            }
                        });
                    }

                    $.each(settings.getActiveControls(), function (controlKey) {
                        if (-1 !== settingsKeys.indexOf(controlKey)) {
                            var value = attributes[controlKey];

                            if (value.toJSON) {
                                value = value.toJSON();
                            }

                            elementSettings[controlKey] = value;
                        }
                    });
                } else {
                    elementSettings = this.$widget.data('settings') || {};
                }
                return methods.getItems(elementSettings, setting);
            };
        };

        The7ElementorSettings.getResponsiveSettingList = function (setting) {
            const breakpoints = Object.keys(elementorFrontend.config.responsive.activeBreakpoints);
            return ['', ...breakpoints].map(suffix => {
                return suffix ? `${setting}_${suffix}` : setting;
            });
        };

        /**
         * Get Control Value
         *
         * Retrieves a control value.
         *
         * @param {{}}     setting A settings object (e.g. element settings - keys and values)
         * @param {string} controlKey      The control key name
         * @param {string} controlSubKey   A specific property of the control object.
         * @return {*} Control Value
         */
        The7ElementorSettings.getControlValue = function (setting, controlKey, controlSubKey) {
            let value;
            if ('object' === typeof setting[controlKey] && controlSubKey) {
                value = setting[controlKey][controlSubKey];
            } else {
                value = setting[controlKey];
            }
            return value;
        }

        /**
         * Get the value of a responsive control.
         *
         * Retrieves the value of a responsive control for the current device or for this first parent device which has a control value.
         *
         *
         * @param {{}}     setting A settings object (e.g. element settings - keys and values)
         * @param {string} controlKey      The control key name
         * @param {string} controlSubKey   A specific property of the control object.
         * @param {string} device          If we want to get a value for a specific device mode.
         * @return {*} Control Value
         */
        The7ElementorSettings.getResponsiveControlValue = function (setting, controlKey) {
            let controlSubKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
            let device = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            const currentDeviceMode = device || elementorFrontend.getCurrentDeviceMode(),
                controlValueDesktop = The7ElementorSettings.getControlValue(setting, controlKey, controlSubKey);

            // Set the control value for the current device mode.
            // First check the widescreen device mode.
            if ('widescreen' === currentDeviceMode) {
                const controlValueWidescreen = The7ElementorSettings.getControlValue(setting, `${controlKey}_widescreen`, controlSubKey);
                return !!controlValueWidescreen || 0 === controlValueWidescreen ? controlValueWidescreen : controlValueDesktop;
            }

            // Loop through all responsive and desktop device modes.
            const activeBreakpoints = elementorFrontend.breakpoints.getActiveBreakpointsList({
                withDesktop: true
            });
            let parentDeviceMode = currentDeviceMode,
                deviceIndex = activeBreakpoints.indexOf(currentDeviceMode),
                controlValue = '';
            while (deviceIndex <= activeBreakpoints.length) {
                if ('desktop' === parentDeviceMode) {
                    controlValue = controlValueDesktop;
                    break;
                }
                const responsiveControlKey = `${controlKey}_${parentDeviceMode}`,
                    responsiveControlValue = The7ElementorSettings.getControlValue(setting, responsiveControlKey, controlSubKey);
                if (!!responsiveControlValue || 0 === responsiveControlValue) {
                    controlValue = responsiveControlValue;
                    break;
                }

                // If no control value has been set for the current device mode, then check the parent device mode.
                deviceIndex++;
                parentDeviceMode = activeBreakpoints[deviceIndex];
            }
            return controlValue;
        }
    });

    function renameObjProp(obj, old_key, new_key) {
        if (old_key !== new_key && obj[old_key]) {
            Object.defineProperty(obj, new_key,
                Object.getOwnPropertyDescriptor(obj, old_key));
            delete obj[old_key];
            return true;
        }
        return false;
    }

    runElementHandlers = function (elements) {
        [...elements].flatMap(el => [...el.querySelectorAll('.elementor-element')]).forEach(el => elementorFrontend.elementsHandler.runReadyTrigger(el));
    };

    The7ElementorAnimation = function () {
        this.classes = {
            animated: "animated",
            elementorInvisible: "elementor-invisible",
            the7Hidden: "the7-hidden",
        };
        this.animationTimerID;

        The7ElementorAnimation.prototype.animateElements = function (elements) {
            let _this = this;
            elements.forEach(function (e) {
                _this.animateElement(e)
            });
        }

        The7ElementorAnimation.prototype.animateElement = function (e) {
            let $element = e.$element;
            let isAnimated = $element.hasClass(this.classes.animated);
            if (isAnimated) {
                return;
            }
            const animation = e.animation;
            const animationDelay = e.animationDelay;
            if ('none' === animation) {
                $element.removeClass(this.classes.elementorInvisible).removeClass(this.classes.the7Hidden).addClass(this.classes.animated);
                return;
            }
            this.animationTimerID = setTimeout(() => {
                $element.removeClass(this.classes.elementorInvisible).removeClass(this.classes.the7Hidden).addClass(this.classes.animated + ' ' + animation);
            }, animationDelay);
        }

        The7ElementorAnimation.prototype.resetElements = function (elements) {
            let _this = this;
            elements.forEach(function (e) {
                _this.resetElement(e)
            });
        }

        The7ElementorAnimation.prototype.resetElement = function (e) {
            clearTimeout(this.animationTimerID);
            let $element = e.$element;
            if (!$element.hasClass(this.classes.animated)) {
                return;
            }
            const animation = e.animation;
            if ('none' === animation) {
                $element.removeClass(this.classes.elementorInvisible);
                $element.removeClass(this.classes.the7Hidden);
            } else {
                $element.addClass(this.classes.elementorInvisible);
                $element.addClass(this.classes.the7Hidden);
            }
            $element.removeClass(this.classes.animated);
            $element.removeClass(animation);
        }

        /**
         * Will return an array of objects
         *
         * @param {{}}     $node A jquery node where we should find animation
         * @param {string} [exclude_class] will ignore elements with specific class
         * @return {*} array of elements with animation.
         */
        The7ElementorAnimation.prototype.findAnimationsInNode = function ($node, exclude_class) {
            let exclude_elements = ''
            if (exclude_class !== undefined) {
                exclude_elements = `:not(.${exclude_class})`;
            }

            let $elements = $node.find(`.elementor-element${exclude_elements}`);
            let elementsWithAnimation = [];
            $elements.each(function () {
                const $element = $(this);
                const elemSettings = new The7ElementorSettings($element);
                const animation = elemSettings.getCurrentDeviceSetting('the7_animation') || elemSettings.getCurrentDeviceSetting('the7__animation');
                if (!animation) return;
                const elementSettings = elemSettings.getSettings(),
                    animationDelay = elementSettings._animation_delay || elementSettings.animation_delay || 0;
                elementsWithAnimation.push({
                    $element: $element,
                    animation: animation,
                    animationDelay: animationDelay
                });
            });
            return elementsWithAnimation;
        }
    }

    /**
     * Will prevent elementor native scripts handling by replacing  animation data in widgetet parameters.
     * Should be called before The7ElementorAnimation class usage
     *
     * @param {{}}     $widget A jquery node where we should patch animation
     * @param {string}  [custom_class] optional custom class which would be added when element was patched
     */
    The7ElementorAnimation.patchElementsAnimation = function ($widget, custom_class = "") {
        let $elements = $widget.find('.elementor-element');
        $elements.each(function () {
            const $element = $(this);
            if (!$element.hasClass('the7-animate')) {
                let settings = $element.data('settings');
                if (typeof settings !== 'undefined' && Object.keys(settings).length) {
                    let animationList = The7ElementorSettings.getResponsiveSettingList('animation');
                    let _animationList = The7ElementorSettings.getResponsiveSettingList('_animation');
                    const list = animationList.concat(_animationList);

                    let hasAnimation = false;
                    list.forEach(function (item) {
                        if (renameObjProp(settings, item, `the7_${item}`)) {
                            settings[item] = "none";
                            hasAnimation = true;
                        }
                    });
                    if (hasAnimation) {
                        const $element = $(this);
                        const elemSettings = new The7ElementorSettings($element);
                        const animation = elemSettings.getCurrentDeviceSetting('animation') || elemSettings.getCurrentDeviceSetting('_animation');
                        if (animation) {
                            $element.addClass(`the7-hidden the7-animate ${custom_class}`);
                        }
                        $element.attr('data-settings', JSON.stringify(settings));
                    }
                }
            }
        });
    }
})(jQuery);
