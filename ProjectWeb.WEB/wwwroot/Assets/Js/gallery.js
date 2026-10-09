(function () {
    'use strict';

    let currentImageIndex = 0;
    let galleryImages = [];

    function getLightboxElements() {
        return {
            lightbox: document.getElementById('lightbox'),
            lightboxImg: document.getElementById('lightbox-img'),
            lightboxCaption: document.getElementById('lightbox-caption'),
            lightboxCounter: document.getElementById('lightbox-counter'),
            lightboxThumbnails: document.getElementById('lightbox-thumbnails'),
            closeBtn: document.querySelector('.lightbox-close'),
            prevBtn: document.querySelector('.lightbox-prev'),
            nextBtn: document.querySelector('.lightbox-next')
        };
    }

    function populateGalleryImages() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems.length === 0) return [];

        return Array.from(galleryItems).map((item, index) => {
            const img = item.querySelector('.gallery-item-img') || item.querySelector('img');
            const caption = item.querySelector('.gallery-item-caption');
            return {
                src: img ? img.src : '',
                alt: img ? (img.alt || `Photo ${index + 1}`) : `Photo ${index + 1}`,
                caption: caption ? caption.textContent.trim() : (img ? img.alt : ''),
                index: index
            };
        });
    }

    // Expose globally to be re-initialized when dynamic photos load
    window.initGallery = function () {
        galleryImages = populateGalleryImages();
        const els = getLightboxElements();

        // Lightbox Control Listeners
        if (els.closeBtn) els.closeBtn.onclick = closeLightbox;
        if (els.prevBtn) els.prevBtn.onclick = showPrevImage;
        if (els.nextBtn) els.nextBtn.onclick = showNextImage;

        // Close on clicking backdrop outside content
        if (els.lightbox) {
            els.lightbox.onclick = function (e) {
                if (e.target === els.lightbox) {
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
        const els = getLightboxElements();
        if (!els.lightboxThumbnails) return;
        els.lightboxThumbnails.innerHTML = '';

        galleryImages.forEach((imgObj, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${imgObj.src}" alt="thumb-${idx}">`;
            thumb.onclick = function (e) {
                e.stopPropagation();
                currentImageIndex = idx;
                updateLightboxImage();
            };
            els.lightboxThumbnails.appendChild(thumb);
        });

        const activeThumb = els.lightboxThumbnails.querySelector('.lightbox-thumb.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function openLightbox(index) {
        const els = getLightboxElements();
        if (!els.lightbox) return;

        galleryImages = populateGalleryImages();
        if (galleryImages.length === 0) return;

        currentImageIndex = (index >= 0 && index < galleryImages.length) ? index : 0;
        updateLightboxImage();
        els.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const els = getLightboxElements();
        if (!els.lightbox) return;
        els.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        if (galleryImages.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    function showNextImage() {
        if (galleryImages.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        if (galleryImages.length === 0) return;
        const els = getLightboxElements();
        const currentImage = galleryImages[currentImageIndex];

        if (els.lightboxImg) {
            els.lightboxImg.style.animation = 'none';
            void els.lightboxImg.offsetHeight; // trigger reflow
            els.lightboxImg.style.animation = 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            els.lightboxImg.src = currentImage.src;
            els.lightboxImg.alt = currentImage.alt;
        }

        if (els.lightboxCounter) {
            els.lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        }

        if (els.lightboxCaption) {
            els.lightboxCaption.textContent = currentImage.caption || currentImage.alt;
        }

        renderThumbnails();
    }

    function handleKeyboard(e) {
        const els = getLightboxElements();
        if (!els.lightbox || !els.lightbox.classList.contains('active')) return;

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
            showNextImage();
        }
        if (touchEndX > touchStartX + threshold) {
            showPrevImage();
        }
    }

    // Global Delegated Click Listener: Click anywhere on .gallery-item opens lightbox!
    document.addEventListener('click', function (e) {
        const item = e.target.closest('.gallery-item');
        if (item) {
            e.preventDefault();
            const allItems = Array.from(document.querySelectorAll('.gallery-item'));
            const idx = allItems.indexOf(item);
            openLightbox(idx >= 0 ? idx : parseInt(item.getAttribute('data-index') || '0', 10));
        }
    });

    // Expose helpers globally
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;

    // Run initial setup if items are already in DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initGallery);
    } else {
        window.initGallery();
    }
})();
