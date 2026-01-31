$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    if (action_name === "adminlogin") {


        $("body").keydown(function (e) {
            if (e.keyCode == 13) {
                $('#BtnSignIn').trigger('click');
            }
        });

        $(document).on("click", "#BtnSignIn", function () {
            loginFormAction();
        });

        var loginFormAction = function () {


            var EmailAddress = $("#user_name").val().trim();
            var Password = $("#password").val().trim();

            let formData = {
                UserName: EmailAddress,
                Password: Password
            };


            $.ajax({
                type: 'POST',
                url: _BaseURL + '/Admin/Login',
                dataType: "json",
                data: formData,
                async: false,
                
                success: function (result) {
                    if ($.parseBool(result.Success)) {

                        var action = "response" in result ? result.response.toLowerCase() : "";

                        if (action === "initial_login") {
                            $.redirect(_BaseURL + "/auth/initial-change-password");
                            return false;
                        } else if (action === "temp_login") {
                            $.session.set("flag", "temp");
                            $.redirect(_BaseURL + "/auth/initial-change-password");//?flag=temp");
                            return false;
                        } else if (action === "password_expire") {
                            $.session.set("flag", "password_expire");

                            $.redirect(_BaseURL + "/auth/initial-change-password");//?flag=password_expire");
                            return false;
                        }
                        var roleNmae = result.Response.userDetails.roleName.toLowerCase();
                        if (roleNmae.toLowerCase() === "administrator" || roleNmae.toLowerCase() === "developer" || roleNmae.toLowerCase() === "deliverymanager") {
                            $.redirect(_BaseURL + "/Dashboard/Dashboard");
                        }
                        else {

                            Swal.fire(
                                {
                                    html:
                                        '<h2 class="reset_psw_heading font_36 text_dark text-uppercase  Apple-Light textVerify">Please Check Your Email And Password!!</h2>' +
                                        '<p class="text_gray Apple-Medium  px-auto textMainLogin text-align-center padding-verfiy-center"></p>',
                                    icon: 'warning',
                                    imageUrl: '@Url.Content("~/Assets/SignIn_Layout/images/logo.svg")',
                                    showConfirmButton: true,
                                    imageWidth: 60,
                                    customClass: {
                                        icon: 'icon_class'
                                    }
                                },
                            ).then((result) => {

                                if (result.isConfirmed) {

                                }

                            });



                        }


                    }
                    else {
                        Swal.fire(
                            {
                                html:
                                    '<h2 class="reset_psw_heading font_36 text_dark text-uppercase  Apple-Light textVerify">Please Enter UserName and Password!!</h2>' +
                                    '<p class="text_gray Apple-Medium  px-auto textMainLogin text-align-center padding-verfiy-center"></p>',
                                icon: 'warning',
                                imageUrl: '@Url.Content("~/Assets/SignIn_Layout/images/logo.svg")',
                                showConfirmButton: true,
                                imageWidth: 60,
                                customClass: {
                                    icon: 'icon_class'
                                }
                            },
                        ).then((result) => {

                            if (result.isConfirmed) {

                            }

                        });

                    }
                },
                error: function () {

                }
            });
        }

        $.redirect = function (url) {
            url = typeof url === 'undefined' ? "" : url;
            if ($.validregex(url, "url")) {
                window.location.href = url;
            } else {
                throw "Invalid URL !!!"
            }
        }

    }
});