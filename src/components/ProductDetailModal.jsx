import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { EXTRA_INGREDIENTS, COMPANION_ITEMS } from '../data/defaultMenu';

export default function ProductDetailModal({
  item,
  onClose,
  onAddToCart,
  onQuickOrder
}) {
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [isExtrasOpen, setIsExtrasOpen] = useState(true);
  const [specialNote, setSpecialNote] = useState('');

  if (!item) return null;

  // Ürüne ait varsayılan malzemeler
  const itemIngredients = Array.isArray(item.ingredients) && item.ingredients.length > 0
    ? item.ingredients
    : (item.categoryId === 'waffles' || item.categoryId === 'menus')
      ? ['Belçika Waffle Hamuru', 'Sütlü Çikolata', 'Beyaz Çikolata', 'Muz', 'Çilek', 'Fındık Kırığı']
      : [];

  // Malzeme çıkarma toggle
  const toggleRemoveIngredient = (ing) => {
    setRemovedIngredients(prev => {
      if (prev.includes(ing)) {
        return prev.filter(i => i !== ing);
      } else {
        return [...prev, ing];
      }
    });
  };

  // Ekstra malzeme toggle
  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  // Yanında iyi gider toggle
  const toggleCompanion = (comp) => {
    setSelectedCompanions(prev => {
      const exists = prev.find(c => c.id === comp.id);
      if (exists) {
        return prev.filter(c => c.id !== comp.id);
      } else {
        return [...prev, comp];
      }
    });
  };

  // Toplam Fiyat Hesabı
  const basePrice = item.price || 0;
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0);
  const companionsTotal = selectedCompanions.reduce((sum, c) => sum + (c.price || 0), 0);
  const calculatedTotal = basePrice + extrasTotal + companionsTotal;

  // Sepete ekleme paketi oluşturma
  const createOrderPayload = () => {
    // Çıkarılan ve eklenen malzemeleri açıklama notu olarak hazırla
    const customizations = [];
    if (removedIngredients.length > 0) {
      customizations.push(`Çıkarılsın: ${removedIngredients.join(', ')}`);
    }
    if (selectedExtras.length > 0) {
      customizations.push(`Ekstra: ${selectedExtras.map(e => `${e.name} (+${e.price}TL)`).join(', ')}`);
    }
    if (selectedCompanions.length > 0) {
      customizations.push(`Yanında: ${selectedCompanions.map(c => `${c.name} (+${c.price}TL)`).join(', ')}`);
    }
    if (specialNote.trim()) {
      customizations.push(`Not: ${specialNote.trim()}`);
    }

    return {
      ...item,
      quantity: 1,
      price: calculatedTotal,
      basePrice,
      removedIngredients,
      selectedExtras,
      selectedCompanions,
      specialNote: customizations.join(' | ')
    };
  };

  const handleAddToCart = () => {
    const payload = createOrderPayload();
    onAddToCart(payload);
    onClose();
  };

  const handleQuickOrder = () => {
    const payload = createOrderPayload();
    onAddToCart(payload);
    if (onQuickOrder) {
      onQuickOrder();
    }
    onClose();
  };

  const isWaffleOrMenu = item.categoryId === 'waffles' || item.categoryId === 'menus';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl relative font-sans text-stone-900">
        
        {/* ÜST KOYU BAR (Fotoğraftaki Tasarım) */}
        <div className="bg-stone-950 text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-base font-black tracking-wide font-brand text-white">
            Waffloq
          </h3>

          <div className="flex items-center gap-1 text-white/70 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] hidden xs:inline">Bildir</span>
          </div>
        </div>

        {/* KAYDIRILABİLİR İÇERİK ALANI */}
        <div className="overflow-y-auto flex-1 pb-24 divide-y divide-stone-100">
          
          {/* Ürün Görseli & Başlık Bilgisi */}
          <div className="p-4 sm:p-5">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 mb-4 border border-stone-200 shadow-xs">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80';
                }}
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                  {item.name}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="text-xl font-black text-waffloq-800 shrink-0">
                {item.price} TL
              </span>
            </div>
          </div>

          {/* 1. BÖLÜM: MALZEMELER - ÇIKARMAK İSTEDİĞİNİZ MALZEMELERİ SEÇİNİZ (Fotoğraf 3) */}
          {isWaffleOrMenu && itemIngredients.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50/60">
              <h3 className="text-base font-black text-stone-900">
                Malzemeler
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 mb-3.5 font-medium">
                Lütfen çıkarmak istediğiniz malzemeleri seçiniz
              </p>

              <div className="flex flex-wrap gap-2.5">
                {itemIngredients.map((ing, idx) => {
                  const isRemoved = removedIngredients.includes(ing);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRemoveIngredient(ing)}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                        isRemoved
                          ? 'bg-rose-50 border-rose-400 text-rose-700 line-through scale-98 shadow-inner'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      {isRemoved && <span className="text-rose-600 no-underline font-black text-xs">✕</span>}
                      <span>{ing}</span>
                      {isRemoved && <span className="text-[10px] text-rose-500 no-underline font-normal">(Çıkarıldı)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. BÖLÜM: EKSTRA MALZEME (Fotoğraf 1 & 2) */}
          {isWaffleOrMenu && (
            <div className="p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setIsExtrasOpen(!isExtrasOpen)}
                className="w-full flex items-center justify-between text-left group"
              >
                <h3 className="text-base font-black text-stone-900">
                  Ekstra Malzeme
                </h3>
                <span className="p-1 rounded-lg text-stone-500 group-hover:bg-stone-100 transition-colors">
                  {isExtrasOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
              </button>

              {isExtrasOpen && (
                <div className="mt-3 divide-y divide-stone-100">
                  {EXTRA_INGREDIENTS.map((extra) => {
                    const isChecked = selectedExtras.some(e => e.id === extra.id);
                    return (
                      <label
                        key={extra.id}
                        className="flex items-center justify-between py-3 cursor-pointer select-none group hover:bg-stone-50/80 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleExtra(extra)}
                            className="w-5 h-5 rounded-md border-stone-300 text-stone-900 focus:ring-0 cursor-pointer accent-stone-900"
                          />
                          <span className={`text-sm ${isChecked ? 'font-black text-stone-900' : 'font-medium text-stone-700'}`}>
                            {extra.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          +{extra.price} TL
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. BÖLÜM: YANINDA İYİ GİDER (Fotoğraf 2 & 4) */}
          <div className="p-4 sm:p-5">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5 mb-3">
              <span>❤️</span>
              <span>Yanında İyi Gider</span>
            </h3>

            <div className="divide-y divide-stone-100">
              {COMPANION_ITEMS.map((comp) => {
                const isChecked = selectedCompanions.some(c => c.id === comp.id);
                return (
                  <label
                    key={comp.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer select-none group hover:bg-stone-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompanion(comp)}
                        className="w-5 h-5 rounded-md border-stone-300 text-stone-900 focus:ring-0 cursor-pointer accent-stone-900 shrink-0"
                      />
                      <img
                        src={comp.image}
                        alt={comp.name}
                        className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&q=80';
                        }}
                      />
                      <span className={`text-xs sm:text-sm truncate ${isChecked ? 'font-black text-stone-900' : 'font-medium text-stone-700'}`}>
                        {comp.name}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-stone-900 shrink-0 ml-2">
                      {comp.price} TL
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mutfak Notu Alanı */}
          <div className="p-4 sm:p-5 bg-stone-50/50">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Mutfak Notu (İsteğe bağlı):
            </label>
            <input
              type="text"
              placeholder="Örn: Bol peçete rica, çatallı servis..."
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
            />
          </div>
        </div>

        {/* ALT SABİT ÇUBUK: FİYAT, HIZLI SİPARİŞ VER VE SEPETE EKLE (Fotoğraf 1 & 2) */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 z-30 bg-white p-3 sm:p-4 border-t border-stone-200 shadow-2xl flex items-center justify-between gap-3">
          <div className="shrink-0 pl-1">
            <span className="text-xl sm:text-2xl font-black text-stone-950 block">
              {calculatedTotal} TL
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={handleQuickOrder}
              className="py-3 px-4 sm:px-5 rounded-full border-2 border-stone-900 text-stone-900 font-extrabold text-xs sm:text-sm hover:bg-stone-100 transition-colors whitespace-nowrap"
            >
              Hızlı Sipariş Ver
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className="py-3 px-5 sm:px-6 rounded-full bg-stone-950 hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md transition-colors whitespace-nowrap"
            >
              Sepete Ekle
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
