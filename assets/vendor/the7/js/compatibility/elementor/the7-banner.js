(function ($) {
    $(window).on("elementor/frontend/init", function () {
        class BannerWidget {
            constructor($widget) {
                this.$widget = $widget;
                this.widgetId = $widget.data("id");
                this.settings = new The7ElementorSettings($widget);
                const isPreview = elementorFrontend.isEditMode() || elementorFrontend.isWPPreviewMode();
                // Do not hide banner in preview mode or if close_banner_for_session is disabled
                this.rememeberBeingClosed = !isPreview && this.settings.getSettings("close_banner_for_session");
            }

            getClosed() {
                let storedValue = the7Cookies.get("the7_closed_banner_widgets");
                if (storedValue) {
                    return JSON.parse(storedValue);
                }

                return [];
            }

            isClosed() {
                if (this.rememeberBeingClosed) {
                    return this.getClosed().includes(this.widgetId);
                }

                return false;
            }

            setClosed() {
                if (!this.rememeberBeingClosed) {
                    return;
                }
                let closedBanners = this.getClosed();
                if (!closedBanners.includes(this.widgetId)) {
                    closedBanners.push(this.widgetId);
                    the7Cookies.set("the7_closed_banner_widgets", JSON.stringify(closedBanners), false, "/");
                }
            }
        }

        elementorFrontend.hooks.addAction("frontend/element_ready/the7-banner.default", function ($widget, $) {
            const bannerWidget = new BannerWidget($widget);

            if (bannerWidget.isClosed()) {
                $widget.hide().remove();
            } else {
                $widget.removeClass("hidden");
            }

            $widget.find(".close-button-container .close-button").on("click", function () {
                bannerWidget.setClosed();
                $widget.css("opacity", "0").stop(true, true).slideUp(250, () => {
                    $widget.remove();
                    window.scrollTo(0, window.scrollY + 1);
                    window.scrollTo(0, window.scrollY - 1);
                });
            });
        });
    });
})(jQuery);
