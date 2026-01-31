// Gallery Lightbox JavaScript
// Handles image viewing, navigation, and keyboard controls

(function() {
    'use strict';

    // Gallery state
    let currentImageIndex = 0;
    let galleryImages = [];
    
    // DOM elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // Initialize gallery
    function initGallery() {
        // Get all gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        if (galleryItems.length === 0) {
            return; // No gallery items found
        }

        // Store image data
        galleryImages = Array.from(galleryItems).map((item, index) => {
            const img = item.querySelector('.gallery-item-img');
            return {
                src: img.src,
                alt: img.alt,
                index: index
            };
        });

        // Add click event to each gallery item
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        });

        // Add event listeners for navigation
        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', showPrevImage);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', showNextImage);
        }

        // Close lightbox when clicking outside the image
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        if (lightbox) {
            lightbox.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);

            lightbox.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, false);
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next image
                    showNextImage();
                } else {
                    // Swipe right - previous image
                    showPrevImage();
                }
            }
        }
    }

    // Open lightbox with specific image
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Show previous image
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    // Show next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    // Update lightbox image
    function updateLightboxImage() {
        const currentImage = galleryImages[currentImageIndex];
        
        if (lightboxImg) {
            lightboxImg.src = currentImage.src;
            lightboxImg.alt = currentImage.alt;
        }

        if (lightboxCaption) {
            lightboxCaption.textContent = currentImage.alt;
        }

        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        }
    }

    // Handle keyboard navigation
    function handleKeyboard(e) {
        if (!lightbox.classList.contains('active')) {
            return;
        }

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }

    // Preload adjacent images for smooth navigation
    function preloadAdjacentImages() {
        const prevIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        const nextIndex = (currentImageIndex + 1) % galleryImages.length;

        const prevImg = new Image();
        prevImg.src = galleryImages[prevIndex].src;

        const nextImg = new Image();
        nextImg.src = galleryImages[nextIndex].src;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGallery);
    } else {
        initGallery();
    }

})();
