$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    function animateActiveSlide() {
        const activeSlide = document.querySelector(".swiper-slide-active");
        if (!activeSlide) return;

        const title = activeSlide.querySelector(".card-title");
        if (!title) return;

        title.classList.remove("animate__animated", "animate__zoomIn");
        void title.offsetWidth;
        title.classList.add("animate__animated", "animate__zoomIn");

        console.log("🎯 Animation applied");
    }

    animateActiveSlide();

    let interval = setInterval(animateActiveSlide, 3000);

    if (action_name === "activityinfodetails") {
        // Registration Form submission handler
        $(document).on("submit", ".registration-form", function (e) {
            e.preventDefault();

            var fullName = $("#name").val() ? $("#name").val().trim() : "";
            var email = $("#email").val() ? $("#email").val().trim() : "";
            var phone = $("#phone").val() ? $("#phone").val().trim() : "";
            var clubActivityId = parseInt($("#clubActivityId").val()) || 0;
            var message = $("#message").val() ? $("#message").val().trim() : "";

            if (!fullName || !email || !phone) {
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        title: 'Validation Error',
                        text: 'Please fill in all required fields.',
                        icon: 'warning'
                    });
                } else {
                    alert('Please fill in all required fields.');
                }
                return;
            }

            var $btn = $(this).find('button[type="submit"]');
            var originalBtnText = $btn.text();
            $btn.prop("disabled", true).text("Submitting...");

            var dto = {
                FullName: fullName,
                Email: email,
                PhoneNumber: phone,
                ClubActivityId: clubActivityId,
                Message: message
            };

            $.ajax({
                type: 'POST',
                url: _BaseURL + '/Home/CreateActivityInterest',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(dto),
                dataType: 'json',
                success: function (result) {
                    $btn.prop("disabled", false).text(originalBtnText);
                    var isSuccess = result && (result.success === true || result.Success === true);
                    var responseText = result && (result.response || result.Response) ? (result.response || result.Response) : "";

                    if (isSuccess) {
                        var successMessage = typeof responseText === "string" && responseText.length > 0
                            ? responseText
                            : "Your interest has been registered successfully. Our team will contact you soon!";

                        if (typeof Swal !== "undefined") {
                            Swal.fire({
                                title: 'Submitted Successfully!',
                                text: successMessage,
                                icon: 'success'
                            });
                        } else {
                            alert(successMessage);
                        }

                        $("#name").val('');
                        $("#email").val('');
                        $("#phone").val('');
                        $("#message").val('');
                    } else {
                        var errorMsg = typeof responseText === "string" && responseText.length > 0
                            ? responseText
                            : 'Failed to submit application. Please try again.';

                        if (typeof Swal !== "undefined") {
                            Swal.fire({
                                title: 'Submission Failed',
                                text: errorMsg,
                                icon: 'error'
                            });
                        } else {
                            alert(errorMsg);
                        }
                    }
                },
                error: function (xhr, status, error) {
                    $btn.prop("disabled", false).text(originalBtnText);
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            title: 'System Error',
                            text: 'An error occurred while submitting your request. Please try again later.',
                            icon: 'error'
                        });
                    } else {
                        alert('An error occurred while submitting your request. Please try again later.');
                    }
                }
            });
        });
    }
    
});