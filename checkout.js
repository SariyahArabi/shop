const LS_CART = 'store.cart';
const $ = (s) => document.querySelector(s);

function getCart(){ return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
function saveCart(v){ localStorage.setItem(LS_CART, JSON.stringify(v)); }
function currency(n){ return Number(n).toFixed(2); }

function renderSummary(){
  const wrap = $('#summary');
  const totalEl = $('#summaryTotal');
  const cart = getCart();
  if (!cart.length){ wrap.innerHTML = '<p class="muted">السلة فارغة.</p>'; totalEl.textContent = '$0.00'; return; }
  wrap.innerHTML = cart.map(i => `
    <div class="row">
      <div><strong>${i.name}</strong><br><small class="muted">$${currency(i.price)} × ${i.qty}</small></div>
      <div>$${currency(i.price * i.qty)}</div>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = '$' + currency(total);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  $('#clearCart2')?.addEventListener('click', () => { localStorage.removeItem(LS_CART); renderSummary(); });

  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // In real life, redirect to payment link (e.g., Stripe Payment Link)
    // window.location.href = 'https://buy.stripe.com/your-payment-link';
    window.location.href = 'success.html';
  });
});
