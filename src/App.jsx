import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import MenuItemCard from './components/MenuItemCard';
import ProductDetailModal from './components/ProductDetailModal';
import QRCodeModal from './components/QRCodeModal';
import AdminPanel from './components/AdminPanel';
import CartDrawer from './components/CartDrawer';
import { menuService } from './firebase/menuService';
import { isFirebaseConfigured } from './firebase/config';
import { SHOP_INFO } from './data/defaultMenu';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all-waffles');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Masa Numarası (URL query params: ?masa=5 veya ?table=5)
  const [tableNumber, setTableNumber] = useState(null);

  useEffect(() => {
    // URL'den masa no oku
    const params = new URLSearchParams(window.location.search);
    const tNum = params.get('masa') || params.get('table') || params.get('m');
    if (tNum) {
      setTableNumber(tNum);
    }

    // Menü verilerini sıfırla ve yeni listeyi yükle
    loadData();
  }, []);

  const loadData = async () => {
    const items = await menuService.resetToDefaults();
    const cats = await menuService.getCategories();
    setCategories(cats);
    setMenuItems(items);
    if (cats.length > 0) {
      setSelectedCategory(cats[0].id);
    }
  };

  // Sepet İşlemleri
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.specialNote === product.specialNote);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + (product.quantity || 1);
        return updated;
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const handleUpdateCartQuantity = (idx, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setCartItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Admin Güncellemeleri
  const handleUpdateMenuItem = async (updatedItem) => {
    const updatedList = await menuService.updateMenuItem(updatedItem);
    setMenuItems(updatedList);
  };

  const handleAddMenuItem = async (newItem) => {
    const updatedList = await menuService.addMenuItem(newItem);
    setMenuItems(updatedList);
  };

  const handleDeleteMenuItem = async (id) => {
    const updatedList = await menuService.deleteMenuItem(id);
    setMenuItems(updatedList);
  };

  const handleResetDefaults = async () => {
    const defaultList = await menuService.resetToDefaults();
    setMenuItems(defaultList);
  };

  // Arama & Kategori Filtreleme
  const filteredProducts = useMemo(() => {
    if (searchQuery.trim()) {
      return menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return menuItems.filter(item => item.categoryId === selectedCategory || selectedCategory === 'all-waffles');
  }, [menuItems, searchQuery, selectedCategory]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#edf9f8] via-[#e2f4f2] to-[#d3f0ec] text-waffloq-950 flex flex-col justify-between selection:bg-waffloq-600 selection:text-white">
      <div>
        {/* Üst Başlık & Arama */}
        <Header
          tableNumber={tableNumber}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenQrModal={() => setShowQrModal(true)}
          onOpenAdminModal={() => setShowAdminModal(true)}
          isFirebaseActive={isFirebaseConfigured}
        />

        {/* Yatay Kategori Çubuğu (Birden fazla kategori varsa göster) */}
        {!searchQuery && categories.length > 1 && (
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* Ana İçerik */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Arama Sonuçları Başlığı */}
          {searchQuery ? (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-waffloq-950">
                  Arama Sonuçları: <span className="text-waffloq-700">"{searchQuery}"</span>
                </h2>
                <span className="text-xs font-bold text-waffloq-800 bg-waffloq-100 px-3.5 py-1.5 rounded-full border border-waffloq-200">
                  {filteredProducts.length} Ürün bulundu
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-waffloq-300 text-waffloq-900 text-xs font-extrabold mb-2 shadow-2xs">
                <span>{selectedCategory === 'drinks' ? '🥤' : '🧇'}</span>
                <span>{selectedCategory === 'drinks' ? 'Soğuk & Ferahlatıcı' : 'Taze & Çıtır Lezzetler'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-brand font-black text-waffloq-950 tracking-wider">
                {categories.find(c => c.id === selectedCategory)?.name || 'Waffloq Menü'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 font-medium mt-1.5 max-w-lg">
                {categories.find(c => c.id === selectedCategory)?.description || 'Özenle hazırladığımız lezzetlerimiz'}
              </p>
            </div>
          )}

          {/* Standart Ürün Grid'i */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProducts.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onSelect={(prod) => setSelectedProduct(prod)}
                  onQuickAdd={(prod) => handleAddToCart(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-waffloq-200 shadow-sm">
              <span className="text-4xl mb-2 block">🧇</span>
              <p className="font-bold text-waffloq-950">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            </div>
          )}
        </main>
      </div>

      {/* Alt Footer */}
      <footer className="mt-14 py-10 bg-gradient-to-b from-waffloq-950 to-waffloq-900 text-waffloq-200 text-xs border-t border-waffloq-400/20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-waffloq-300 to-waffle-light shadow-md">
              <img src={SHOP_INFO.logo} alt="Logo" className="w-full h-full object-cover rounded-full bg-waffloq-950" />
            </div>
            <span className="font-brand font-black text-white text-base tracking-widest">{SHOP_INFO.name}</span>
            <span className="font-slogan text-[10px] font-bold text-waffloq-300 tracking-widest uppercase">{SHOP_INFO.tagline}</span>
          </div>

          <p className="pt-2 text-[10px] text-waffloq-400/80">
            {SHOP_INFO.name} © {new Date().getFullYear()} • QR Menü & Sipariş Sistemi
          </p>
        </div>
      </footer>

      {/* Sabit Yüzen Sepet / Sipariş Çubuğu (Floating Cart Bar) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full bg-gradient-to-r from-waffloq-700 via-waffloq-600 to-waffloq-500 text-white p-4 rounded-2xl shadow-2xl shadow-waffloq-600/40 flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all border border-waffloq-300/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
                {totalCartCount}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs uppercase tracking-wider text-waffloq-200">Sipariş Listeniz</div>
                <div className="text-sm font-extrabold">{totalCartCount} Ürün Seçildi</div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-black text-lg">
              <span>{totalCartPrice} TL</span>
              <span className="text-xs bg-black/20 px-2.5 py-1 rounded-lg">Görüntüle →</span>
            </div>
          </button>
        </div>
      )}

      {/* Modallar */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showQrModal && (
        <QRCodeModal
          onClose={() => setShowQrModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminPanel
          menuItems={menuItems}
          categories={categories}
          onUpdateItem={handleUpdateMenuItem}
          onAddItem={handleAddMenuItem}
          onDeleteItem={handleDeleteItem}
          onResetDefaults={handleResetDefaults}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        tableNumber={tableNumber}
      />
    </div>
  );
}
