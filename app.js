// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const currency = (n) => Number(n).toFixed(2);

// ===== API Configuration =====
const API_URL = "https://script.google.com/macros/s/AKfycbyP6bIslaGyDruE73JnwcHFDKlaOA5co8W0Z9VOBuExgsUMWTDGHKwyDJhr9gXVf8MEww/exec";
const LS_CART = 'store.cart';

// ===== API Functions =====
async function getProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    return [];
  }
}

// ===== Cart Functions (LocalStorage) =====
function saveCart(c) { 
  localStorage.setItem(LS_CART, JSON.stringify(c)); 
  updateCartCount(); 
}

function getCart() { 
  return JSON.parse(localStorage.getItem(LS_CART) || '[]'); 
}

function addToCart(p) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === p.id);
  if (idx > -1) cart[idx].qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  saveCart(cart);
  openCart();
  renderCart();
}

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const el = $('#cartCount');
  if (el) el.textContent = count;
}

// ===== UI Rendering =====
async function renderProducts() {
  const wrap = $('#products');
  if (!wrap) return;
  
  try {
    const products = await getProducts();
    
    if (!products.length) {
      wrap.innerHTML = '<p class="muted">لا توجد منتجات بعد.</p>';
      return;
    }
    
    wrap.innerHTML = products.map(p => `
      <div class="card product">
        <img loading="lazy" src="${p.image || 'https://placehold.co/600x400?text=Product'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">${p.description || ''}</p>
        <div class="row">
          <span class="price">$${currency(p.price)}</span>
          <button class="btn primary" data-add="${p.id}">أضف للسلة</button>
        </div>
      </div>
    `).join('');

    // bind buttons
    wrap.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-add');
        const p = products.find(x => x.id === id);
        if (p) addToCart(p);
      });
    });
    
  } catch (error) {
    wrap.innerHTML = '<p class="muted">خطأ في تحميل المنتجات</p>';
  }
}

function renderCart() {
  const body = $('#cartItems');
  const totalEl = $('#cartTotal');
  if (!body || !totalEl) return;
  
  const cart = getCart();
  if (!cart.length) {
    body.innerHTML = '<p class="muted">السلة فارغة.</p>';
  } else {
    body.innerHTML = cart.map(i => `
      <div class="row">
        <div>
          <strong>${i.name}</strong><br>
          <small class="muted">$${currency(i.price)} × ${i.qty}</small>
        </div>
        <div class="row" style="gap:.3rem">
          <button class="btn" data-dec="${i.id}">−</button>
          <button class="btn" data-inc="${i.id}">+</button>
          <button class="btn danger ghost" data-del="${i.id}">حذف</button>
        </div>
      </div>
    `).join('');
  }
  
  totalEl.textContent = '$' + currency(cartTotal());

  body.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => changeQty(b.getAttribute('data-inc'), +1));
  body.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => changeQty(b.getAttribute('data-dec'), -1));
  body.querySelectorAll('[data-del]').forEach(b => b.onclick = () => removeFromCart(b.getAttribute('data-del')));
}

// Drawer events
function openCart() { 
  $('#cartDrawer')?.classList.add('open'); 
  $('#overlay')?.classList.add('show'); 
}

function closeCart() { 
  $('#cartDrawer')?.classList.remove('open'); 
  $('#overlay')?.classList.remove('show'); 
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  updateCartCount();

  $('#openCart')?.addEventListener('click', openCart);
  $('#closeCart')?.addEventListener('click', closeCart);
  $('#overlay')?.addEventListener('click', closeCart);
  $('#clearCart')?.addEventListener('click', () => { 
    localStorage.removeItem(LS_CART); 
    renderCart(); 
    updateCartCount(); 
  });
});
