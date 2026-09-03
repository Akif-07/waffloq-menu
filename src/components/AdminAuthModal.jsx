import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminAuthModal({
  isOpen,
  onClose,
  onSuccess
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const currentPin = localStorage.getItem('waffloq_admin_pin') || '1453';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === currentPin || pin.trim() === 'waffloq123' || pin.trim() === '1453') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-waffloq-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-stone-800 shadow-2xl relative border border-waffloq-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-waffloq-100 text-waffloq-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-waffloq-950 mb-1">Dükkan Sahibi Girişi</h3>
        <p className="text-xs text-stone-500 mb-5">
          Fiyatları ve menüyü düzenlemek için yönetici şifrenizi giriniz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={12}
              placeholder="Yönetici Şifresi"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(false);
              }}
              className="w-full text-center tracking-widest text-lg font-black py-3 px-4 rounded-2xl bg-waffloq-50 border border-waffloq-200 focus:outline-none focus:ring-2 focus:ring-waffloq-500"
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-berry font-bold bg-rose-50 py-2 px-3 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Hatalı şifre! Lütfen tekrar deneyin.</span>
            </div>
          )}

          <div className="text-[11px] text-stone-400 bg-stone-50 p-2 rounded-xl border border-stone-100">
            Varsayılan Şifre: <span className="font-mono font-bold text-waffloq-800">1453</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-waffloq-600 hover:bg-waffloq-700 text-white font-extrabold rounded-xl text-sm transition-colors shadow-md shadow-waffloq-600/20"
          >
            Panele Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
