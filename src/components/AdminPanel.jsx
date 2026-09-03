import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SHOP_INFO } from '../data/defaultMenu';

const PRODUCTION_URL = 'https://waffloq-menu--waffloqmenu.europe-west4.hosted.app';
const STORAGE_KEY_ORDERS = 'waffloq_active_orders';

function getOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error(e); }
  return [];
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

export default function AdminPanel({
  menuItems = [],
  categories = [],
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
  onClose,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'items' | 'add' | 'qr' | 'security'
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  
  // Şifre değiştirme state
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // Yeni ürün ekleme state
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('waffles');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80');

  // QR Kod state
  const [qrTableCount, setQrTableCount] = useState(10);
  const [qrSelectedTable, setQrSelectedTable] = useState(1);

  const items = Array.isArray(menuItems) ? menuItems : [];

  // Siparişleri dinle
  useEffect(() => {
    setOrders(getOrders());
    const handler = () => setOrders(getOrders());
    window.addEventListener('waffloq_new_order', handler);
    window.addEventListener('storage', handler);
    const interval = setInterval(handler, 3000);
    return () => {
      window.removeEventListener('waffloq_new_order', handler);
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const updateOrderStatus = (id, current) => {
    const next = current === 'pending' ? 'preparing' : current === 'preparing' ? 'completed' : 'pending';
    const updated = orders.map(o => o.id === id ? { ...o, status: next } : o);
    saveOrders(updated);
    setOrders(updated);
  };

  const deleteOrder = (id) => {
    if (confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
      const updated = orders.filter(o => o.id !== id);
      saveOrders(updated);
      setOrders(updated);
    }
  };

  const clearAllOrders = () => {
    if (confirm('Tüm sipariş geçmişini silmek istiyor musunuz?')) {
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      setOrders([]);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) {
      alert('Lütfen ürün adını ve fiyatını eksiksiz girin.');
      return;
    }
    if (onAddItem) {
      onAddItem({
        name: newName.trim(),
        categoryId: newCat,
        price: Number(newPrice),
        description: newDesc.trim(),
        image: newImage.trim() || 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80',
        available: true
      });
    }
    alert(`"${newName}" ürünü menüye başarıyla eklendi!`);
    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setActiveTab('items');
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      alert('Şifre en az 4 karakter veya rakam olmalıdır.');
      return;
    }
    localStorage.setItem('waffloq_admin_pin', newPin.trim());
    setPinMessage('✅ Yönetici şifreniz başarıyla güncellendi!');
    setNewPin('');
    setTimeout(() => setPinMessage(''), 3000);
  };

  const filteredItems = items.filter(item => {
    if (!item || !item.name) return false;
    const matchSearch = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchCat = selectedCategoryFilter === 'all' ? true : item.categoryId === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  const pendingCount = orders.filter(o => o && o.status === 'pending').length;
  const preparingCount = orders.filter(o => o && o.status === 'preparing').length;

  const currentQrUrl = `${PRODUCTION_URL}/?masa=${qrSelectedTable}`;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ÜST YÖNETİCİ ÇUBUĞU (NAVBAR) */}
      <header style={{
        backgroundColor: '#082524',
        borderBottom: '2px solid #144e4b',
        color: '#ffffff',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={SHOP_INFO.logo}
            alt="Logo"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#0f3c3a',
              border: '2px solid #7ed1cb',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                margin: 0,
                color: '#ffffff',
                fontFamily: "'Cinzel', serif"
              }}>
                WAFFLOQ
              </h1>
              <span style={{
                backgroundColor: '#23958e',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                YÖNETİM & MUTFAK
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#7ed1cb' }}>
              Canlı Masa Siparişleri ve Menü Yönetim Ekranı
            </p>
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1b7a75',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            ← Müşteri Menüsüne Dön
          </button>

          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#450a0a',
              color: '#fca5a5',
              border: '1px solid #7f1d1d',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔒 Çıkış Yap
          </button>
        </div>
      </header>

      {/* SEKMELER */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'orders' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'orders' ? '#0f3c3a' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🔔 Masa Siparişleri ({orders.length})</span>
          {pendingCount > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {pendingCount} Yeni
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'items' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'items' ? '#0f3c3a' : '#64748b',
            whiteSpace: 'nowrap'
          }}
        >
          📋 Menü & Fiyat Listesi ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'add' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'add' ? '#0f3c3a' : '#64748b',
            whiteSpace: 'nowrap'
          }}
        >
          ➕ Yeni Ürün Ekle
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'qr' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'qr' ? '#0f3c3a' : '#64748b',
            whiteSpace: 'nowrap'
          }}
        >
          📱 Masa QR Kod & Stand Üretici
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'security' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'security' ? '#0f3c3a' : '#64748b',
            whiteSpace: 'nowrap'
          }}
        >
          🔑 Şifre Ayarları
        </button>
      </div>

      {/* İÇERİK ALANI */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* 1. SEKME: CANLI SİPARİŞLER (MUTFAK EKRANI) */}
        {activeTab === 'orders' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#0f3c3a' }}>
                  Masalardan Gelen Anlık Siparişler
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Müşteriler masadaki QR kodu okutup 'Garsona İlet / Sipariş Ver' dediğinde buraya canlı olarak düşer.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                  Bekleyen: <strong style={{ color: '#d97706' }}>{pendingCount}</strong> | Hazırlanan: <strong style={{ color: '#2563eb' }}>{preparingCount}</strong>
                </span>
                {orders.length > 0 && (
                  <button
                    onClick={clearAllOrders}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🗑 Tümünü Temizle
                  </button>
                )}
              </div>
            </div>

            {orders.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '56px', marginBottom: '14px' }}>🔔</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f3c3a', margin: '0 0 6px 0' }}>
                  Şu Anda Bekleyen Sipariş Yok
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '460px', margin: '0 auto' }}>
                  Müşteriler masalarından QR kodla sipariş verdikçe sesli ve görsel bildirimle anında burada listelenecektir.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '18px'
              }}>
                {orders.map(order => {
                  if (!order) return null;
                  const isPending = order.status === 'pending';
                  const isPreparing = order.status === 'preparing';
                  const isCompleted = order.status === 'completed';

                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: isPending
                          ? '0 10px 25px -5px rgba(245, 158, 11, 0.25)'
                          : '0 4px 12px rgba(0,0,0,0.05)',
                        border: isPending
                          ? '2px solid #f59e0b'
                          : isPreparing
                          ? '2px solid #3b82f6'
                          : '2px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Sipariş Üst Bilgisi */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              backgroundColor: '#0f3c3a',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '15px',
                              padding: '6px 14px',
                              borderRadius: '12px'
                            }}>
                              MASA #{order.tableNumber}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                              🕒 {order.timeFormatted || 'Yeni'}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteOrder(order.id)}
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                            title="Siparişi Sil"
                          >
                            🗑
                          </button>
                        </div>

                        {/* Sipariş Kalemleri */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <strong style={{ color: '#0f3c3a', fontSize: '14px' }}>
                                  {item.quantity || 1}x
                                </strong>{' '}
                                <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</span>
                                {item.specialNote && (
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#b45309',
                                    backgroundColor: '#fef3c7',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                  }}>
                                    Not: {item.specialNote}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '13px', color: '#17625e' }}>
                                {(item.price || 0) * (item.quantity || 1)} TL
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alt Tutar & Durum Değiştirme Butonu */}
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '10px'
                        }}>
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Toplam Tutar:</span>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f3c3a' }}>
                            {order.totalAmount || 0} TL
                          </span>
                        </div>

                        <button
                          onClick={() => updateOrderStatus(order.id, order.status)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            backgroundColor: isPending ? '#f59e0b' : isPreparing ? '#3b82f6' : '#10b981',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {isPending ? '⏳ Siparişi Onayla & Hazırla' : isPreparing ? '🍳 Hazırlandı • Masaya Teslim Et' : '✅ Tamamlandı (Arşivle)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. SEKME: ÜRÜN & FİYAT LİSTESİ */}
        {activeTab === 'items' && (
          <div>
            {/* Filtre ve Arama */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px 20px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              marginBottom: '16px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <input
                type="text"
                placeholder="🔍 Ürün adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '240px',
                  flex: 1
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: selectedCategoryFilter === 'all' ? '#0f3c3a' : '#f1f5f9',
                    color: selectedCategoryFilter === 'all' ? '#ffffff' : '#475569'
                  }}
                >
                  Tümü ({items.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('waffles')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: selectedCategoryFilter === 'waffles' ? '#0f3c3a' : '#f1f5f9',
                    color: selectedCategoryFilter === 'waffles' ? '#ffffff' : '#475569'
                  }}
                >
                  🧇 Waffle'lar
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('drinks')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: selectedCategoryFilter === 'drinks' ? '#0f3c3a' : '#f1f5f9',
                    color: selectedCategoryFilter === 'drinks' ? '#ffffff' : '#475569'
                  }}
                >
                  🥤 İçecekler
                </button>
              </div>
            </div>

            {/* Tablo / Kart Listesi */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '14px'
            }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <img
                      src={item.image}
                      alt={item.name || ''}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        backgroundColor: '#f1f5f9',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&q=80';
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        margin: '0 0 4px 0',
                        color: '#0f3c3a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.categoryId === 'drinks' ? '🥤 İçecek' : '🧇 Waffle'}
                      </div>
                    </div>
                  </div>

                  {/* Fiyat & Stok */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        defaultValue={item.price}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val > 0 && val !== item.price && onUpdateItem) {
                            onUpdateItem({ ...item, price: val });
                          }
                        }}
                        style={{
                          width: '70px',
                          padding: '8px 4px',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          outline: 'none'
                        }}
                        title="Fiyatı değiştirmek için yazıp dışına tıklayın"
                      />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TL</span>
                    </div>

                    <button
                      onClick={() => onUpdateItem && onUpdateItem({ ...item, available: !(item.available !== false) })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: item.available !== false ? '#dcfce7' : '#fee2e2',
                        color: item.available !== false ? '#166534' : '#991b1b'
                      }}
                    >
                      {item.available !== false ? 'Stokta' : 'Tükendi'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`"${item.name}" ürününü menüden kaldırmak istediğinize emin misiniz?`)) {
                          onDeleteItem && onDeleteItem(item.id);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '6px',
                        fontSize: '15px'
                      }}
                      title="Sil"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  if (confirm('Tüm menüyü orijinal varsayılan haline sıfırlamak istiyor musunuz?')) {
                    onResetDefaults && onResetDefaults();
                  }
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Menüyü Varsayılana Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* 3. SEKME: YENİ ÜRÜN EKLE */}
        {activeTab === 'add' && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f3c3a', margin: '0 0 8px 0' }}>
              Menüye Yeni Lezzet Ekle
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>
              Eklediğiniz ürün anında müşterilerin canlı menüsüne yansıyacaktır.
            </p>

            <form onSubmit={handleAddItem}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Nutella Çilekli Bowl"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Kategori *
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="waffles">🧇 Waffle Çeşitleri</option>
                    <option value="drinks">🥤 İçecekler</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="380"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Görsel URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Açıklama & İçindekiler
                </label>
                <textarea
                  rows={3}
                  placeholder="İçerik bilgisi: Belçika waffle hamuru, çikolata, fındık parçaları..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#23958e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(35, 149, 142, 0.3)'
                }}
              >
                Ürünü Menüye Ekle
              </button>
            </form>
          </div>
        )}

        {/* 4. SEKME: MASA QR KODLARI & STAND ÜRETİCİ */}
        {activeTab === 'qr' && (
          <div style={{
            maxWidth: '640px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f3c3a', margin: '0 0 6px 0' }}>
              Masa QR Kod & Stand Şablonu
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Masalarınız için yazdırılabilir canlı QR kodları buradan oluşturabilirsiniz.
            </p>

            {/* Masa Seçici */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f3c3a' }}>Masa Numarası Seçin:</span>
                <select
                  value={qrTableCount}
                  onChange={(e) => setQrTableCount(Number(e.target.value))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <option value={5}>5 Masa</option>
                  <option value={10}>10 Masa</option>
                  <option value={20}>20 Masa</option>
                  <option value={30}>30 Masa</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {Array.from({ length: qrTableCount }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setQrSelectedTable(num)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      backgroundColor: qrSelectedTable === num ? '#23958e' : '#ffffff',
                      color: qrSelectedTable === num ? '#ffffff' : '#334155',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    Masa {num}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Kart Önizleme */}
            <div style={{
              backgroundColor: '#082524',
              color: '#ffffff',
              padding: '32px 24px',
              borderRadius: '24px',
              border: '4px solid #144e4b',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
            }}>
              <img
                src={SHOP_INFO.logo}
                alt="Logo"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '2px solid #7ed1cb',
                  marginBottom: '10px'
                }}
              />
              <h4 style={{
                fontSize: '22px',
                fontWeight: 900,
                letterSpacing: '0.1em',
                margin: '0 0 2px 0',
                fontFamily: "'Cinzel', serif"
              }}>
                {SHOP_INFO.name}
              </h4>
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#7ed1cb',
                letterSpacing: '0.2em',
                margin: '0 0 20px 0'
              }}>
                {SHOP_INFO.tagline}
              </p>

              {/* QR Kod */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '18px',
                display: 'inline-block',
                border: '2px solid #7ed1cb'
              }}>
                <QRCodeSVG
                  value={currentQrUrl}
                  size={180}
                  level="H"
                  fgColor="#082524"
                />
              </div>

              <div style={{
                marginTop: '18px',
                backgroundColor: '#23958e',
                color: '#ffffff',
                padding: '6px 20px',
                borderRadius: '20px',
                fontWeight: 900,
                fontSize: '15px'
              }}>
                MASA #{qrSelectedTable}
              </div>

              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>
                Kameranızı QR koda tutarak menüyü inceleyin
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#0f3c3a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🖨️ Masa Standını Yazdır
              </button>
            </div>
          </div>
        )}

        {/* 5. SEKME: ŞİFRE AYARLARI */}
        {activeTab === 'security' && (
          <div style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f3c3a', margin: '0 0 8px 0' }}>
              🔑 Yönetici Şifresini Değiştir
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Müşterilerin yönetim paneline ve fiyat düzenlemelerine erişememesi için şifrenizi güncelleyin.
            </p>

            <form onSubmit={handleChangePin}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                Yeni Şifre:
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 1453 veya 4 haneli yeni şifre"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 800,
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '16px'
                }}
              />

              {pinMessage && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}>
                  {pinMessage}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#23958e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Yeni Şifreyi Kaydet
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
