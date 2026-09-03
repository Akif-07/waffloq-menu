import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, RefreshCw, Database, Sparkles } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/config';

export default function AdminPanel({
  menuItems,
  categories,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'add' | 'firebase'
  const [searchTerm, setSearchTerm] = useState('');

  // Yeni Ürün Form Durumu
  const [newForm, setNewForm] = useState({
    name: '',
    categoryId: 'all-waffles',
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
      categoryId: 'all-waffles',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
      available: true
    });
    setActiveTab('items');
  };

  const filteredItems = menuItems.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden text-stone-800 shadow-2xl relative border border-stone-200 flex flex-col">
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-choco-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-100">Waffloq Menü & Fiyat Paneli</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className="text-stone-300">
                  {isFirebaseConfigured ? 'Firebase Cloud Firestore Bağlı' : 'Yerel Depo Modu'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'items'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ürün & Fiyat Listesi ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'add'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ürün Ekle</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'firebase'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Firebase Kurulum Rehberi
          </button>
        </div>

        {/* İçerik Bölümü */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-50/50">
          {/* 1. SEKME: Ürün Listesi ve Hızlı Düzenleme */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Filtre ve Arama */}
              <div>
                <input
                  type="text"
                  placeholder="Ürün adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>

              {/* Ürün Listesi */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 hover:border-stone-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">{item.name}</h4>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span className="font-semibold text-brand-600">{item.price} TL</span>
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
                        className="w-20 p-1 text-center font-bold text-xs bg-stone-100 border border-stone-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                        title="Fiyatı değiştirmek için yazıp dışına tıklayın"
                      />

                      {/* Stok Durumu Toggle */}
                      <button
                        onClick={() => onUpdateItem({ ...item, available: item.available === false ? true : false })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
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
                <span className="text-stone-400">5 orijinal Waffloq ürününü geri yüklemek için:</span>
                <button
                  onClick={() => {
                    if (confirm("Menü orijinal 5 ürüne sıfırlanacak. Onaylıyor musunuz?")) {
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
                    placeholder="Örn: Lotus Waffle"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Fiyat (TL) *</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={newForm.price}
                    onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Görsel URL</label>
                  <input
                    type="url"
                    value={newForm.image}
                    onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Açıklama & Malzemeler</label>
                  <textarea
                    rows={2}
                    placeholder="İçerik bilgisi..."
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-brand-500/20"
              >
                Ürünü Menüye Ekle
              </button>
            </form>
          )}

          {/* 3. SEKME: Firebase Bağlantı Rehberi */}
          {activeTab === 'firebase' && (
            <div className="space-y-3 text-xs text-stone-700">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-900 text-sm mb-1">Firebase Spark Planı Bağlantısı</h4>
                <p className="text-amber-800 leading-relaxed">
                  Projeniz Firebase Cloud Firestore ile tam uyumludur. Bilgileri `.env` veya `src/firebase/config.js` dosyasına girdiğinizde veriler anında bulutla senkronize olur.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
