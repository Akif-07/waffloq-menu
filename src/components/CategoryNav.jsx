import React from 'react';
import { Sparkles, CupSoda, Layers, Flame, Coffee } from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  CupSoda,
  Layers,
  Flame,
  Coffee
};

export default function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory
}) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-waffloq-200/80 shadow-xs py-3 px-4 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-center sm:justify-start gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = ICON_MAP[cat.icon] || Sparkles;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isSelected
                  ? 'bg-waffloq-900 text-white shadow-lg shadow-waffloq-900/25 scale-[1.02] ring-2 ring-waffloq-400'
                  : 'bg-waffloq-50/80 text-waffloq-900 hover:bg-white hover:text-waffloq-950 border border-waffloq-200/90 shadow-2xs'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-waffloq-300' : 'text-waffloq-600'}`} />
              <span className={isSelected ? 'text-white' : 'text-waffloq-950'}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
