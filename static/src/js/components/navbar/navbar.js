// Remove odoo.define wrapper - it's causing conflicts in Odoo 18
(function() {
    'use strict';

    let menuInitialized = false;
    let isMenuOpen = false;

    function initMobileMenu() {
        // Prevent multiple initializations
        if (menuInitialized) return;

        console.log('Initializing mobile menu...');

        const mobileMenuButton = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!mobileMenuButton || !mobileMenu) {
            console.log('Mobile menu elements not found, retrying...');
            return false;
        }

        console.log('Mobile menu elements found!');

        // Mark as initialized
        menuInitialized = true;

        // Function to toggle hamburger icon
        function toggleHamburgerIcon(isOpen) {
            const line1 = document.getElementById('menu-line-1');
            const line2 = document.getElementById('menu-line-2');

            if (line1 && line2) {
                if (isOpen) {
                    // Transform to X
                    line1.setAttribute('y1', '12');
                    line1.setAttribute('y2', '12');
                    line1.style.transform = 'rotate(45deg)';

                    line2.setAttribute('y1', '12');
                    line2.setAttribute('y2', '12');
                    line2.style.transform = 'rotate(-45deg)';
                } else {
                    // Transform back to hamburger
                    line1.setAttribute('y1', '9');
                    line1.setAttribute('y2', '9');
                    line1.style.transform = 'rotate(0deg)';

                    line2.setAttribute('y1', '15');
                    line2.setAttribute('y2', '15');
                    line2.style.transform = 'rotate(0deg)';
                }
            }
        }

        // Function to toggle body scroll
        function toggleBodyScroll(lock) {
            if (lock) {
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }
        }

        // Function to open menu
        function openMenu() {
            const currentMenu = document.getElementById('mobile-menu');
            const menuContent = document.getElementById('menu-content-container');

            if (!currentMenu) return;

            console.log('Opening menu');
            isMenuOpen = true;

            // Show overlay
            currentMenu.classList.remove('hidden');
            currentMenu.style.display = 'block';

            // Force reflow
            void currentMenu.offsetWidth;

            // Animate overlay
            currentMenu.classList.add('animate-fadeIn');
            currentMenu.classList.remove('animate-fadeOut');

            // Animate menu content from top
            if (menuContent) {
                console.log('Animating menu content down');
                menuContent.style.transform = 'translateY(0)';
                menuContent.classList.add('menu-open');
            }

            // Lock scroll and transform icon
            toggleBodyScroll(true);
            toggleHamburgerIcon(true);
        }

        // Function to close menu
        function closeMenu() {
            const currentMenu = document.getElementById('mobile-menu');
            const menuContent = document.getElementById('menu-content-container');

            if (!currentMenu) return;

            console.log('Closing menu');
            isMenuOpen = false;

            // Animate menu content back up
            if (menuContent) {
                console.log('Animating menu content up');
                menuContent.style.transform = 'translateY(-100%)';
                menuContent.classList.remove('menu-open');
            }

            // Animate overlay out
            currentMenu.classList.remove('animate-fadeIn');
            currentMenu.classList.add('animate-fadeOut');

            // Hide after animation
            setTimeout(function() {
                if (currentMenu) {
                    currentMenu.classList.add('hidden');
                    currentMenu.style.display = 'none';
                }
            }, 700); // Increased timeout to match menu animation duration

            // Unlock scroll and reset icon
            toggleBodyScroll(false);
            toggleHamburgerIcon(false);
        }

        // Add click event to mobile menu button
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked!');

            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking outside (on overlay)
        document.addEventListener('click', function(e) {
            const currentMenu = document.getElementById('mobile-menu');

            if (currentMenu &&
                isMenuOpen &&
                !e.target.closest('#menu-content-container') &&
                !e.target.closest('#mobile-menu-toggle')) {

                console.log('Closing menu - clicked on overlay');
                closeMenu();
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (isMenuOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                console.log('Closing menu - escape key');
                closeMenu();
            }
        });

        // Close menu when clicking on menu links
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Menu link clicked, closing menu');
                setTimeout(closeMenu, 300); // Small delay for better UX
            });
        });

        console.log('Mobile menu initialized successfully!');
        return true;
    }

    // Multiple initialization strategies for Odoo 18
    function tryInitialize() {
        if (initMobileMenu()) {
            return; // Success, stop trying
        }

        // If elements not found, keep trying
        setTimeout(tryInitialize, 500);
    }

    // Strategy 1: DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, trying to init mobile menu');
            setTimeout(tryInitialize, 100);
        });
    } else {
        // DOM already loaded
        console.log('DOM already loaded, trying to init mobile menu');
        setTimeout(tryInitialize, 100);
    }

    // Strategy 2: Window load (fallback)
    window.addEventListener('load', function() {
        console.log('Window loaded, trying to init mobile menu');
        setTimeout(tryInitialize, 200);
    });

    // Strategy 3: MutationObserver for dynamic content
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'mobile-menu-toggle' ||
                            node.id === 'mobile-menu' ||
                            node.querySelector && node.querySelector('#mobile-menu-toggle')) {
                            console.log('Mobile menu elements detected via mutation observer');
                            setTimeout(tryInitialize, 100);
                        }
                    }
                });
            }
        });
    });

    // Start observing after a short delay
    setTimeout(function() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }, 500);

})();