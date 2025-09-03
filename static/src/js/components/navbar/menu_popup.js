/** @odoo-module **/

/**
 * Menu Popup Controller - Simplified with unified scrolling
 * File: /website_customizations/static/src/js/components/navbar/menu_popup.js
 */
(function () {
    'use strict';

    // ================================= STATE & CONFIGURATION =================================
    let menuPopupInitialized = false;
    let hoverTimeout = null;
    let hideTimeout = null;
    let isMouseOverPopup = false;
    let isMouseOverTrigger = false;

    // Constants
    const NAVBAR_SELECTOR = 'header, .navbar, #main-navbar, nav';
    const HOVER_DELAY = 150;
    const HIDE_DELAY = 300;

    // ================================= POPUP MANAGEMENT =================================

    function updatePopupPosition() {
        const menuPopup = document.getElementById('menu-categories-popup');
        const navbar = document.querySelector(NAVBAR_SELECTOR);

        if (!menuPopup || !navbar) return;

        const navbarHeight = navbar.offsetHeight || 80;
        menuPopup.style.setProperty('--navbar-height', navbarHeight + 'px');
        menuPopup.classList.add('positioned');

        console.log(`Menu popup positioned below navbar at height: ${navbarHeight}px`);
    }

    function showPopup() {
        // Don't show if scrolling is in progress
        if (window.isAnyScrollingInProgress) return;

        clearTimeout(hideTimeout);
        isMouseOverTrigger = true;
        updatePopupPosition();

        const menuPopup = document.getElementById('menu-categories-popup');
        if (!menuPopup) return;

        menuPopup.classList.add('show');
        console.log('Menu popup shown below navbar');

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
            const menuPopup = document.getElementById('menu-categories-popup');
            if (menuPopup) {
                menuPopup.classList.remove('show');
                console.log('Menu popup hidden');

                // Reset card animations
                const cards = menuPopup.querySelectorAll('.menu-popup-item');
                cards.forEach(card => {
                    card.style.animation = '';
                    card.style.animationDelay = '';
                });
            }
        }
    }

    // ================================= EVENT HANDLERS =================================

    function initMenuPopup() {
        if (menuPopupInitialized) return true;

        const menuTrigger = document.getElementById('menu-hover-trigger');
        const menuPopup = document.getElementById('menu-categories-popup');

        if (!menuTrigger || !menuPopup) {
            console.log('Menu elements not found, retrying...');
            return false;
        }

        console.log('Initializing menu popup system');
        menuPopupInitialized = true;

        // Desktop hover handling
        menuTrigger.addEventListener('mouseenter', function () {
            console.log('Menu trigger hovered');
            isMouseOverTrigger = true;
            clearTimeout(hideTimeout);
            hoverTimeout = setTimeout(showPopup, HOVER_DELAY);
        });

        menuTrigger.addEventListener('mouseleave', function () {
            console.log('Menu trigger left');
            isMouseOverTrigger = false;
            clearTimeout(hoverTimeout);
            hideTimeout = setTimeout(hidePopup, HIDE_DELAY);
        });

        menuPopup.addEventListener('mouseenter', function () {
            console.log('Menu popup entered');
            isMouseOverPopup = true;
            clearTimeout(hideTimeout);
        });

        menuPopup.addEventListener('mouseleave', function () {
            console.log('Menu popup left');
            isMouseOverPopup = false;
            hideTimeout = setTimeout(hidePopup, 200);
        });

        // ADD THIS: Prevent menu link navigation on checkout page
    menuTrigger.addEventListener('click', function (e) {
        // If on checkout page, prevent default navigation
        if (window.location.pathname.includes('/checkout')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu click prevented on checkout page');
        }
    });

        // Global close handlers
        document.addEventListener('click', function (e) {
            if (!menuTrigger.contains(e.target) && !menuPopup.contains(e.target)) {
                hidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });

        // Close on scroll
        window.addEventListener('scroll', function () {
            if (!window.isAnyScrollingInProgress && menuPopup.classList.contains('show')) {
                setTimeout(() => {
                    if (!window.isAnyScrollingInProgress) {
                        hidePopup();
                        isMouseOverPopup = false;
                        isMouseOverTrigger = false;
                    }
                }, 50);
            }
        }, { passive: true });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                hidePopup();
                isMouseOverPopup = false;
                isMouseOverTrigger = false;
            }
        });


        // Update position on resize
        window.addEventListener('resize', updatePopupPosition);
        setTimeout(updatePopupPosition, 100);

        // Add CSS animations
        addMenuPopupAnimations();

        console.log('Menu popup system initialized successfully!');
        return true;
    }

    function addMenuPopupAnimations() {
        if (document.getElementById('menu-popup-animations')) return;

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

    // ================================= INITIALIZATION =================================

    function tryInitialize() {
        if (initMenuPopup()) return;
        setTimeout(tryInitialize, 500);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInitialize, 100));
    } else {
        setTimeout(tryInitialize, 100);
    }

    window.addEventListener('load', () => setTimeout(tryInitialize, 200));

})();