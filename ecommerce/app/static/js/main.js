document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Quantity increment/decrement on product page
    if (document.getElementById('quantity-input')) {
        setupQuantityButtons();
    }

    // Setup add to cart form submission
    if (document.getElementById('add-to-cart-form')) {
        setupAddToCartForm();
    }

    // Setup remove from cart buttons
    setupRemoveFromCartButtons();
    
    // Update cart count on page load
    updateCartCountFromServer();
    
    // Add animations to product cards
    animateProductCards();
    
    // Setup category filters if they exist
    setupCategoryFilters();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Add newsletter form handler
    setupNewsletterForm();
});

function setupQuantityButtons() {
    const quantityInput = document.getElementById('quantity-input');
    const incrementBtn = document.getElementById('increment-btn');
    const decrementBtn = document.getElementById('decrement-btn');

    if (incrementBtn && decrementBtn && quantityInput) {
        incrementBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value, 10);
            if (!isNaN(currentValue)) {
                quantityInput.value = currentValue + 1;
            }
        });

        decrementBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value, 10);
            if (!isNaN(currentValue) && currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
}

function setupAddToCartForm() {
    const form = document.getElementById('add-to-cart-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = form.getAttribute('data-product-id');
        const quantity = document.getElementById('quantity-input').value;
        const addButton = form.querySelector('button[type="submit"]');
        
        // Change button state
        const originalText = addButton.innerHTML;
        addButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Adding...';
        addButton.disabled = true;
        
        fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Product added to cart!', 'success');
                updateCartCount(data.cart_count);
                
                // Add a nice animation to the cart icon
                animateCartIcon();
            } else {
                showToast(data.message || 'Failed to add product to cart.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            showToast('An error occurred. Please try again.', 'danger');
        })
        .finally(() => {
            // Restore button state
            setTimeout(() => {
                addButton.innerHTML = originalText;
                addButton.disabled = false;
            }, 500);
        });
    });
}

function setupRemoveFromCartButtons() {
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            const cartItem = this.closest('.cart-item');
            
            if (cartItem) {
                cartItem.style.opacity = '0.5';
            }
            
            fetch(`/cart/remove/${productId}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (cartItem) {
                        cartItem.style.height = cartItem.offsetHeight + 'px';
                        setTimeout(() => {
                            cartItem.style.height = '0';
                            cartItem.style.margin = '0';
                            cartItem.style.padding = '0';
                            cartItem.style.overflow = 'hidden';
                            
                            setTimeout(() => {
                                cartItem.remove();
                                updateCartTotal(data.cart_total);
                                updateCartCount(data.cart_count);
                                
                                if (data.cart_count === 0) {
                                    const cartItemsContainer = document.querySelector('.cart-items');
                                    if (cartItemsContainer) {
                                        cartItemsContainer.innerHTML = '<div class="text-center my-5"><i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i><p>Your cart is empty</p><a href="/products" class="btn btn-primary">Continue Shopping</a></div>';
                                    }
                                    const cartSummary = document.querySelector('.cart-summary');
                                    if (cartSummary) {
                                        cartSummary.style.display = 'none';
                                    }
                                }
                            }, 300);
                        }, 10);
                    }
                    
                    showToast('Product removed from cart!', 'success');
                } else {
                    if (cartItem) {
                        cartItem.style.opacity = '1';
                    }
                    showToast(data.message || 'Failed to remove product from cart.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error removing from cart:', error);
                if (cartItem) {
                    cartItem.style.opacity = '1';
                }
                showToast('An error occurred. Please try again.', 'danger');
            });
        });
    });
}

function updateCartCountFromServer() {
    fetch('/cart/count', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount(data.cart_count);
        }
    })
    .catch(error => {
        console.error('Error fetching cart count:', error);
    });
}

function updateCartCount(count) {
    const cartCountElem = document.getElementById('cart-count');
    if (cartCountElem) {
        cartCountElem.textContent = count;
        if (count > 0) {
            cartCountElem.style.display = 'inline-block';
        } else {
            cartCountElem.style.display = 'none';
        }
    }
}

function updateCartTotal(total) {
    const cartTotalElem = document.getElementById('cart-total');
    if (cartTotalElem) {
        cartTotalElem.textContent = '$' + parseFloat(total).toFixed(2);
    }
}

function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toast-container';
        newContainer.className = 'position-fixed bottom-0 end-0 p-3';
        newContainer.style.zIndex = '1050';
        document.body.appendChild(newContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.nav-link [class*="fa-shopping-cart"]');
    if (cartIcon) {
        cartIcon.classList.add('fa-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('fa-bounce');
        }, 1000);
    }
}

function animateProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length > 0) {
        productCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });
    }
}

function setupCategoryFilters() {
    const categoryPills = document.querySelectorAll('.category-pill');
    if (categoryPills.length > 0) {
        categoryPills.forEach(pill => {
            pill.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active state
                document.querySelectorAll('.category-pill').forEach(p => {
                    p.classList.remove('active');
                });
                this.classList.add('active');
                
                // Filter products
                const products = document.querySelectorAll('.product-card');
                products.forEach(product => {
                    const productCategory = product.getAttribute('data-category');
                    
                    if (category === 'all' || productCategory === category) {
                        product.style.display = 'block';
                        setTimeout(() => {
                            product.style.opacity = '1';
                            product.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        product.style.opacity = '0';
                        product.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            product.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
}

function addScrollAnimations() {
    // Fade in elements as they scroll into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in-element');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            if (elementPosition < screenPosition - 100) {
                element.classList.add('active');
            }
        });
    };
    
    // Add the class to elements we want to animate
    document.querySelectorAll('.hero h1, .hero p, .hero .btn, .section-title, .admin-card').forEach(el => {
        el.classList.add('fade-in-element');
    });
    
    // Initial check on page load
    setTimeout(animateOnScroll, 300);
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
}

function setupNewsletterForm() {
    const newsletterForms = document.querySelectorAll('form.newsletter-form, footer .input-group');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const submitBtn = form.querySelector('button[type="submit"], button');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                submitBtn.disabled = true;
                
                // Simulate subscription (replace with actual API call)
                setTimeout(() => {
                    showToast('Thanks for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1000);
            } else {
                showToast('Please enter a valid email address', 'warning');
            }
        });
    });
} 