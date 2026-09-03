import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, RefreshCw, Database, KeyRound, Lock, LogOut } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/config';

export default function AdminPanel({
  menuItems,
  categories,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
  onClose,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'add' | 'security' | 'firebase'
  const [searchTerm, setSearchTerm] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Yeni Ürün Form Durumu
  const [newForm, setNewForm] = useState({
    name: '',
    categoryId: 'waffles',
    price: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
    available: true
  });

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.price) {
      alert("Lütfen ürün adı ve fiyatını giriniz.");
      return;
    }

    const itemToAdd = {
      ...newForm,
      price: Number(newForm.price)
    };

    onAddItem(itemToAdd);
    alert("Ürün başarıyla menüye eklendi!");
    setNewForm({
      name: '',
      categoryId: 'waffles',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
      available: true
    });
    setActiveTab('items');
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      alert("Şifre en az 4 karakter olmalıdır.");
      return;
    }
    localStorage.setItem('waffloq_admin_pin', newPin.trim());
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setNewPin('');
    }, 2500);
  };

  const filteredItems = menuItems.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-waffloq-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden text-stone-800 shadow-2xl relative border border-waffloq-200 flex flex-col">
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-waffloq-950 to-waffloq-900 text-white flex items-center justify-between border-b border-waffloq-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-waffloq-800 border border-waffloq-400/30 flex items-center justify-center text-waffloq-300 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-brand">WAFFLOQ Yönetim Paneli</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="text-waffloq-200 text-[11px]">
                  {isFirebaseConfigured ? 'Firebase Cloud Firestore Bağlı' : 'Yerel Depo Modu'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs text-rose-200 hover:text-white bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 py-1.5 px-3 rounded-xl transition-all"
              title="Güvenli Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2.5 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'items'
                ? 'border-waffloq-600 text-waffloq-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ürün & Fiyat Listesi ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 shrink-0 ${
              activeTab === 'add'
                ? 'border-waffloq-600 text-waffloq-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ürün Ekle</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 shrink-0 ${
              activeTab === 'security'
                ? 'border-waffloq-600 text-waffloq-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Şifre Ayarları</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'firebase'
                ? 'border-waffloq-600 text-waffloq-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Firebase Rehberi
          </button>
        </div>

        {/* İçerik Bölümü */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-50/50">
          {/* 1. SEKME: Ürün Listesi ve Hızlı Düzenleme */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Arama */}
              <div>
                <input
                  type="text"
                  placeholder="Ürün adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:ring-2 focus:ring-waffloq-400 outline-none"
                />
              </div>

              {/* Ürün Listesi */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 hover:border-waffloq-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">{item.name}</h4>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span className="font-bold text-waffloq-700">{item.price} TL</span>
                          <span>•</span>
                          <span className="capitalize">{item.categoryId === 'drinks' ? 'İçecek' : 'Waffle'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Fiyat Güncelleme */}
                      <input
                        type="number"
                        defaultValue={item.price}
                        onBlur={(e) => {
                          const newPrice = Number(e.target.value);
                          if (newPrice > 0 && newPrice !== item.price) {
                            onUpdateItem({ ...item, price: newPrice });
                          }
                        }}
                        className="w-20 p-1.5 text-center font-bold text-xs bg-stone-100 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-waffloq-500 outline-none"
                        title="Fiyatı değiştirmek için yazıp dışına tıklayın"
                      />

                      {/* Stok Durumu Toggle */}
                      <button
                        onClick={() => onUpdateItem({ ...item, available: item.available === false ? true : false })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          item.available !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.available !== false ? 'Stokta' : 'Tükendi'}
                      </button>

                      {/* Sil */}
                      <button
                        onClick={() => {
                          if (confirm(`"${item.name}" ürününü silmek istediğinize emin misiniz?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ürünü Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Varsayılana Sıfırla Butonu */}
              <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
                <span className="text-stone-400">Tüm menüyü orijinal listeye sıfırlamak için:</span>
                <button
                  onClick={() => {
                    if (confirm("Menü orijinal varsayılan haline sıfırlanacak. Onaylıyor musunuz?")) {
                      onResetDefaults();
                    }
                  }}
                  className="flex items-center gap-1 text-stone-600 hover:text-red-600 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. SEKME: Yeni Ürün Ekle */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Nutella Pankek"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-waffloq-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori *</label>
                  <select
                    value={newForm.categoryId}
                    onChange={(e) => setNewForm({ ...newForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-waffloq-400 outline-none"
                  >
                    <option value="waffles">🧇 Waffle Çeşitleri</option>
                    <option value="drinks">🥤 İçecekler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Fiyat (TL) *</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={newForm.price}
                    onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-waffloq-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Görsel URL</label>
                  <input
                    type="url"
                    value={newForm.image}
                    onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-waffloq-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Açıklama & Malzemeler</label>
                  <textarea
                    rows={2}
                    placeholder="İçerik bilgisi..."
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-waffloq-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-waffloq-600 hover:bg-waffloq-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-waffloq-600/20"
              >
                Ürünü Menüye Ekle
              </button>
            </form>
          )}

          {/* 3. SEKME: Şifre & Güvenlik Ayarları */}
          {activeTab === 'security' && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-waffloq-50 border border-waffloq-200 p-4 rounded-2xl text-xs text-waffloq-950">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-waffloq-700" />
                  <span>Yönetici Şifrenizi Değiştirin</span>
                </h4>
                <p className="text-stone-600">
                  Müşterilerinizin yönetim paneline ve fiyat düzenlemelerine erişememesi için şifrenizi dilediğiniz zaman güncelleyebilirsiniz.
                </p>
              </div>

              <form onSubmit={handleChangePin} className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Yeni Yönetici Şifresi:</label>
                  <input
                    type="text"
                    required
                    placeholder="Yeni Şifre (örn: 5432)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-waffloq-500 outline-none"
                  />
                </div>

                {pinSuccess && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <Check className="w-4 h-4" />
                    <span>Şifreniz başarıyla güncellendi!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-waffloq-600 hover:bg-waffloq-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Şifreyi Kaydet
                </button>
              </form>
            </div>
          )}

          {/* 4. SEKME: Firebase Bağlantı Rehberi */}
          {activeTab === 'firebase' && (
            <div className="space-y-3 text-xs text-stone-700">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-900 text-sm mb-1">Firebase Cloud Firestore</h4>
                <p className="text-amber-800 leading-relaxed">
                  Projeniz Cloud Firestore ile tam uyumludur. Bilgileri `.env` dosyasına girdiğinizde veriler anında bulutla senkronize olur.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
