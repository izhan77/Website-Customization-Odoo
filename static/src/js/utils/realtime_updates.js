/**
 * Real-time updates for categories and products
 */

class RealtimeUpdates {
    constructor() {
        this.init();
    }

    init() {
        // Listen for Odoo bus notifications
        this.setupBusListener();

        // Alternatively, use polling for simplicity
        this.setupPolling();
    }

    setupBusListener() {
        // This requires Odoo bus service to be properly set up
        console.log('Setting up real-time updates listener...');

        // For simplicity, we'll use polling instead
        // Odoo bus implementation would require additional setup
    }

    setupPolling() {
        // Check for updates every 30 seconds
        setInterval(() => {
            this.checkForCategoryUpdates();
            this.checkForProductUpdates();
        }, 30000);
    }

    async checkForCategoryUpdates() {
        try {
            const response = await fetch('/order-mode/categories/all');
            const data = await response.json();

            if (data.success) {
                const currentCount = window.dynamicMenuLoader
                    ? window.dynamicMenuLoader.categories.length
                    : 0;

                if (data.categories.length > currentCount) {
                    console.log('🔄 New categories detected, refreshing...');
                    if (window.dynamicMenuLoader) {
                        window.dynamicMenuLoader.loadCategories();
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for category updates:', error);
        }
    }

    checkForProductUpdates() {
        // Product updates are handled by the product loader when sections are viewed
        // You could implement specific logic here if needed
    }
}

// Initialize real-time updates
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.realtimeUpdates = new RealtimeUpdates();
    });
} else {
    window.realtimeUpdates = new RealtimeUpdates();
}