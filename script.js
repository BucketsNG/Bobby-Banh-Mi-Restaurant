document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DATA & ELEMENTS ---
    let cart = JSON.parse(localStorage.getItem('bbm_cart')) || [];
    let pendingItem = null;

    const cartCount = document.getElementById('cart-count');
    const cartList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    const modal = document.getElementById('customizer-modal');

    // --- 2. CORE FUNCTIONS ---
    
    function refreshUI() {
        localStorage.setItem('bbm_cart', JSON.stringify(cart));
        
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (cartList) {
            if (cart.length === 0) {
                cartList.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Your cart is empty</p>';
            } else {
                // Cleaner template without inline 'onclick'
                cartList.innerHTML = cart.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>$${item.price.toFixed(2)} x ${item.qty}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
                            <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
                            <button class="remove-btn" data-index="${index}">&times;</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        if (cartTotal) cartTotal.textContent = `$${totalMoney.toFixed(2)}`;
    }

function addToCart(item) {
    const existingItem = cart.find(i => i.name === item.name);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push(item);
    }

    refreshUI();

    // Pop animation
    if (cartCount) {
        cartCount.classList.add("cart-pop");
        setTimeout(() => cartCount.classList.remove("cart-pop"), 300);
    }

    // Open sidebar
    sidebar?.classList.add('open');
    overlay?.classList.add('show');
}
    refreshUI();


    function closeModal() { 
        if(modal) modal.style.display = 'none'; 
        document.querySelectorAll('input[name="opt"]').forEach(i => i.checked = false);
        pendingItem = null; // Clean up memory
    }

    // --- 3. EVENT LISTENERS ---

    // Handle Cart controls (Delegation)
    cartList?.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        if (e.target.classList.contains('qty-btn')) {
            const delta = parseInt(e.target.dataset.delta);
            cart[index].qty += delta;
            if (cart[index].qty <= 0) cart.splice(index, 1);
        } else if (e.target.classList.contains('remove-btn')) {
            cart.splice(index, 1);
        }
        refreshUI();
    });

    // Handle Product clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.product-card');
            const itemName = card.querySelector('h3').textContent;
            const priceRaw = parseFloat(card.querySelector('.price').textContent.replace('$', ''));

            pendingItem = { name: itemName, price: priceRaw, qty: 1 };

            if (card.dataset.category === 'banh-mi') {
                document.getElementById('modal-item-name').textContent = itemName;
                modal.style.display = 'flex';
            } else {
                addToCart(pendingItem);
            }
        }
    });

    // Confirm Customization
    document.getElementById('confirm-add')?.addEventListener('click', () => {
        const selectedOpts = Array.from(document.querySelectorAll('input[name="opt"]:checked'));
        let extraTotal = 0;

        if (selectedOpts.length > 0) {
            const optNames = selectedOpts.map(o => o.value).join(', ');
            pendingItem.name += ` (${optNames})`;
            selectedOpts.forEach(o => {
                if(o.dataset.price) extraTotal += parseFloat(o.dataset.price);
            });
        }
        
        pendingItem.price += extraTotal;
        addToCart(pendingItem);
        closeModal();
    });

    document.getElementById('cancel-custom')?.addEventListener('click', closeModal);

    // --- 4. UTILS (Status, Filters, Scroll) ---

    function updateStoreStatus() {
        const now = new Date();
        const day = now.getDay(); 
        const hour = now.getHours();
        const statusEl = document.getElementById('store-status');
        if(!statusEl) return;

        let isOpen = (day >= 2 && day <= 4 && hour >= 10 && hour < 20) || // Tue-Thu
                     ([6, 0].includes(day) && hour >= 11 && hour < 18);   // Sat-Sun

        statusEl.className = `status-indicator ${isOpen ? 'open-now' : 'closed-now'}`;
        statusEl.querySelector('.status-text').textContent = isOpen ? "Open Now" : "Closed";
    }

    // Sidebar/Overlay setup
    document.querySelector('.cart-icon')?.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });

    [document.querySelector('.close-cart'), overlay].forEach(el => {
        el?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
            closeModal();
        });
    });

const revealElements = document.querySelectorAll('.reveal, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

        if (entry.isIntersecting) {

            // Add stagger animation
            const parent = entry.target.parentElement;
            const siblings = parent.querySelectorAll('.reveal, .reveal-right');

            siblings.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('active');
                }, index * 120);
            });

        } else {
 
            entry.target.classList.remove('active');
        }

    });
}, {
    threshold: 0.15
});

revealElements.forEach(el => {
    revealObserver.observe(el);
});
const titleElements = document.querySelectorAll('.title-animate');

titleElements.forEach(title => {

    const letters = title.textContent.split("");
    title.innerHTML = "";

    letters.forEach((letter, index) => {

        const span = document.createElement("span");
        span.innerHTML = letter === " " ? "&nbsp;" : letter;
        span.style.animationDelay = (index * 0.05) + "s";

        title.appendChild(span);
    });

});

const titleObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        const spans = entry.target.querySelectorAll("span");

        if (entry.isIntersecting) {

            spans.forEach((span, index) => {

                span.style.animation = "none";
                span.offsetHeight;

                span.style.animation = "titleReveal 0.6s forwards";
                span.style.animationDelay = (index * 0.05) + "s";

            });

        } else {

            spans.forEach(span => {
                span.style.animation = "none";
                span.style.opacity = "0";
                span.style.transform = "translateY(30px)";
            });

        }

    });

}, { threshold: 0.35 });

titleElements.forEach(title => {
    titleObserver.observe(title);
});


updateStoreStatus();
refreshUI();
});