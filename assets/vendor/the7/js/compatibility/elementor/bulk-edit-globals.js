/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/checkbox-switch.js":
/*!***********************************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/checkbox-switch.js ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.CheckboxSwitch = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CheckboxSwitch = exports.CheckboxSwitch = /*#__PURE__*/function (_$e$modules$CommandBa) {
  (0, _inherits2.default)(CheckboxSwitch, _$e$modules$CommandBa);
  function CheckboxSwitch() {
    (0, _classCallCheck2.default)(this, CheckboxSwitch);
    return _callSuper(this, CheckboxSwitch, arguments);
  }
  (0, _createClass2.default)(CheckboxSwitch, [{
    key: "apply",
    value: function apply(args) {
      $e.components.get('the7-bulk-edit-globals').checkboxSwitch({
        value: args.value
      });
    }
  }]);
  return CheckboxSwitch;
}($e.modules.CommandBase);
var _default = exports["default"] = CheckboxSwitch;

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/clear.js":
/*!*************************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/clear.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.Clear = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Clear = exports.Clear = /*#__PURE__*/function (_$e$modules$CommandBa) {
  (0, _inherits2.default)(Clear, _$e$modules$CommandBa);
  function Clear() {
    (0, _classCallCheck2.default)(this, Clear);
    return _callSuper(this, Clear, arguments);
  }
  (0, _createClass2.default)(Clear, [{
    key: "apply",
    value: function apply(args) {
      $e.components.get('the7-bulk-edit-globals').clearBulkEditControlSettings(args);
    }
  }]);
  return Clear;
}($e.modules.CommandBase);
var _default = exports["default"] = Clear;

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/index.js":
/*!*************************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/index.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "CheckboxSwitch", ({
  enumerable: true,
  get: function get() {
    return _checkboxSwitch.CheckboxSwitch;
  }
}));
Object.defineProperty(exports, "Clear", ({
  enumerable: true,
  get: function get() {
    return _clear.Clear;
  }
}));
var _clear = __webpack_require__(/*! ./clear */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/clear.js");
var _checkboxSwitch = __webpack_require__(/*! ./checkbox-switch */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/checkbox-switch.js");

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/component.js":
/*!********************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/component.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "../node_modules/@babel/runtime/helpers/typeof.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/assertThisInitialized */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "../node_modules/@babel/runtime/helpers/defineProperty.js"));
var commands = _interopRequireWildcard(__webpack_require__(/*! ./commands/ */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/commands/index.js"));
var _repeater = _interopRequireDefault(__webpack_require__(/*! ./repeater */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater.js"));
var _switcher = _interopRequireDefault(__webpack_require__(/*! ./switcher */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/switcher.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Component = exports["default"] = /*#__PURE__*/function (_$e$modules$Component) {
  (0, _inherits2.default)(Component, _$e$modules$Component);
  function Component(args) {
    var _this;
    (0, _classCallCheck2.default)(this, Component);
    _this = _callSuper(this, Component, [args]);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "manager", {});
    _this.manager = args.manager;
    _this.bindEvents();
    elementor.addControlView('the7-global-style-repeater', _repeater.default);
    elementor.addControlView('the7-global-style-switcher', _switcher.default);
    return _this;
  }
  (0, _createClass2.default)(Component, [{
    key: "getNamespace",
    value: function getNamespace() {
      return 'the7-bulk-edit-globals';
    }

    /**
     * Listen to click event
     *
     * @return {void}
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      elementor.channels.editor.on('the7_bulk_edit:apply', function (_ref) {
        var container = _ref.container,
          el = _ref.el;
        var controls = _this2.getGroupControls({
          the7_bulk_edit_typography: ''
        }, container.controls);
        var repeaterContainer = container.repeaters.custom_typography;
        var settingsChanged = 0;
        container.getSetting('custom_typography').each(function (model) {
          var id = model.get('_id');
          var reply = elementor.channels.panelElements.request('the7-bulk-edit:' + id + ':is-checked');
          if (reply) {
            var foundChildren = repeaterContainer.children.findRecursive(
            // eslint-disable-next-line no-shadow
            function (container) {
              return container.id === id;
            });
            Object.values(controls).forEach(function (control) {
              var hasVal = null;
              var settings = container.getSetting(control.name);
              if ('slider' === control.type) {
                hasVal = settings.size;
              } else {
                hasVal = settings;
              }
              if (hasVal) {
                var key = control.name.replace('the7_bulk_edit_', '');
                $e.run('document/elements/settings', {
                  container: foundChildren,
                  settings: (0, _defineProperty2.default)({}, key, settings),
                  options: {
                    external: true,
                    render: true,
                    renderUI: true
                  }
                });
                settingsChanged++;
              }
            });
          }
        });

        // Reload styleguide to update all styles
        if (elementor.getPreferences('enable_styleguide_preview') && settingsChanged > 1) {
          $e.run('preview/styleguide/hide');
          elementor.documents.getCurrent().config.settings.settings.custom_typography = container.getSetting('custom_typography').toJSON();
          setTimeout(function () {
            $e.route('panel/global/global-typography');
            $e.run('preview/styleguide/global-typography');
          }, 500);
        }
        jQuery('.elementor-control-the7_bulk_edit_apply_notice').fadeIn(500).delay(3000).fadeOut(500);
      });
    }
  }, {
    key: "clearBulkEditControlSettings",
    value: function clearBulkEditControlSettings() {
      var container = elementor.documents.getCurrent().container;
      var controls = this.getGroupControls({
        the7_bulk_edit_typography: ''
      }, container.controls);
      // Clear custom bulk edit settings.
      Object.values(controls).forEach(function (control) {
        container.settings.set(control.name, control.default);
      });
      container.settings.set('the7_bulk_edit', container.controls.the7_bulk_edit.default);
      elementor.channels.panelElements.reply('the7-bulk-edit:checkbox:switch', container.settings.get('the7_bulk_edit'));
    }
  }, {
    key: "getGroupControls",
    value: function getGroupControls(settings, controls) {
      var result = {};
      Object.keys(settings).forEach(function (settingKey) {
        Object.values(controls).forEach(function (control) {
          if (settingKey === control.name) {
            result[control.name] = control;
          } else if (control !== null && control !== void 0 && control.groupPrefix) {
            var groupPrefix = control.groupPrefix;
            if (groupPrefix.startsWith(settingKey)) {
              result[control.name] = control;
            }
          }
        });
      });
      return result;
    }
  }, {
    key: "checkboxSwitch",
    value: function checkboxSwitch(args) {
      elementor.channels.panelElements.trigger('the7-bulk-edit:checkbox:switch', args);
    }
  }, {
    key: "defaultCommands",
    value: function defaultCommands() {
      // Object of all the component commands.
      return this.importCommands(commands);
    }
  }]);
  return Component;
}($e.modules.ComponentBase);

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater-row.js":
/*!***********************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater-row.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];
/* provided dependency */ var sprintf = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["sprintf"];


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var _default = exports["default"] = /*#__PURE__*/function (_elementor$modules$co) {
  (0, _inherits2.default)(_default, _elementor$modules$co);
  function _default() {
    (0, _classCallCheck2.default)(this, _default);
    return _callSuper(this, _default, arguments);
  }
  (0, _createClass2.default)(_default, [{
    key: "ui",
    value: function ui() {
      var ui = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "ui", this).call(this);
      ui.sortButton = '.elementor-repeater-tool-sort';
      ui.bulkActionInput = '.elementor-repeater-tool-bulk-action';
      return ui;
    }
  }, {
    key: "getTemplate",
    value: function getTemplate() {
      return '#tmpl-the7-elementor-global-style-repeater-row';
    }
  }, {
    key: "events",
    value: function events() {
      return {
        'click @ui.removeButton': 'onRemoveButtonClick',
        'keyup @ui.removeButton': 'onRemoveButtonPress',
        'click @ui.bulkActionInput': 'onBulkActionClickInput'
      };
    }
  }, {
    key: "onBulkActionClickInput",
    value: function onBulkActionClickInput() {
      var currentValue = this.ui.bulkActionInput.is(':checked');
      elementor.channels.panelElements.reply('the7-bulk-edit:' + this.model.get('_id') + ':is-checked', currentValue);
    }
  }, {
    key: "setBulkActionCheckbox",
    value: function setBulkActionCheckbox(value) {
      this.ui.bulkActionInput.prop('checked', !!value);
      this.onBulkActionClickInput();
    }
  }, {
    key: "updateColorValue",
    value: function updateColorValue() {
      this.$colorValue.text(this.model.get('color'));
    }
  }, {
    key: "getDisabledRemoveButtons",
    value: function getDisabledRemoveButtons() {
      if (!this.ui.disabledRemoveButtons) {
        this.ui.disabledRemoveButtons = this.$el.find('.elementor-repeater-tool-remove--disabled');
      }
      return this.ui.disabledRemoveButtons;
    }
  }, {
    key: "getRemoveButton",
    value: function getRemoveButton() {
      return this.ui.removeButton.add(this.getDisabledRemoveButtons());
    }
  }, {
    key: "triggers",
    value: function triggers() {
      return {};
    }
  }, {
    key: "onRender",
    value: function onRender() {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "onRender", this).call(this);
      var reply = elementor.channels.panelElements.request('the7-bulk-edit:checkbox:switch');
      if (!reply) {
        this.ui.bulkActionInput.hide();
      }
    }
  }, {
    key: "onChildviewRender",
    value: function onChildviewRender(childView) {
      var isColor = 'color' === childView.model.get('type'),
        isPopoverToggle = 'popover_toggle' === childView.model.get('type'),
        $controlInputWrapper = childView.$el.find('.elementor-control-input-wrapper');
      var globalType = '',
        globalTypeTranslated = '';
      if (isColor) {
        this.$colorValue = jQuery('<div>', {
          class: 'e-global-colors__color-value elementor-control-unit-3'
        });
        $controlInputWrapper.prepend(this.getRemoveButton(), this.$colorValue).prepend(this.ui.sortButton);
        globalType = 'color';
        globalTypeTranslated = __('Color', 'elementor');
        this.updateColorValue();
      }
      if (isPopoverToggle) {
        $controlInputWrapper.append(this.getRemoveButton()).append(this.ui.sortButton);
        globalType = 'font';
        globalTypeTranslated = __('Font', 'elementor');
      }
      if (isColor || isPopoverToggle) {
        var removeButtons = this.getDisabledRemoveButtons();
        this.ui.removeButton.data('e-global-type', globalType);
        this.ui.removeButton.tipsy({
          /* Translators: %s: Font/Color. */
          title: function title() {
            return sprintf(__('Delete Global %s', 'elementor'), globalTypeTranslated);
          },
          gravity: function gravity() {
            return 's';
          }
        });
        removeButtons.tipsy({
          /* Translators: %s: Font/Color. */
          title: function title() {
            return sprintf(__('System %s can\'t be deleted', 'elementor'), globalTypeTranslated);
          },
          gravity: function gravity() {
            return 's';
          }
        });
      }
    }
  }, {
    key: "onModelChange",
    value: function onModelChange(model) {
      if (undefined !== model.changed.color) {
        this.updateColorValue();
      }
    }
  }, {
    key: "onRemoveButtonClick",
    value: function onRemoveButtonClick() {
      var _this = this;
      var globalType = this.ui.removeButton.data('e-global-type'),
        globalTypeTranslatedCapitalized = 'font' === globalType ? __('Font', 'elementor') : __('Color', 'elementor'),
        globalTypeTranslatedLowercase = 'font' === globalType ? __('font', 'elementor') : __('color', 'elementor'),
        /* Translators: 1: Font/Color, 2: typography/color. */
        translatedMessage = sprintf(__('You\'re about to delete a Global %1$s. Note that if it\'s being used anywhere on your site, it will inherit a default %1$s.', 'elementor'), globalTypeTranslatedCapitalized, globalTypeTranslatedLowercase);
      this.confirmDeleteModal = elementorCommon.dialogsManager.createWidget('confirm', {
        className: 'e-global__confirm-delete',
        /* Translators: %s: Font/Color. */
        headerMessage: sprintf(__('Delete Global %s', 'elementor'), globalTypeTranslatedCapitalized),
        message: '<i class="eicon-info-circle"></i> ' + translatedMessage,
        strings: {
          confirm: __('Delete', 'elementor'),
          cancel: __('Cancel', 'elementor')
        },
        hide: {
          onBackgroundClick: false
        },
        onConfirm: function onConfirm() {
          _this.trigger('click:remove');
        }
      });
      this.confirmDeleteModal.show();
    }
  }, {
    key: "onRemoveButtonPress",
    value: function onRemoveButtonPress(event) {
      var ENTER_KEY = 13,
        SPACE_KEY = 32;
      if (ENTER_KEY === event.keyCode || SPACE_KEY === event.keyCode) {
        event.currentTarget.click();
        event.stopPropagation();
      }
    }
  }, {
    key: "onDestroy",
    value: function onDestroy() {
      elementor.channels.panelElements.reply('the7-bulk-edit:' + this.model.get('_id') + ':is-checked', null);
    }
  }, {
    key: "initialize",
    value: function initialize(options) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "initialize", this).call(this, options);
      this.listenTo(elementor.channels.panelElements, 'the7-bulk-edit:checkbox:switch', this.onBulkEditSwitch);
    }
  }, {
    key: "onBulkEditSwitch",
    value: function onBulkEditSwitch(state) {
      if (state.value) {
        this.ui.bulkActionInput.show();
      } else {
        this.ui.bulkActionInput.hide();
      }
    }
  }]);
  return _default;
}(elementor.modules.controls.RepeaterRow);

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater.js":
/*!*******************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var __ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n")["__"];


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _repeaterRow = _interopRequireDefault(__webpack_require__(/*! ./repeater-row */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/repeater-row.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var _default = exports["default"] = /*#__PURE__*/function (_elementor$modules$co) {
  (0, _inherits2.default)(_default, _elementor$modules$co);
  function _default() {
    var _this;
    (0, _classCallCheck2.default)(this, _default);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, _default, [].concat(args));
    _this.childView = _repeaterRow.default;
    return _this;
  }
  (0, _createClass2.default)(_default, [{
    key: "ui",
    value: function ui() {
      var ui = elementor.modules.controls.Repeater.prototype.ui;
      ui.selectAllControl = '.elementor-repeater-tool-bulk-action-select-all';
      ui.selectAllCheckbox = '.elementor-repeater-tool-bulk-action-select-all input';
      ui.selectAllTextActive = '.elementor-repeater-tool-bulk-action-select-all .choose-select-all-active';
      ui.selectAllTextNotActive = '.elementor-repeater-tool-bulk-action-select-all .choose-select-all-not-active';
      return ui;
    }
  }, {
    key: "events",
    value: function events() {
      var events = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "events", this).call(this);
      events['click @ui.selectAllCheckbox'] = 'onSelectAllClickInput';
      return events;
    }
  }, {
    key: "onSelectAllClickInput",
    value: function onSelectAllClickInput() {
      var currentValue = this.ui.selectAllCheckbox.is(':checked');
      if (currentValue) {
        this.ui.selectAllTextActive.show();
        this.ui.selectAllTextNotActive.hide();
      } else {
        this.ui.selectAllTextActive.hide();
        this.ui.selectAllTextNotActive.show();
      }
      this.model.set('selectAllChecked', currentValue);
      this.children.each(function (control) {
        control.setBulkActionCheckbox(currentValue);
      });
    }
  }, {
    key: "onRender",
    value: function onRender() {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "onRender", this).call(this);
      var reply = elementor.channels.panelElements.request('the7-bulk-edit:checkbox:switch');
      if (!reply) {
        this.ui.selectAllControl.hide();
      }
      this.ui.selectAllTextActive.hide();
    }
  }, {
    key: "templateHelpers",
    value: function templateHelpers() {
      var templateHelpers = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "templateHelpers", this).call(this);
      templateHelpers.addButtonText = 'custom_colors' === this.model.get('name') ? __('Add Color', 'elementor') : __('Add Style', 'elementor');
      return templateHelpers;
    }
  }, {
    key: "getDefaults",
    value: function getDefaults() {
      var defaults = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "getDefaults", this).call(this);
      defaults.title = "".concat(__('New Item', 'elementor'), " #").concat(this.children.length + 1);
      return defaults;
    }
  }, {
    key: "getSortableParams",
    value: function getSortableParams() {
      var sortableParams = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "getSortableParams", this).call(this);
      sortableParams.placeholder = 'e-sortable-placeholder';
      sortableParams.cursor = 'move';
      return sortableParams;
    }
  }, {
    key: "className",
    value: function className() {
      var classes = (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "className", this).call(this);
      classes += ' elementor-control-type-global-style-repeater';
      return classes;
    }
  }, {
    key: "initialize",
    value: function initialize(options) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "initialize", this).call(this, options);
      this.listenTo(elementor.channels.panelElements, 'the7-bulk-edit:checkbox:switch', this.onBulkEditSwitch);
    }
  }, {
    key: "onBulkEditSwitch",
    value: function onBulkEditSwitch(state) {
      if (state.value) {
        this.ui.selectAllControl.show();
      } else {
        this.ui.selectAllControl.hide();
      }
    }
  }]);
  return _default;
}(elementor.modules.controls.Repeater);

