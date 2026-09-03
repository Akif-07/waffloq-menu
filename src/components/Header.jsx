import React, { useState } from 'react';
import { Wifi, Phone, Clock, QrCode, ShieldCheck, Search, X, Sparkles, MapPin } from 'lucide-react';
import { SHOP_INFO } from '../data/defaultMenu';

export default function Header({
  tableNumber,
  searchQuery,
  setSearchQuery,
  onOpenQrModal,
  onOpenAdminModal,
  isFirebaseActive
}) {
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <header className="relative bg-gradient-to-b from-waffloq-950 via-waffloq-900 to-waffloq-800 text-white shadow-2xl overflow-hidden border-b-2 border-waffloq-400/30">
        {/* Dekoratif Işıltılar & Arka Plan Parıltıları */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-waffloq-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-64 h-64 bg-waffle/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-berry/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Üst İnce Bilgi Çubuğu */}
        <div className="bg-black/30 backdrop-blur-md border-b border-waffloq-400/15 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-waffloq-200 font-medium tracking-wide">Açık • Masaya Servis</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setShowWifiModal(true)}
              className="flex items-center gap-1.5 text-waffloq-100 hover:text-white transition-all py-1 px-2.5 rounded-full bg-waffloq-800/80 hover:bg-waffloq-700 border border-waffloq-400/20 shadow-xs"
              title="Wi-Fi Bilgisi"
            >
              <Wifi className="w-3.5 h-3.5 text-waffloq-300" />
              <span className="font-semibold text-[11px]">Wi-Fi</span>
            </button>

            <button
              onClick={onOpenQrModal}
              className="flex items-center gap-1.5 text-waffloq-100 hover:text-white transition-all py-1 px-2.5 rounded-full bg-waffloq-600/60 hover:bg-waffloq-500 border border-waffloq-300/30 shadow-xs"
              title="Masa QR Kodları"
            >
              <QrCode className="w-3.5 h-3.5 text-waffle-light" />
              <span className="font-semibold text-[11px] hidden xs:inline">Masa QR</span>
            </button>

            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors py-1 px-2 rounded-full hover:bg-white/10"
              title="Yönetim Paneli"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-waffloq-300" />
            </button>
          </div>
        </div>

        {/* Ana Logo ve Başlık Bölümü */}
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Yuvarlak Logo Rozeti */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-waffloq-400 via-waffloq-200 to-waffle-light p-1 shadow-teal-glow shadow-xl transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                  <img
                    src={SHOP_INFO.logo}
                    alt="WAFFLOQ Logo"
                    className="w-full h-full object-cover rounded-full bg-waffloq-950"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-brand font-black tracking-widest bg-gradient-to-r from-white via-waffloq-100 to-waffloq-200 bg-clip-text text-transparent drop-shadow-sm">
                  {SHOP_INFO.name}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="h-px w-5 bg-waffloq-400/60 hidden sm:inline-block"></span>
                  <p className="text-xs sm:text-sm font-slogan font-bold tracking-widest text-waffloq-300 uppercase">
                    {SHOP_INFO.tagline}
                  </p>
                  <span className="h-px w-5 bg-waffloq-400/60 hidden sm:inline-block"></span>
                </div>
              </div>
            </div>

            {/* Masa Numarası Göstergesi */}
            {tableNumber ? (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-waffloq-800/90 to-waffloq-900 border border-waffloq-400/40 px-4 py-2 rounded-2xl shadow-lg shadow-black/20">
                <span className="w-2.5 h-2.5 rounded-full bg-waffloq-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider text-waffloq-200 font-bold">Masa:</span>
                <span className="text-lg font-black text-white px-2.5 py-0.5 bg-waffloq-600 rounded-xl shadow-inner font-brand">
                  #{tableNumber}
                </span>
              </div>
            ) : null}
          </div>

          {/* Hızlı Arama Kutusu */}
          <div className="mt-5 relative max-w-2xl mx-auto sm:mx-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-waffloq-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Waffle veya malzeme ara... (örn: Frambuaz, Oreo, Bubble, Special)"
              className="w-full bg-white/95 text-stone-900 placeholder:text-stone-400 pl-10 pr-9 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-waffloq-400 shadow-lg border border-waffloq-200/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wi-Fi Bilgi Modalı */}
      {showWifiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-stone-800 shadow-2xl relative border border-waffloq-100">
            <button
              onClick={() => setShowWifiModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-waffloq-100 text-waffloq-700 flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-waffloq-900 mb-1">Müşteri Wi-Fi Ağı</h3>
            <p className="text-xs text-stone-500 mb-4">Ücretsiz kablosuz internete bağlanabilirsiniz.</p>
            
            <div className="space-y-2 bg-waffloq-50/50 p-3.5 rounded-2xl border border-waffloq-200/70 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 text-xs font-semibold uppercase">Ağ Adı:</span>
                <span className="font-bold text-stone-800 font-mono">{SHOP_INFO.wifiName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-waffloq-200/50">
                <span className="text-stone-500 text-xs font-semibold uppercase">Şifre:</span>
                <span className="font-bold text-waffloq-700 font-mono text-base">{SHOP_INFO.wifiPass}</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(SHOP_INFO.wifiPass);
                alert("Şifre panoya kopyalandı!");
              }}
              className="mt-4 w-full py-2.5 bg-waffloq-600 hover:bg-waffloq-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-waffloq-600/20"
            >
              Şifreyi Kopyala
            </button>
          </div>
        </div>
      )}
    </>
  );
}
