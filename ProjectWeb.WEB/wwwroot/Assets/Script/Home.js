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
    


});