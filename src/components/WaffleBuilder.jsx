import React, { useState, useMemo } from 'react';
import { Sparkles, Check, ChevronRight, ChevronLeft, Plus, Flame, Info, CheckCircle2, ShoppingBag } from 'lucide-react';
import { WAFFLE_BUILDER_DATA } from '../data/defaultMenu';

export default function WaffleBuilder({
  onComplete,
  builderData = WAFFLE_BUILDER_DATA
}) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Seçim durumları
  const [selectedBase, setSelectedBase] = useState(builderData.bases[0]);
  const [selectedChocolates, setSelectedChocolates] = useState([builderData.chocolates[0]]);
  const [selectedFruits, setSelectedFruits] = useState([
    builderData.fruits[0],
    builderData.fruits[1]
  ]);
  const [selectedToppings, setSelectedToppings] = useState([builderData.toppings[0]]);
  const [selectedSauces, setSelectedSauces] = useState([builderData.sauces[0]]);
  const [selectedIceCream, setSelectedIceCream] = useState(builderData.iceCreams[0]);
  const [customNote, setCustomNote] = useState('');

  // Toplam Fiyat ve Kalori Hesaplama
  const totalPrice = useMemo(() => {
    let price = selectedBase?.price || 180;
    selectedChocolates.forEach(c => price += (c.price || 0));
    selectedFruits.forEach(f => price += (f.price || 0));
    selectedToppings.forEach(t => price += (t.price || 0));
    selectedSauces.forEach(s => price += (s.price || 0));
    if (selectedIceCream) price += (selectedIceCream.price || 0);
    return price;
  }, [selectedBase, selectedChocolates, selectedFruits, selectedToppings, selectedSauces, selectedIceCream]);

  const totalCalories = useMemo(() => {
    let cal = selectedBase?.calories || 280;
    selectedChocolates.forEach(c => cal += (c.calories || 0));
    selectedFruits.forEach(f => cal += (f.calories || 0));
    selectedToppings.forEach(t => cal += 35);
    selectedSauces.forEach(s => cal += 25);
    if (selectedIceCream && selectedIceCream.id !== 'ic0') cal += 120;
    return cal;
  }, [selectedBase, selectedChocolates, selectedFruits, selectedToppings, selectedSauces, selectedIceCream]);

  // Çoklu seçim toggle fonksiyonu
  const toggleItem = (list, setList, item, maxAllowed = 4) => {
    if (list.some(i => i.id === item.id)) {
      if (list.length === 1 && maxAllowed === 1) return; // En az bir seçim kalsın
      setList(list.filter(i => i.id !== item.id));
    } else {
      if (list.length >= maxAllowed) {
        // En eski seçimi kaldırıp yenisini ekle
        setList([...list.slice(1), item]);
      } else {
        setList([...list, item]);
      }
    }
  };

  const steps = [
    { id: 1, name: '1. Hamur', desc: 'Waffle Tabanı' },
    { id: 2, name: '2. Çikolata', desc: 'Sürülebilir Taban' },
    { id: 3, name: '3. Meyveler', desc: 'Taze Meyveler' },
    { id: 4, name: '4. Çıtırlar', desc: 'Kuru Yemiş & Bisküvi' },
    { id: 5, name: '5. Sos & Dondurma', desc: 'Son Dokunuşlar' },
  ];

  const handleFinish = () => {
    const customWaffle = {
      id: `custom-${Date.now()}`,
      name: `Özel Tasarım ${selectedBase.name.replace(' Hamuru', '')}`,
      description: `${selectedChocolates.map(c => c.name).join(' + ')} | ${selectedFruits.map(f => f.name).join(', ')} | ${selectedToppings.map(t => t.name).join(', ')}`,
      price: totalPrice,
      calories: `${totalCalories} kcal`,
      image: selectedBase.image || 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80',
      badge: 'Özel Tarifin',
      badgeColor: 'bg-brand-600',
      isCustom: true,
      customDetails: {
        base: selectedBase,
        chocolates: selectedChocolates,
        fruits: selectedFruits,
        toppings: selectedToppings,
        sauces: selectedSauces,
        iceCream: selectedIceCream,
        note: customNote
      }
    };
    onComplete(customWaffle);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-8">
      {/* Başlık Banner */}
      <div className="bg-gradient-to-r from-choco-dark via-choco to-choco-milk p-6 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/30 border border-brand-400/40 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>İnteraktif Waffle Atölyesi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kendi Waffle'ını Tasarla</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Damak tadınıza en uygun hamur, çikolata ve meyveleri adım adım seçin.
            </p>
          </div>

          {/* Anlık Fiyat & Kalori Göstergesi */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start sm:self-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Tahmini Kalori</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                ~{totalCalories} kcal
              </div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-brand-300 tracking-wider">Toplam Tutar</div>
              <div className="text-2xl font-black text-amber-100">
                {totalPrice} <span className="text-sm text-brand-400">₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* Adım Çubuğu (Steps Indicator) */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-6">
          {steps.map((s) => {
            const isActive = currentStep === s.id;
            const isPassed = currentStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white font-bold shadow-md ring-2 ring-amber-300/60'
                    : isPassed
                    ? 'bg-white/20 text-amber-200 font-semibold hover:bg-white/30'
                    : 'bg-black/20 text-white/40 hover:bg-black/30'
                }`}
              >
                <span className="text-xs font-bold leading-none">{s.name}</span>
                <span className="text-[10px] opacity-80 hidden md:inline mt-0.5">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adım İçeriği */}
      <div className="p-4 sm:p-6 bg-[#faf7f2]">
        {/* Adım 1: Hamur Seçimi */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-stone-800">1. Adım: Waffle Hamurunu Seç</h3>
              <span className="text-xs text-stone-500">1 seçim gereklidir</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {builderData.bases.map((base) => {
                const isSelected = selectedBase?.id === base.id;
                return (
                  <div
                    key={base.id}
                    onClick={() => setSelectedBase(base)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 bg-white flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20'
                        : 'border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-stone-100">
                      <img src={base.image} alt={base.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-stone-900 text-sm">{base.name}</h4>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{base.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between items-center text-xs font-bold">
                      <span className="text-stone-400">{base.calories} kcal</span>
                      <span className="text-brand-600 text-sm font-extrabold">{base.price} ₺</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adım 2: Çikolatalar */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-stone-800">2. Adım: Çikolata & Sürülebilir Taban</h3>
                <p className="text-xs text-stone-500">En fazla 2 çeşit çikolata seçebilirsiniz (yarı yarıya sürülür)</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                Seçilen: {selectedChocolates.length}/2
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {builderData.chocolates.map((choco) => {
                const isSelected = selectedChocolates.some(c => c.id === choco.id);
                return (
                  <button
                    key={choco.id}
                    onClick={() => toggleItem(selectedChocolates, setSelectedChocolates, choco, 2)}
                    className={`p-3.5 rounded-2xl text-left transition-all border-2 flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50/80 border-brand-500 shadow-md ring-1 ring-brand-500/20'
                        : 'bg-white border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{choco.image}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900 leading-tight">{choco.name}</div>
                        <div className="text-[11px] text-stone-400 font-medium">
                          {choco.price > 0 ? `+${choco.price} ₺` : 'Ücretsiz'}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-stone-300 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Adım 3: Meyveler */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-stone-800">3. Adım: Taze Meyveler</h3>
                <p className="text-xs text-stone-500">Dilediğiniz taze meyveleri ekleyin</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                Seçilen: {selectedFruits.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {builderData.fruits.map((fruit) => {
                const isSelected = selectedFruits.some(f => f.id === fruit.id);
                return (
                  <button
                    key={fruit.id}
                    onClick={() => toggleItem(selectedFruits, setSelectedFruits, fruit, 6)}
                    className={`p-3.5 rounded-2xl text-left transition-all border-2 flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-500 shadow-md ring-1 ring-rose-500/20'
                        : 'bg-white border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{fruit.icon}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900">{fruit.name}</div>
                        <div className="text-[11px] text-stone-400 font-medium">
                          {fruit.price > 0 ? `+${fruit.price} ₺` : 'Dahil'}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-stone-300 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Adım 4: Çıtırlar & Kuru Yemişler */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-stone-800">4. Adım: Çıtır & Kuru Yemişler</h3>
                <p className="text-xs text-stone-500">Waffle'ınıza ekstra lezzet ve doku katın</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                Seçilen: {selectedToppings.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {builderData.toppings.map((top) => {
                const isSelected = selectedToppings.some(t => t.id === top.id);
                return (
                  <button
                    key={top.id}
                    onClick={() => toggleItem(selectedToppings, setSelectedToppings, top, 6)}
                    className={`p-3.5 rounded-2xl text-left transition-all border-2 flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-white border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{top.icon}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900 leading-tight">{top.name}</div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                          +{top.price} ₺
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-stone-300 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Adım 5: Soslar, Dondurma ve Not */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Soslar */}
            <div>
              <h4 className="font-bold text-sm text-stone-800 mb-2">Üzeri İçin Sos Seçimi:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {builderData.sauces.map((sauce) => {
                  const isSelected = selectedSauces.some(s => s.id === sauce.id);
                  return (
                    <button
                      key={sauce.id}
                      onClick={() => toggleItem(selectedSauces, setSelectedSauces, sauce, 2)}
                      className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between ${
                        isSelected ? 'bg-brand-500 text-white border-brand-600 font-bold' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <span className="text-xs">{sauce.icon} {sauce.name}</span>
                      {sauce.price > 0 && <span className="text-[10px] opacity-80">+{sauce.price} ₺</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dondurma Topu */}
            <div>
              <h4 className="font-bold text-sm text-stone-800 mb-2">Ekstra Dondurma Topu Ekle:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {builderData.iceCreams.map((ice) => {
                  const isSelected = selectedIceCream?.id === ice.id;
                  return (
                    <button
                      key={ice.id}
                      onClick={() => setSelectedIceCream(ice)}
                      className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between ${
                        isSelected ? 'bg-choco-dark text-amber-200 border-choco font-bold' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <span className="text-xs">{ice.icon} {ice.name}</span>
                      {ice.tag && <span className="text-[10px] text-amber-400 font-bold">{ice.tag}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Özel Not */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mutfak İçin Özel Not (Opsiyonel):</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Örn: Çikolatası bol olsun, muzlar ince dilimlensin..."
                className="w-full p-3 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        )}

        {/* Tabak Özeti (Canlı Görsel Özet) */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-stone-700">Waffle Tabağınız:</span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium">
            🧇 {selectedBase?.name}
          </span>
          {selectedChocolates.map(c => (
            <span key={c.id} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium text-amber-900">
              {c.image} {c.name}
            </span>
          ))}
          {selectedFruits.map(f => (
            <span key={f.id} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium text-rose-800">
              {f.icon} {f.name}
            </span>
          ))}
          {selectedToppings.map(t => (
            <span key={t.id} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium text-amber-800">
              {t.icon} {t.name}
            </span>
          ))}
          {selectedIceCream && selectedIceCream.id !== 'ic0' && (
            <span className="px-2 py-0.5 rounded-md bg-choco-dark text-white font-medium">
              {selectedIceCream.icon} {selectedIceCream.name}
            </span>
          )}
        </div>

        {/* Alt Butonlar (İleri / Geri / Bitir) */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-200">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki Adım</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-md shadow-brand-500/20"
            >
              <span>Sonraki Adım</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 hover:scale-105 text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-500/30 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Waffle'ımı Siparişe Ekle ({totalPrice} ₺)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
