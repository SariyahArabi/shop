const API_URL = "https://script.google.com/macros/s/AKfycbyP6bIslaGyDruE73JnwcHFDKlaOA5co8W0Z9VOBuExgsUMWTDGHKwyDJhr9gXVf8MEww/exec"; // استبدل برابطك

// استبدال دوال localStorage بدوال API
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

async function saveProduct(product) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(product),
      headers: { "Content-Type": "application/json" }
    });
    return true;
  } catch (error) {
    console.error('خطأ في حفظ المنتج:', error);
    return false;
  }
}

async function deleteProduct(id) {
  try {
    // هذه وظيفة تحتاج إلى تعديل في Google Apps Script لدعم الحذف
    // حالياً سنقوم بحذف محلي ثم إعادة حفظ كل المنتجات
    const products = await getProducts();
    const updatedProducts = products.filter(p => p.id !== id);
    
    // حذف جميع المنتجات ثم إضافة المتبقي
    // (هذه طريقة مؤقتة حتى نضيف دعم للحذف في API)
    await clearAllProducts();
    for (const product of updatedProducts) {
      await saveProduct(product);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف المنتج:', error);
    return false;
  }
}

async function clearAllProducts() {
  // هذه تحتاج إلى دعم من جانب API
  // حالياً سنتركها فارغة لأن الحذف الكلي يحتاج تعديل في Google Apps Script
  console.log('وظيفة الحذف الكلي تحتاج تعديل في API');
}

// عرض المنتجات في واجهة الإدارة
async function renderAdmin() {
  const wrap = document.getElementById('adminProducts');
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
        <p class="muted">$${Number(p.price).toFixed(2)}</p>
        <div class="row">
          <button class="btn" data-edit="${p.id}">تعديل</button>
          <button class="btn danger ghost" data-del="${p.id}">حذف</button>
        </div>
      </div>
    `).join('');

    // إضافة event listeners للأزرار
    wrap.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-del');
        if (confirm('هل تريد حذف هذا المنتج؟')) {
          await deleteProduct(id);
          await renderAdmin();
        }
      };
    });

  } catch (error) {
    wrap.innerHTML = '<p class="muted">خطأ في تحميل المنتجات</p>';
  }
}

// دالة إضافة المنتجات العينة (يجب تعديلها)
async function seed() {
  if ((await getProducts()).length > 0) {
    alert('هناك منتجات بالفعل.');
    return;
  }
  
  const demoProducts = [
    { id: generateId(), name: 'قميص قطني', price: 19.99, image: 'https://images.unsplash.com/photo-1520974699644-0a56c1a8a9bf?q=80&w=800&auto=format&fit=crop', desc: 'قميص مريح 100% قطن.' },
    { id: generateId(), name: 'حقيبة يد', price: 34.50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', desc: 'حقيبة أنيقة للاستخدام اليومي.' },
  ];
  
  for (const product of demoProducts) {
    await saveProduct(product);
  }
  
  await renderAdmin();
  alert('تم إضافة المنتجات العينة');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  renderAdmin();

  // إضافة منتج جديد
  document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value || '0');
    const image = document.getElementById('image').value.trim();
    const desc = document.getElementById('desc').value.trim();

    if (!name || isNaN(price) || price < 0) {
      alert('يرجى إدخال اسم وسعر صحيحين.');
      return;
    }

    const product = {
      id: form.dataset.editing || generateId(),
      name: name,
      price: price,
      image: image,
      desc: desc
    };

    const success = await saveProduct(product);
    if (success) {
      alert('تم حفظ المنتج ✅');
      form.reset();
      delete form.dataset.editing;
      await renderAdmin();
    } else {
      alert('❌ حدث خطأ أثناء حفظ المنتج');
    }
  });

  // الأزرار الإضافية
  document.getElementById('seedBtn')?.addEventListener('click', seed);
  document.getElementById('clearBtn')?.addEventListener('click', function() {
    if (confirm('هل تريد حذف جميع المنتجات؟')) {
      clearAllProducts();
      renderAdmin();
    }
  });
});