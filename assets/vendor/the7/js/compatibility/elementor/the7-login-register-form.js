jQuery(function ($) {
    $.loginRegisterForm = function (el) {
        let $widget = $(el),
            $lostPassLink = $widget.find(".lost_password a"),
            $resetPasswordForm = $widget.find(".woocommerce-ResetPassword");
        $widget.vars = {
            toogleSpeed: 250,
            animationSpeed: 150,
            fadeIn: {opacity: 1},
            fadeOut: {opacity: 0}
        };
        // Private methods
        let methods = {
            init: function () {
                $lostPassLink.on('click', function (e) {
                    e.preventDefault();

                    if (!$resetPasswordForm.hasClass("show-reset-form")) {
                        $resetPasswordForm.addClass("show-reset-form");
                        $resetPasswordForm.css($widget.vars.fadeOut).slideDown($widget.vars.toogleSpeed).animate(
                            $widget.vars.fadeIn,
                            {
                                duration: $widget.vars.animationSpeed,
                                queue: false
                            }
                        );
                    } else {
                        $resetPasswordForm.removeClass("show-reset-form");
                        $resetPasswordForm.css($widget.vars.fadeOut).slideUp($widget.vars.toogleSpeed);
                    }
                })
            }
        };
        //global functions

        methods.init();
    };

    $.fn.loginRegisterForm = function () {
        return this.each(function () {
            new $.loginRegisterForm(this);
        });
    };
});
(function ($) {
    // Make sure you run this code under Elementor.
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/the7-woocommerce-login-register-form.default", function ($widget, $) {
            $(document).ready(function () {
                $widget.loginRegisterForm();
            })
        });
    });
})(jQuery);
