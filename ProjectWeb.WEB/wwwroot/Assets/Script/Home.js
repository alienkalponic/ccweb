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

    // Redirect to Online Registration Form from Activity Details
    $(document).on('click', '#btnSubmitInterest, #btnRegistrationForm', function (e) {
        if ($(this).text().trim().toLowerCase().includes('registration form')) {
            e.preventDefault();
            var startDate = $(this).attr('data-start-date');
            var endDate = $(this).attr('data-end-date');
            if (startDate) sessionStorage.setItem('cc_activity_start_date', startDate);
            if (endDate) sessionStorage.setItem('cc_activity_end_date', endDate);

            var href = $(this).attr('href');
            if (href && href !== '#' && href.indexOf('javascript') === -1) {
                window.location.href = href;
                return;
            }

            // Extract activity id from path e.g. /Home/ActivityInfoDetails/12
            var pathParts = window.location.pathname.split('/').filter(Boolean);
            var lastPart = pathParts[pathParts.length - 1];
            if (lastPart && !isNaN(lastPart)) {
                window.location.href = _BaseURL + '/Home/OnlineRegistrationForm?id=' + lastPart;
            } else {
                window.location.href = _BaseURL + '/Home/OnlineRegistrationForm';
            }
        }
    });

    // Click anywhere on activity photo card in OUR ACTIVITY section to navigate like Know more button
    $(document).on('click', '.slide-card', function (e) {
        // If clicking directly on an anchor or button inside, allow its default action
        if ($(e.target).closest('a').length > 0) {
            return;
        }

        var url = $(this).attr('data-href') || $(this).find('a.know-more-btn').attr('href');
        if (url && url !== '#' && url !== 'javascript:void(0);') {
            window.location.href = url;
        }
    });
});