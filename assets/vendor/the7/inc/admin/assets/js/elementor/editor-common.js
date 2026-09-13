function elementorEditorAddOnChangeHandler(widgetType, handler) {
    widgetType = widgetType ? ":" + widgetType : "";
    elementor.channels.editor.on("change" + widgetType, handler);
}

function elementorEditorOnChangeWidgetHandlers(widgetType, widgetControls, handler) {
    widgetControls.forEach(function (control) {
            elementorEditorAddOnChangeHandler(widgetType + ":" + control, handler);
        }
    );
}

(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        // Fix visuals for Elementor Canvas template in editor.
        elementorFrontend.elements.$body.attr("id", "the7-body");
    });
})(jQuery);

(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        class The7HoverTemplateModule {
            onElementorFrontendInit() {
                this.createDocumentSaveHandles();
                elementor.on('document:loaded', this.createDocumentSaveHandles.bind(this));
            }
            createDocumentSaveHandles() {
                Object.entries(elementorFrontend.config?.elements?.data).forEach(_ref => {
                    let [cid, element] = _ref;
                    const templateId = element.attributes.template_id;
                    if (!templateId) {
                        return;
                    }
                    const widgetSelector = `.elementor-element[data-model-cid="${cid}"]`,
                        editHandleSelector = `[data-elementor-type="the7-overlay-template"].elementor-${templateId}`,
                        editHandleElement = elementorFrontend.elements.$body.find(`${widgetSelector} ${editHandleSelector}`).first()[0];
                    if (editHandleElement) {
                        (0, _documentHandle.default)({
                            element: editHandleElement,
                            id: 0,
                            title: '& Back'
                        }, _documentHandle.SAVE_CONTEXT, null, '.elementor-' + elementor.config.initial_document.id);
                    }
                });
            }
            onElementorLoaded() {
                elementor.on('document:loaded', this.onDocumentLoaded.bind(this));
                elementor.on('document:unload', this.onDocumentUnloaded.bind(this));
                this.onApplySourceChange = this.onApplySourceChange.bind(this);
                this.component = $e.components.register(new _component.default({
                    manager: this
                }));
            }
            onDocumentLoaded(document) {
                if (!document.config.theme_builder) {
                    return;
                }
                elementor.channels.editor.on('elementorLoopBuilder:ApplySourceChange', this.onApplySourceChange);
            }
            onDocumentUnloaded(document) {
                if (!document.config.theme_builder) {
                    return;
                }
                elementor.channels.editor.off('elementorLoopBuilder:ApplySourceChange', this.onApplySourceChange);
            }
            onApplySourceChange() {
                this.saveAndRefresh().then(() => {
                    location.reload();
                });
            }
            async saveAndRefresh() {
                await $e.run('document/save/update', {
                    force: true
                });
            }
        }

        const the7HoverTemplateModule = new The7HoverTemplateModule();
        elementor.on('frontend:init', the7HoverTemplateModule.onElementorFrontendInit.bind(the7HoverTemplateModule));
    });
})(jQuery);
