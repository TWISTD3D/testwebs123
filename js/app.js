// ============================================================
// TIANBIO — INTERACTION LAYER
// 01. Cart Logic (LocalStorage)
// 02. Toast Notifications
// 03. Product Tabs
// 04. Mobile Menu Toggle
// 05. Checkout Validation
// ============================================================


// 01. CART LOGIC ---------------------------------------------

let cart = JSON.parse(localStorage.getItem('tianbio_cart')) || [];

if (!Array.isArray(cart)) {
    cart = [];
}

function saveCart() {
    localStorage.setItem('tianbio_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const counts = document.querySelectorAll('.cart-count');

    const totalItems = cart.reduce((total, item) => {
        return total + Number(item.qty || 1);
    }, 0);

    counts.forEach(count => {
        count.textContent = totalItems;
        count.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function addToCart(name, cat, price) {
    const productPrice = Number(price);

    if (!name || Number.isNaN(productPrice)) {
        console.error('Invalid product information.');
        return;
    }

    const existingItem = cart.find(item => {
        return item.name === name && item.cat === cat;
    });

    if (existingItem) {
        existingItem.qty = Number(existingItem.qty || 1) + 1;
    } else {
        cart.push({
            name: name,
            cat: cat,
            price: productPrice,
            qty: 1
        });
    }

    saveCart();
    updateCartCount();

    showToast(
        'Added to Cart',
        `${name} has been added to your cart.`
    );
}

function removeFromCart(index) {
    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();
    renderCartTable();
    updateCartCount();

    showToast('Removed', 'The item was removed from your cart.');
}

function renderCartTable() {
    const tbody = document.getElementById('cart-tbody');

    if (!tbody) {
        return;
    }

    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="text-align: center; padding: 4rem; color: var(--text-mute);"
                >
                    Your cart is empty.
                    <a href="products.html" style="color: var(--red);">
                        Browse catalog →
                    </a>
                </td>
            </tr>
        `;

        updateCartSummary();
        return;
    }

    tbody.innerHTML = cart.map((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.qty) || 1;
        const itemTotal = price * quantity;

        return `
            <tr>
                <td>
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <svg
                                viewBox="0 0 100 140"
                                width="100%"
                                height="100%"
                            >
                                <rect
                                    x="35"
                                    y="5"
                                    width="30"
                                    height="10"
                                    fill="#1a1a1a"
                                />

                                <rect
                                    x="25"
                                    y="15"
                                    width="50"
                                    height="100"
                                    fill="#2a1004"
                                />

                                <rect
                                    x="20"
                                    y="40"
                                    width="60"
                                    height="50"
                                    fill="#EAEAEA"
                                />

                                <rect
                                    x="24"
                                    y="44"
                                    width="12"
                                    height="12"
                                    fill="#B30000"
                                />

                                <text
                                    x="30"
                                    y="53"
                                    font-family="sans-serif"
                                    font-size="9"
                                    fill="white"
                                    text-anchor="middle"
                                >
                                    天
                                </text>
                            </svg>
                        </div>

                        <div>
                            <div style="font-weight: 500;">
                                ${escapeHTML(item.name)}
                            </div>

                            <div
                                class="mono"
                                style="font-size: 11px; color: var(--text-mute);"
                            >
                                ${escapeHTML(item.cat)}
                            </div>
                        </div>
                    </div>
                </td>

                <td>€${price.toFixed(2)}</td>

                <td>
                    <input
                        type="number"
                        class="qty-input"
                        value="${quantity}"
                        min="1"
                        onchange="updateQty(${index}, this.value)"
                    >
                </td>

                <td>€${itemTotal.toFixed(2)}</td>

                <td>
                    <button
                        type="button"
                        class="icon-btn"
                        onclick="removeFromCart(${index})"
                        aria-label="Remove item"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            width="16"
                            height="16"
                        >
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    updateCartSummary();
}

function updateQty(index, newQty) {
    if (!cart[index]) {
        return;
    }

    let quantity = parseInt(newQty, 10);

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    cart[index].qty = quantity;

    saveCart();
    renderCartTable();
    updateCartCount();
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.qty) || 1;

        return sum + price * quantity;
    }, 0);

    const shipping = cart.length > 0 ? 45.00 : 0.00;
    const total = subtotal + shipping;

    const subElement = document.getElementById('summary-subtotal');
    const shippingElement = document.getElementById('summary-shipping');
    const totalElement = document.getElementById('summary-total');

    if (subElement) {
        subElement.textContent = `€${subtotal.toFixed(2)}`;
    }

    if (shippingElement) {
        shippingElement.textContent = `€${shipping.toFixed(2)}`;
    }

    if (totalElement) {
        totalElement.textContent = `€${total.toFixed(2)}`;
    }
}


// Prevent product names from being interpreted as HTML
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// 02. TOAST NOTIFICATIONS ------------------------------------

function showToast(title, message) {
    const wrapper = document.getElementById('toast-wrap');

    if (!wrapper) {
        return;
    }

    const toast = document.createElement('div');

    toast.className = 'toast';

    toast.innerHTML = `
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(message)}</span>
    `;

    wrapper.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}


// 03. PRODUCT TABS -------------------------------------------

function initTabs() {
    const tabs = document.querySelectorAll('.tab');

    if (tabs.length === 0) {
        return;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = `tab-${tab.dataset.tab}`;
            const selectedContent = document.getElementById(tabId);

            if (!selectedContent) {
                return;
            }

            document.querySelectorAll('.tab').forEach(item => {
                item.classList.remove('active');
            });

            document.querySelectorAll('.tab-content').forEach(item => {
                item.classList.remove('active');
            });

            tab.classList.add('active');
            selectedContent.classList.add('active');
        });
    });
}


// 04. MOBILE MENU TOGGLE -------------------------------------

function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');

        const isOpen = menu.classList.contains('active');

        toggle.setAttribute('aria-expanded', isOpen);
    });
}


// 05. CHECKOUT VALIDATION ------------------------------------

function initCheckout() {
    const form = document.getElementById('checkout-form');

    if (!form) {
        return;
    }

    const ackCheckbox = document.getElementById('ruo_acknowledge');
    const submitButton = document.getElementById('place-order-btn');

    if (!ackCheckbox || !submitButton) {
        return;
    }

    function updateSubmitButton() {
        const isChecked = ackCheckbox.checked;

        submitButton.disabled = !isChecked;
        submitButton.style.opacity = isChecked ? '1' : '0.5';
        submitButton.style.cursor = isChecked
            ? 'pointer'
            : 'not-allowed';
    }

    ackCheckbox.addEventListener('change', updateSubmitButton);

    updateSubmitButton();

    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!ackCheckbox.checked) {
            showToast(
                'Required',
                'Please acknowledge the terms before placing your order.'
            );
            return;
        }

        showToast(
            'Order Placed',
            'Your order has been received. A confirmation has been sent to your institutional email.'
        );

        localStorage.removeItem('tianbio_cart');
        cart = [];

        updateCartCount();

        setTimeout(() => {
            window.location.href = 'account.html';
        }, 1500);
    });
}


// INIT ON DOM READY ------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartTable();
    initTabs();
    initMobileMenu();
    initCheckout();
});
