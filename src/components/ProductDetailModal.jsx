import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

export default function ProductDetailModal({
  item,
  onClose,
  onAddToCart
}) {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  if (!item) return null;

  const unitPrice = item.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      ...item,
      quantity,
      selectedPrice: unitPrice,
      totalPrice,
      specialNote
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-waffloq-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-stone-800 shadow-2xl relative border border-waffloq-100 flex flex-col justify-between">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-waffloq-950/60 hover:bg-waffloq-950/80 text-white backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Üst Görsel */}
        <div className="relative aspect-square sm:aspect-video w-full bg-waffloq-50 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* İçerik */}
        <div className="p-5 sm:p-6 space-y-4 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-waffloq-950">{item.name}</h2>
              <span className="text-2xl font-black text-waffloq-700 shrink-0">
                {item.price} <span className="text-sm font-bold">TL</span>
              </span>
            </div>

            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Müşteri Notu */}
          <div>
            <label className="block text-xs font-bold text-waffloq-900 mb-1">Mutfak Notu (İsteğe bağlı):</label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="Örn: Bol peçete rica, çatallı servis..."
              className="w-full p-3 rounded-xl bg-waffloq-50/70 border border-waffloq-200 text-xs focus:outline-none focus:ring-2 focus:ring-waffloq-500"
            />
          </div>
        </div>

        {/* Alt Satır: Adet ve Sipariş Butonu */}
        <div className="p-4 sm:p-5 bg-waffloq-50/50 border-t border-waffloq-100 flex items-center justify-between gap-4">
          <div className="flex items-center bg-white border border-waffloq-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-waffloq-800 hover:bg-waffloq-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-waffloq-950 text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-waffloq-800 hover:bg-waffloq-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-waffloq-700 to-waffloq-500 hover:bg-waffloq-600 text-white font-extrabold text-sm transition-all shadow-md shadow-waffloq-600/30 flex items-center justify-between active:scale-98"
          >
            <span>Siparişe Ekle</span>
            <span className="text-waffloq-100 font-black text-base">{totalPrice} TL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
