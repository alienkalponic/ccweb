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

    // Smooth scroll to Course Registration Form if anchor clicked
    $(document).on('click', '#btnRegistrationForm', function (e) {
        var formEl = document.getElementById('registration-form');
        if (formEl) {
            e.preventDefault();
            formEl.scrollIntoView({ behavior: 'smooth' });
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

    // =========================================================================
    // Quick Action Strip Scroll & Reload Animation Observer
    // =========================================================================
    function initQuickStripAnimation() {
        const stripEl = document.querySelector('.cc-quick-strip-section');
        if (!stripEl) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stripEl.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            });

            observer.observe(stripEl);
        } else {
            stripEl.classList.add('is-visible');
        }

        // Safety fallback: ensure cards are always revealed after brief delay
        setTimeout(function () {
            if (stripEl) {
                stripEl.classList.add('is-visible');
            }
        }, 1200);
    }

    initQuickStripAnimation();
});