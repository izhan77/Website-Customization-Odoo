// Add this debug code to identify what's causing the blue shadow
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu popup debug mode activated');

    const menuItems = document.querySelectorAll('.menu-popup-item');

    menuItems.forEach(item => {
        // Monitor for any class changes that might cause blue shadow
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    console.log('Class changed:', mutation.target.className);

                    // If blue classes are detected, remove them
                    if (mutation.target.className.includes('blue') ||
                        mutation.target.className.includes('shadow') ||
                        mutation.target.className.includes('bg-') &&
                        !mutation.target.className.includes('bg-white') &&
                        !mutation.target.className.includes('bg-gray')) {

                        console.log('Removing problematic classes');
                        mutation.target.className = mutation.target.className
                            .replace(/blue|shadow|bg-\w+/g, '')
                            .trim();
                    }
                }
            });
        });

        // Start observing class changes
        observer.observe(item, { attributes: true, attributeFilter: ['class'] });

        // Also monitor the card inside
        const card = item.querySelector('.menu-popup-card');
        if (card) {
            observer.observe(card, { attributes: true, attributeFilter: ['class'] });
        }
    });

    // Clean up any inline styles that might be causing issues
    setTimeout(function() {
        document.querySelectorAll('#menu-categories-popup [style*="blue"], #menu-categories-popup [style*="shadow"]').forEach(el => {
            el.style.removeProperty('background-color');
            el.style.removeProperty('box-shadow');
            el.style.removeProperty('filter');
        });
    }, 1000);
});

/**
 * Menu Hover Popup Controller - Enhanced Version with Beautiful Cards
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

            // Add stagger animation for cards
            const cards = menuPopup.querySelectorAll('.menu-popup-item');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.05}s`;
                card.style.animation = 'none';
                card.offsetHeight; // trigger reflow
                card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            });
        }

        function hidePopup() {
            clearTimeout(hoverTimeout);
            if (!isMouseOverPopup && !isMouseOverTrigger) {
                menuPopup.classList.remove('show');

                // Reset card animations
                const cards = menuPopup.querySelectorAll('.menu-popup-item');
                cards.forEach(card => {
                    card.style.animation = '';
                    card.style.animationDelay = '';
                });
            }
        }

        // Hover handling with improved UX
        menuTrigger.addEventListener('mouseenter', function () {
            isMouseOverTrigger = true;
            clearTimeout(hideTimeout);
            hoverTimeout = setTimeout(showPopup, 150);
        });

        menuTrigger.addEventListener('mouseleave', function () {
            isMouseOverTrigger = false;
            clearTimeout(hoverTimeout);
            hideTimeout = setTimeout(hidePopup, 300);
        });

        menuPopup.addEventListener('mouseenter', function () {
            isMouseOverPopup = true;
            clearTimeout(hideTimeout);
        });

        menuPopup.addEventListener('mouseleave', function () {
            isMouseOverPopup = false;
            hideTimeout = setTimeout(hidePopup, 200);
        });

        // Enhanced click handling with smooth animations
        const popupItems = menuPopup.querySelectorAll('.menu-popup-item');
        popupItems.forEach(item => {
            // Add click animation
            item.addEventListener('mousedown', function() {
                const card = this.querySelector('.menu-popup-card');
                if (card) {
                    card.style.transform = 'translateY(-2px) scale(0.95)';
                }
            });

            item.addEventListener('mouseup', function() {
                const card = this.querySelector('.menu-popup-card');
                if (card) {
                    card.style.transform = '';
                }
            });

            item.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (!href || !href.startsWith('#')) return;

                e.preventDefault();

                // Visual feedback on click
                const card = this.querySelector('.menu-popup-card');
                if (card) {
                    card.style.transform = 'translateY(-2px) scale(0.95)';
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 150);
                }

                // Close popup with fade out effect
                menuPopup.style.transition = 'all 0.3s ease-out';
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;

                // Reset popup transition after animation
                setTimeout(() => {
                    menuPopup.style.transition = '';
                }, 300);

                const targetId = href.slice(1);
                const targetElement = document.getElementById(targetId);
                if (!targetElement) return;

                // Small delay before scrolling for better UX
                setTimeout(() => {
                    scrollPreciselyTo(targetElement);
                }, 100);

                // Update active state on the strip with delay
                setTimeout(() => {
                    const catItem = document.querySelector(`.category-item[href="${href}"]`);
                    if (catItem) {
                        if (window.categoryStripComplete && typeof window.categoryStripComplete.setActiveCategory === 'function') {
                            window.categoryStripComplete.setActiveCategory(catItem);
                        } else if (window.categoryStripMain && typeof window.categoryStripMain.setActiveCategory === 'function') {
                            window.categoryStripMain.setActiveCategory(catItem);
                        }
                    }
                }, 200);

                // Update URL after scroll completes
                setTimeout(() => {
                    history.replaceState(null, '', `#${targetId}`);
                }, 800);
            });
        });

        // Enhanced close behaviors
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                menuPopup.classList.remove('show');
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Close on scroll with smooth transition
        let scrollTimeout;
        window.addEventListener('scroll', function () {
            if (menuPopup.classList.contains('show')) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    menuPopup.classList.remove('show');
                    isMouseOverPopup = false;
                    isMouseOverTrigger = false;
                }, 100);
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

        // Add CSS animations for card entrance
        if (!document.getElementById('menu-popup-animations')) {
            const style = document.createElement('style');
            style.id = 'menu-popup-animations';
            style.textContent = `
                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .menu-popup-item {
                    opacity: 0;
                    transform: translateY(20px);
                }

                .menu-categories-popup.show .menu-popup-item {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }

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