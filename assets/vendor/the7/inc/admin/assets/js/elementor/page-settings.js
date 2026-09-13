jQuery(function ($) {
    "use strict";

    var autoSaveTimeout;

    function arrayIntersect(a, b) {
        var t;
        if (b.length > a.length) {
            t = b;
            b = a;
            a = t;
        }
        return a.filter(function (e) {
            return b.indexOf(e) > -1;
        });
    }

    function activateEditorPageSettingsSection(section) {
        window.$e.route("panel/page-settings/settings");
        window.elementor.getPanelView().currentPageView.activateSection(section)._renderChildren();
    }

    function getControlsOverlay(controls) {
        var controlsHTML = controls.reduce(function (s, e) {
            return s + "<li class=\"the7-elementor-element-setting the7-elementor-element-setting-" + e.action + "\" title=\"" + e.title + "\">" +
                "<i class=\"" + e.icon + "\" aria-hidden=\"true\"></i>" +
                "<span class=\"elementor-screen-only\">" + e.title + "</span>" +
                "</li>";
        }, "");
        controlsHTML = "<div class=\"the7-elementor-overlay\"><ul class=\"the7-elementor-element-settings\">" + controlsHTML + "</ul></div>";

        return $(controlsHTML);
    }

    function removeAllControls() {
        var iframe = $("#elementor-preview-iframe").first().contents();
        var $the7overlays = $(".the7-elementor-overlay-active", iframe);
        $the7overlays.find(".the7-elementor-overlay").remove();
        $the7overlays.removeClass("the7-elementor-overlay-active");
    }

    function addControls($el, controls) {
        var $controlsOverlay;

        controls = controls.filter(function (control) {
            return !control.section || elementor.settings.page.model.controls[control.section];
        });

        if (!controls) {
            return;
        }

        $controlsOverlay = getControlsOverlay(controls);

        controls.forEach(function (control) {
            if (control.events) {
                var events = control.events;
                var $control = $controlsOverlay.find(".the7-elementor-element-setting-" + control.action);
                for (var event in events) {
                    $control.on(event, events[event]);
                }
            }
        });

        $el.addClass("the7-elementor-overlay-active");
        $el.append($controlsOverlay);
    }

    elementor.on("document:loaded", function (document) {
        var iframe = $("#elementor-preview-iframe").first().contents();

        removeAllControls();

        var $elementorEditor = $(".elementor-editor-active #content > .elementor", iframe);
        var $elementorHeaderEditor = $(".elementor-editor-active #page > .elementor-location-header", iframe);

        $(".transparent.title-off #page > .masthead", iframe).hover(
            function () {
                $elementorEditor.children(".elementor-document-handle").addClass("visible");
                $elementorHeaderEditor.children(".elementor-document-handle").addClass("visible");
            },
            function () {
                $elementorEditor.children(".elementor-document-handle").removeClass("visible");
                $elementorHeaderEditor.children(".elementor-document-handle").removeClass("visible");
            }
        );
        var $elemntorEditorFooter = $("body.elementor-editor-footer")[0];
        var $elemntorEditorHeader = $("body.elementor-editor-header")[0];
        if (($elemntorEditorFooter === undefined) && ($elemntorEditorHeader === undefined)) {
            addControls($("#sidebar", iframe), [
                {
                    action: "edit",
                    title: "Edit Sidebar",
                    icon: "eicon-edit",
                    section: "the7_document_sidebar",
                    events: {
                        click: function () {
                            activateEditorPageSettingsSection("the7_document_sidebar");

                            return false;
                        }
                    }
                }
            ]);

            if ($("#footer.elementor-footer", iframe)[0] === undefined) {
                addControls($("#footer > .wf-wrap > .wf-container-footer", iframe), [
                    {
                        action: "edit",
                        title: "Edit Footer",
                        icon: "eicon-edit",
                        section: "the7_document_footer",
                        events: {
                            click: function () {
                                activateEditorPageSettingsSection("the7_document_footer");

                                return false;
                            }
                        }
                    }
                ]);
            }
        }
        if ($elemntorEditorFooter === undefined) {
            var $elemntorLocationHeader = $(".elementor-location-header", iframe)[0];
            if (($elemntorLocationHeader !== undefined && $elemntorEditorHeader !== undefined) || (
                $elemntorLocationHeader === undefined && $elemntorEditorHeader === undefined)) {
                addControls($(".masthead, .page-title, #main-slideshow, #fancy-header", iframe), [
                    {
                        action: "edit",
                        title: "Edit Title",
                        icon: "eicon-edit",
                        section: "the7_document_title_section",
                        events: {
                            click: function () {
                                activateEditorPageSettingsSection("the7_document_title_section");

                                return false;
                            }
                        }
                    }
                ]);
            }
        }

        elementor.settings.page.model.on("change", function (settings) {
            iframe = $("#elementor-preview-iframe").first().contents();
            var tobBarColor = settings.changed.the7_document_disabled_header_top_bar_color || settings.changed.the7_document_fancy_header_top_bar_color;
            var headerBgColor = settings.changed.the7_document_disabled_header_backgraund_color || settings.changed.the7_document_fancy_header_backgraund_color;


            if (tobBarColor) {
                $(".top-bar .top-bar-bg", iframe).css("background-color", tobBarColor);
            }
            if (headerBgColor) {
                $(".masthead.inline-header, .masthead.classic-header, .masthead.split-header, .masthead.mixed-header", iframe).css("background-color", headerBgColor);
            }

            clearTimeout(autoSaveTimeout);
            var the7Settings = arrayIntersect(Object.keys(settings.changed), the7Elementor.controlsIds);
            if (the7Settings.length > 0) {
                autoSaveTimeout = setTimeout(function () {
                    elementor.saver.saveAutoSave({
                        onSuccess: function onSuccess() {
                            $e.run('preview/reload');
                            elementor.once("preview:loaded", function () {
                                if (!settings.controls[the7Settings[0]]) {
                                    return;
                                }
                                setTimeout(function () {
                                    activateEditorPageSettingsSection(settings.controls[the7Settings[0]].section);
                                });
                            });
                        }
                    });
                }, 300);
            }
        });

        elementor.settings.page.addChangeCallback("the7_scroll_to_top_button_icon", function (newValue) {
            var icon = newValue;
            var $scrollToTopButton = $(".scroll-top", iframe);
            renderIcon(icon, $scrollToTopButton);
        });

        function renderIcon(iconsControl, element) {
            let icon = '';
            if (iconsControl.library === 'svg') {
                return elementor.helpers.fetchInlineSvg(iconsControl.value.url, function (data) {
                    element.html(data);
                });
            } else {
                icon = elementor.helpers.renderIcon(null, iconsControl, {}, 'i', 'panel') || '';
            }
            element.html(icon);
            element.toggleClass('elementor-hidden', !iconsControl.value);
        }
    });
});