/***/ }),

/***/ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/switcher.js":
/*!*******************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/switcher.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _get2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/get */ "../node_modules/@babel/runtime/helpers/get.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var _default = exports["default"] = /*#__PURE__*/function (_elementor$modules$co) {
  (0, _inherits2.default)(_default, _elementor$modules$co);
  function _default() {
    (0, _classCallCheck2.default)(this, _default);
    return _callSuper(this, _default, arguments);
  }
  (0, _createClass2.default)(_default, [{
    key: "initialize",
    value: function initialize(options) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "initialize", this).call(this, options);
      this.$el.addClass('elementor-control-type-switcher');
    }
  }, {
    key: "onBaseInputChange",
    value: function onBaseInputChange(event) {
      (0, _get2.default)((0, _getPrototypeOf2.default)(_default.prototype), "onBaseInputChange", this).call(this, event);
      var input = event.currentTarget,
        value = this.getInputValue(input),
        command = this.model.get('on_change_command');
      if (command) {
        $e.run(command, {
          name: this.model.get('name'),
          value: value
        });
      }
      this.model.set('return_value', null);
    }
  }]);
  return _default;
}(elementor.modules.controls.Switcher);

/***/ }),

/***/ "@wordpress/i18n":
/*!**************************!*\
  !*** external "wp.i18n" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = wp.i18n;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/assertThisInitialized.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \****************************************************************/
