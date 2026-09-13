(function ($) {
    "use strict";
    elementor.on("document:loaded", function () {
        var The7ElementorMigrator = function () {
            const sectionMap = (model, parentModel) => ({
                ...this.responsive('custom_height_inner', 'min_height'),
            });

            const columnMap = (model, parentModel) => ({
                ...this.responsive('the7_auto_width', ({deviceValue, breakpoint, settings}) => {
                    var array = [];
                    switch (deviceValue) {
                        case 'maximize':
                            array.push([this.getDeviceKey('_flex_size', breakpoint), 'custom']);
                            array.push([this.getDeviceKey('_flex_grow', breakpoint), 1]);
                            array.push([this.getDeviceKey('_flex_shrink', breakpoint), 1]);
                            break;
                        case 'fit-content':
                            array.push([this.getDeviceKey('width', breakpoint),  {
                                size: 'fit-content',
                                unit: 'custom'
                            }]);
                            array.push([this.getDeviceKey('_flex_size', breakpoint), 'none']);
                            break;
                        case 'minimize':
                            const targetWidthKey = this.getDeviceKey('the7_target_width', breakpoint);
                            let param = 'none';
                            if (settings[targetWidthKey]) {
                                const widthKey = this.getDeviceKey('width', breakpoint);
                                array.push([widthKey, settings[targetWidthKey]]);
                                array.push([this.getDeviceKey('_flex_size', breakpoint), 'none']);
                            }
                            else{
                                array.push([this.getDeviceKey('width', breakpoint),  {
                                    size: 'fit-content',
                                    unit: 'custom'
                                }]);
                                array.push([this.getDeviceKey('_flex_size', breakpoint), 'none']);
                            }
                            break;
                    }
                    return array;
                }),
            });


            const sectionNormalizeMap = (settings, model, parentModel) => ({
                ...this.responsive('padding', ({deviceKey, deviceValue, settings}) => {
                    let val = {
                        unit: 'px',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        isLinked: true
                    };
                    if (deviceValue){
                        val = {
                            unit: 'px',
                            top: deviceValue.top === '' ? 0 : deviceValue.top,
                            right: deviceValue.right === '' ? 0 : deviceValue.right,
                            bottom: deviceValue.bottom === '' ? 0 : deviceValue.bottom,
                            left: deviceValue.left === '' ? 0 : deviceValue.left,
                            isLinked: true
                        };
                    }
                    return [[deviceKey, val]];
                }),
                flex_align_items: settings.column_position ? settings.flex_align_items : 'center',
            })

            const columnNormalizeMap = (settings, model, parentModel) => ({
                ...this.responsive('padding', ({deviceKey, deviceValue, settings}) => {
                    let val = {
                        unit: 'px',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        isLinked: true
                    };
                    if (deviceValue){
                        val = {
                            unit: 'px',
                            top: deviceValue.top === '' ? 0 : deviceValue.top,
                            right: deviceValue.right === '' ? 0 : deviceValue.right,
                            bottom: deviceValue.bottom === '' ? 0 : deviceValue.bottom,
                            left: deviceValue.left === '' ? 0 : deviceValue.left,
                            isLinked: false
                        };
                    }
                    return [[deviceKey, val]];
                }),
            })

            const config = {
                section: {
                    legacyControlsMapping: sectionMap,
                    normalizeMapping: sectionNormalizeMap
                },
                column: {
                    legacyControlsMapping: columnMap,
                    normalizeMapping: columnNormalizeMap
                },
            };
            // Private methods
            var methods = {
                /**
                 * Get a mapping object of Legacy-to-Container controls mapping.
                 *
                 * @param {Object} model - Mapping object.
                 *
                 * @return {Object}
                 */
                getLegacyControlsMapping: function (model, parentModel) {
                    const conf = config[model.elType];
                    if (!conf) {
                        return {};
                    }
                    const {legacyControlsMapping: mapping} = conf;
                    return ('function' === typeof mapping) ? mapping(model, parentModel) : mapping;
                },
                /**
                 * Get a mapping object of Legacy-to-Container controls mapping.
                 *
                 * @param {Object} model - Mapping object.
                 *
                 * @return {Object}
                 */
                getNormalizeMapping: function (settings, model, parentModel) {
                    const conf = config[model.elType];
                    if (!conf) {
                        return {};
                    }
                    const {normalizeMapping: mapping} = conf;
                    return ('function' === typeof mapping) ? mapping(settings, model, parentModel) : mapping;
                },
            };

            /*
             * Generate a mapping object for responsive controls.
                 *
                 * Usage:
             *  1. responsive( 'old_key', 'new_key' );
             *  2. responsive( 'old_key', ( { key, value, deviceValue, settings, breakpoint } ) => { return [[ key, value ]] } );
             *
             * @param {string} key - Control name without device suffix.
                 * @param {string|function} value - New control name without device suffix, or a callback.
                 *normalizeSettings
                 * @return {array}
                     */
            The7ElementorMigrator.prototype.responsive = function (key, value) {
                const breakpoints = [
                    '', // For desktop.
                    ...Object.keys(elementorFrontend.config.responsive.activeBreakpoints),
                ];

                return Object.fromEntries(breakpoints.map((breakpoint) => {
                    const deviceKey = this.getDeviceKey(key, breakpoint);

                    // Simple responsive rename with string:
                    if ('string' === typeof value) {
                        const newDeviceKey = this.getDeviceKey(value, breakpoint);

                        return [
                            deviceKey,
                            ({settings}) => [[newDeviceKey, settings[deviceKey]]],
                        ];
                    }

                    // Advanced responsive rename with callback:
                    return [deviceKey, ({settings, value: desktopValue}) => value({
                        key,
                        deviceKey,
                        value: desktopValue,
                        deviceValue: settings[deviceKey],
                        settings,
                        breakpoint,
                    })];
                }));
            };

            /**
             * Get a setting key for a device.
             *
             * Examples:
             *  1. getDeviceKey( 'some_control', 'mobile' ) => 'some_control_mobile'.
             *  2. getDeviceKey( 'some_control', '' ) => 'some_control'.
             *
             * @param {string} key - Setting key.
             * @param {string} breakpoint - Breakpoint name.
             *
             * @return {string}
             */
            The7ElementorMigrator.prototype.getDeviceKey = function (key, breakpoint) {
                return [key, breakpoint].filter((v) => !!v).join('_');
            };

            /**
             * Normalize element settings (adding defaults, etc.) by elType,
             *
             * @param {Object} model - Element model.
             * @param {Object} settings - Settings object after migration.
             *
             * @return {Object} - normalized settings.
             */
            The7ElementorMigrator.prototype.normalizeSettings = function (model, settings, parentModel) {
                const map = methods.getNormalizeMapping(settings, model, parentModel);
                if (map === undefined) {
                    return settings;
                }
                let copy = [];
                Object.entries(map).forEach(([key, mapped]) => {

                    // Simple key:
                    // { old_setting: 'new_setting' }
                    if ('string' === typeof mapped) {
                        copy.push([key, mapped])
                        return;
                    }

                    // Advanced conversion using a callback:
                    // { old_setting: ( { key, value, settings } ) => [ 'new_setting', value ] }
                    if ('function' === typeof mapped) {
                        copy = copy.concat(mapped({key, settings}));
                        return;
                    }
                });
                return { ...settings, ...Object.fromEntries(copy)}
            };

            /**
             * Migrate element settings into new settings object, using a map object.
             *
             * @param {Object} settings - Settings to migrate.
             *
             *  @param {Object} model - Element model.
             *
             * @return {Object}
             */
            The7ElementorMigrator.prototype.migrate = function (settings, model, parentModel) {
                const map = methods.getLegacyControlsMapping(model, parentModel);
                if (map === undefined) {
                    return settings;
                }
                let copy = [];
                Object.entries({...settings}).forEach(([key, value]) => {
                    const mapped = map[key];
                    // Remove setting.
                    if (null === mapped) {
                        return;
                    }

                    // Simple key conversion:
                    // { old_setting: 'new_setting' }
                    if ('string' === typeof mapped) {
                        copy.push([mapped, value])
                        return;
                    }

                    // Advanced conversion using a callback:
                    // { old_setting: ( { key, value, settings } ) => [ 'new_setting', value ] }
                    if ('function' === typeof mapped) {
                        copy = copy.concat(mapped({key, value, settings}));
                        return;
                    }
                    copy.push([key, value]);
                });

                return Object.fromEntries(copy);
            };

            The7ElementorMigrator.prototype.canConvertToContainer = function (elType) {
                return Object.keys(config).includes(elType);
            };
        };

        //migrate
        var convertType = null;
        $e.commands.on('run:before', function (self, commandName, args) {
            if (commandName === 'container-converter/convert') {
                convertType = null;
                const elType = args.container.type;
                const migrator = new The7ElementorMigrator();
                if (migrator.canConvertToContainer(elType)) {
                    convertType = elType;
                }
            }
            if (convertType !== null && commandName === 'document/elements/create') {
                const migrator = new The7ElementorMigrator();
                if (migrator.canConvertToContainer(convertType)) {
                    const parentContainer = args.container;
                    let parentModel = parentContainer.model.toJSON();

                    let newSettings;
                    const modelOrig = args.model;
                    const modelCopy = Object.assign({}, modelOrig);
                    modelCopy.elType = convertType;
                    newSettings = migrator.migrate(modelCopy.settings, modelCopy, parentModel);
                    newSettings = migrator.normalizeSettings(modelCopy, newSettings, parentModel);
                    modelOrig.settings = newSettings;
                }
                convertType = null;
            }

        });
    });
})(jQuery);