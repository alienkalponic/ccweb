/**
 * Global Loader Controller
 * Handles display and hiding of the full-screen overlay loader.
 * Supports multiple concurrent calls safe-guarding.
 */

const GlobalLoader = (function () {
    // Private variables
    let activeRequests = 0;
    let loaderElement = null;

    // Initialize loader reference
    function init() {
        if (!loaderElement) {
            loaderElement = document.getElementById('globalLoader');
        }
    }

    /**
     * Shows the global loader.
     * Increments active request count to handle concurrent specific operations.
     */
    function show() {
        init();
        activeRequests++;
        if (loaderElement && activeRequests > 0) {
            loaderElement.classList.add('active');
            // Prevent body scroll when loader is active
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hides the global loader.
     * Decrements active request count. Only hides if count reaches 0.
     * @param {boolean} force - Optional. If true, forces the loader to hide regardless of count.
     */
    function hide(force = false) {
        init();
        if (activeRequests > 0) {
            activeRequests--;
        }

        if (force) {
            activeRequests = 0;
        }

        if (loaderElement && activeRequests <= 0) {
            // Slight delay to ensure smooth transition prevents flickering on fast updates
            setTimeout(() => {
                if (activeRequests <= 0) {
                    loaderElement.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scroll
                    activeRequests = 0; // Reset safe guard
                }
            }, 300);
        }
    }

    return {
        show: show,
        hide: hide
    };
})();

// Expose global shorthand functions for ease of use
window.showLoader = GlobalLoader.show;
window.hideLoader = GlobalLoader.hide;
