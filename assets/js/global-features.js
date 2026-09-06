/**
 * Stackly Global Features
 * Handles Cart, Wishlist, Quick View, Mobile Menu, and Global Events.
 */

// Since this script is loaded at the bottom of <body>, the DOM is already ready.
// We run init immediately, with DOMContentLoaded as a safety net.
let globalFeaturesInitialized = false;

function initGlobalFeatures() {
    if (globalFeaturesInitialized) return;
    globalFeaturesInitialized = true;
    injectGlobalHTML();
    initMobileMenu();
    if (window.CartManager && window.CartManager.init) window.CartManager.init();
    if (window.WishlistManager && window.WishlistManager.init) window.WishlistManager.init();
    setupGlobalEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalFeatures);
} else {
    initGlobalFeatures();
}


function injectGlobalHTML() {
    // Inject Quick View Modal if not exists
    if (!document.getElementById('quickViewOverlay')) {
        const qvHTML = `
        <div class="qv-overlay" id="quickViewOverlay">
            <div class="qv-modal advanced-qv" id="quickViewModal">
                <button class="qv-close" id="qvClose"><i class="fa-solid fa-xmark"></i></button>
                <div class="qv-grid">
                    <div class="qv-img-container">
                        <img id="qvImage" src="" alt="Product">
                        <span class="qv-badge">In Stock</span>
                    </div>
                    <div class="qv-details">
                        <div class="qv-rating" id="qvRating">4.8 <i class="fa-solid fa-star"></i> (124 Reviews)</div>
                        <h2 id="qvTitle">Product Name</h2>
                        <h3 id="qvPrice">$0.00</h3>
                        <p class="qv-desc" id="qvDesc">Description</p>
                        <div class="qv-actions-row">
                            <div class="qv-qty">
                                <button id="qvQtyDec">-</button>
                                <input type="number" id="qvQtyInput" value="1" min="1">
                                <button id="qvQtyInc">+</button>
                            </div>
                            <button class="btn btn-primary" id="qvCartBtn" style="flex:1;">Add to Cart</button>
                            <button class="btn btn-buy" id="qvBuyBtn" style="flex:1; margin-left: 10px;">Buy Now</button>
                            <button class="btn btn-secondary qv-wish-btn" id="qvWishBtn" title="Add to Wishlist"><i class="fa-regular fa-heart"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', qvHTML);
    }
}

function initMobileMenu() {
    const btn    = document.querySelector('.mobile-menu-btn');
    const menu   = document.querySelector('.nav-links');
    if (!btn || !menu) return;
    if (btn._menuWired) return;
    btn._menuWired = true;

    /* ---- Create overlay once ---- */
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    /* ---- Helpers ---- */
    const isOpen = () => menu.classList.contains('active');

    const open = () => {
        menu.classList.add('active');
        overlay.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        // Lock body scroll — simple and reliable
        document.body.style.overflow = 'hidden';
        // document.body.style.height = '100vh'; // can cause layout shifts on mobile
        document.body.style.touchAction = 'none'; // prevent touch scroll
        
        // Prevent touchmove on document while open to ensure scrolling is fully locked on mobile
        document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    };

    const close = () => {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        // Restore body scroll
        document.body.style.overflow = '';
        // document.body.style.height = '';
        document.body.style.touchAction = '';
        
        document.removeEventListener('touchmove', preventTouchScroll, { passive: false });
    };

    const preventTouchScroll = (e) => {
        // Only prevent default if we're not touching the menu itself
        if (!menu.contains(e.target)) {
            e.preventDefault();
        }
    };

    /* ---- Toggle on hamburger click ---- */
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen() ? close() : open();
    });

    /* ---- Close on overlay click ---- */
    overlay.addEventListener('click', close);

    /* ---- Close on ESC ---- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) close();
    });

    /* ---- Handle nav link clicks ---- */
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';

            if (href.startsWith('#') && href !== '#') {
                /* Anchor on same page — scroll smoothly */
                e.preventDefault();
                close();
                const target = document.getElementById(href.slice(1));
                if (target) {
                    setTimeout(() => {
                        const offset = document.querySelector('header')?.offsetHeight || 80;
                        const top = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }, 320); // wait for menu close animation
                }
            } else if (href === '#') {
                e.preventDefault();
                close();
            } else {
                /* External page — let the browser navigate immediately. Just close the menu. */
                close();
            }

            /* Active state highlight */
            menu.querySelectorAll('a').forEach(a => a.classList.remove('nav-active'));
            link.classList.add('nav-active');
        });
    });

    /* ---- Highlight active link based on current page ---- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a').forEach(link => {
        const linkPage = (link.getAttribute('href') || '').split('/').pop();
        if (linkPage === currentPage && linkPage !== '') {
            link.classList.add('nav-active');
        }
    });
}

// Global Managers
window.CartManager = {
    getCart() { return JSON.parse(localStorage.getItem('Stackly_cart')) || []; },
    saveCart(cart) { 
        localStorage.setItem('Stackly_cart', JSON.stringify(cart)); 
        this.updateCartCount(); 
        window.dispatchEvent(new Event('cartUpdated'));
    },
    addItem(item) {
        const cart = this.getCart();
        const existing = cart.find(i => i.id === item.id);
        if (existing) existing.qty += (item.qty || 1);
        else cart.push({ ...item, qty: item.qty || 1 });
        this.saveCart(cart);
        this.showToast(item.name + ' added to cart!', 'success');
    },
    removeItem(id) {
        const cart = this.getCart().filter(i => i.id !== id);
        this.saveCart(cart);
    },
    clearCart() {
        this.saveCart([]);
    },
    updateCartCount() {
        const cart = this.getCart();
        const count = cart.reduce((total, item) => total + item.qty, 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    },
    showToast(message, type = 'success') {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; color: #fff; padding: 15px 25px; border-radius: 4px; z-index: 9999; transform: translateY(100px); opacity: 0; transition: all 0.3s ease; font-family: var(--font-body); pointer-events: none;';
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'success' ? 'var(--color-success, #2e8b57)' : 'var(--color-black)';
        toast.innerText = message;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0'; }, 3000);
    },
    init() { this.updateCartCount(); }
};

window.WishlistManager = {
    getItems() { return JSON.parse(localStorage.getItem('Stackly_wishlist')) || []; },
    saveItems(items) { 
        localStorage.setItem('Stackly_wishlist', JSON.stringify(items)); 
        this.updateCount(); 
    },
    hasItem(id) {
        return this.getItems().some(i => i.id === id);
    },
    addItem(item) {
        const items = this.getItems();
        if (!this.hasItem(item.id)) { 
            items.push(item); 
            this.saveItems(items); 
            window.CartManager.showToast(item.name + ' added to wishlist!');
        }
    },
    removeItem(id) {
        this.saveItems(this.getItems().filter(i => i.id !== id));
        window.CartManager.showToast('Item removed from wishlist!');
    },
    updateCount() {
        const count = this.getItems().length;
        document.querySelectorAll('.wish-badge, .wishlist-count').forEach(badge => {
            badge.innerText = count;
            if(badge.classList.contains('wish-badge')) {
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    },
    init() { this.updateCount(); }
};

window.QuickViewManager = {
    open(card) {
        const overlay = document.getElementById('quickViewOverlay');
        if (!overlay) return;
        
        const img = card.dataset.img || card.querySelector('img')?.src || '';
        const name = card.dataset.name || card.querySelector('h3')?.innerText || 'Product';
        let priceStr = card.dataset.price || '$0.00';
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
        const desc = card.dataset.desc || 'A premium beauty product.';
        const rating = card.dataset.rating || '5.0';
        const reviews = card.dataset.reviews || '0';
        const id = name.replace(/\s+/g, '-').toLowerCase();

        document.getElementById('qvImage').src = img;
        document.getElementById('qvTitle').innerText = name;
        document.getElementById('qvPrice').innerText = priceStr;
        document.getElementById('qvDesc').innerText = desc;
        document.getElementById('qvRating').innerHTML = `${rating} <i class="fa-solid fa-star"></i> (${reviews} Reviews)`;
        
        const qtyInput = document.getElementById('qvQtyInput');
        if (qtyInput) qtyInput.value = 1;

        overlay.classList.add('active');

        // Setup Cart Button
        const cartBtn = document.getElementById('qvCartBtn');
        const newCartBtn = cartBtn.cloneNode(true);
        cartBtn.parentNode.replaceChild(newCartBtn, cartBtn);
        newCartBtn.onclick = () => {
            const qty = parseInt(document.getElementById('qvQtyInput').value) || 1;
            newCartBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
            setTimeout(() => {
                newCartBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
                newCartBtn.style.background = 'var(--color-success)';
                window.CartManager.addItem({ id, name, priceStr, price, img, qty });
                setTimeout(() => {
                    overlay.classList.remove('active');
                    newCartBtn.innerHTML = 'Add to Cart';
                    newCartBtn.style.background = '';
                }, 1000);
            }, 500);
        };

        // Setup Buy Now Button
        const buyBtn = document.getElementById('qvBuyBtn');
        if(buyBtn) {
            const newBuyBtn = buyBtn.cloneNode(true);
            buyBtn.parentNode.replaceChild(newBuyBtn, buyBtn);
            newBuyBtn.onclick = () => {
                const qty = parseInt(document.getElementById('qvQtyInput').value) || 1;
                window.CartManager.addItem({ id, name, priceStr, price, img, qty });
                window.location.href = 'checkout.html';
            };
        }

        // Setup Wishlist Button
        const wishBtn = document.getElementById('qvWishBtn');
        const newWishBtn = wishBtn.cloneNode(true);
        wishBtn.parentNode.replaceChild(newWishBtn, wishBtn);
        const isWished = window.WishlistManager.hasItem(id);
        const icon = newWishBtn.querySelector('i');
        
        if(isWished) {
            icon.className = 'fa-solid fa-heart';
            icon.style.color = 'var(--color-rose-gold)';
        } else {
            icon.className = 'fa-regular fa-heart';
            icon.style.color = '';
        }

        newWishBtn.onclick = () => {
            const currentIcon = newWishBtn.querySelector('i');
            if (currentIcon.classList.contains('fa-regular')) {
                currentIcon.className = 'fa-solid fa-heart';
                currentIcon.style.color = 'var(--color-rose-gold)';
                window.WishlistManager.addItem({ id, name, priceStr, price, img });
            } else {
                currentIcon.className = 'fa-regular fa-heart';
                currentIcon.style.color = '';
                window.WishlistManager.removeItem(id);
            }
        };

        // Close events
        document.getElementById('qvClose').onclick = () => overlay.classList.remove('active');
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };
        
        // QTY Logic
        document.getElementById('qvQtyDec').onclick = () => { if(qtyInput.value > 1) qtyInput.value--; };
        document.getElementById('qvQtyInc').onclick = () => { if(qtyInput.value < 10) qtyInput.value++; };
    }
};

function setupGlobalEventListeners() {
    document.body.addEventListener('click', function(e) {
        
        // ADD TO CART
        const addCartBtn = e.target.closest('.add-to-cart');
        if (addCartBtn) {
            e.preventDefault(); e.stopPropagation();
            if (addCartBtn.classList.contains('loading') || addCartBtn.classList.contains('success')) return;
            const card = addCartBtn.closest('.product-card, .product-info, [data-name], .premium-card, .bs-product-card, .h-card');
            if (!card) return;
            
            const name = card.dataset.name || card.querySelector('h3')?.innerText || 'Product';
            let priceStr = card.dataset.price || '$0.00';
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            const img = card.dataset.img || card.querySelector('img')?.src || '';
            const id = name.replace(/\s+/g, '-').toLowerCase();

            addCartBtn.classList.add('loading');
            const originalHTML = addCartBtn.innerHTML;
            addCartBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            setTimeout(() => {
                addCartBtn.classList.remove('loading');
                addCartBtn.classList.add('success');
                addCartBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                window.CartManager.addItem({ id, name, priceStr, price, img, qty: 1 });
                setTimeout(() => {
                    addCartBtn.classList.remove('success');
                    addCartBtn.innerHTML = originalHTML;
                }, 2000);
            }, 500);
            return;
        }

        // BUY NOW
        const buyBtn = e.target.closest('.btn-buy');
        if (buyBtn && !buyBtn.id?.includes('qvBuyBtn')) {
            e.preventDefault(); e.stopPropagation();
            const card = buyBtn.closest('.product-card, .product-info, [data-name], .premium-card, .bs-product-card');
            if (card) {
                const name = card.dataset.name || card.querySelector('h3')?.innerText || 'Product';
                let priceStr = card.dataset.price || '$0.00';
                const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
                const img = card.dataset.img || card.querySelector('img')?.src || '';
                const id = name.replace(/\s+/g, '-').toLowerCase();
                
                window.CartManager.addItem({ id, name, priceStr, price, img, qty: 1 });
            }
            window.location.href = 'checkout.html';
            return;
        }

        // WISHLIST
        const wishBtn = e.target.closest('.wishlist-btn, [title*="Wishlist"]');
        if (wishBtn && !wishBtn.classList.contains('qv-wish-btn')) { 
            e.preventDefault(); e.stopPropagation();
            const card = wishBtn.closest('.product-card, .product-info, [data-name], .premium-card, .bs-product-card');
            if (!card) return;

            const name = card.dataset.name || card.querySelector('h3')?.innerText || 'Product';
            let priceStr = card.dataset.price || '$0.00';
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            const img = card.dataset.img || card.querySelector('img')?.src || '';
            const id = name.replace(/\s+/g, '-').toLowerCase();

            const icon = wishBtn.querySelector('i');
            if (icon && icon.classList.contains('fa-regular')) {
                icon.className = 'fa-solid fa-heart';
                icon.style.color = 'var(--color-rose-gold)';
                window.WishlistManager.addItem({ id, name, priceStr, price, img });
            } else if (icon) {
                icon.className = 'fa-regular fa-heart';
                icon.style.color = '';
                window.WishlistManager.removeItem(id);
            }
            return;
        }

        // QUICK VIEW
        const quickViewBtn = e.target.closest('.quick-view-btn, [title*="Quick View"]');
        if (quickViewBtn) {
            e.preventDefault(); e.stopPropagation();
            const card = quickViewBtn.closest('.product-card, .product-info, [data-name], .premium-card, .bs-product-card');
            if (card) window.QuickViewManager.open(card);
            return;
        }
        
        // PROCEED TO CHECKOUT (Clear cart and redirect)
        const a = e.target.closest('a');
        const btn = e.target.closest('button');
        const text = (btn ? btn.innerText : (a ? a.innerText : '')).toLowerCase();
        
        if (text.includes('proceed to checkout') || text.includes('place order')) {
            if(window.location.href.includes('checkout.html') && text.includes('place order')) {
                e.preventDefault();
                window.CartManager.clearCart();
                window.location.href = '404.html';
            }
        }
    });

    // Sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'Stackly_cart') window.CartManager.updateCartCount();
        if (e.key === 'Stackly_wishlist') window.WishlistManager.updateCount();
    });
}
