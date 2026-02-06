(function () {
    'use strict';

    let currentImageIndex = 0;
    let galleryImages = [];

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // 👇 expose globally
    window.initGallery = function () {

        const galleryItems = document.querySelectorAll('.gallery-item');

        if (galleryItems.length === 0) return;

        galleryImages = Array.from(galleryItems).map((item, index) => {
            const img = item.querySelector('.gallery-item-img');
            return {
                src: img.src,
                alt: img.alt,
                index: index
            };
        });

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
        if (nextBtn) nextBtn.addEventListener('click', showNextImage);

        document.addEventListener('keydown', handleKeyboard);
    };

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        currentImageIndex =
            (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex =
            (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        const currentImage = galleryImages[currentImageIndex];
        lightboxImg.src = currentImage.src;
        lightboxCounter.textContent =
            `${currentImageIndex + 1} / ${galleryImages.length}`;
    }

    function handleKeyboard(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    }

})();
