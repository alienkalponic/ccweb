$(document).ready(function () {
    var _BaseURL = window.location.origin;
    var action_name = !$.isNull($.getactionname()) ? $.getactionname().toLowerCase() : "";
    var contollername = !$.isNull($.getcontrollername()) ? $.getcontrollername().toLowerCase() : "";

    if (action_name === "about") {
        

        document.addEventListener("DOMContentLoaded", function () {
            if (window.location.hash === "#about-hills") {
                const target = document.getElementById("about-hills");
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }, 300); // navbar load হওয়ার সময় দেয়
                }
            }
        });

        var swiper = new Swiper(".swiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            speed: 800, // smoother transition
            slidesPerView: "auto",
            coverflowEffect: {
                rotate: 15,      // slight angle for depth
                stretch: 0,
                depth: 180,      // more 3D feel
                modifier: 1.5,
                slideShadows: false // cleaner, modern look
            },

            keyboard: {
                enabled: true,
                onlyInViewport: true
            },

            mousewheel: {
                forceToAxis: true,
                sensitivity: 0.6
            },

            autoplay: {
                delay: 3500,
                disableOnInteraction: false
            },
            loop: true,
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true
                },
            breakpoints: {
                0: {
                    slidesPerView: 1
                },
                640: {
                    slidesPerView: 1.2
                },
                768: {
                    slidesPerView: 1.5
                },
                1024: {
                    slidesPerView: 2
                },
                1440: {
                    slidesPerView: 3
                }
            }
        });




        const testimonials = [
            {
                quote:
                    "Rock climbing in West Bengal did not begin on an established path—it began with a vision and a steady guiding hand. Banabhusan Nayak was that guiding force. Through his leadership and passion, he laid the foundation upon which generations of climbers continue to rise.",
                name: "Banabhusan Nayak",
                designation: "Banabhusan Nayak",
                src:
                    "../Assets/Testimonials/testimonials1.jpeg"
            },
            {
                quote:
                    "In the early days, when resources were scarce and challenges were many, Swapan Datta stood firm with unwavering belief. His quiet dedication and commitment helped shape the spirit of this club and transform a dream into a lasting legacy.",
                name: "Swapan Datta",
                designation: "Swapan Datta",
                src:
                    "../Assets/Testimonials/swapanda..jpg"
            },
            {
                quote:
                    "",
                name: "Kalayan Bhattacharya",
                designation: "Kalayan Bhattacharya",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Bibek Ranjan Sarkar",
                designation: "Bibek Ranjan Sarkar",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Samir Pal Choudhury",
                designation: "Samir Pal Choudhury",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Debavas Dey",
                designation: "Samir Pal Choudhury",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Tarun Dey",
                designation: "Tarun Dey",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Late Dr.Prabal Roy",
                designation: "Late Dr.Prabal Roy",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Late Arnab Mukharjee",
                designation: "Late Arnab Mukharjee",
                src:
                    "../Assets/Testimonials/male.jpg"
            },
            {
                quote:
                    "",
                name: "Late Supriya Sengupta",
                designation: "Late Supriya Sengupta",
                src:
                    "../Assets/Testimonials/female.jpg"
            },
        ];

        let activeIndex = 0;
        const imageContainer = document.getElementById("image-container");
        const nameElement = document.getElementById("name");
        const designationElement = document.getElementById("designation");
        const quoteElement = document.getElementById("quote");
        const prevButton = document.getElementById("prev-button");
        const nextButton = document.getElementById("next-button");

        function calculateGap(width) {
            const minWidth = 1024;
            const maxWidth = 1456;
            const minGap = 60;
            const maxGap = 86;

            if (width <= minWidth) return minGap;
            if (width >= maxWidth)
                return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));

            return (
                minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
            );
        }

        function updateTestimonial(direction) {
            const oldIndex = activeIndex;
            activeIndex =
                (activeIndex + direction + testimonials.length) % testimonials.length;

            const containerWidth = imageContainer.offsetWidth;
            const gap = calculateGap(containerWidth);
            const maxStickUp = gap * 0.8; // 80% of the calculated gap

            testimonials.forEach((testimonial, index) => {
                let img = imageContainer.querySelector(`[data-index="${index}"]`);
                if (!img) {
                    img = document.createElement("img");
                    img.src = testimonial.src;
                    img.alt = testimonial.name;
                    img.classList.add("testimonial-image");
                    img.dataset.index = index;
                    imageContainer.appendChild(img);
                }

                const offset =
                    (index - activeIndex + testimonials.length) % testimonials.length;
                const zIndex = testimonials.length - Math.abs(offset);
                const opacity = index === activeIndex ? 1 : 1;
                const scale = index === activeIndex ? 1 : 0.85;

                let translateX, translateY, rotateY;
                if (offset === 0) {
                    translateX = "0%";
                    translateY = "0%";
                    rotateY = "0deg";
                } else if (offset === 1 || offset === -2) {
                    translateX = "20%";
                    translateY = `-${(maxStickUp / img.offsetHeight) * 100}%`;
                    rotateY = "-15deg";
                } else {
                    translateX = "-20%";
                    translateY = `-${(maxStickUp / img.offsetHeight) * 100}%`;
                    rotateY = "15deg";
                }

                img.style.zIndex = zIndex;
                img.style.opacity = opacity;
                img.style.transform = `translate(${translateX}, ${translateY}) scale(${scale}) rotateY(${rotateY})`;
            });

            nameElement.textContent = testimonials[activeIndex].name;
            designationElement.textContent = testimonials[activeIndex].designation;
            quoteElement.innerHTML = testimonials[activeIndex].quote
                .split(" ")
                .map((word) => `<span class="word">${word}</span>`)
                .join(" ");

            animateWords();
        }

        function animateWords() {
            const words = quoteElement.querySelectorAll(".word");
            words.forEach((word, index) => {
                word.style.opacity = "0";
                word.style.transform = "translateY(10px)";
                word.style.filter = "blur(10px)";
                setTimeout(() => {
                    word.style.transition =
                        "opacity 0.2s ease-in-out, transform 0.2s ease-in-out, filter 0.2s ease-in-out";
                    word.style.opacity = "1";
                    word.style.transform = "translateY(0)";
                    word.style.filter = "blur(0)";
                }, index * 20);
            });
        }

        function handleNext() {
            updateTestimonial(1);
        }

        function handlePrev() {
            updateTestimonial(-1);
        }

        prevButton.addEventListener("click", handlePrev);
        nextButton.addEventListener("click", handleNext);

        // Initial setup
        updateTestimonial(0);

        // Autoplay functionality
        const autoplayInterval = setInterval(handleNext, 5000);

        // Stop autoplay on user interaction
        [prevButton, nextButton].forEach((button) => {
            button.addEventListener("click", () => {
                clearInterval(autoplayInterval);
            });
        });

        // Handle window resize
        window.addEventListener("resize", () => updateTestimonial(0));






        // ===========team==============
        const defaultItemCount = 7;
        const itemWidth = 238;

        const wrapper = document.getElementById("InfiniteScrollWrapper");
        const content = document.getElementById("InfiniteScroll");

        const manageChildren = (childCount) => {
            while (content.children.length > defaultItemCount) {
                content.removeChild(content.lastChild);
            }

            for (let i = 0; i < childCount; i++) {
                for (let j = 0; j < defaultItemCount; j++) {
                    const clone = content.children[j].cloneNode(true);
                    content.appendChild(clone);
                }
            }

            content.style.width = `${itemWidth * defaultItemCount * (childCount + 1)}px`;
        };

        const core = (width) => {
            if (width <= 1920) {
                manageChildren(2);
            } else if (width <= 2560) {
                manageChildren(3);
            } else if (width <= 3840) {
                manageChildren(4);
            } else {
                manageChildren(8);
            }
        };

        const debounce = (func, delay) => {
            let timeout;
            return () => {
                clearTimeout(timeout);
                timeout = setTimeout(func, delay);
            };
        };

        const handleResize = debounce(() => core(window.innerWidth), 300);

        window.addEventListener("load", () => {
            core(window.innerWidth);
        });

        window.addEventListener("resize", handleResize);
    }
});