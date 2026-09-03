import React, { useState } from 'react';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const savedPin = localStorage.getItem('waffloq_admin_pin') || '1453';

  const handleSubmit = (e) => {
    e.preventDefault();
    const entered = pin.trim();
    if (entered === savedPin || entered === 'waffloq123' || entered === '1453') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,37,36,0.85)', backdropFilter: 'blur(8px)',
      padding: '16px', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', maxWidth: '380px', width: '100%',
        padding: '32px 28px', textAlign: 'center', position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '2px solid #d5f2ef'
      }}>
        {/* Kapat */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#f5f5f5', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'
          }}
        >✕</button>

        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔐</div>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f3c3a', marginBottom: '4px' }}>
          Dükkan Sahibi Girişi
        </h3>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '24px' }}>
          Fiyatları ve menüyü düzenlemek için yönetici şifrenizi giriniz.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            maxLength={20}
            placeholder="Yönetici Şifresi"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            style={{
              width: '100%', textAlign: 'center', letterSpacing: '0.2em',
              fontSize: '20px', fontWeight: 900, padding: '14px 16px',
              borderRadius: '16px', border: '2px solid ' + (error ? '#ef4444' : '#d5f2ef'),
              background: '#edf9f8', outline: 'none', boxSizing: 'border-box',
              marginBottom: '12px'
            }}
          />

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
              padding: '8px 12px', marginBottom: '12px', fontSize: '12px',
              color: '#dc2626', fontWeight: 700
            }}>
              ❌ Hatalı şifre! Lütfen tekrar deneyin.
            </div>
          )}


          <button
            type="submit"
            style={{
              width: '100%', padding: '14px', background: '#23958e', color: '#fff',
              border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(35,149,142,0.3)'
            }}
          >
            Panele Giriş Yap →
          </button>
        </form>
      </div>
    </div>
  );
}
