$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";

    if (action_name === "adminlogin") {
        // Auto-fill Saved Credentials on Load with Robust Error Handling
        (function fillSavedCredentials() {
            try {
                const savedUser = localStorage.getItem("remembered_admin_user");
                const savedPass = localStorage.getItem("remembered_admin_pass");

                if (savedUser && savedPass) {
                    // Use try-catch for atob in case of invalid storage data
                    $("#user_name").val(atob(savedUser));
                    $("#password").val(atob(savedPass));
                    $("#chkRemember").prop("checked", true);
                }
            } catch (e) {
                console.warn("Failed to decrypt saved credentials:", e);
                localStorage.removeItem("remembered_admin_user");
                localStorage.removeItem("remembered_admin_pass");
            }
        })();

        $("body").keydown(function (e) {
            if (e.keyCode == 13) {
                $('#BtnSignIn').trigger('click');
            }
        });

        $(document).on("click", "#BtnSignIn", function () {
            loginFormAction();
        });

        var loginFormAction = function () {
            var $btn = $("#BtnSignIn");
            var EmailAddress = $("#user_name").val().trim();
            var Password = $("#password").val().trim();

            if (!EmailAddress || !Password) {
                $("#user_name, #password").addClass("validateInputborder");
                Swal.fire({
                    title: 'Missing Credentials',
                    text: 'Please enter both username and password.',
                    icon: 'warning',
                    confirmButtonColor: 'var(--admin-primary)'
                });
                return;
            }

            $("#user_name, #password").removeClass("validateInputborder");

            // Show Loading State
            $btn.prop("disabled", true).addClass("loading");
            $btn.find(".btn-text").text("Authenticating...");

            let formData = {
                UserName: EmailAddress,
                Password: Password
            };

            $.ajax({
                type: 'POST',
                url: _BaseURL + '/Admin/Login',
                dataType: "json",
                data: formData,
                async: true,
                success: function (result) {
                    if ($.parseBool(result.Success)) {
                        // Handle Remember Me Logic
                        try {
                            if ($("#chkRemember").is(":checked")) {
                                localStorage.setItem("remembered_admin_user", btoa(EmailAddress));
                                localStorage.setItem("remembered_admin_pass", btoa(Password));
                            } else {
                                localStorage.removeItem("remembered_admin_user");
                                localStorage.removeItem("remembered_admin_pass");
                            }
                        } catch (e) {
                            console.error("Failed to save credentials:", e);
                        }

                        var action = "response" in result ? result.response.toLowerCase() : "";

                        // Handle redirections based on response action
                        if (action === "initial_login" || action === "temp_login" || action === "password_expire") {
                            window.location.href = _BaseURL + "/auth/initial-change-password";
                            return false;
                        }

                        if (result.Response && result.Response.userDetails) {
                            var roleName = result.Response.userDetails.roleName.toLowerCase();
                            if (roleName === "administrator" || roleName === "developer" || roleName === "deliverymanager") {
                                window.location.href = _BaseURL + "/Dashboard/Dashboard";
                            } else {
                                resetLoginState($btn, 'Access Denied', 'You do not have permission to access the admin panel.');
                            }
                        } else {
                            // Default redirect if check fails but success is true
                            window.location.href = _BaseURL + "/Dashboard/Dashboard";
                        }
                    }
                    else {
                        resetLoginState($btn, 'Login Failed', 'Please check your username and password.');
                    }
                },
                error: function () {
                    resetLoginState($btn, 'System Error', 'A system error occurred. Please try again later.');
                }
            });
        };

        var resetLoginState = function ($btn, title, message) {
            $btn.prop("disabled", false).removeClass("loading");
            $btn.find(".btn-text").text("Sign In to Dashboard");

            Swal.fire({
                title: title,
                text: message,
                icon: 'error',
                confirmButtonColor: 'var(--admin-primary)'
            });
        };
    }
});
