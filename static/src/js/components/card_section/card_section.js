// Card section functionality
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.card-item');
            const productName = card.querySelector('h3').textContent;
            const productPrice = card.querySelector('span').textContent;

            // Add to cart logic here
            console.log(`Added to cart: ${productName} - ${productPrice}`);

            // Visual feedback
            this.textContent = 'ADDED!';
            this.classList.add('bg-green-500');

            setTimeout(() => {
                this.textContent = 'ADD';
                this.classList.remove('bg-green-500');
            }, 2000);
        });
    });
});