/***/ ((module) => {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/createClass.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/createClass.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/defineProperty.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/toPropertyKey.js");
function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/get.js":
/*!*****************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/get.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var superPropBase = __webpack_require__(/*! ./superPropBase.js */ "../node_modules/@babel/runtime/helpers/superPropBase.js");
function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get.bind(), module.exports.__esModule = true, module.exports["default"] = module.exports;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }
  return _get.apply(this, arguments);
}
module.exports = _get, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/getPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _getPrototypeOf(o);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/inherits.js":
/*!**********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/inherits.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js");
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \***********************************************************************/
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var assertThisInitialized = __webpack_require__(/*! ./assertThisInitialized.js */ "../node_modules/@babel/runtime/helpers/assertThisInitialized.js");
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return assertThisInitialized(self);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/setPrototypeOf.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/setPrototypeOf.js ***!
  \****************************************************************/
/***/ ((module) => {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _setPrototypeOf(o, p);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/superPropBase.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/superPropBase.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js");
function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}
module.exports = _superPropBase, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPrimitive.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPrimitive.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/toPropertyKey.js":
/*!***************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/toPropertyKey.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/typeof.js")["default"]);
var toPrimitive = __webpack_require__(/*! ./toPrimitive.js */ "../node_modules/@babel/runtime/helpers/toPrimitive.js");
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : String(i);
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/typeof.js":
/*!********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/typeof.js ***!
  \********************************************************/
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!****************************************************************************************************!*\
  !*** ../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/bulk-edit-globals.js ***!
  \****************************************************************************************************/


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "../node_modules/@babel/runtime/helpers/interopRequireDefault.js");
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "../node_modules/@babel/runtime/helpers/classCallCheck.js"));
var _createClass2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/createClass */ "../node_modules/@babel/runtime/helpers/createClass.js"));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "../node_modules/@babel/runtime/helpers/possibleConstructorReturn.js"));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "../node_modules/@babel/runtime/helpers/getPrototypeOf.js"));
var _inherits2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/inherits */ "../node_modules/@babel/runtime/helpers/inherits.js"));
var _component = _interopRequireDefault(__webpack_require__(/*! ./component */ "../inc/mods/compatibility/elementor/modules/bulk-edit-globals/assets/js/component.js"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Module = /*#__PURE__*/function (_elementorModules$edi) {
  (0, _inherits2.default)(Module, _elementorModules$edi);
  function Module() {
    (0, _classCallCheck2.default)(this, Module);
    return _callSuper(this, Module, arguments);
  }
  (0, _createClass2.default)(Module, [{
    key: "onInit",
    value: function onInit() {
      if (!elementor.config.user.can_edit_kit) {
        return;
      }
      $e.components.register(new _component.default({
        manager: this
      }));
      this.addHooks();
    }
  }, {
    key: "getGlobalRoutes",
    value: function getGlobalRoutes() {
      return {
        'global-typography': 'panel/global/global-typography'
      };
    }
  }, {
    key: "addHooks",
    value: function addHooks() {
      elementor.hooks.addAction('panel/global/tab/before-show', this.show.bind(this));
      elementor.hooks.addAction('panel/global/tab/before-destroy', this.hide.bind(this));
    }

    /**
     * Function show() triggered before showing a new tab at the Globals panel.
     *
     * @param {Object} args
     */
  }, {
    key: "show",
    value: function show(args) {
      if (!args.id || !(args.id in this.getGlobalRoutes())) {}
      $e.run('the7-bulk-edit-globals/clear', {
        id: args.id
      });
    }

    /**
     * Function hide() triggered before hiding a tab at the Globals panel.
     *
     * @param {Object} args
     */
  }, {
    key: "hide",
    value: function hide(args) {
      if (!args.id || !(args.id in this.getGlobalRoutes())) {
        return;
      }
      $e.run('the7-bulk-edit-globals/clear', {
        id: args.id
      });
    }
  }]);
  return Module;
}(elementorModules.editor.utils.Module);
new Module();
})();

/******/ })()
;
//# sourceMappingURL=bulk-edit-globals.js.map