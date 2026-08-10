
const allProducts = window.PRODUCTS || [];

function imgOrBottle(product, cls='') {
  const label = (product.name || 'PERFUME').toUpperCase().replace(/"/g, '&quot;');
  if (product.mainImage) {
    return `<img src="${product.mainImage}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend','<div class=&quot;bottle&quot; data-label=&quot;${label}&quot;></div>')">`;
  }
  return `<div class="bottle" data-label="${label}"></div>`;
}

function productCard(product) {
  return `
    <a class="product-tile" href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="product-thumb">${imgOrBottle(product)}</div>
      <div class="collection">${product.collection || product.brand || 'Al Jazeera Perfumes'}</div>
      <h3>${product.name}</h3>
      <p>${product.shortDescription || ''}</p>
      <div class="badge-row">${(product.badges || []).slice(0,3).map(b => `<span class="badge">${b}</span>`).join('')}</div>
      <div class="price-line"><span>QAR ${product.price || 0}</span><span>${product.size || ''}</span></div>
    </a>
  `;
}

function renderFeatured(limit = 8) {
  const el = document.querySelector('[data-featured-products]');
  if (!el) return;
  const selected = allProducts.filter(p => p.hasStock || p.stock > 0).slice(0, limit);
  el.innerHTML = selected.map(productCard).join('');
}

function renderShop() {
  const grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;
  const search = document.querySelector('[data-search]');
  const filters = document.querySelectorAll('[data-filter]');
  let active = 'All';
  function draw() {
    const q = (search?.value || '').toLowerCase();
    const filtered = allProducts.filter(p => {
      const hay = [p.name, p.collection, p.category, p.subcategory, p.brand, p.shortDescription, p.longDescription, p.gender, (p.badges || []).join(' '), (p.bestFor || []).join(' ')].join(' ').toLowerCase();
      const matchesSearch = hay.includes(q);
      const matchesFilter = active === 'All' || p.gender === active || (p.collection || '').includes(active) || (p.subcategory || '').includes(active) || (p.category || '').includes(active) || (p.badges || []).includes(active) || ((p.profile || {})[active] || 0) > 70;
      return matchesSearch && matchesFilter;
    });
    grid.innerHTML = filtered.map(productCard).join('') || `<div class="card"><h3>No products found</h3><p>Try another keyword or filter.</p></div>`;
    const count = document.querySelector('[data-count]');
    if (count) count.textContent = `${filtered.length} products`;
  }
  search?.addEventListener('input', draw);
  filters.forEach(btn => btn.addEventListener('click', () => { filters.forEach(b => b.classList.remove('active')); btn.classList.add('active'); active = btn.dataset.filter; draw(); }));
  draw();
}


function formatLongDescription(text) {
  if (!text) return '';
  const value = String(text).trim();
  if (!value) return '';
  if (/<\/?(p|br|div|ul|ol|li|strong|em|span|h\d)\b/i.test(value)) return value;
  return value.split(/\n+/).map(part => part.trim()).filter(Boolean).map(part => `<p>${part}</p>`).join('');
}

function longDescriptionModule(p) {
  const html = formatLongDescription(p.longDescription || '');
  if (!html) {
    return `<div class="module long-description-card"><h3>Long description</h3><p>The full product story can be added here from the product database.</p></div>`;
  }
  return `<div class="module long-description-card"><h3>Long description</h3><div class="long-description-content">${html}</div></div>`;
}

function renderProductPage() {
  const root = document.querySelector('[data-product-page]');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || (allProducts[0]?.id || '');
  const p = allProducts.find(x => x.id === id) || allProducts[0];
  if (!p) { root.innerHTML = '<div class="card"><h3>No product data found</h3></div>'; return; }
  document.title = `${p.name} | Smart Perfume Page`;
  const profile = p.profile || {};
  const profileItems = Object.entries(profile).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k, v]) => `<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="--w:${v}%"></div></div><strong>${(v/10).toFixed(1)}</strong></div>`).join('');
  const notes = Object.entries(p.notes || {}).map(([k, v]) => `<div class="note-card"><strong>${k}</strong><span>${v || '—'}</span></div>`).join('');
  const compares = (p.compare || []).map(c => `<div class="compare-card"><h4>Compared to ${c.name}</h4><p>${c.text}</p><a class="small-link" href="product.html?id=${encodeURIComponent(c.id)}">View ${c.name} →</a></div>`).join('');
  const thumbs = (p.images || []).slice(0,4).map(src => `<div class="thumb"><img src="${src}" alt="${p.name}"></div>`).join('') || '<div class="thumb">Bottle</div><div class="thumb">Box</div><div class="thumb">Notes</div><div class="thumb">Gift</div>';
  const stockClass = (p.hasStock || p.stock > 0) ? '' : ' out';
  const stockText = (p.hasStock || p.stock > 0) ? `In stock${p.stock ? ' • ' + p.stock + ' available' : ''}` : 'Check availability';
  root.innerHTML = `
    <div class="breadcrumb">Home / Perfumes / ${p.name}</div>
    <section class="product-hero">
      <div class="gallery">
        <div class="product-image">${imgOrBottle(p)}</div>
        <div class="thumbs">${thumbs}</div>
      </div>
      <div class="product-panel">
        <div class="product-card">
          <div class="collection">${p.collection || p.brand || ''}</div>
          <h1 class="product-title">${p.name}</h1>
          <div class="subtitle">${p.shortDescription || ''}</div>
          <div class="badge-row">${(p.badges || []).map(b => `<span class="badge">${b}</span>`).join('')}</div>
          <div class="price-row"><div><div class="price">QAR ${p.price || 0}</div><div class="stock${stockClass}">${stockText}</div></div><div class="badge">${p.size || p.concentration || 'Perfume'}</div></div>
          <div class="actions"><button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>${p.urlEn ? `<a class="btn secondary" href="${p.urlEn}" target="_blank">Open Live Product</a>` : '<button class="btn secondary">Add to Wishlist</button>'}</div>
        </div>
        <div class="decision-card">
          <h2 class="decision-title">Why buy this perfume?</h2>
          <p class="decision-text">${p.whyBuy || ''}</p>
          <div class="decision-grid">
            <div class="mini-stat"><strong>Best for</strong><span>${(p.bestFor || []).join(', ')}</span></div>
            <div class="mini-stat"><strong>Impression</strong><span>${p.impression || ''}</span></div>
            <div class="mini-stat"><strong>You will like it if</strong><span>${p.likeIf || ''}</span></div>
            <div class="mini-stat"><strong>Avoid if</strong><span>${p.avoidIf || ''}</span></div>
          </div>
        </div>
      </div>
    </section>
    <div class="section-head"><div><h2 class="section-title">Smart Product Decision Page</h2><p class="section-subtitle">This section explains the product clearly without making customers search through long text.</p></div></div>
    <section class="modules-grid">
      <div class="module"><h3>Is this perfume for me?</h3><p>A clear buying guide that helps customers decide quickly.</p><div class="list"><div class="list-item"><div class="icon yes">✓</div><div><strong>Perfect if you like this style</strong><br><span>${p.likeIf || ''}</span></div></div><div class="list-item"><div class="icon yes">✓</div><div><strong>Best occasions</strong><br><span>${(p.bestFor || []).join(', ')}</span></div></div><div class="list-item"><div class="icon no">!</div><div><strong>Maybe not for you if</strong><br><span>${p.avoidIf || ''}</span></div></div></div></div>
      <div class="module"><h3>Scent visualizer</h3><p>Visual ratings make the scent easier to imagine.</p><div class="scent-bars">${profileItems}</div></div>
      ${longDescriptionModule(p)}
      <div class="module"><h3>Wear it for</h3><p>Customers often buy perfume for a situation, not only for notes.</p><div class="occasion-grid">${(p.bestFor || []).map(x => `<div class="occasion">${x}</div>`).join('')}</div></div>
    </section>
    <h2 class="section-title" style="margin-top:46px">Compared to other perfumes</h2><section class="compare-grid">${compares}</section>
    <h2 class="section-title" style="margin-top:46px">Fragrance details</h2><section class="module"><h3>Product details</h3><p>Classic product information stays available, but the buying-decision sections come first.</p><div class="notes">${notes}</div></section>
    <div class="sticky-mobile"><div><strong>${p.name}</strong><div class="price">QAR ${p.price || 0}</div></div><button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button></div>`;
}

