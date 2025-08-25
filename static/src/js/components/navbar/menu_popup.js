/**
 * Menu Hover Popup Controller - Precise Scrolling Version
 */
(function () {
    'use strict';

    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;

    // --- helpers copied/adapted from your CategoryStripComplete ---
    const NAVBAR_SELECTOR = 'header, .navbar, #main-navbar, nav';

    function getElementTop(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.top + scrollTop;
    }

    function getFixedHeaderHeight() {
        let total = 0;

        // Navbar (only if actually fixed/sticky)
        const navbar = document.querySelector(NAVBAR_SELECTOR);
        if (navbar) {
            const pos = window.getComputedStyle(navbar).position;
            if (pos === 'fixed' || pos === 'sticky') {
                total += navbar.offsetHeight || 0;
            }
        }

        // Category strip — include always (it becomes sticky while scrolling)
        const strip = document.getElementById('category-strip-wrapper');
        if (strip) {
            total += strip.offsetHeight || 0;
        }

        // Small buffer for perfect alignment
        total += 8;
        return total;
    }

    // Two-pass precise scroll (handles layout shifts)
    function scrollPreciselyTo(targetEl) {
        const firstTarget = Math.max(0, Math.round(getElementTop(targetEl) - getFixedHeaderHeight()));
        window.scrollTo({ top: firstTarget, behavior: 'smooth' });

        // second pass correction after animation settles
        setTimeout(() => {
            const corrected = Math.max(0, Math.round(getElementTop(targetEl) - getFixedHeaderHeight()));
            if (Math.abs(window.pageYOffset - corrected) > 2) {
                // no smooth here to avoid elastic overshoot
                window.scrollTo({ top: corrected });
            }
        }, 420);
    }
    // --- end helpers ---

    function initMenuPopup() {
        if (menuPopupInitialized) return;

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');
        const navbar = document.querySelector(NAVBAR_SELECTOR);

        if (!menuTrigger || !menuPopup) {
            return false;
        }

        menuPopupInitialized = true;

        function updatePopupPosition() {
            if (!navbar) return;
            const navbarHeight = navbar.offsetHeight || 80;
            menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
            menuPopup.classList.add('positioned');
        }

        function showPopup() {
            clearTimeout(hideTimeout);
            isMouseOverTrigger = true;
            updatePopupPosition();
            menuPopup.classList.add('show');
        }

        function hidePopup() {
            clearTimeout(hoverTimeout);
            if (!isMouseOverPopup && !isMouseOverTrigger) {
                menuPopup.classList.remove('show');
            }
        }

        // Hover handling
        menuTrigger.addEventListener('mouseenter', function () {
            isMouseOverTrigger = true;
            clearTimeout(hideTimeout);
            hoverTimeout = setTimeout(showPopup, 100);
        });

        menuTrigger.addEventListener('mouseleave', function () {
            isMouseOverTrigger = false;
            clearTimeout(hoverTimeout);
            hideTimeout = setTimeout(hidePopup, 200);
        });

        menuPopup.addEventListener('mouseenter', function () {
            isMouseOverPopup = true;
            clearTimeout(hideTimeout);
        });

        menuPopup.addEventListener('mouseleave', function () {
            isMouseOverPopup = false;
            hideTimeout = setTimeout(hidePopup, 150);
        });

        // Clicks on popup items -> precise scroll
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach(item => {
            item.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                e.preventDefault();

                // Close popup before measuring heights
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;

                const targetId = href.slice(1);
                const targetElement = document.getElementById(targetId);
                if (!targetElement) return;

                // precise scroll
                scrollPreciselyTo(targetElement);

                // update active state on the strip (support both names you used)
                setTimeout(() => {
                    const catItem = document.querySelector(`.category-item[href="${href}"]`);
                    if (catItem) {
                        if (window.categoryStripComplete && typeof window.categoryStripComplete.setActiveCategory === 'function') {
                            window.categoryStripComplete.setActiveCategory(catItem);
                        } else if (window.categoryStripMain && typeof window.categoryStripMain.setActiveCategory === 'function') {
                            window.categoryStripMain.setActiveCategory(catItem);
                        }
                    }
                }, 120);

                // update URL after scroll
                setTimeout(() => {
                    history.replaceState(null, '', `#${targetId}`);
                }, 600);
            });
        });

        // Close behaviors
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        window.addEventListener('scroll', function () {
            if (menuPopup.classList.contains('show')) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        window.addEventListener('resize', updatePopupPosition);
        setTimeout(updatePopupPosition, 100);

        return true;
    }

    function tryInitialize() {
        if (initMenuPopup()) return;
        setTimeout(tryInitialize, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInitialize, 100));
    } else {
        setTimeout(tryInitialize, 100);
    }

    window.addEventListener('load', () => setTimeout(tryInitialize, 200));
})();
