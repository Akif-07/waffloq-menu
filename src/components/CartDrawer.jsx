import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Send, CheckCircle, Trash2 } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  tableNumber
}) {
  const [orderSent, setOrderSent] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleSendOrder = () => {
    setOrderSent(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-waffloq-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">
        {/* Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-waffloq-950 to-waffloq-800 text-white flex items-center justify-between border-b border-waffloq-400/20">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-waffloq-300" />
            <div>
              <h3 className="font-bold text-base">Sipariş Listeniz</h3>
              {tableNumber && (
                <span className="text-[11px] text-waffloq-200 font-brand">Masa #{tableNumber}</span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sipariş Başarılı Ekranı */}
        {orderSent ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-waffloq-100 text-waffloq-700 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-waffloq-950 font-brand">Siparişiniz Alındı!</h4>
            <p className="text-xs text-stone-600 mt-2 max-w-xs leading-relaxed">
              Talebiniz mutfağa iletildi. En taze haliyle hazırlanıyor. Garsonumuz masanıza servis edecektir.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-waffloq-50 border border-waffloq-200 w-full text-xs text-left space-y-1.5">
              <div className="flex justify-between font-bold text-waffloq-900">
                <span>Masa:</span>
                <span>{tableNumber ? `#${tableNumber}` : 'Belirtilmedi'}</span>
              </div>
              <div className="flex justify-between font-black text-waffloq-800 text-sm pt-1.5 border-t border-waffloq-200">
                <span>Toplam Tutar:</span>
                <span>{totalAmount} TL</span>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderSent(false);
                onClearCart();
                onClose();
              }}
              className="mt-6 w-full py-3 bg-waffloq-600 hover:bg-waffloq-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-waffloq-600/20"
            >
              Yeni Sipariş Oluştur
            </button>
          </div>
        ) : (
          <>
            {/* Ürün Listesi */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 divide-y divide-waffloq-100">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-12">
                  <span className="text-4xl mb-2">🧇</span>
                  <p className="font-bold text-waffloq-950 text-sm">Listeniz Boş</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Menüden nefis waffle çeşitlerini ekleyerek sipariş listenizi oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-waffloq-50 shrink-0 border border-waffloq-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs sm:text-sm text-waffloq-950 leading-tight truncate">
                        {item.name}
                      </h5>
                      {item.specialNote && (
                        <p className="text-[10px] text-waffloq-800 bg-waffloq-50 border border-waffloq-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                          Not: {item.specialNote}
                        </p>
                      )}
                      <div className="font-black text-waffloq-700 text-xs sm:text-sm mt-1">
                        {item.price * (item.quantity || 1)} TL
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-waffloq-50 rounded-lg p-1 shrink-0 border border-waffloq-200">
                      <button
                        onClick={() => onUpdateQuantity(idx, (item.quantity || 1) - 1)}
                        className="p-1 rounded text-waffloq-800 hover:bg-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-waffloq-950">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, (item.quantity || 1) + 1)}
                        className="p-1 rounded text-waffloq-800 hover:bg-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alt Kısım: Özet & Sipariş Ver */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-waffloq-50/70 border-t border-waffloq-200 space-y-3">
                <div className="flex justify-between items-center text-xs text-stone-600">
                  <span>Toplam Ürün:</span>
                  <span className="font-bold text-waffloq-900">{totalCount} Adet</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-waffloq-950">
                  <span>Toplam Tutar:</span>
                  <span className="text-xl text-waffloq-700">{totalAmount} TL</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onClearCart}
                    className="p-3 text-stone-400 hover:text-berry hover:bg-red-50 rounded-2xl border border-stone-200 transition-colors"
                    title="Listeyi Temizle"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleSendOrder}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-waffloq-700 to-waffloq-500 hover:bg-waffloq-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-waffloq-600/30 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Garsona İlet / Sipariş Ver</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
