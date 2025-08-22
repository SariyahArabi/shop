const API_URL = "https://script.google.com/macros/s/AKfycbyP6bIslaGyDruE73JnwcHFDKlaOA5co8W0Z9VOBuExgsUMWTDGHKwyDJhr9gXVf8MEww/exec"; // استبدل برابطك

// استبدال دالة getProducts القديمة
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

// إزالة دالة seedProducts القديمة لأننا لن نستخدم localStorage
// يمكنك حذفها أو تعليقها