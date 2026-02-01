$(document).ready(function () {

    const toggleBtn = document.querySelector('.toggle_btn')
    const toggleBtnIcon = document.querySelector('.toggle_btn i')
    const dropDownMenu = document.querySelector('.dropdown_menu')

    if (toggleBtn) {
        toggleBtn.onclick = function () {
            dropDownMenu.classList.toggle('open')
            const isOpen = dropDownMenu.classList.contains('open')

            toggleBtnIcon.classList = isOpen
                ? 'fa-solid fa-xmark'
                : 'fa-solid fa-bars'
        };
    }

    //toggleBtn.onclick = function () {
        
    //}

    // =========nav-ber==========

    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', fixNav);

    function fixNav() {
        if (window.scrollY > nav.offsetHeight + 150) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    }


    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function () {
            links.forEach(otherLink => otherLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // =========nav-ber-end==========

    // ========swip-card-design========
    var swiper = new Swiper('.swiper-container', {
        grabCursor: true,
        centeredSlides: true,
        freeMode: true,
        slidesPerView: 'auto',
        effect: 'coverflow',
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
        },
        pagination: {
            el: '.swiper-pagination',
            dynamicBullets: true
        }
    });
    // ========swip-card-design-end========


    // ========video========
    var windowWidth = $(window).width();
    if (windowWidth > 640) {
        $("video , .Video-playbtn").click(function () {
            var video = $("#rightVideo").get(0);
            if (video.paused) {
                console.log("play");
                video.play();

                $(".Video-playbtn").hide();
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").addClass("animate_it");
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").removeClass("animate_reverse");
                $(this).siblings(".play-btn").hide();
            } else {
                video.pause();
                console.log("pause");

                $(".Video-playbtn").show();
                $(".Video-playbtn").show();
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").removeClass("animate_it");
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").addClass("animate_reverse");
                $(video).parent().siblings(".play-btn").show();
            }
            return false;
        });

        document.addEventListener('play', function (e) {
            var video = e.target;
            if (video.nodeName === 'VIDEO') {
                $('video').siblings(".Video-playbtn").hide();
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").addClass("animate_it");
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").removeClass("animate_reverse");
            }
        }, true);

        document.addEventListener('pause', function (e) {
            var video = e.target;
            if (video.nodeName === 'VIDEO') {
                $('video').siblings(".Video-playbtn").show();
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").removeClass("animate_it");
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").addClass("animate_reverse");
            }
        }, true);

        $(function () {
            $('#rightVideo').on('ended', function () {
                var video = $("#rightVideo").get(0);
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").removeClass("animate_it");
                $(this).closest(".HomeVideoInner").find(".HomeVideoTitleSection").addClass("animate_reverse");
                $(this).closest(".HomeVideoInner").find(".Video-playbtn").show();
            });
        });

    }

    // ================team-swiper===============
    swaiper();
    function swaiper() {
        var agSlideFlickity = $('.js-flickity-slider').flickity({
            autoPlay: 2000,
            imagesLoaded: true,
            percentPosition: false,
            prevNextButtons: false,
            initialIndex: 5,
            pageDots: false,
            groupCells: 1
        });

        var agCard = agSlideFlickity.find('.js-carousel-cell .js-card-bg'),
            agTransform = 'string' == typeof document.documentElement.style.transform ? 'transform' : 'WebkitTransform',
            agSlide = agSlideFlickity.data('flickity');

        agSlideFlickity.on('scroll.flickity', function () {
            agSlide.slides.forEach(function (t, e) {
                var n = agCard[e],
                    i = -1 * (t.target + agSlide.x) / 3;

                n.style[agTransform] = 'translateX(' + i + 'px)';
            });
        });

        agSlideFlickity.on('dragStart.flickity', function (t, e) {
            document.ontouchmove = function (t) {
                t.preventDefault();
            }
        });

        agSlideFlickity.on('dragEnd.flickity', function (t, e) {
            document.ontouchmove = function () {
                return true;
            }
        })
    }

});