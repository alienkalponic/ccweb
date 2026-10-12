/* ============================================================
   GLOBAL CONFIRMATION DIALOG  —  confirm-dialog.js
   Climbers Circle Admin Panel

   Usage:
     showConfirmDialog({
       title   : 'Custom title',          // optional
       message : 'Custom message here',   // optional
       onYes   : function() { ... },      // called on YES
       onNo    : function() { ... }       // called on NO (optional)
     });
   ============================================================ */
(function () {
    'use strict';

    var _overlay = null;
    var _yesBtn = null;
    var _noBtn = null;
    var _msgEl = null;
    var _titleEl = null;
    var _onYesCb = null;
    var _onNoCb = null;

    function _init() {
        _overlay = document.getElementById('ccConfirmOverlay');
        _yesBtn = document.getElementById('ccBtnYes');
        _noBtn = document.getElementById('ccBtnNo');
        _msgEl = document.getElementById('ccConfirmMessage');
        _titleEl = document.getElementById('ccConfirmTitle');

        if (!_overlay) return;

        // NO button — close
        _noBtn.addEventListener('click', function () {
            _close();
            if (typeof _onNoCb === 'function') _onNoCb();
        });

        // YES button — fire callback
        _yesBtn.addEventListener('click', function () {
            if (_yesBtn.disabled) return;
            if (typeof _onYesCb === 'function') _onYesCb();
        });

        // Click outside card → close
        _overlay.addEventListener('click', function (e) {
            if (e.target === _overlay) {
                _close();
                if (typeof _onNoCb === 'function') _onNoCb();
            }
        });

        // ESC key → close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && _overlay.classList.contains('cc-active')) {
                _close();
                if (typeof _onNoCb === 'function') _onNoCb();
            }
        });
    }

    function _open() {
        _overlay.classList.add('cc-active');
        document.body.style.overflow = 'hidden';
    }

    function _close() {
        _overlay.classList.remove('cc-active');
        document.body.style.overflow = '';
        _yesBtn.disabled = false;
        _yesBtn.innerHTML = '<i class="fa fa-check"></i> Yes, Delete';
    }

    /**
     * Public API
     * @param {object} options - { title, message, onYes, onNo }
     */
    window.showConfirmDialog = function (options) {
        options = options || {};

        if (!_overlay) {
            document.addEventListener('DOMContentLoaded', function () {
                _init();
                window.showConfirmDialog(options);
            });
            return;
        }

        _onYesCb = options.onYes || null;
        _onNoCb = options.onNo || null;

        if (_titleEl) _titleEl.textContent = options.title || 'Are you sure?';
        if (_msgEl) _msgEl.textContent = options.message || 'If you want this file delete?';

        _open();
    };

    /**
     * Set loading state on the YES button during async operations.
     * @param {boolean} loading
     */
    window.ccConfirmSetLoading = function (loading) {
        if (!_yesBtn) return;
        if (loading) {
            _yesBtn.disabled = true;
            _yesBtn.innerHTML = '<span class="cc-spinner"></span> Deleting...';
        } else {
            _yesBtn.disabled = false;
            _yesBtn.innerHTML = '<i class="fa fa-check"></i> Yes, Delete';
        }
    };

    /** Programmatically close the dialog. */
    window.ccConfirmClose = function () {
        if (_overlay) _close();
    };

    // Initialise once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }
}());
