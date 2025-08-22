// Category Strip Navigation and Section Scrolling
(function() {
    'use strict';

    function initCategoryNavigation() {
        console.log('Initializing category strip navigation...');

        const categoryItems = document.querySelectorAll('.category-item');

        if (!categoryItems.length) {
            console.log('Category items not found, retrying...');
            return false;
        }

        // Section mapping - adjust these IDs to match your actual sections
        const sectionMapping = {
            'rice-box': 'rice-box-section',
            'ala-delivery-box': 'ala-delivery-box-section',
            'hadiya-premium-box': 'hadiya-premium-box-section',
            'turkish-feast': 'turkish-feast-section',
            'ronaq-e-dastarkhwan': 'ronaq-e-dastarkhwan-section',
            'new-arrivals': 'new-arrivals-section',
            'soups-and-salads': 'soups-and-salads-section',
            'cold-drinks': 'cold-drinks-section',
            'hot-beverages': 'hot-beverages-section',
            'desserts': 'desserts-section'
        };

        // Get navbar and category strip heights for offset calculation
        function getScrollOffset() {
            const navbar = document.querySelector('.custom-navbar') || document.querySelector('header');
            const categoryStrip = document.getElementById('category-strip-wrapper');

            let offset = 20; // Base offset

            if (navbar) {
                offset += navbar.offsetHeight;
            }

            if (categoryStrip && categoryStrip.classList.contains('sticky')) {
                offset += categoryStrip.offsetHeight;
            }

            console.log('Scroll offset:', offset);
            return offset;
        }

        // Smooth scroll to section
        function scrollToSection(sectionId) {
            console.log('Scrolling to section:', sectionId);

            // First try to find by exact ID
            let targetElement = document.getElementById(sectionId);

            // If not found, try to find by data attribute or class
            if (!targetElement) {
                targetElement = document.querySelector(`[data-section="${sectionId}"]`);
            }

            // If still not found, try to find by class
            if (!targetElement) {
                targetElement = document.querySelector(`.${sectionId}`);
            }

            // If still not found, try to find a section containing the keyword
            if (!targetElement) {
                const possibleSelectors = [
                    `section[id*="${sectionId}"]`,
                    `div[id*="${