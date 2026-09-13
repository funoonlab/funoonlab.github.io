jQuery(function ($) {
    // Class to handle products variations.
    class ProductVariations {

        /**
         * Construct object with some data.
         *
         * @param data
         */
        constructor(data) {
            this.data = data || {};
            this.data.outOfStockAttributes = this.findOutOfStockAttributes();
            this.data.state = this.data.state || {};
            this.data.$originPrice = this.data.$price.clone();
        }

        /**
         * Return current state or part of it.
         *
         * @param key
         * @returns {*}
         */
        getState(key) {
            return key ? this.data.state[key] : Object.assign({}, this.data.state);
        }

        /**
         * Apply visual effects.
         */
        render() {
            const attributes = this.getState();

            if (!attributes) {
                return;
            }

            const self = this;
            const $attributeWrap = this.data.$variations.find("li");
            const attributesSelector = Object.keys(attributes).filter(function (val) {
                return !!val;
            }).map(function (key) {
                return '[data-id="' + $.escapeSelector(attributes[key]) + '"]';
            }).join(',');


            // Set active attributes.
            $attributeWrap.removeClass("active");
            $attributeWrap.find(attributesSelector).each(function () {
                $(this).parent().addClass("active");
            });

            // Dynamic out-of-stock system.
            this.handleOutOfStockVisibility(this.findMatchingOutOfStockVariations());

            const foundVariation = this.findMatchingVariation();

            if (foundVariation) {
                // Enable button.
                this.data.$addToCartButton.attr("data-product_id", foundVariation.variation_id);
                this.data.$addToCartButton.removeClass("variation-btn-disabled");

                // Update price.
                if (foundVariation.price_html) {
                    this.updateProductPriceData($(foundVariation.price_html));
                }
            } else {
                // Disable button.
                this.data.$addToCartButton.attr("data-product_id", "");
                this.data.$addToCartButton.addClass("variation-btn-disabled");
                // Update price.
                this.updateProductPriceData(this.data.$originPrice.clone());
            }

        }

        /**
         * Update state and render.
         *
         * @param state
         */
        updateState(state) {
            // Create a new object to avoid mutating the original state.
            this.data.state = Object.assign({}, this.data.state, state);
            this.render();
        }

        /**
         * Find matching variation for attributes.
         */
        findMatchingVariation() {
            const variations = this.data.variations;
            const attributes = this.getState();
            var matching = [];
            for (var i = 0; i < variations.length; i++) {
                var variation = variations[i];

                if (this.isExactMatch(variation.attributes, attributes)) {
                    matching.push(variation);
                }
            }

            return matching.shift();
        }

        /**
         * Update product price data.
         *
         * @param productData
         * @param $newPrice
         */
        updateProductPriceData($newPrice) {
            this.data.$price.replaceWith($newPrice);
            this.data.$price = $newPrice;
        }

        /**
         * Get the image HTML of the first variation, based on provided state.
         */
        getVariationImage(state) {
            const foundVariation = this.findFirstMatchingVariationOfGivenState(state);

            if (!foundVariation) {
                return undefined;
            }

            const image = foundVariation.image;

            return $(`
                    <img
                        class="replaced-img preload-me aspect lazy lazy-load"
                        style="--ratio: ${image.src_w} / ${image.src_h};"
                        width="${image.src_w}"
                        height="${image.src_h}"
                        data-src="${image.src}"
                        data-srcset="${image.srcset || ""}"
                        alt="${image.alt || ""}"
                        title="${image.title || ""}"
                        data-caption="${image.data_caption || ""}"
                        loading="eager"
                        data-large_image="${image.full_src}"
                        data-large_image_width="${image.full_src_w}"
                        data-large_image_height="${image.full_src_h}"
                        sizes="${image.sizes}"
                    />
                `);
        }

        /**
         * Mark attributes as out-of-stock.
         *
         * @param outOfStockAttributes
         */
        handleOutOfStockVisibility(outOfStockAttributes) {
            const attributes = outOfStockAttributes || this.data.outOfStockAttributes;
            const $variationNodes = this.data.$variations.find("li a");
            const self = this;
            $variationNodes.removeClass("out-of-stock");
            for (const [attr, values] of Object.entries(attributes)) {
                if (values.length) {
                    const selector = values.slice().map((val) => {
                        return '[data-id="' + $.escapeSelector(val) + '"]';
                    }).join(",");
                    $variationNodes.filter(selector).addClass("out-of-stock");

                }
            }
        }

        /**
         * Get all possible attributes combination based on current state.
         */
        getAttributesCombination() {
            // Filterout empty attributes.
            const attributes = Object.entries(this.getState()).reduce(function (acc, [key, value]) {
                if (value) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const keys = Object.keys(attributes);
            const values = Object.values(attributes);
            const combinations = [];

            // If attributes length greater than 1, make a combination of all attributes.
            if (keys.length > 1) {
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = values[i];

                    if (value) {
                        const newCombination = Object.assign({}, attributes);
                        newCombination[key] = "";
                        combinations.push(newCombination);
                    }
                }
            }

            return combinations
        }

        getMatchingIntersectionAttributes(attributes, matching, matchingAttributes) {
            // Get variations that match all attributes.
            const matchingIntersection = matching.filter(function (variation) {
                return Object.entries(variation.attributes).every(function ([key, value]) {
                    return !attributes[key] || !value || attributes[key] === value;
                });
            });

            const matchingItersectionAttributes = {};
            for (const [key, value] of Object.entries(matchingAttributes)) {
                const [attr, val] = key.split('///');

                if (attributes[attr] !== val) {
                    value.forEach(function (variation) {
                        // If in matching intersection.
                        if (matchingIntersection.indexOf(variation) !== -1) {
                            matchingItersectionAttributes[key] = matchingItersectionAttributes[key] || [];
                            if (matchingItersectionAttributes[key].indexOf(variation) === -1) {
                                matchingItersectionAttributes[key].push(variation);
                            }
                        }
                    });
                }
            }

            return matchingItersectionAttributes;
        }

        /**
         * Find matching variations for attributes.
         */
        findMatchingOutOfStockVariations() {
            const self = this;
            const variations = this.data.variations;
            const attributes = this.getState();
            const selectedAttributes = Object.keys(attributes).filter(function (key) {
                return attributes[key];
            }).length;
            const matching = [];


            // Get all possible values per attribute in all variations.
            const matchingAttributes = {};
            const matchingInStockAttributes = {};
            const allAttributes = {};
            const allInStockAttributes = {};
            variations.forEach(function (variation) {
                const isMatch = self.isMatch(variation.attributes, attributes);
                if (isMatch) {
                    matching.push(variation);
                }

                for (const [key, value] of Object.entries(variation.attributes)) {
                    const sKey = key + '///' + value;

                    allAttributes[sKey] = allAttributes[sKey] || [];
                    if (allAttributes[sKey].indexOf(variation) === -1) {
                        allAttributes[sKey].push(variation);
                    }

                    if (variation.is_in_stock) {
                        allInStockAttributes[sKey] = allInStockAttributes[sKey] || [];
                        if (allInStockAttributes[sKey].indexOf(variation) === -1) {
                            allInStockAttributes[sKey].push(variation);
                        }
                    }

                    if (isMatch) {
                        matchingAttributes[sKey] = matchingAttributes[sKey] || [];
                        if (matchingAttributes[sKey].indexOf(variation) === -1) {
                            matchingAttributes[sKey].push(variation);
                        }

                        if (variation.is_in_stock) {
                            matchingInStockAttributes[sKey] = matchingInStockAttributes[sKey] || [];
                            if (matchingInStockAttributes[sKey].indexOf(variation) === -1) {
                                matchingInStockAttributes[sKey].push(variation);
                            }
                        }
                    }
                }
            });

            const inStockAttributes = {};

            // Add in-stock attributes from attribute combinations.
            const attributeInStockCombinations = this.getAttributesCombination();
            if (attributeInStockCombinations.length) {
                attributeInStockCombinations.forEach(function (combination) {
                    const matchingIntersection = self.getMatchingIntersectionAttributes(combination, matching, matchingInStockAttributes);

                    // Add in-stock attributes from matching intersection.
                    for (const [key, value] of Object.entries(matchingIntersection)) {
                        const [attr, val] = key.split('///');
                        if (attributes[attr]) {
                            inStockAttributes[attr] = inStockAttributes[attr] || [];
                            inStockAttributes[attr].push(val);
                        }
                    }
                });
            } else {
                for (const [key, value] of Object.entries(allInStockAttributes)) {
                    const [attr, val] = key.split('///');
                    if (attributes[attr] || selectedAttributes === 0) {
                        inStockAttributes[attr] = inStockAttributes[attr] || [];
                        inStockAttributes[attr].push(val);
                    }
                }
            }

            // Add in-stock attributes from matching intersection.
            const matchingItersectionInStockAttributes = self.getMatchingIntersectionAttributes(attributes, matching, matchingInStockAttributes);

            // Add in-stock attributes from matching intersection.
            for (const [key, value] of Object.entries(matchingItersectionInStockAttributes)) {
                const [attr, val] = key.split('///');
                inStockAttributes[attr] = inStockAttributes[attr] || [];
                inStockAttributes[attr].push(val);
            }

            // Remove duplicates.
            for (const [key, value] of Object.entries(inStockAttributes)) {
                inStockAttributes[key] = [...new Set(value) ];
            }

            const outOfStockBasedOnInStock = {};
            // Diff in-stock attributes from all attributes.
            for (const [key, value] of Object.entries(allAttributes)) {
                const [attr, val] = key.split('///');
                if (val && (!inStockAttributes[attr] || inStockAttributes[attr].indexOf(val) === -1)) {
                    outOfStockBasedOnInStock[attr] = outOfStockBasedOnInStock[attr] || [];
                    outOfStockBasedOnInStock[attr].push(val);
                }
            }

            return outOfStockBasedOnInStock;
        }

        /**
         * Find out-of-stock attributes.
         *
         * @returns {{}}
         */
        findOutOfStockAttributes() {
            const variations = this.data.variations;
            let inStockAttributes = [];
            let outOfStockAttributes = [];
            let matching = {};

            for (let i = 0; i < variations.length; i++) {
                let variation = variations[i];

                if (variation.is_in_stock) {
                    inStockAttributes.push(Object.entries(variation.attributes));
                } else {
                    outOfStockAttributes.push(Object.entries(variation.attributes));
                }
            }

            inStockAttributes = [].concat(...inStockAttributes);
            outOfStockAttributes = [].concat(...outOfStockAttributes);

            const attrReducer = function (acc, entry) {
                const attr = entry[0];
                const val = entry[1];

                acc[attr] = acc[attr] || [];
                acc[attr].push(val);

                return acc;
            };

            const inStockAttributesObj = inStockAttributes.reduce(attrReducer, {});
            const outOfStockAttributesObj = outOfStockAttributes.reduce(attrReducer, {});

            for (const [key, value] of Object.entries(outOfStockAttributesObj)) {
                const noneInStock = inStockAttributesObj[key] === undefined;
                if (noneInStock || inStockAttributesObj[key]) {
                    matching[key] = value.filter(function (v) {
                        return noneInStock || !inStockAttributesObj[key].includes(v);
                    });
                }
            }

            return matching;
        }

        /**
         * Find first matching variation with image for attributes.
         *
         * @returns {{}}
         */
        findFirstMatchingVariationOfGivenState(attributes) {
            if (!attributes || Object.keys(attributes).length === 0) {
                return undefined;
            }

            const variations = this.data.variations;
            for (let i = 0; i < variations.length; i++) {
                let variation = variations[i];

                if (this.isExactMatch(attributes, variation.attributes)) {
                    return variation;
                }
            }

            return undefined;
        }

        /**
         * See if attributes match.
         *
         * @return {Boolean}
         */
        isMatch(variation_attributes, attributes) {
            var match = false;
            for (var attr_name in variation_attributes) {
                if (variation_attributes.hasOwnProperty(attr_name)) {
                    var val1 = variation_attributes[attr_name];
                    var val2 = attributes[attr_name];
                    if (val1 !== undefined && val2 !== undefined && val1.length !== 0 && val2.length !== 0 && val1 === val2) {
                        match = true;
                    }
                }
            }
            return match;
        }

        /**
         * See if attributes match.
         *
         * @return {Boolean}
         */
        isExactMatch(variation_attributes, attributes) {
            var match = true;
            for (var attr_name in variation_attributes) {
                if (variation_attributes.hasOwnProperty(attr_name)) {
                    var val1 = variation_attributes[attr_name];
                    var val2 = attributes[attr_name];
                    if (val1 === undefined || val2 === undefined || val2.length === 0 || (val1.length !== 0 && val1 !== val2)) {
                        match = false;
                    }
                }
            }
            return match;
        }
    }

    $.productsVariations = function (el) {
        const $widget = $(el);
        const widgetSettings = new The7ElementorSettings($widget);

        // Global properties.
        let sliderObject;
        let $backupImage;
        let $insertedImage;
        let $productWrap;

        let methods = {};
        let products = {};

        // Store a reference to the object
        $.data(el, "productsVariations", $widget);

        // Private methods
        methods = {
            init: function () {
                // Apply product quantity. Only for loop add-to-cart widget.
                const $quantity = $widget.find('.quantity');

                if ($quantity.length) {
                    const $addToCartButton = $widget.find(".box-button");
                    const $qty = $('.qty', $quantity);
                    $qty.on("change", function () {
                        $addToCartButton.attr("data-quantity", parseInt($qty.val()));
                    });
                }

                const variationsData = $widget.find("[data-product_variations]");
                if (variationsData.length) {
                    variationsData.each(function () {
                        const $this = $(this);
                        const $variationList = $this.find(".products-variations");
                        const $addToCartButton = $this.find(".box-button");

                        let $priceHtml;
                        if ($widget.data("widget_type") === 'the7-woocommerce-loop-add-to-cart.default') {
                            // Find price in the same loop item.
                            $priceHtml = $this.closest('div[data-elementor-type="loop-item"]').find(".price").first();
                        } else {
                            $priceHtml = $this.find("span.price").first();
                        }

                        const productVariations = new ProductVariations({
                            variations: $this.data("product_variations"),
                            $addToCartButton: $addToCartButton,
                            $variations: $variationList,
                            $price: $priceHtml,
                        });

                        // Find always active attributes - those that have only one value.
                        const mustBeAlwaysActiveAttributes = [];
                        $variationList.each(function () {
                            const $this = $(this);
                            const attributeName = $this.attr("data-atr");
                            const $attributeValue = $this.find("[data-id]");

                            // If there is only one value, it must be always active.
                            if ($attributeValue.length === 1) {
                                mustBeAlwaysActiveAttributes.push({
                                    "attribute": attributeName,
                                    "value": $attributeValue.first().data("id")
                                });
                            }
                        });

                        const mustBeActiveAttributeNames = mustBeAlwaysActiveAttributes.map(function (item) {
                            return item.attribute;
                        });

                        // Setup initial attributes with those that must be always active or already selected in the form.
                        const initialAttributes = [...mustBeAlwaysActiveAttributes];
                        const defaultAttributes = $this.data("default_attributes") || {};
                        for (const [key, value] of Object.entries(defaultAttributes)) {
                            if (mustBeActiveAttributeNames.indexOf(key) === -1) {
                                initialAttributes.push({
                                    "attribute": key,
                                    "value": value
                                });
                            }
                        }
                        const initialState = initialAttributes.reduce(function (acc, item) {
                            acc[item.attribute] = item.value;
                            return acc;
                        }, {});

                        if (productVariations.findFirstMatchingVariationOfGivenState(initialState)) {
                            productVariations.updateState(initialState);
                        }

                        // Link product data with each attribute element.
                        $variationList.find("li a")
                            .data("the7_product_variations_obj", productVariations)
                            .data("the7_must_be_active_attribute_names", mustBeActiveAttributeNames);

                        // Disable ajax handlers.
                        $addToCartButton.attr("data-product_id", "");
                        $addToCartButton.on("click", function (e) {
                            const $this = $(this);

                            /**
                             * Open product page if variations are hidden for current device.
                             * Ensure that add-to-cart button behave the same way it does when variations are disabled altogether.
                             */
                            const show_variations = widgetSettings.getCurrentDeviceSetting("show_variations");
                            if (show_variations == "n") {
                                e.preventDefault();
                                window.location.assign($this.attr("href"));
                                return;
                            }

                            if ($this.is(".add_to_cart_button.variation-btn-disabled")) {
                                e.preventDefault();
                            }
                        });

                        // Apply variations visuals.
                        productVariations.render();
                    });

                    const $attr = $widget.find(".products-variations li a");
                    if ($(".touchevents").length) {
                        let origY, origX;

                        $attr.on("touchstart", function (e) {
                            origY = e.originalEvent.touches[0].pageY;
                            origX = e.originalEvent.touches[0].pageX;
                        });
                        $attr.on("touchend", function (e) {
                            e.preventDefault();

                            let touchEX = e.originalEvent.changedTouches[0].pageX;
                            let touchEY = e.originalEvent.changedTouches[0].pageY;

                            if (origY === touchEY || origX === touchEX) {
                                const $this = $(this);
                                methods.selectAttribute($this);
                            }
                        })
                    } else {
                        $attr.on("click", function (e) {
                            if($(this).parents().siblings('.woocommerce-variation-add-to-cart').css("display") !== "none"){
                                e.preventDefault();
                            }
                            const $this = $(this);
                            methods.selectAttribute($this);
                        });
                    }
                }

                const isMobile = !!$("html.mobile-true").length;

                if (isMobile) {
                    // Usually it is article or .woo-buttons-on-img.
                    const $imgHoverElements = $widget.find(".trigger-img-hover");

                    $imgHoverElements.each(function () {
                        const $imgHoverElement = $(this);
                        let origY, origX;

                        if ($imgHoverElement.hasClass("woo-ready")) {
                            return;
                        }

                        const isVariableProduct = !!$imgHoverElement.closest(".product-type-variable", $widget).length;

                        $imgHoverElement.on("touchstart", function (e) {
                            origY = e.originalEvent.touches[0].pageY;
                            origX = e.originalEvent.touches[0].pageX;
                        });
                        $imgHoverElement.on("touchend", function (e) {
                            const $this = $(this);
                            const touchEX = e.originalEvent.changedTouches[0].pageX;
                            const touchEY = e.originalEvent.changedTouches[0].pageY;
                            const isNotClicked = !$this.hasClass("is-clicked");
                            let preventDefault = isNotClicked;

                            if (isNotClicked) {
                                let isImageTouch;

                                if ($this.hasClass("woo-buttons-on-img")) {
                                    isImageTouch = true
                                } else {
                                    const imgWrap = $this.find(".woo-buttons-on-img").get(0);
                                    isImageTouch = e.originalEvent && imgWrap && e.originalEvent.composedPath().includes(imgWrap);
                                }

                                // If target is/on image.
                                if (isImageTouch && $(e.target).closest(".products-variations-wrap, .woo-list-buttons", $this).length) {
                                    const show_variations_on_hover = widgetSettings.getCurrentDeviceSetting("show_variations_on_hover");
                                    const show_btn_on_hover = widgetSettings.getCurrentDeviceSetting("show_btn_on_hover");
                                    const isVariationsVisible = (!isVariableProduct || (show_variations_on_hover && show_variations_on_hover !== "on-hover"));
                                    const isAddToCartVisible = (show_btn_on_hover && show_btn_on_hover !== "on-hover");

                                    // Variations and Add-to-cart button are visible on image, don't preventDefault.
                                    if (isVariationsVisible && isAddToCartVisible) {
                                        preventDefault = false;
                                    }
                                }

                                if (origY == touchEY || origX == touchEX) {
                                    // Remove all "is-clicked" classes in widget.
                                    $imgHoverElements.removeClass("is-clicked");
                                    $this.addClass("is-clicked");

                                    const eventData = {
                                        boundaryElement: $this.get(0),
                                        $affectedElements: $imgHoverElements
                                    };

                                    elementorFrontend.elements.$body
                                        .off("touchstart", methods.onOuterTouchHandler)
                                        .on("touchstart", eventData, methods.onOuterTouchHandler);
                                }
                            }

                            if (preventDefault) {
                                e.preventDefault();
                            }
                        });

                        $imgHoverElement.addClass("woo-ready");
                    });
                }
            },

            getProductSlider: function () {
                if (typeof sliderObject === 'undefined' && typeof $productWrap !== 'undefined') {
                    const $slider = $productWrap.find('.elementor-widget-the7-slider-common');
                    if ($slider.length) {
                        sliderObject = $slider.data('productSlider').getSwiper();
                    } else {
                        sliderObject = null;
                    }
                }

                return sliderObject;
            },

            replaceImage: function ($imageToReplace, $imageToInsert) {
                if (!$backupImage) {
                    $backupImage = $imageToReplace.first().clone();
                }

                $productWrap.addClass("replace-is-loading");

                $insertedImage = $();
                $imageToReplace.each(function () {
                    $(this).replaceWith(function () {
                        const $img = $imageToInsert.clone();
                        $img.on("load", function () {
                            $productWrap.removeClass("replace-is-loading");
                        });

                        // Store inserted image so it can be replaced by the backup image.
                        $insertedImage = $insertedImage.add($img);
                        return $img;
                    });
                });

                $productWrap.addClass("has-replaced-img");
                $productWrap.layzrInitialisation();
            },

            restoreImage: function () {
                if ($insertedImage && $insertedImage.length && $backupImage && $backupImage.length) {
                    methods.replaceImage($insertedImage, $backupImage);
                    $insertedImage = undefined;
                    $productWrap.removeClass('has-replaced-img');
                }
            },

            updateProductImage: function ($imgElement) {
                if (!$imgElement || !$imgElement.length) {
                    methods.restoreImage();
                    return;
                }

                const slider = methods.getProductSlider();

                if (slider) {
                    const $slideToImage = $(slider.wrapperEl).find('img[src="' + $imgElement.attr('data-src') + '"]').first();
                    if ($slideToImage.length) {
                        methods.restoreImage();
                        slider.slideTo(slider.slides.indexOf($slideToImage.closest('.the7-swiper-slide')[0]));
                    } else {
                        slider.slideTo(1);
                        const $imageToReplace = slider.slides.length === 1 ? $(slider.slides[0]).find('img') : $(slider.$wrapperEl).find('.the7-swiper-slide[data-swiper-slide-index="0"]').find('img');
                        methods.replaceImage($imageToReplace, $imgElement);
                    }
                } else {
                    const $imageToReplace = $productWrap.find('img').first();
                    if($imageToReplace[0].src  !== $imgElement.attr('data-src') ){
                        methods.replaceImage($imageToReplace, $imgElement);
                    }
                }
            },

            /**
             * Select variation.
             */
            selectAttribute: function ($el) {
                const variations = $el.data("the7_product_variations_obj");
                const atr = $el.closest("ul").attr("data-atr");
                const mustBeActiveAttributeNames = $el.data("the7_must_be_active_attribute_names");
                const mustBeActive = (mustBeActiveAttributeNames.indexOf(atr) !== -1);
                const atrValue = String($el.data("id"));

                if (mustBeActive && variations.getState(atr) === atrValue) {
                    return;
                }

                const newState = {
                    [atr]: $el.parent().hasClass("active") ? "" : atrValue
                };
                const variationImageState = Object.entries(Object.assign({}, variations.getState(), newState))
                    .reduce((acc, [key, value]) => {
                        if (value) acc[key] = value;
                        return acc;
                    }, {});

                if ($widget.hasClass('elementor-widget-the7-woocommerce-loop-add-to-cart')) {
                    $productWrap = $el.closest('.product');
                } else {
                    $productWrap = $el.closest('.woocom-project');
                }
                methods.updateProductImage(variations.getVariationImage(variationImageState));

                if ($el.is(".out-of-stock") || widgetSettings.getCurrentDeviceSetting("show_add_to_cart") === "n") {
                    return;
                }

                variations.updateState(newState);
            },

            onOuterTouchHandler: function (event) {
                /**
                 * Close dropdown if event path not contains menu wrap object.
                 *
                 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
                 */
                if (event.originalEvent && event.data && event.data.boundaryElement && !event.originalEvent.composedPath().includes(event.data.boundaryElement)) {
                    event.data.$affectedElements && event.data.$affectedElements.removeClass("is-clicked") && elementorFrontend.elements.$body.off("touchstart", methods.onOuterTouchHandler);
                }
            },
        };

        methods.init();
    };

    $.fn.productsVariations = function () {
        return this.each(function () {
            if ($(this).data("productsVariations") !== undefined) {
                $(this).removeData("productsVariations")
            }
            new $.productsVariations(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        const initVariations = function ($widget, $) {
            $(function () {
                $widget.productsVariations();
            });
        };
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-wc-products.default", initVariations);
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-wc-products-carousel.default", initVariations);
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-loop-add-to-cart.default", initVariations);
    });
})(jQuery);
