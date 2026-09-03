import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuItemCard({
  item,
  onSelect,
  onQuickAdd
}) {
  const isAvailable = item.available !== false;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`group relative bg-white rounded-3xl p-4 border border-waffloq-200/80 shadow-card-soft hover:shadow-teal-glow transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden ${
        !isAvailable ? 'opacity-60 grayscale-[40%]' : 'hover:-translate-y-1.5 hover:border-waffloq-400'
      }`}
    >
      {/* Üst Görsel Bölümü */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-waffloq-50 mb-4 border border-waffloq-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Tükendi Rozeti */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-waffloq-950/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-berry text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
              Tükendi
            </span>
          </div>
        )}
      </div>

      {/* İçerik Bilgileri */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-waffloq-950 group-hover:text-waffloq-600 transition-colors tracking-tight">
            {item.name}
          </h3>

          <p className="text-xs text-stone-600 mt-1.5 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Fiyat ve Ekle Butonu */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-waffloq-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-waffloq-600/80 uppercase tracking-widest">Fiyat</span>
            <span className="text-xl sm:text-2xl font-black text-waffloq-900 tracking-tight">
              {item.price} <span className="text-xs font-bold text-waffloq-600">TL</span>
            </span>
          </div>

          <button
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onQuickAdd(item);
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isAvailable
                ? 'bg-gradient-to-tr from-waffloq-700 to-waffloq-500 text-white shadow-md shadow-waffloq-600/30 hover:scale-110 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title="Siparişe Ekle"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
