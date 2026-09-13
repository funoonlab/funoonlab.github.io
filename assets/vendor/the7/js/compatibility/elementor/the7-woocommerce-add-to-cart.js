(function ($) {
	// Make sure you run this code under Elementor.
	$(window).on("elementor/frontend/init", function () {
		elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-product-add-to-cart-v2.default", function ($widget, $) {
			$(function () {
				$widget.productVariations();
			})
		});
	});

	$.productVariations = function (el) {
		const $widget = $(el);
		const $variationList = $widget.find(".the7-vr-options");
		const $variationsData = $widget.find("[data-product_variations]");
		const $form = $widget.find("form");
		const $singleVariation = $form.find(".single_variation");
		let $insertedImage;
		let $backupImage;
		let sliderObject;


		// Store a reference to the object.
		$.data(el, "productVariations", $widget);

		// Private methods.
		const methods = {
			init: function () {
				if ($variationList.length) {
					const productVariations = new ProductVariations({
						variations: $variationsData.data("product_variations"),
						state: $variationsData.data("default_attributes") || {},
						// Triggered after state changes.
						render: function () {
							const attributes = this.getState();

							if (!attributes) {
								return;
							}

							// Update image in sliders. See dt_variations_image_update for a gallery.
							const variationImageState = Object.entries(attributes)
								.reduce((acc, [key, value]) => {
									if (value) acc[key] = value;
									return acc;
								}, {});
							methods.updateProductImage(this.getVariationImage(variationImageState));

							// Find active attributes.
							const attributesSelector = Object.keys(attributes).filter(function (val) {
								return !!val;
							}).map(function (key) {
								return "[data-id=\"" + $.escapeSelector(attributes[key]) + "\"]";
							}).join(",");

							// Set active attributes.
							const $attributeWrap = $variationList.find("li");
							$attributeWrap.removeClass("active");
							$attributeWrap.find(attributesSelector).each(function () {
								// Parent is li.
								$(this).parent().addClass("active");
							});

							// Update value in select.
							$form.find(".variations select").each(function () {
								const $this = $(this);
								const atr = $this.attr("name");

								if (attributes[atr] !== undefined && attributes[atr] !== $this.val()) {
									$this.val(attributes[atr]);
								}
							}).trigger("change");

							// Dynamic out-of-stock system.
							methods.handleOutOfStockVisibility(this.findMatchingOutOfStockVariations4());
						}
					});

					$("li a", $variationList).on("click", function (e) {
						e.preventDefault();

						const $this = $(this);
						const rawAtr = $this.closest("ul").attr("data-atr");
						const atr = productVariations.sanitizeAttrSlug(rawAtr);
						const atrValue = String($this.data("id"));
						const mustBeActive = (mustBeActiveAttributeNames.indexOf(rawAtr) !== -1);

						if (mustBeActive && productVariations.getState(atr) === atrValue) {
							return;
						}

						const $parent = $this.parent();

						// Update state.
						const newState = {
							[atr]: $parent.hasClass("active") ? "" : atrValue
						};
						productVariations.updateState(newState);
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
					$form.find(".variations select").each(function () {
						const $this = $(this);
						const val = $this.val();
						const atr = $this.attr("id");

						// Prevent multiple attributes with the same name.
						if (val.length && mustBeActiveAttributeNames.indexOf(atr) === -1) {
							initialAttributes.push({
								"attribute": atr,
								"value": val
							});
						}
					});

					// Set default state.
					productVariations.updateState(initialAttributes.reduce(function (acc, item) {
						const val = item.value;
						const atr = productVariations.sanitizeAttrSlug(item.attribute);

                        return {
                            ...acc,
                            [atr]: val
                        };
                    }, {}));
                }
                 $('.variations_form').on('reset_data', function () {
                    methods.restoreImage();
                });
                $form.on('found_variation', function (event, variation) {
                    if (variation && variation.image && variation.image.src) {
                        const $img = $(`
                            <img
                                class="replaced-img preload-me aspect lazy lazy-load"
                                style="--ratio: ${variation.image.src_w} / ${variation.image.src_h};"
                                width="${variation.image.src_w}"
                                height="${variation.image.src_h}"
                                data-src="${variation.image.src}"
                                data-srcset="${variation.image.srcset || ""}"
                                alt="${variation.image.alt || ""}"
                                title="${variation.image.title || ""}"
                                data-caption="${variation.image.data_caption || ""}"
                                loading="eager"
                                data-large_image="${variation.image.full_src}"
                                data-large_image_width="${variation.image.full_src_w}"
                                data-large_image_height="${variation.image.full_src_h}"
                                sizes="${variation.image.sizes}"
                            />
                        `);


                        methods.updateProductImage($img);
                    } else {
                        methods.restoreImage();
                    }
                });


				const applyPriceBottomMargin = function () {
					$singleVariation.children().not(":empty").last().addClass("last");
				};

				$widget.find(".single_variation_wrap").on("show_variation", function (event, variation) {
					applyPriceBottomMargin();
				});

				applyPriceBottomMargin();
			},
			getProductSlider: async function () {
				return new Promise((resolve) => {
					const findSlider = () => {
						if (sliderObject === undefined) {
							const $slider = $widget.closest(".product").find(".elementor-widget-the7-woocommerce-product-images-slider");

							if ($slider.length) {
								const sliderInstance = $slider.data("the7Slider");
								if (sliderInstance) {
									sliderObject = sliderInstance.getSwiper();

									if (sliderObject === undefined) {
										// If sliderObject is still not found, try again after a short delay
										setTimeout(findSlider, 100);
									}
								}
							} else {
								sliderObject = null;
							}
						}

						if (sliderObject !== undefined) {
							resolve(sliderObject);
						}
					};
					findSlider();
				});
			},
			replaceImage: function ($imageToReplace, $imageToInsert) {
				if (!$backupImage) {
					$backupImage = $imageToReplace.first().clone();
				}

				$widget.addClass("replace-is-loading");

				$insertedImage = $();
				$imageToReplace.each(function () {
					var $this = $(this);
					var $parent = $this.parent();
					var originalBg = $parent.css("background-image");
					// Store original background if not already stored
					if (!$this.data("original-bg")) {
						$this.data("original-bg", originalBg);
					}
					$(this).replaceWith(function () {
						const $img = $imageToInsert.clone();
						$img.on("load", function () {
							$widget.removeClass("replace-is-loading");
						});
						// Update parent background-image if applicable
						if (originalBg && originalBg !== "none") {
							$parent.css("background-image", "url(" + $img[0].getAttribute("data-src") + ")");
						}

						// Store inserted image so it can be replaced by the backup image.
						$insertedImage = $insertedImage.add($img);
						return $img;
					});
				});

				$widget.addClass("has-replaced-img");
				$widget.closest(".product").find(".elementor-widget-the7-woocommerce-product-images-slider").layzrInitialisation();
			},
			restoreImage: function () {
				if ($insertedImage && $insertedImage.length && $backupImage && $backupImage.length) {
					$insertedImage.each(function () {
						var $this = $(this);
						var $parent = $this.parent();
						var originalBg = $this.data("original-bg");

						if (originalBg) {
							$parent.css("background-image", originalBg);
						}
					});
					methods.replaceImage($insertedImage, $backupImage);
					$insertedImage = undefined;
					$widget.removeClass("has-replaced-img");
				}
			},
			updateProductImage: function ($imgElement) {
				if (!$imgElement || !$imgElement.length) {
					methods.restoreImage();
					return;
				}

				methods.getProductSlider().then((slider) => {
					if (slider) {
						const $slideToImage = $(slider.wrapperEl).find("img.is-loaded[srcset*=\"" + $imgElement.attr("data-src") + "\"],img[data-srcset*=\"" + $imgElement.attr("data-src") + "\"]").first();

						if ($slideToImage.length) {
							methods.restoreImage();
							slider.slideTo(slider.slides.indexOf($slideToImage.closest(".the7-swiper-slide")[0]));
						} else {
							slider.slideTo(0);
							const $imageToReplace = slider.slides.length === 1 ? $(slider.slides[0]).find("img") : $(slider.$wrapperEl).find(".the7-swiper-slide[data-swiper-slide-index=\"0\"]").find("img");
							methods.replaceImage($imageToReplace, $imgElement);
						}
					}
				});
				const $sliderVertical = $widget.closest(".product").find(".elementor-widget-the7-woocommerce-product-images-vertical-slider");

				if ($sliderVertical.length) {
					// Get base image name without size suffix
					function normalizeImageSrc(url) {
						if (!url) return "";
						return url
							.replace(/-\d+x\d+(?=\.\w{3,4}$)/, "")  // remove -WxH
							.replace(/-scaled(?=\.\w{3,4}$)/, "");  // remove -scaled
					}

					var targetSrc = normalizeImageSrc($imgElement.attr("data-src"));

					var $scroleToImage = $sliderVertical.find(".dt-gallery-container img").filter(function () {
						var $img = $(this);
						var src = normalizeImageSrc($img.attr("src") || "");
						var dataSrc = normalizeImageSrc($img.attr("data-src") || "");
						var srcset = $img.attr("data-srcset") || "";

						return src === targetSrc || dataSrc === targetSrc || srcset.includes(targetSrc);
					});

					if ($scroleToImage.length) {
						methods.restoreImage();
						var scrollToPosition = $scroleToImage.offset().top - $sliderVertical.offset().top + $sliderVertical.scrollTop() + 2;
						$sliderVertical[0].scrollTo({
							top: scrollToPosition
						});
					} else {
						// Scroll to the first image and replace it
						const $firstImage = $sliderVertical.find(".dt-gallery-container img").first();
						if ($firstImage.length) {
							// Store original if not already stored
							if (!$firstImage.data("original-src")) {
								$firstImage.data("original-src", $firstImage.attr("src"));
								$firstImage.data("original-srcset", $firstImage.attr("srcset"));
							}
							const scrollToPosition = $firstImage.offset().top - $sliderVertical.offset().top + $sliderVertical.scrollTop() + 2;
							$sliderVertical[0].scrollTo({
								top: scrollToPosition
							});

							methods.replaceImage($firstImage, $imgElement);
							$sliderVertical.layzrInitialisation();
						}
					}
				}
			},
			/**
			 * Mark attributes as out-of-stock.
			 *
			 * @param outOfStockAttributes
			 */
			handleOutOfStockVisibility(outOfStockAttributes) {
				const attributes = outOfStockAttributes;
				const $variationNodes = $variationList.find("li a");
				$variationNodes.removeClass("out-of-stock");
				for (const [attr, values] of Object.entries(attributes)) {
					if (values.length) {
						const selector = values.slice().map((val) => {
							return "[data-id=\"" + $.escapeSelector(val) + "\"]";
						}).join(",");
						$variationNodes.filter(selector).addClass("out-of-stock");
					}
				}
			}
		};

		methods.init();
	};

	$.fn.productVariations = function () {
		return this.each(function () {
			if ($(this).data("productVariations") !== undefined) {
				$(this).removeData("productVariations")
			}
			new $.productVariations(this);
		});
	};

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
		 * Update state and render.
		 *
		 * @param state
		 */
		updateState(state) {
			// Create a new object to avoid mutating the original state.
			this.data.state = Object.assign({}, this.data.state, state);
			typeof this.data.render === "function" && this.data.render.call(this);
		}

		/**
		 * Sanitize attribute slug.
		 * @param attr
		 * @returns {string}
		 */
		sanitizeAttrSlug(attr) {
			if (attr.indexOf("attribute_") !== 0) {
				attr = "attribute_" + attr;
			}

			return attr;
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

		findAttributesWithOutOfStockVariationsInAttributeMap(attributeMap, callback) {
			if (typeof callback !== "function" || typeof attributeMap !== "object") {
				return;
			}

			for (const [key, value] of Object.entries(attributeMap)) {
				const [attr, val] = key.split("///");

				// If all variations in val are out of stock.
				if (value.every(function (variation) {
					return !variation.is_in_stock;
				})) {
					callback(attr, val, value);
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
				const [attr, val] = key.split("///");

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
		findMatchingOutOfStockVariations4() {
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
					const sKey = key + "///" + value;

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
						const [attr, val] = key.split("///");
						if (attributes[attr]) {
							inStockAttributes[attr] = inStockAttributes[attr] || [];
							inStockAttributes[attr].push(val);
						}
					}
				});
			} else {
				for (const [key, value] of Object.entries(allInStockAttributes)) {
					const [attr, val] = key.split("///");
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
				const [attr, val] = key.split("///");
				inStockAttributes[attr] = inStockAttributes[attr] || [];
				inStockAttributes[attr].push(val);
			}

			// Remove duplicates.
			for (const [key, value] of Object.entries(inStockAttributes)) {
				inStockAttributes[key] = [...new Set(value)];
			}

			const outOfStockBasedOnInStock = {};
			// Diff in-stock attributes from all attributes.
			for (const [key, value] of Object.entries(allAttributes)) {
				const [attr, val] = key.split("///");
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

					// Empty value means any value.
					if (val1 !== undefined && val1.length === 0) {
						val1 = val2;
					}

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
			for (var attr_name in variation_attributes) {
				if (variation_attributes.hasOwnProperty(attr_name)) {
					var val1 = variation_attributes[attr_name];
					var val2 = attributes[attr_name];
					if (val1 === undefined || val2 === undefined || val2.length === 0 || (val1.length !== 0 && val1 !== val2)) {
						return false;
					}
				}
			}
			return true;
		}
	}
})(jQuery);
