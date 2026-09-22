(function () {
    'use strict';

    let currentImageIndex = 0;
    let galleryImages = [];

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxThumbnails = document.getElementById('lightbox-thumbnails');
    
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // Expose globally to be re-initialized when dynamic photos load
    window.initGallery = function () {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems.length === 0) return;

        galleryImages = Array.from(galleryItems).map((item, index) => {
            const img = item.querySelector('.gallery-item-img');
            const caption = item.querySelector('.gallery-item-caption');
            return {
                src: img.src,
                alt: img.alt || `Photo ${index + 1}`,
                caption: caption ? caption.textContent : img.alt,
                index: index
            };
        });

        // Add Click & Touch listeners to gallery photo cards
        galleryItems.forEach((item, index) => {
            item.onclick = function (e) {
                e.preventDefault();
                openLightbox(index);
            };
        });

        // Lightbox Control Listeners
        if (closeBtn) closeBtn.onclick = closeLightbox;
        if (prevBtn) prevBtn.onclick = showPrevImage;
        if (nextBtn) nextBtn.onclick = showNextImage;

        // Close on clicking backdrop outside content
        if (lightbox) {
            lightbox.onclick = function (e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            };
        }

        // Global Keyboard Handler
        document.removeEventListener('keydown', handleKeyboard);
        document.addEventListener('keydown', handleKeyboard);

        // Mobile Touch Swipe Handling
        initTouchSwipe();
    };

    function renderThumbnails() {
        if (!lightboxThumbnails) return;
        lightboxThumbnails.innerHTML = '';

        galleryImages.forEach((imgObj, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${imgObj.src}" alt="thumb-${idx}">`;
            thumb.onclick = function () {
                currentImageIndex = idx;
                updateLightboxImage();
            };
            lightboxThumbnails.appendChild(thumb);
        });

        // Auto scroll active thumbnail into view
        const activeThumb = lightboxThumbnails.querySelector('.lightbox-thumb.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function openLightbox(index) {
        if (!lightbox) return;
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        if (galleryImages.length === 0) return;
        const currentImage = galleryImages[currentImageIndex];

        if (lightboxImg) {
            lightboxImg.style.animation = 'none';
            lightboxImg.offsetHeight; // trigger reflow
            lightboxImg.style.animation = 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            lightboxImg.src = currentImage.src;
            lightboxImg.alt = currentImage.alt;
        }

        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        }

        if (lightboxCaption) {
            lightboxCaption.textContent = currentImage.caption || currentImage.alt;
        }

        renderThumbnails();
    }

    function handleKeyboard(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    }

    // Touch Swipe Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    function initTouchSwipe() {
        const content = document.querySelector('.lightbox-content');
        if (!content) return;

        content.ontouchstart = function (e) {
            touchStartX = e.changedTouches[0].screenX;
        };

        content.ontouchend = function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        };
    }

    function handleSwipe() {
        const threshold = 40;
        if (touchEndX < touchStartX - threshold) {
            showNextImage(); // Swiped left -> Next photo
        }
        if (touchEndX > touchStartX + threshold) {
            showPrevImage(); // Swiped right -> Prev photo
        }
    }

})();