function addToCart(id) {
  const cart = JSON.parse(localStorage.getItem('demoCart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1; else cart.push({ id, qty: 1 });
  localStorage.setItem('demoCart', JSON.stringify(cart));
  alert('Added to demo cart');
}

function renderCart() {
  const el = document.querySelector('[data-cart]');
  if (!el) return;
  const cart = JSON.parse(localStorage.getItem('demoCart') || '[]');
  if (!cart.length) { el.innerHTML = `<div class="card"><h3>Your demo cart is empty</h3><p>Add a perfume from the shop page to preview this cart.</p><a href="shop.html" class="btn">Shop perfumes</a></div>`; return; }
  let total = 0;
  const lines = cart.map(item => {
    const p = allProducts.find(x => x.id === item.id); if (!p) return '';
    total += (p.price || 0) * item.qty;
    return `<div class="cart-item"><div class="cart-mini-thumb">${imgOrBottle(p)}</div><div><h3>${p.name}</h3><p>${p.shortDescription || ''}</p><span class="badge">Qty ${item.qty}</span></div><strong>QAR ${(p.price || 0) * item.qty}</strong></div>`;
  }).join('');
  el.innerHTML = `<div class="cart-layout"><div class="module">${lines}</div><div class="module"><h3>Order summary</h3><div class="price-row"><span>Subtotal</span><strong>QAR ${total}</strong></div><p>Demo cart only. Developers can connect this to the real checkout.</p><a class="btn block" href="checkout.html">Continue to Checkout</a><button class="btn secondary block" style="margin-top:10px" onclick="localStorage.removeItem('demoCart'); location.reload()">Clear demo cart</button></div></div>`;
}



function getCartItems() {
  const cart = JSON.parse(localStorage.getItem('demoCart') || '[]');
  return cart.map(item => {
    const product = allProducts.find(p => p.id === item.id);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
}

function checkoutSummary(items, options = {}) {
  const subtotal = items.reduce((sum, item) => sum + ((item.product.price || 0) * item.qty), 0);
  const deliveryMethod = options.deliveryMethod || document.querySelector('input[name="delivery_method"]:checked')?.value || 'standard';
  const giftWrap = options.giftWrap ?? document.querySelector('#gift_wrap')?.checked ?? false;
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : deliveryMethod === 'express' ? 35 : subtotal >= 300 ? 0 : 25;
  const giftFee = giftWrap ? 20 : 0;
  return { subtotal, deliveryFee, giftFee, total: subtotal + deliveryFee + giftFee, deliveryMethod, giftWrap };
}

function renderCheckoutSummary(items) {
  const el = document.querySelector('[data-checkout-summary]');
  if (!el) return;
  const summary = checkoutSummary(items);
  const lines = items.map(item => {
    const p = item.product;
    return `<div class="checkout-summary-item"><div class="checkout-item-thumb">${imgOrBottle(p)}</div><div><strong>${p.name}</strong><span>Qty ${item.qty} • ${p.size || p.concentration || 'Perfume'}</span></div><b>QAR ${(p.price || 0) * item.qty}</b></div>`;
  }).join('');
  el.innerHTML = `
    <div class="module checkout-summary-card">
      <h3>Order summary</h3>
      <div class="checkout-summary-list">${lines}</div>
      <div class="summary-line"><span>Subtotal</span><strong>QAR ${summary.subtotal}</strong></div>
      <div class="summary-line"><span>Delivery</span><strong>${summary.deliveryFee === 0 ? 'Free' : 'QAR ' + summary.deliveryFee}</strong></div>
      <div class="summary-line"><span>Gift wrapping</span><strong>${summary.giftFee === 0 ? 'QAR 0' : 'QAR ' + summary.giftFee}</strong></div>
      <div class="summary-line total"><span>Total</span><strong>QAR ${summary.total}</strong></div>
      <p class="checkout-note">This is a demo checkout. No payment will be processed.</p>
    </div>`;
}

function renderCheckout() {
  const root = document.querySelector('[data-checkout]');
  if (!root) return;
  const items = getCartItems();
  if (!items.length) {
    root.innerHTML = `<div class="card"><h3>Your cart is empty</h3><p>Add a perfume to preview the checkout page.</p><a href="shop.html" class="btn">Shop perfumes</a></div>`;
    return;
  }

  root.innerHTML = `
    <form class="checkout-layout" id="checkout_form">
      <div class="checkout-main">
        <section class="module checkout-step">
          <div class="checkout-step-head"><span>1</span><div><h3>Customer information</h3><p>Collect customer contact details for order confirmation.</p></div></div>
          <div class="form-grid">
            <input class="input" name="first_name" placeholder="First name" required>
            <input class="input" name="last_name" placeholder="Last name" required>
            <input class="input" name="email" type="email" placeholder="Email address" required>
            <input class="input" name="phone" placeholder="Mobile number" required>
          </div>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>2</span><div><h3>Delivery address</h3><p>Designed for Qatar delivery, but developers can connect zones/cities later.</p></div></div>
          <div class="form-grid">
            <select class="select" name="country" required><option>Qatar</option></select>
            <input class="input" name="city" placeholder="City / Area" required>
            <input class="input" name="street" placeholder="Street / Building / Zone" required>
            <input class="input" name="notes" placeholder="Delivery notes optional">
          </div>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>3</span><div><h3>Delivery method</h3><p>Shows delivery cost clearly before payment.</p></div></div>
          <div class="option-grid">
            <label class="option-card"><input type="radio" name="delivery_method" value="standard" checked><div><strong>Standard delivery</strong><span>1–3 working days • Free above QAR 300</span></div><b>QAR 25</b></label>
            <label class="option-card"><input type="radio" name="delivery_method" value="express"><div><strong>Express delivery</strong><span>Priority delivery where available</span></div><b>QAR 35</b></label>
            <label class="option-card"><input type="radio" name="delivery_method" value="pickup"><div><strong>Store pickup</strong><span>Reserve online and collect in-store</span></div><b>Free</b></label>
          </div>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>4</span><div><h3>Gift options</h3><p>Useful for perfume orders, gifting, and premium customer experience.</p></div></div>
          <div class="option-grid">
            <label class="option-card"><input id="gift_wrap" type="checkbox"><div><strong>Add gift wrapping</strong><span>Premium wrapping and gift bag</span></div><b>QAR 20</b></label>
            <label class="option-card"><input id="hide_price" type="checkbox"><div><strong>Hide invoice price</strong><span>Recommended for gifts</span></div><b>Free</b></label>
          </div>
          <textarea class="input checkout-textarea" name="gift_message" placeholder="Gift message optional"></textarea>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>4</span><div><h3>Payment method</h3><p>Demo options only. Developers can connect NAPS, cards, Apple Pay, Google Pay, or COD.</p></div></div>
          <div class="option-grid">
            <label class="option-card"><input type="radio" name="payment_method" value="card" checked><div><strong>Card payment</strong><span>Visa / Mastercard / debit card</span></div></label>
            <label class="option-card"><input type="radio" name="payment_method" value="applepay"><div><strong>Apple Pay / Google Pay</strong><span>Fast mobile checkout</span></div></label>
            <label class="option-card"><input type="radio" name="payment_method" value="cod"><div><strong>Cash on delivery</strong><span>Optional if your business supports it</span></div></label>
          </div>
        </section>
      </div>

      <aside class="checkout-side">
        <div data-checkout-summary></div>
        <button class="btn block checkout-place-order" type="submit">Place Demo Order</button>
        <a class="btn secondary block" style="margin-top:10px" href="cart.html">Back to Cart</a>
        <div class="checkout-trust module">
          <h3>Why this checkout helps sales</h3>
          <div class="list">
            <div class="list-item"><div class="icon yes">✓</div><div><strong>Clear delivery cost</strong><br><span>No surprise fees at the last step.</span></div></div>
            <div class="list-item"><div class="icon yes">✓</div><div><strong>Gift options</strong><br><span>Perfume customers often buy for others.</span></div></div>
            <div class="list-item"><div class="icon yes">✓</div><div><strong>Mobile-friendly flow</strong><br><span>Steps are separated and easy to complete.</span></div></div>
          </div>
        </div>
      </aside>
    </form>
    <div class="checkout-success" id="checkout_success" hidden>
      <div class="module"><h2>Demo order placed</h2><p>This confirms the checkout flow only. Developers can connect this button to order creation, payment gateway, stock reservation, and confirmation email.</p><a class="btn" href="shop.html">Continue shopping</a></div>
    </div>
  `;

  renderCheckoutSummary(items);
  document.querySelectorAll('input[name="delivery_method"], #gift_wrap').forEach(el => el.addEventListener('change', () => renderCheckoutSummary(items)));
  document.querySelector('#checkout_form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('#checkout_form').style.display = 'none';
    document.querySelector('#checkout_success').hidden = false;
    localStorage.removeItem('demoCart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


document.addEventListener('DOMContentLoaded', () => { renderFeatured(); renderShop(); renderProductPage(); renderCart(); renderCheckout(); });


/* ============================================================
   Europe E-Gift Voucher demo feature
   ============================================================ */
const EUROPE_VOUCHER_PRODUCT = {
  id: 'europe-e-gift-voucher',
  type: 'voucher',
  name: 'Europe E-Gift Voucher',
  collection: 'Digital Gift Voucher',
  price: 100,
  currency: 'EUR',
  size: 'Digital Voucher',
  shortDescription: 'Voucher starting from €100, sent directly by email.',
  badges: ['E-Voucher', 'Europe', 'Digital Gift']
};
if (Array.isArray(allProducts) && !allProducts.some(p => p.id === EUROPE_VOUCHER_PRODUCT.id)) {
  allProducts.unshift(EUROPE_VOUCHER_PRODUCT);
}

const EUROPE_COUNTRY_FEES = [
  ['Austria', 15], ['Belgium', 15], ['Denmark', 15], ['France', 15], ['Germany', 15], ['Ireland', 15], ['Italy', 15], ['Luxembourg', 15], ['Netherlands', 15], ['Portugal', 15], ['Spain', 15],
  ['Albania', 20], ['Andorra', 20], ['Belarus', 20], ['Bosnia and Herzegovina', 20], ['Bulgaria', 20], ['Croatia', 20], ['Cyprus', 20], ['Czech Republic', 20], ['Estonia', 20], ['Finland', 20], ['Greece', 20], ['Hungary', 20], ['Iceland', 20], ['Kosovo', 20], ['Latvia', 20], ['Liechtenstein', 20], ['Lithuania', 20], ['Malta', 20], ['Moldova', 20], ['Monaco', 20], ['Montenegro', 20], ['North Macedonia', 20], ['Norway', 20], ['Poland', 20], ['Romania', 20], ['San Marino', 20], ['Serbia', 20], ['Slovakia', 20], ['Slovenia', 20], ['Sweden', 20], ['Switzerland', 20], ['Turkey', 20], ['Ukraine', 20], ['United Kingdom', 20], ['Vatican City', 20]
];
const VOUCHER_FREE_SHIPPING_THRESHOLD = 280;

function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  if (currency === 'EUR') return `€${value.toFixed(2)}`;
  return `QAR ${value.toFixed(0)}`;
}
function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}
function getVoucherCountryFee(country) {
  return 0;
}
function calculateVoucherShipping(amount, country) {
  return 0;
}
function calculateVoucherTotal(amount, country) {
  return Number(amount || 0);
}
function voucherProductCard() {
  return `<a class="product-tile voucher-product-tile" href="e-voucher.html">
    <div class="product-thumb voucher-thumb-card"><div class="voucher-mini-card"><strong>EUROPE</strong><span>E-GIFT VOUCHER</span><b>From €100</b></div></div>
    <div class="collection">Digital Gift Voucher</div>
    <h3>Europe E-Gift Voucher</h3>
    <p>Select the voucher value, To/From details, message, and requested delivery date.</p>
    <div class="badge-row"><span class="badge">Digital Gift</span><span class="badge">Europe</span></div>
    <div class="price-line"><span>From €100</span><span>Digital Voucher</span></div>
  </a>`;
}

// Override product cards to support the e-voucher product.
function productCard(product) {
  if (product.type === 'voucher' || product.id === 'europe-e-gift-voucher') return voucherProductCard();
  return `
    <a class="product-tile" href="product.html?id=${encodeURIComponent(product.id)}">
      <div class="product-thumb">${imgOrBottle(product)}</div>
      <div class="collection">${product.collection || product.brand || 'Al Jazeera Perfumes'}</div>
      <h3>${product.name}</h3>
      <p>${product.shortDescription || ''}</p>
      <div class="badge-row">${(product.badges || []).slice(0,3).map(b => `<span class="badge">${b}</span>`).join('')}</div>
      <div class="price-line"><span>QAR ${product.price || 0}</span><span>${product.size || ''}</span></div>
    </a>
  `;
}

function setupVoucherWidget() {
  const widget = document.querySelector('[data-voucher-widget]');
  if (!widget) return;
  const valueButtons = document.querySelectorAll('[data-value]');
  const customWrap = document.querySelector('[data-voucher-custom-wrap]');
  const customInput = document.querySelector('[data-voucher-custom-amount]');
  const toInput = document.querySelector('[data-voucher-recipient-name]');
  const fromInput = document.querySelector('[data-voucher-sender-name]');
  const emailInput = document.querySelector('[data-voucher-recipient-email]');
  const confirmEmailInput = document.querySelector('[data-voucher-recipient-email-confirm]');
  const messageInput = document.querySelector('[data-voucher-message]');
  const messageCount = document.querySelector('[data-voucher-message-count]');
  const scheduleFields = document.querySelector('[data-voucher-schedule-fields]');
  const sendNow = document.querySelector('[data-voucher-send-now]');
  const sendLater = document.querySelector('[data-voucher-send-later]');
  const deliveryDate = document.querySelector('[data-voucher-delivery-date]');
  const deliveryTime = document.querySelector('[data-voucher-delivery-time]');
  let selectedValue = 100;
  let usingCustomValue = false;

  if (deliveryDate) deliveryDate.min = new Date().toISOString().split('T')[0];

  function getActiveVoucherValue() {
    if (usingCustomValue) {
      const raw = Number(customInput?.value || 0);
      return raw >= 100 ? raw : 100;
    }
    return Number(selectedValue || 100);
  }

  function getDeliveryText() {
    if (sendLater?.checked) {
      const date = deliveryDate?.value || 'selected date';
      const time = deliveryTime?.value || '09:00';
      return `This eGift Card will be delivered on ${date} at ${time}.`;
    }
    return 'This eGift Card will be delivered now.';
  }


  function hashVoucherCode(value) {
    let hash = 0;
    const source = String(value || 'ALJAZEERA');
    for (let i = 0; i < source.length; i += 1) {
      hash = ((hash << 5) - hash + source.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36).toUpperCase().slice(0, 6).padEnd(6, '0');
  }

  function getVoucherCode() {
    const amount = getActiveVoucherValue();
    const email = (emailInput?.value || 'recipient').trim().toLowerCase();
    const recipient = (toInput?.value || 'recipient').trim().toLowerCase();
    const sender = (fromInput?.value || 'sender').trim().toLowerCase();
    return `AJP-EU-${Math.round(amount)}-${hashVoucherCode(`${amount}|${email}|${recipient}|${sender}`)}`;
  }

  function getVoucherShareUrl() {
    const base = new URL('voucher-recipient.html', window.location.href);
    const params = new URLSearchParams({
      code: getVoucherCode(),
      amount: String(getActiveVoucherValue()),
      to: toInput?.value || 'Recipient Name',
      from: fromInput?.value || 'Al-Jazeera Perfumes',
      message: messageInput?.value || 'A luxury perfume experience, chosen for you.',
      delivery: getDeliveryText()
    });
    base.search = params.toString();
    return base.toString();
  }

  function getVoucherShareText() {
    const recipient = toInput?.value || 'Recipient';
    const sender = fromInput?.value || 'Someone special';
    return `${sender} sent ${recipient} an Al-Jazeera Perfumes e-gift voucher. Voucher promo code / serial number: ${getVoucherCode()}. Open it here: ${getVoucherShareUrl()}`;
  }

  function updatePreview() {
    const message = (messageInput?.value || '').trim() || 'Your Message Here';
    document.querySelector('[data-preview-to]').textContent = toInput?.value || 'Recipient Name Here';
    document.querySelector('[data-preview-from]').textContent = fromInput?.value || 'Your Name Here';
    document.querySelector('[data-preview-message]').textContent = message;
    document.querySelector('[data-preview-date]').textContent = getDeliveryText();
    const code = getVoucherCode();
    document.querySelectorAll('[data-voucher-preview-code]').forEach(el => { el.textContent = code; });
    document.querySelectorAll('[data-share-code]').forEach(el => { el.textContent = code; });
    if (messageCount) messageCount.textContent = String(400 - (messageInput?.value || '').length);
  }

  function update() {
    const amount = getActiveVoucherValue();
    const total = amount;
    document.querySelector('[data-voucher-preview-amount]').textContent = formatCurrency(amount, 'EUR');
    document.querySelector('[data-voucher-value-line]').textContent = formatCurrency(amount, 'EUR');
    const shippingLine = document.querySelector('[data-voucher-shipping-line]');
    if (shippingLine) shippingLine.textContent = formatCurrency(0, 'EUR');
    document.querySelector('[data-voucher-total-line]').textContent = formatCurrency(total, 'EUR');
    const note = document.querySelector('[data-voucher-note]');
    if (note) note.textContent = 'Total equals the selected voucher value.';
    if (scheduleFields) scheduleFields.hidden = !sendLater?.checked;
    updatePreview();
  }

  valueButtons.forEach(btn => btn.addEventListener('click', () => {
    valueButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.value === 'custom') {
      usingCustomValue = true;
      if (customWrap) customWrap.hidden = false;
      if (customInput && !customInput.value) customInput.value = '100';
      customInput?.focus();
    } else {
      usingCustomValue = false;
      selectedValue = Number(btn.dataset.value);
      if (customWrap) customWrap.hidden = true;
    }
    update();
  }));

  customInput?.addEventListener('input', update);
  customInput?.addEventListener('blur', () => {
    if (usingCustomValue && Number(customInput.value || 0) < 100) {
      customInput.value = '100';
      update();
    }
  });

  [toInput, fromInput, emailInput, confirmEmailInput, messageInput, sendNow, sendLater, deliveryDate, deliveryTime]
    .filter(Boolean).forEach(el => el.addEventListener('input', update));
  [sendNow, sendLater, deliveryTime].filter(Boolean).forEach(el => el.addEventListener('change', update));

  const previewModal = document.querySelector('[data-voucher-preview-modal]');
  const previewCard = document.querySelector('[data-voucher-card-preview]');
  const shareModal = document.querySelector('[data-voucher-share-modal]');
  const shareHelp = document.querySelector('[data-share-help]');

  function prepareShareLinks() {
    const text = getVoucherShareText();
    const url = getVoucherShareUrl();
    const encodedText = encodeURIComponent(text);
    const encodedSubject = encodeURIComponent('Your Al-Jazeera Perfumes e-gift voucher');
    document.querySelector('[data-share-whatsapp]')?.setAttribute('href', `https://wa.me/?text=${encodedText}`);
    document.querySelector('[data-share-sms]')?.setAttribute('href', `sms:?&body=${encodedText}`);
    document.querySelector('[data-share-email]')?.setAttribute('href', `mailto:?subject=${encodedSubject}&body=${encodedText}`);
    return { text, url };
  }

  function openShareModal(message) {
    update();
    prepareShareLinks();
    if (shareHelp && message) shareHelp.textContent = message;
    if (!shareModal) return;
    shareModal.hidden = false;
    requestAnimationFrame(() => shareModal.classList.add('is-open'));
  }

  function closeShareModal() {
    if (!shareModal) return;
    shareModal.classList.remove('is-open');
    setTimeout(() => { shareModal.hidden = true; }, 180);
  }

  async function copyShareText() {
    const text = getVoucherShareText();
    try {
      await navigator.clipboard.writeText(text);
      if (shareHelp) shareHelp.textContent = 'Copied. You can now paste it into WhatsApp, Instagram DM, SMS, or any social app.';
    } catch (error) {
      if (shareHelp) shareHelp.textContent = 'Copy is not available in this browser. Please select and copy the voucher code manually.';
    }
  }

  async function shareVoucher() {
    update();
    const { text, url } = prepareShareLinks();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Al-Jazeera Perfumes e-gift voucher',
          text,
          url
        });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    openShareModal('Choose how to share the voucher, or copy the link and code to send through any social app.');
  }

  function openVoucherPreviewModal() {
    update();
    if (!previewModal) return;
    previewModal.hidden = false;
    requestAnimationFrame(() => {
      previewModal.classList.add('is-open');
      previewCard?.classList.add('preview-pulse');
      setTimeout(() => previewCard?.classList.remove('preview-pulse'), 500);
      document.body.classList.add('modal-open');
    });
  }

  function closeVoucherPreviewModal() {
    if (!previewModal) return;
    previewModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(() => { previewModal.hidden = true; }, 180);
  }

  document.querySelector('[data-preview-voucher]')?.addEventListener('click', openVoucherPreviewModal);
  document.querySelector('[data-share-voucher]')?.addEventListener('click', shareVoucher);
  document.querySelectorAll('[data-close-voucher-preview]').forEach(el => el.addEventListener('click', closeVoucherPreviewModal));
  document.querySelectorAll('[data-close-voucher-share]').forEach(el => el.addEventListener('click', closeShareModal));
  document.querySelector('[data-share-copy]')?.addEventListener('click', copyShareText);
  document.querySelector('[data-share-instagram]')?.addEventListener('click', async () => {
    await copyShareText();
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && shareModal && !shareModal.hidden) closeShareModal();
    else if (event.key === 'Escape' && previewModal && !previewModal.hidden) closeVoucherPreviewModal();
  });

  document.querySelector('[data-add-voucher]')?.addEventListener('click', () => {
    const amount = getActiveVoucherValue();
    const voucherUseScope = 'Europe website';
    const recipientName = toInput?.value.trim() || '';
    const senderName = fromInput?.value.trim() || '';
    const recipientEmail = emailInput?.value.trim() || '';
    const confirmEmail = confirmEmailInput?.value.trim() || '';
    const timing = sendLater?.checked ? 'scheduled' : 'now';
    if (usingCustomValue && Number(customInput?.value || 0) < 100) {
      alert('Custom voucher amount must be at least €100.');
      customInput?.focus();
      return;
    }
    if (!recipientName || !senderName || !recipientEmail || !confirmEmail) {
      alert('Please fill To, From, recipient email, and confirm recipient email.');
      return;
    }
    if (recipientEmail.toLowerCase() !== confirmEmail.toLowerCase()) {
      alert('Recipient email and confirmation email do not match.');
      return;
    }
    if (timing === 'scheduled' && !deliveryDate?.value) {
      alert('Please choose a requested delivery date.');
      return;
    }
    const shipping = 0;
    const total = amount;
    const cart = JSON.parse(localStorage.getItem('demoCart') || '[]').filter(i => i.id !== 'europe-e-gift-voucher');
    cart.push({
      id: 'europe-e-gift-voucher',
      type: 'voucher',
      qty: 1,
      amount,
      voucherUseScope,
      country: '',
      countryFee: 0,
      shippingFee: shipping,
      total,
      voucherCode: getVoucherCode(),
      recipientName,
      senderName,
      recipientEmail,
      confirmRecipientEmail: confirmEmail,
      message: messageInput?.value || '',
      deliveryTiming: timing,
      requestedDeliveryDate: timing === 'scheduled' ? deliveryDate?.value : '',
      requestedDeliveryTime: timing === 'scheduled' ? deliveryTime?.value : '',
      note: 'E-gift voucher',
      customAmount: usingCustomValue
    });
    localStorage.setItem('demoCart', JSON.stringify(cart));
    window.location.href = 'cart.html';
  });
  update();
}

// Override addToCart so normal products still work and voucher opens its configurator.
function addToCart(id) {
  if (id === 'europe-e-gift-voucher') {
    window.location.href = 'e-voucher.html';
    return;
  }
  const cart = JSON.parse(localStorage.getItem('demoCart') || '[]');
  const existing = cart.find(i => i.id === id && !i.type);
  if (existing) existing.qty += 1; else cart.push({ id, qty: 1 });
  localStorage.setItem('demoCart', JSON.stringify(cart));
  alert('Added to demo cart');
}

function getCartItems() {
  const cart = JSON.parse(localStorage.getItem('demoCart') || '[]');
  return cart.map(item => {
    if (item.type === 'voucher' || item.id === 'europe-e-gift-voucher') {
      const amount = Number(item.amount || 100);
      const shippingFee = 0;
      return { ...item, type: 'voucher', qty: 1, amount, shippingFee, total: amount, product: EUROPE_VOUCHER_PRODUCT };
    }
    const product = allProducts.find(p => p.id === item.id);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
}

function voucherDeliveryLabel(item) {
  return item.deliveryTiming === 'scheduled' && item.requestedDeliveryDate
    ? `Scheduled: ${item.requestedDeliveryDate} ${item.requestedDeliveryTime || ''}`
    : 'Send now';
}

function voucherCartLine(item) {
  return `<div class="cart-item voucher-cart-item">
    <div class="cart-mini-thumb voucher-cart-thumb"><div class="voucher-mini-card small"><strong>EUROPE</strong><span>E-GIFT VOUCHER</span><b>${formatCurrency(item.amount, 'EUR')}</b></div></div>
    <div><h3>Europe E-Gift Voucher</h3><p>To: ${escapeHtml(item.recipientName || 'Recipient')} • From: ${escapeHtml(item.senderName || 'Sender')} • ${voucherDeliveryLabel(item)}</p><p>Digital e-gift voucher delivered by email.</p></div>
    <strong>${formatCurrency(item.total, 'EUR')}</strong>
  </div>`;
}

function renderCart() {
  const el = document.querySelector('[data-cart]');
  if (!el) return;
  const items = getCartItems();
  if (!items.length) {
    el.innerHTML = `<div class="card"><h3>Your demo cart is empty</h3><p>Add a perfume or create an e-voucher to preview this cart.</p><a href="shop.html" class="btn">Shop perfumes</a> <a href="e-voucher.html" class="btn secondary">Create E-Voucher</a></div>`;
    return;
  }
  let qarTotal = 0;
  let eurTotal = 0;
  const lines = items.map(item => {
    if (item.type === 'voucher') { eurTotal += item.total; return voucherCartLine(item); }
    const p = item.product;
    qarTotal += (p.price || 0) * item.qty;
    return `<div class="cart-item"><div class="cart-mini-thumb">${imgOrBottle(p)}</div><div><h3>${p.name}</h3><p>${p.shortDescription || ''}</p><span class="badge">Qty ${item.qty}</span></div><strong>QAR ${(p.price || 0) * item.qty}</strong></div>`;
  }).join('');
  const totals = `${qarTotal ? `<div class="price-row"><span>Perfume subtotal</span><strong>QAR ${qarTotal}</strong></div>` : ''}${eurTotal ? `<div class="price-row"><span>E-voucher total</span><strong>€${eurTotal}</strong></div>` : ''}`;
  el.innerHTML = `<div class="cart-layout"><div class="module">${lines}</div><div class="module"><h3>Order summary</h3>${totals}<p>Demo cart only.</p><a class="btn block" href="checkout.html">Continue to Checkout</a><a class="btn secondary block" style="margin-top:10px" href="e-voucher.html">Edit / Create E-Voucher</a><button class="btn secondary block" style="margin-top:10px" onclick="localStorage.removeItem('demoCart'); location.reload()">Clear demo cart</button></div></div>`;
}

function renderVoucherCheckout(items) {
  const root = document.querySelector('[data-checkout]');
  const voucher = items.find(i => i.type === 'voucher');
  root.innerHTML = `
    <form class="checkout-layout" id="checkout_form">
      <div class="checkout-main">
        <section class="module checkout-step">
          <div class="checkout-step-head"><span>1</span><div><h3>Buyer information</h3><p>The buyer receives the order confirmation and pays the full voucher total.</p></div></div>
          <div class="form-grid">
            <input class="input" name="first_name" placeholder="First name" required>
            <input class="input" name="last_name" placeholder="Last name" required>
            <input class="input" name="email" type="email" placeholder="Buyer email address" required>
            <input class="input" name="phone" placeholder="Mobile number" required>
          </div>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>2</span><div><h3>E-gift card delivery details</h3><p>These fields control the e-gift card email and preview.</p></div></div>
          <div class="form-grid">
            <input class="input" id="checkout_recipient_name" placeholder="To: recipient name" value="${escapeHtml(voucher.recipientName || '')}" required>
            <input class="input" id="checkout_sender_name" placeholder="From: sender name" value="${escapeHtml(voucher.senderName || '')}" required>
            <input class="input" id="checkout_recipient_email" type="email" placeholder="Recipient email" value="${escapeHtml(voucher.recipientEmail || '')}" required>
            <input class="input" id="checkout_recipient_email_confirm" type="email" placeholder="Confirm recipient email" value="${escapeHtml(voucher.confirmRecipientEmail || voucher.recipientEmail || '')}" required>
          </div>
          <textarea class="input checkout-textarea" id="checkout_voucher_message" maxlength="400" placeholder="Gift message optional">${escapeHtml(voucher.message || '')}</textarea>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>3</span><div><h3>Requested delivery date</h3><p>Send immediately or schedule the e-gift card for a selected date.</p></div></div>
          <div class="option-grid voucher-date-options">
            <label class="option-card"><input type="radio" name="checkout_delivery_timing" value="now" ${voucher.deliveryTiming !== 'scheduled' ? 'checked' : ''}><div><strong>Send this e-gift card now</strong><span>Recipient receives it after confirmation.</span></div></label>
            <label class="option-card"><input type="radio" name="checkout_delivery_timing" value="scheduled" ${voucher.deliveryTiming === 'scheduled' ? 'checked' : ''}><div><strong>Send on selected date</strong><span>Use the date and time below.</span></div></label>
          </div>
          <div class="form-grid voucher-schedule-fields" id="checkout_schedule_fields" ${voucher.deliveryTiming === 'scheduled' ? '' : 'hidden'}>
            <input class="input" id="checkout_delivery_date" type="date" value="${escapeHtml(voucher.requestedDeliveryDate || '')}">
            <select class="select" id="checkout_delivery_time">
              ${['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => `<option value="${t}" ${t === voucher.requestedDeliveryTime ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
        </section>

        <section class="module checkout-step">
          <div class="checkout-step-head"><span>4</span><div><h3>Payment method</h3><p>Demo options only. Developers can connect the real European payment gateway.</p></div></div>
          <div class="option-grid">
            <label class="option-card"><input type="radio" name="payment_method" value="card" checked><div><strong>Card payment</strong><span>Visa / Mastercard / debit card</span></div></label>
            <label class="option-card"><input type="radio" name="payment_method" value="applepay"><div><strong>Apple Pay / Google Pay</strong><span>Fast mobile checkout</span></div></label>
          </div>
        </section>
      </div>
      <aside class="checkout-side">
        <div data-checkout-summary></div>
        <button class="btn block checkout-place-order" type="submit">Place Demo Voucher Order</button>
        <a class="btn secondary block" style="margin-top:10px" href="e-voucher.html">Back to E-Voucher</a>
        <div class="checkout-trust module"><h3>Why this helps sales</h3><div class="list"><div class="list-item"><div class="icon yes">✓</div><div><strong>Simple checkout</strong><br><span>The buyer pays the voucher value only.</span></div></div><div class="list-item"><div class="icon yes">✓</div><div><strong>Clear gift details</strong><br><span>To, From, delivery date, and message are saved with the order.</span></div></div></div></div>
      </aside>
    </form>
    <div class="checkout-success" id="checkout_success" hidden><div class="module"><h2>Demo voucher order placed</h2><p>This confirms the voucher checkout flow only. Developers can connect this to voucher code generation, email delivery, payment, and voucher redemption rules.</p><a class="btn" href="shop.html">Continue shopping</a></div></div>`;

  const checkoutDeliveryDate = document.querySelector('#checkout_delivery_date');
  if (checkoutDeliveryDate) checkoutDeliveryDate.min = new Date().toISOString().split('T')[0];

  function getCheckoutTiming() {
    return document.querySelector('input[name="checkout_delivery_timing"]:checked')?.value || 'now';
  }

  function updateVoucherSummary() {
    const timing = getCheckoutTiming();
    const scheduleFields = document.querySelector('#checkout_schedule_fields');
    if (scheduleFields) scheduleFields.hidden = timing !== 'scheduled';
    voucher.deliveryTiming = timing;
    voucher.requestedDeliveryDate = timing === 'scheduled' ? (document.querySelector('#checkout_delivery_date')?.value || '') : '';
    voucher.requestedDeliveryTime = timing === 'scheduled' ? (document.querySelector('#checkout_delivery_time')?.value || '') : '';
    voucher.shippingFee = 0;
    voucher.total = voucher.amount;
    const summaryEl = document.querySelector('[data-checkout-summary]');
    const delivery = voucherDeliveryLabel(voucher);
    summaryEl.innerHTML = `<div class="module checkout-summary-card"><h3>Voucher summary</h3><div class="checkout-summary-list"><div class="checkout-summary-item"><div class="checkout-item-thumb voucher-checkout-thumb"><div class="voucher-mini-card tiny"><strong>EU</strong><span>VOUCHER</span></div></div><div><strong>Europe E-Gift Voucher</strong><span>To: ${escapeHtml(document.querySelector('#checkout_recipient_name')?.value || voucher.recipientName || '')}</span><span>From: ${escapeHtml(document.querySelector('#checkout_sender_name')?.value || voucher.senderName || '')}</span><span>${delivery}</span></div><b>${formatCurrency(voucher.amount, 'EUR')}</b></div></div><div class="summary-line"><span>Voucher value</span><strong>${formatCurrency(voucher.amount, 'EUR')}</strong></div><div class="summary-line"><span>Taxes</span><strong>Included</strong></div><div class="summary-line total"><span>Total to pay</span><strong>${formatCurrency(voucher.total, 'EUR')}</strong></div><p class="checkout-note">Digital e-gift voucher delivered by email.</p></div>`;
  }
  document.querySelectorAll('#checkout_delivery_date, #checkout_delivery_time, #checkout_recipient_name, #checkout_sender_name, input[name="checkout_delivery_timing"]').forEach(el => {
    el.addEventListener('input', updateVoucherSummary);
    el.addEventListener('change', updateVoucherSummary);
  });
  updateVoucherSummary();
  document.querySelector('#checkout_form')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#checkout_recipient_email')?.value.trim() || '';
    const confirmEmail = document.querySelector('#checkout_recipient_email_confirm')?.value.trim() || '';
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      alert('Recipient email and confirmation email do not match.');
      return;
    }
    if (getCheckoutTiming() === 'scheduled' && !document.querySelector('#checkout_delivery_date')?.value) {
      alert('Please choose a requested delivery date.');
      return;
    }
    localStorage.removeItem('demoCart');
    document.querySelector('#checkout_form').style.display = 'none';
    document.querySelector('#checkout_success').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Override checkout for voucher-only carts; normal checkout remains for perfume orders.
const originalRenderCheckout = renderCheckout;
function renderCheckout() {
  const root = document.querySelector('[data-checkout]');
  if (!root) return;
  const items = getCartItems();
  if (!items.length) {
    root.innerHTML = `<div class="card"><h3>Your cart is empty</h3><p>Add a perfume or create an e-voucher to preview the checkout page.</p><a href="shop.html" class="btn">Shop perfumes</a> <a href="e-voucher.html" class="btn secondary">Create E-Voucher</a></div>`;
    return;
  }
  if (items.every(i => i.type === 'voucher')) {
    renderVoucherCheckout(items);
    return;
  }
  // For mixed carts, show the normal checkout plus voucher line in the cart. Production should usually separate currencies.
  originalRenderCheckout();
}

document.addEventListener('DOMContentLoaded', setupVoucherWidget);