(function ($) {
    "use strict";

    const LOOP_TAB = 'the7-loop-items';

    $(window).on("elementor:init", function () {
        let is_connected_backup = elementor.config.library_connect.is_connected;
        // $e.routes.register('library', 'templates/the7-loop-items', () => {
        //     elementor.config.library_connect.is_connected = true;
        //     $e.components.get('library').activateTab('templates/the7-loop-items', {});
        // });
        //

        $e.routes.on('run:after', (component, route) => {
            let parsedRoute = route.match(/(library\/templates\/)(\S+)/);
            if (component.getNamespace() === 'library' && parsedRoute) {
                if (LOOP_TAB === parsedRoute[2]) {
                    elementor.config.library_connect.is_connected = true;
                } else {
                    elementor.config.library_connect.is_connected = is_connected_backup
                }
            }
        })

        class The7AfterSave extends $e.modules.hookData.After {
            getCommand() {
                return 'document/save/save';
            }

            getConditions(args) {
                /**
                 * Conditions was copied from elementor code base.
                 * Search for 'document/save/save' in elementor/assets/js/editor.js
                 */
                const status = args.status,
                    _args$document = args.document,
                    document = _args$document === void 0 ? elementor.documents.getCurrent() : _args$document;
                return 'publish' === status && 'kit' === document.config.type;
            }

            getId() {
                return 'the7-saver-after-save';
            }

            apply(args) {
                const settings = args.document.container.settings;
                jQuery.each(settings.changed, function (key) {
                    if (settings !== 'undefined' && settings.controls !== 'undefined' && 'the7_save' in settings.controls[key] && settings.controls[key]['the7_save'] === true) {
                        if (key in elementor.settings.page.model.controls && key in settings.attributes) {
                            elementor.settings.page.model.controls[key].default = settings.attributes[key];
                        }
                    }
                });
            }
        }

        // Change default values in order to fix settings saving.
        $e.hooks.registerDataAfter(new The7AfterSave());
    }); //end of elementor:init


    $(window).on("elementor:loaded", function () {

        var InsertTemplateHandler2;
        InsertTemplateHandler2 = Marionette.Behavior.extend({
            ui: {
                insertButton: '.elementor-template-library-template-insert'
            },
            events: {
                'click @ui.insertButton': 'onInsertButtonClick'
            },
            onInsertButtonClick: function onInsertButtonClick() {
                var args = {
                    model: this.view.model
                };
                this.ui.insertButton.addClass('elementor-disabled');
                if ('remote' === args.model.get('source') && !elementor.config.library_connect.is_connected) {
                    $e.route('library/connect', args);
                    return;
                }
                $e.run('library/insert-template', args);
            }
        });

        Marionette.ItemView.extend({
            template: '#tmpl-elementor-template-library-header-preview',
            id: 'elementor-template-library-header-preview',
            behaviors: {
                insertTemplate: {
                    behaviorClass: InsertTemplateHandler2
                }
            }
        });


        class LoopBuilderAddLibraryTab extends $e.modules.hookData.After {
            getCommand() {
                return 'editor/documents/open';
            }

            getConditions(args) {
                const document = elementor.documents?.get(args.id);
                return 'loop-item' === document?.config?.type;
            }

            getId() {
                return 'the7-loop-items-add-library-tab';
            }

            apply(args) {
                if ($e.components.get('library').hasTab(`templates/${LOOP_TAB}`)) {
                    return;
                }

                $e.components.get('library').addTab(`templates/${LOOP_TAB}`, {
                    title: 'The7 Loop',
                    filter: {
                        source: function source() {
                            elementor.channels.templates.reply('filter:source', 'remote');
                            return 'the7-remote';
                        },
                        // source: 'remote',
                        type: 'lb',
                        subtype: elementor.config.document.settings.settings.source
                    }
                }, 0);
            }
        }

        $e.hooks.registerDataAfter(new LoopBuilderAddLibraryTab());

        function initThe7ImportButton() {
            elementor.hooks.addFilter('elementor/editor/template-library/template/action-button', function (viewId, data) {
                if (data.template_id.toString().startsWith('the7_')) {
                    if (data.the7_pro) { //check if pro
                        return '#tmpl-elementor-template-library-get-the7-pro-insert-button';
                    } else {
                        return '#tmpl-elementor-template-library-get-the7-insert-button';
                    }
                }
                return viewId;
            });
        }

        initThe7ImportButton();
    }); //end of elementor:loaded
})(jQuery);
