import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import MenuItemCard from './components/MenuItemCard';
import ProductDetailModal from './components/ProductDetailModal';
import QRCodeModal from './components/QRCodeModal';
import AdminPanel from './components/AdminPanel';
import AdminAuthModal from './components/AdminAuthModal';
import CartDrawer from './components/CartDrawer';
import { menuService } from './firebase/menuService';
import { isFirebaseConfigured } from './firebase/config';
import { SHOP_INFO } from './data/defaultMenu';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('waffles');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Masa Numarası
  const [tableNumber, setTableNumber] = useState(null);

  // Data Load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tNum = params.get('masa') || params.get('table') || params.get('m');
      if (tNum) setTableNumber(tNum);
    } catch (e) { console.error(e); }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cats = await menuService.getCategories();
      setCategories(cats || []);
      
      let items = await menuService.getMenuItems();
      if (!items || items.length === 0) {
        items = await menuService.resetToDefaults();
      }
      setMenuItems(items || []);
      
      if (cats && cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    } catch (err) {
      console.error('loadData error:', err);
    }
  };

  // Cart
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id && i.specialNote === product.specialNote);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: (updated[idx].quantity || 1) + (product.quantity || 1) };
        return updated;
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const handleUpdateCartQty = (idx, qty) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setCartItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
    }
  };

  const handleRemoveFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Admin
  const handleOpenAdmin = () => {
    if (adminLoggedIn) {
      setShowAdminPanel(true);
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setAdminLoggedIn(true);
    setShowAdminAuth(false);
    setShowAdminPanel(true);
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setShowAdminPanel(false);
  };

  // Menu CRUD
  const handleUpdateItem = async (item) => {
    try {
      const list = await menuService.updateMenuItem(item);
      setMenuItems(list || []);
    } catch (e) { console.error(e); }
  };

  const handleAddItem = async (item) => {
    try {
      const list = await menuService.addMenuItem(item);
      setMenuItems(list || []);
    } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (id) => {
    try {
      const list = await menuService.deleteMenuItem(id);
      setMenuItems(list || []);
    } catch (e) { console.error(e); }
  };

  const handleResetDefaults = async () => {
    try {
      const list = await menuService.resetToDefaults();
      setMenuItems(list || []);
    } catch (e) { console.error(e); }
  };

  // Filter
  const filteredProducts = useMemo(() => {
    const safe = Array.isArray(menuItems) ? menuItems : [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return safe.filter(i => i && ((i.name || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)));
    }
    return safe.filter(i => i && i.categoryId === selectedCategory);
  }, [menuItems, searchQuery, selectedCategory]);

  const totalCartCount = cartItems.reduce((a, i) => a + (i.quantity || 1), 0);
  const totalCartPrice = cartItems.reduce((a, i) => a + ((i.price || 0) * (i.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#edf9f8] via-[#e2f4f2] to-[#d3f0ec] text-waffloq-950 flex flex-col justify-between selection:bg-waffloq-600 selection:text-white">
      <div>
        <Header
          tableNumber={tableNumber}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenQrModal={() => setShowQrModal(true)}
          onOpenAdminModal={handleOpenAdmin}
          isFirebaseActive={isFirebaseConfigured}
        />

        {!searchQuery && categories.length > 1 && (
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        <main className="max-w-4xl mx-auto px-4 py-8">
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

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProducts.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onSelect={prod => setSelectedProduct(prod)}
                  onQuickAdd={prod => handleAddToCart(prod)}
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

      {/* Footer */}
      <footer className="mt-14 py-10 bg-gradient-to-b from-waffloq-950 to-waffloq-900 text-waffloq-200 text-xs border-t border-waffloq-400/20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-waffloq-300 to-waffle-light shadow-md">
              <img src={SHOP_INFO.logo} alt="Logo" className="w-full h-full object-cover rounded-full bg-waffloq-950" />
            </div>
            <span className="font-brand font-black text-white text-base tracking-widest">{SHOP_INFO.name}</span>
            <span className="font-slogan text-[10px] font-bold text-waffloq-300 tracking-widest uppercase">{SHOP_INFO.tagline}</span>
          </div>
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-waffloq-300">
            <button
              onClick={handleOpenAdmin}
              className="text-waffloq-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              🔒 Yetkili Yönetim Girişi
            </button>
          </div>
          <p className="pt-2 text-[10px] text-waffloq-400/80">
            {SHOP_INFO.name} © {new Date().getFullYear()} • QR Menü & Sipariş Sistemi
          </p>
        </div>
      </footer>

      {/* Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
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

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showQrModal && (
        <QRCodeModal onClose={() => setShowQrModal(false)} />
      )}

      {/* Admin Auth */}
      <AdminAuthModal
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          menuItems={menuItems}
          categories={categories}
          onUpdateItem={handleUpdateItem}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onResetDefaults={handleResetDefaults}
          onClose={() => setShowAdminPanel(false)}
          onLogout={handleAdminLogout}
        />
      )}

      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
        tableNumber={tableNumber}
      />
    </div>
  );
}
