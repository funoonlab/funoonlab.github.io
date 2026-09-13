(function () {

    tinymce.PluginManager.add('the7_elementor_elements', function (editor, url) {
        var $ = window.jQuery, toolbar, iOS = tinymce.Env.iOS;
        const gapClass = 'the7-p-gap';
        editor.addButton('the7_elements', {
            type: 'menubutton',
            text: 'The7 Elements',
            tooltip: 'The7 Elements',
            icon: false,
            menu:
                [
                    {
                        text: 'Gap',
                        onclick: function () {
                            const callback = function (data) {
                                editor.execCommand('mceInsertContent', false, `<hr style="padding-bottom:${data.value}${data.unit}" class="${gapClass}">`);
                            }
                            const metadata = {value: '30', unit: 'px'};
                            Dialog.open(editor, callback, metadata);
                        }
                    }
                ]
        });

        editor.addButton('wp_the7_gap_edit', {
            tooltip: 'Edit|button', // '|button' is not displayed, only used for context.
            icon: 'dashicon dashicons-edit',
            onclick: function () {
                editGap(editor.selection.getNode());
            }
        });

        editor.addButton('wp_the7_gap_remove', {
            tooltip: 'Remove',
            icon: 'dashicon dashicons-no',
            onclick: function () {
                removeGap(editor.selection.getNode());
            }
        });

        editor.once('preinit', function () {
            if (editor.wp && editor.wp._createToolbar) {
                toolbar = editor.wp._createToolbar([
                    'wp_the7_gap_edit',
                    'wp_the7_gap_remove'
                ]);
            }
        });

        if (iOS) {
            editor.on('init', function () {
                editor.on('touchstart', function (event) {
                    if (event.target.nodeName === 'IMG' && !isNonEditable(event.target)) {
                        touchOnImage = true;
                    }
                });

                editor.dom.bind(editor.getDoc(), 'touchmove', function () {
                    touchOnImage = false;
                });

                editor.on('touchend', function (event) {
                    if (touchOnImage && event.target.nodeName === 'IMG' && !isNonEditable(event.target)) {
                        var node = event.target;

                        touchOnImage = false;

                        window.setTimeout(function () {
                            editor.selection.select(node);
                            editor.nodeChanged();
                        }, 100);
                    } else if (toolbar) {
                        toolbar.hide();
                    }
                });
            });
        }

        function isNonEditable(node) {
            var parent = editor.$(node).parents('[contenteditable]');
            return parent && parent.attr('contenteditable') === 'false';
        }

        editor.on('wptoolbar', function (event) {
            if (event.element.className === gapClass) {
                event.toolbar = toolbar;
            }
        });

        var open = function (editor, callback, data) {
            var win = editor.windowManager.open({
                title: 'Add Gap',
                items: {
                    type: 'container',
                    layout: 'flex',
                    direction: 'column',
                    align: 'left',
                    padding: 15,
                    spacing: 10,
                    minWidth: 250,
                    items: [
                        {
                            type: 'label',
                            name: 'preview',
                            text: 'Gap value:',
                        },
                        {
                            type: 'form',
                            layout: 'flex',
                            direction: 'row',
                            padding: 0,
                            items: [
                                {
                                    name: 'value',
                                    value: data.value,
                                    type: 'textbox',
                                    size: 3,
                                    flex: 1,
                                    style: 'width:35px',
                                    spellcheck: false,
                                },
                                {
                                    name: 'unit',
                                    type: 'listbox',
                                    value: data.unit,
                                    values: [
                                        {text: 'px', value: 'px'},
                                        {text: 'em', value: 'em'},
                                        {text: 'rem', value: 'rem'},
                                        {text: '%', value: '%'},
                                    ],
                                }
                            ]
                        }
                    ]
                },
                onSubmit: function () {
                    var results = win.toJSON();
                    results.value = results.value.replace(/\.+$/, "");
                    callback(win.toJSON());
                }
            });

            var $valueCntrl = win.find('#value')[0].$el;
            $valueCntrl.on('keyup', onlyDigits);
        }

        function onlyDigits(e){
            if (/\D/g.test(this.value)) {
                // Filter non-digits from input value.
                this.value = this.value.replace(/[^\d.]+/g, '');
            }
        }

        var Dialog = {open: open};

        function editGap(node) {
            var callback, metadata, $node;

            $node = editor.$(node);
            metadata = extractGapData($node);
            // Mark the image node so we can select it later.
            $node.attr('data-wp-editing', 1);

            callback = function (data) {
                editor.undoManager.transact(function () {
                    $node.css({"padding-bottom": `${data.value}${data.unit}`});
                    $node.attr('data-mce-style', $node.attr('style'));
                    editor.nodeChanged();
                });
                $node.removeAttr('data-wp-editing');
            };

            Dialog.open(editor, callback, metadata);
        }

        function extractGapData($node) {
            // Default attributes.
            var metadata = {
                value: '0',
                unit: 'px',
            };
            const paddingBottom = $node[0].style.paddingBottom;
            const match = paddingBottom.match(/^(\d+(?:\.\d+)?)\s?k?(px|em|%|rem)$/);
            const numericValue = match ? match[1] : null;
            const unitValue = match ? match[2] : null;
            if (numericValue != null || unitValue != null) {
                metadata.value = numericValue;
                metadata.unit = unitValue;
            }
            return metadata;
        }

        function removeGap(node) {
            editor.dom.remove(node);
            editor.nodeChanged();
            editor.undoManager.add();
        }
    });
})();