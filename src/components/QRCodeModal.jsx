import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import { SHOP_INFO } from '../data/defaultMenu';

const PRODUCTION_URL = 'https://waffloq-menu--waffloqmenu.europe-west4.hosted.app';

export default function QRCodeModal({ onClose }) {
  const [tableCount, setTableCount] = useState(10);
  const [selectedTable, setSelectedTable] = useState(1);
  const [copied, setCopied] = useState(false);
  const [useProductionUrl, setUseProductionUrl] = useState(true);
  const printRef = useRef(null);

  // Canlı App Hosting adresi veya geçerli origin
  const baseUrl = useProductionUrl ? PRODUCTION_URL : (window.location.origin + window.location.pathname);
  const currentTableUrl = `${baseUrl.replace(/\/$/, '')}/?masa=${selectedTable}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-waffloq-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto text-stone-800 shadow-2xl relative border border-waffloq-100 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-waffloq-50 hover:bg-waffloq-100 text-waffloq-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-waffloq-100 text-waffloq-700 flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-waffloq-950">Masa QR Kod & Stand Üretici</h2>
            <p className="text-xs text-stone-500">Müşterilerinizin telefonla tarayabileceği canlı QR kodlar.</p>
          </div>
        </div>

        {/* Canlı Adres Bilgi Kutusu */}
        <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl mb-4 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hedef Adres: <strong className="font-bold font-mono">waffloq-menu.hosted.app</strong> (Canlı)</span>
          </div>
          <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
            Aktif
          </span>
        </div>

        {/* Masa Seçici */}
        <div className="bg-waffloq-50/70 p-4 rounded-2xl border border-waffloq-200/80 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-waffloq-900">Masa Seçimi:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Masa Sayısı:</span>
              <select
                value={tableCount}
                onChange={(e) => setTableCount(Number(e.target.value))}
                className="text-xs font-bold bg-white border border-waffloq-300 rounded-lg px-2 py-1 text-waffloq-900"
              >
                <option value={5}>5 Masa</option>
                <option value={10}>10 Masa</option>
                <option value={20}>20 Masa</option>
                <option value={30}>30 Masa</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar p-1">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((tNum) => (
              <button
                key={tNum}
                onClick={() => setSelectedTable(tNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTable === tNum
                    ? 'bg-waffloq-600 text-white shadow-md shadow-waffloq-600/30 scale-105'
                    : 'bg-white text-waffloq-900 hover:bg-waffloq-100 border border-waffloq-200'
                }`}
              >
                Masa {tNum}
              </button>
            ))}
          </div>
        </div>

        {/* Önizleme Kartı (Masa Standı Şablonu) */}
        <div
          ref={printRef}
          className="bg-gradient-to-b from-waffloq-950 via-waffloq-900 to-waffloq-800 text-white p-6 rounded-3xl shadow-xl text-center relative overflow-hidden flex flex-col items-center justify-center border-4 border-waffloq-400/40"
        >
          {/* Logo & Başlık */}
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-waffloq-300 to-waffle-light shadow-lg mb-2">
            <img src={SHOP_INFO.logo} alt="Logo" className="w-full h-full object-cover rounded-full bg-waffloq-950" />
          </div>
          <h3 className="text-xl font-brand font-black tracking-widest text-white">{SHOP_INFO.name}</h3>
          <p className="text-[10px] font-slogan font-bold tracking-widest text-waffloq-300 mb-4 uppercase">
            {SHOP_INFO.tagline}
          </p>

          {/* QR Kod Çerçevesi */}
          <div className="bg-white p-4 rounded-2xl shadow-2xl inline-block border-2 border-waffloq-300">
            <QRCodeSVG
              value={currentTableUrl}
              size={175}
              level="H"
              includeMargin={false}
              fgColor="#0f3c3a"
            />
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-waffloq-600 to-waffloq-500 text-white px-5 py-1.5 rounded-full font-black text-sm shadow-md border border-waffloq-300/40">
            <span>MASA #{selectedTable}</span>
          </div>

          <p className="text-[10px] text-waffloq-200 mt-2 font-medium">
            Kameranızı QR koda tutarak menüyü inceleyin
          </p>

          <div className="mt-4 pt-2.5 border-t border-waffloq-500/30 text-[9px] text-waffloq-300/80 w-full flex justify-between">
            <span>Wi-Fi: {SHOP_INFO.wifiName}</span>
            <span>Şifre: {SHOP_INFO.wifiPass}</span>
          </div>
        </div>

        {/* URL Bilgisi & Aksiyonlar */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 bg-waffloq-50 p-2.5 rounded-xl border border-waffloq-200 text-xs">
            <span className="font-mono text-waffloq-900 truncate flex-1 font-semibold">{currentTableUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white hover:bg-waffloq-100 border border-waffloq-300 rounded-lg text-waffloq-800 shrink-0 transition-colors"
              title="Linki Kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={currentTableUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-white hover:bg-waffloq-100 border border-waffloq-300 rounded-lg text-waffloq-800 shrink-0 transition-colors"
              title="Canlı Adresi Aç"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl bg-waffloq-900 hover:bg-waffloq-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Standı Yazdır</span>
            </button>
            <button
              onClick={() => {
                alert(`Masa #${selectedTable} QR kodu hazırlandı! Doğrudan yazdırabilirsiniz.`);
              }}
              className="py-3 px-4 rounded-xl bg-waffloq-600 hover:bg-waffloq-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-waffloq-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
