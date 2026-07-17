// ============================================================
// ProOliva — Carrito de compras (compartido entre páginas)
//
// El carrito se guarda en localStorage del navegador, por eso
// persiste aunque el visitante navegue entre index.html,
// productos.html y producto.html, o recargue la página.
//
// Nota para vista previa: dentro del panel de artefactos de
// Claude.ai el carrito puede no guardar datos entre mensajes,
// porque ese entorno de prueba bloquea el almacenamiento del
// navegador. Una vez subido a GitHub Pages (tu sitio real),
// funciona con normalidad.
//
// Requiere que formatCLP() ya esté definida en la página, y que
// exista el HTML del drawer (#cartDrawer, #cartItems, etc).
// ============================================================

const CART_KEY = 'prooliva_cart';
const WSP_NUMBER = '56988256980';

function formatCLP(value){
  return new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(value || 0);
}

function getCart(){
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e){
    return [];
  }
}

function saveCart(cart){
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e){
    console.warn('No se pudo guardar el carrito:', e);
  }
  updateCartBadge();
}

function addToCart(product, qty){
  qty = Math.max(1, parseInt(qty) || 1);
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing){
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      format: product.format,
      weight_kg: product.weight_kg || 0.5,
      qty
    });
  }
  saveCart(cart);
  renderCartDrawer();
  openCart();
}

function removeFromCart(id){
  saveCart(getCart().filter(i => i.id !== id));
  renderCartDrawer();
}

function updateCartItemQty(id, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = qty;
  if (item.qty <= 0){
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }
  renderCartDrawer();
}

function cartTotal(cart){
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  if (count > 0){
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function buildCartMessage(cart){
  const lines = ['Hola, quiero cotizar mi carrito de ProOliva:', ''];
  cart.forEach(i => {
    lines.push(`• ${i.qty}x ${i.name} — ${formatCLP(i.price * i.qty)}`);
  });
  lines.push('');
  lines.push(`Total: ${formatCLP(cartTotal(cart))}`);
  return lines.join('\n');
}

function renderCartDrawer(){
  const cart = getCart();
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (!itemsEl) return;

  if (cart.length === 0){
    itemsEl.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br><a href="productos.html" style="text-decoration:underline; font-weight:600;">Ver catálogo</a></div>`;
    totalEl.textContent = formatCLP(0);
    checkoutBtn.style.pointerEvents = 'none';
    checkoutBtn.style.opacity = '0.5';
    return;
  }

  checkoutBtn.style.pointerEvents = 'auto';
  checkoutBtn.style.opacity = '1';

  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">${i.image_url ? `<img src="${i.image_url}" alt="${i.name}">` : ''}</div>
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <div class="cart-item-price">${formatCLP(i.price)} c/u${i.format ? ' · ' + i.format : ''}</div>
        <div class="cart-item-controls">
          <div class="qty-stepper" data-cart-id="${i.id}">
            <button class="qty-btn cart-qty-minus">−</button>
            <span class="qty-value">${i.qty}</span>
            <button class="qty-btn cart-qty-plus">+</button>
          </div>
          <button class="cart-item-remove" data-remove-id="${i.id}" aria-label="Quitar del carrito">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="#a3392f" stroke-width="1.5"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  totalEl.textContent = formatCLP(cartTotal(cart));
  checkoutBtn.href = `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(buildCartMessage(cart))}`;

  const payBtn = document.getElementById('cartPayBtn');
  if (payBtn) payBtn.style.display = cart.length ? 'flex' : 'none';
}

function openCart(){
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('open');
}

function closeCart(){
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('open');
}

function initCart(){
  const openBtn = document.getElementById('cartOpenBtn');
  const closeBtn = document.getElementById('cartCloseBtn');
  const backdrop = document.getElementById('cartBackdrop');
  const clearBtn = document.getElementById('cartClearBtn');
  const itemsEl = document.getElementById('cartItems');

  if (openBtn) openBtn.addEventListener('click', () => { renderCartDrawer(); openCart(); });
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')){
      saveCart([]);
      renderCartDrawer();
    }
  });

  if (itemsEl){
    itemsEl.addEventListener('click', (e) => {
      const minus = e.target.closest('.cart-qty-minus');
      const plus = e.target.closest('.cart-qty-plus');
      const remove = e.target.closest('[data-remove-id]');

      if (minus || plus){
        const stepper = e.target.closest('.qty-stepper');
        const id = stepper.dataset.cartId;
        const valueEl = stepper.querySelector('.qty-value');
        let val = parseInt(valueEl.textContent);
        val = plus ? val + 1 : val - 1;
        updateCartItemQty(id, val);
      }
      if (remove){
        removeFromCart(remove.dataset.removeId);
      }
    });
  }

  updateCartBadge();
}
