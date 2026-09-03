import React, { useState, useEffect } from 'react';

// Sipariş servisi — bağımsız, hata güvenli
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
  menuItems,
  categories,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
  onClose,
  onLogout
}) {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  // Yeni Ürün
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('waffles');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const items = Array.isArray(menuItems) ? menuItems : [];

  useEffect(() => {
    setOrders(getOrders());
    const handler = () => setOrders(getOrders());
    window.addEventListener('waffloq_new_order', handler);
    window.addEventListener('storage', handler);
    // Periyodik olarak da kontrol et
    const interval = setInterval(handler, 3000);
    return () => {
      window.removeEventListener('waffloq_new_order', handler);
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const updateStatus = (id, current) => {
    const next = current === 'pending' ? 'preparing' : current === 'preparing' ? 'completed' : 'pending';
    const updated = orders.map(o => o.id === id ? { ...o, status: next } : o);
    saveOrders(updated);
    setOrders(updated);
  };

  const deleteOrder = (id) => {
    const updated = orders.filter(o => o.id !== id);
    saveOrders(updated);
    setOrders(updated);
  };

  const clearOrders = () => {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    setOrders([]);
  };

  const filteredItems = items.filter(item => {
    if (!item || !item.name) return false;
    if (!searchTerm) return true;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) { alert('Ürün adı ve fiyatı gereklidir.'); return; }
    if (onAddItem) {
      onAddItem({
        name: newName, categoryId: newCat, price: Number(newPrice),
        description: newDesc, available: true,
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80'
      });
    }
    alert('Ürün eklendi!');
    setNewName(''); setNewPrice(''); setNewDesc('');
    setTab('items');
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length < 4) { alert('En az 4 karakter olmalı.'); return; }
    localStorage.setItem('waffloq_admin_pin', newPin.trim());
    setPinMsg('✅ Şifre güncellendi!');
    setNewPin('');
    setTimeout(() => setPinMsg(''), 3000);
  };

  const pendingCount = orders.filter(o => o && o.status === 'pending').length;

  // Inline style objeleri
  const S = {
    overlay: {
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,37,36,0.88)', backdropFilter: 'blur(10px)',
      padding: '8px', fontFamily: 'system-ui, sans-serif'
    },
    panel: {
      background: '#fff', borderRadius: '24px', maxWidth: '860px', width: '100%',
      maxHeight: '94vh', display: 'flex', flexDirection: 'column',
      boxShadow: '0 25px 60px rgba(0,0,0,0.3)', border: '2px solid #b0e5e0',
      overflow: 'hidden'
    },
    header: {
      padding: '16px 20px', background: 'linear-gradient(135deg, #082524, #0f3c3a)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    headerTitle: { fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '0.05em' },
    headerSub: { fontSize: '11px', color: '#7ed1cb', marginTop: '2px' },
    btnClose: {
      background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
      width: '36px', height: '36px', cursor: 'pointer', color: '#fff', fontSize: '18px',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    btnLogout: {
      background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
      borderRadius: '10px', padding: '6px 14px', color: '#fca5a5', fontSize: '12px',
      fontWeight: 700, cursor: 'pointer', marginRight: '8px'
    },
    tabs: {
      display: 'flex', gap: '0', borderBottom: '2px solid #f0f0f0',
      background: '#f9fafb', overflowX: 'auto', padding: '0 12px'
    },
    tab: (active) => ({
      padding: '12px 16px', fontSize: '12px', fontWeight: active ? 800 : 600,
      color: active ? '#0f3c3a' : '#888', cursor: 'pointer', border: 'none',
      background: 'none', borderBottom: active ? '3px solid #23958e' : '3px solid transparent',
      whiteSpace: 'nowrap', transition: 'all 0.2s'
    }),
    badge: {
      background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800,
      padding: '2px 7px', borderRadius: '20px', marginLeft: '6px'
    },
    content: { flex: 1, overflow: 'auto', padding: '20px' },
    input: {
      width: '100%', padding: '10px 14px', borderRadius: '12px',
      border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none',
      boxSizing: 'border-box'
    },
    orderCard: (status) => ({
      background: '#fff', borderRadius: '16px', padding: '16px',
      border: `2px solid ${status === 'pending' ? '#f59e0b' : status === 'preparing' ? '#3b82f6' : '#d1d5db'}`,
      marginBottom: '12px',
      boxShadow: status === 'pending' ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
    }),
    statusBtn: (status) => ({
      background: status === 'pending' ? '#f59e0b' : status === 'preparing' ? '#3b82f6' : '#10b981',
      color: '#fff', border: 'none', borderRadius: '10px', padding: '6px 14px',
      fontSize: '12px', fontWeight: 700, cursor: 'pointer'
    }),
    itemRow: {
      background: '#fff', borderRadius: '14px', padding: '12px',
      border: '1px solid #e8e8e8', marginBottom: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
    },
    priceInput: {
      width: '80px', padding: '6px', textAlign: 'center', fontWeight: 700,
      fontSize: '13px', borderRadius: '8px', border: '1px solid #d0d0d0',
      background: '#f5f5f5', outline: 'none'
    },
    primaryBtn: {
      width: '100%', padding: '14px', background: '#23958e', color: '#fff',
      border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800,
      cursor: 'pointer', boxShadow: '0 4px 12px rgba(35,149,142,0.25)'
    },
    deleteBtn: {
      background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
      fontSize: '16px', padding: '4px'
    },
    stockBtn: (available) => ({
      padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      border: 'none', cursor: 'pointer',
      background: available ? '#d1fae5' : '#fee2e2',
      color: available ? '#065f46' : '#991b1b'
    })
  };

  return (
    <div style={S.overlay}>
      <div style={S.panel}>
        {/* HEADER */}
        <div style={S.header}>
          <div>
            <h2 style={S.headerTitle}>🏪 WAFFLOQ Yönetim Paneli</h2>
            <div style={S.headerSub}>Yerel Depo Modu • Sipariş & Menü Yönetimi</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={S.btnLogout} onClick={onLogout || onClose}>🚪 Çıkış</button>
            <button style={S.btnClose} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* TABS */}
        <div style={S.tabs}>
          <button style={S.tab(tab === 'orders')} onClick={() => setTab('orders')}>
            🔔 Masa Siparişleri ({orders.length})
            {pendingCount > 0 && <span style={S.badge}>{pendingCount} Yeni</span>}
          </button>
          <button style={S.tab(tab === 'items')} onClick={() => setTab('items')}>
            📋 Ürün & Fiyat ({items.length})
          </button>
          <button style={S.tab(tab === 'add')} onClick={() => setTab('add')}>
            ➕ Yeni Ürün Ekle
          </button>
          <button style={S.tab(tab === 'security')} onClick={() => setTab('security')}>
            🔑 Şifre Ayarları
          </button>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* SİPARİŞLER SEKMESİ */}
          {tab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f3c3a' }}>
                    Masalardan Gelen Siparişler
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
                    Müşteriler "Garsona İlet" dediğinde siparişler anlık buraya düşer.
                  </p>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={() => { if (confirm('Tüm siparişleri temizle?')) clearOrders(); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >🗑 Temizle</button>
                )}
              </div>

              {orders.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px', background: '#f9fafb',
                  borderRadius: '20px', border: '1px solid #e8e8e8'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔔</div>
                  <p style={{ fontWeight: 700, color: '#555', fontSize: '14px' }}>Henüz bekleyen sipariş yok</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Müşteriler QR kodu okutup sipariş verdiğinde burada görünecek.
                  </p>
                </div>
              ) : (
                orders.map(order => {
                  if (!order) return null;
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  return (
                    <div key={order.id} style={S.orderCard(order.status)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            background: '#0f3c3a', color: '#fff', fontWeight: 900,
                            padding: '4px 14px', borderRadius: '10px', fontSize: '14px'
                          }}>
                            Masa #{order.tableNumber || '?'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#888' }}>
                            🕐 {order.timeFormatted || 'Yeni'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            style={S.statusBtn(order.status)}
                            onClick={() => updateStatus(order.id, order.status)}
                          >
                            {order.status === 'pending' ? '⏳ Hazırla' : order.status === 'preparing' ? '🍳 Teslim Et' : '✅ Tamamlandı'}
                          </button>
                          <button style={S.deleteBtn} onClick={() => deleteOrder(order.id)}>🗑</button>
                        </div>
                      </div>

                      {orderItems.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#f9fafb', padding: '8px 12px', borderRadius: '10px',
                          marginBottom: '4px', fontSize: '12px'
                        }}>
                          <div>
                            <strong style={{ color: '#0f3c3a' }}>{item.quantity || 1}x</strong>{' '}
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                            {item.specialNote && (
                              <span style={{ fontSize: '10px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                                Not: {item.specialNote}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: '#17625e' }}>
                            {(item.price || 0) * (item.quantity || 1)} TL
                          </span>
                        </div>
                      ))}

                      <div style={{
                        display: 'flex', justifyContent: 'space-between', marginTop: '12px',
                        paddingTop: '8px', borderTop: '1px solid #f0f0f0',
                        fontSize: '13px', fontWeight: 900
                      }}>
                        <span style={{ color: '#888' }}>Toplam:</span>
                        <span style={{ color: '#0f3c3a', fontSize: '16px' }}>{order.totalAmount || 0} TL</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ÜRÜN LİSTESİ SEKMESİ */}
          {tab === 'items' && (
            <div>
              <input
                type="text"
                placeholder="🔍 Ürün adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...S.input, marginBottom: '16px' }}
              />

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredItems.map(item => (
                  <div key={item.id} style={S.itemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <img
                        src={item.image}
                        alt={item.name || ''}
                        style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          objectFit: 'cover', background: '#f0f0f0', border: '1px solid #e0e0e0',
                          flexShrink: 0
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          <strong style={{ color: '#17625e' }}>{item.price} TL</strong> • {item.categoryId === 'drinks' ? 'İçecek' : 'Waffle'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <input
                        type="number"
                        defaultValue={item.price}
                        style={S.priceInput}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v > 0 && v !== item.price && onUpdateItem) {
                            onUpdateItem({ ...item, price: v });
                          }
                        }}
                      />
                      <button
                        style={S.stockBtn(item.available !== false)}
                        onClick={() => onUpdateItem && onUpdateItem({ ...item, available: !(item.available !== false) })}
                      >
                        {item.available !== false ? 'Stokta' : 'Tükendi'}
                      </button>
                      <button
                        style={S.deleteBtn}
                        onClick={() => {
                          if (confirm(`"${item.name}" silinsin mi?`)) {
                            onDeleteItem && onDeleteItem(item.id);
                          }
                        }}
                      >🗑</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { if (confirm('Menüyü varsayılana sıfırla?')) onResetDefaults && onResetDefaults(); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >🔄 Menüyü Sıfırla</button>
              </div>
            </div>
          )}

          {/* YENİ ÜRÜN SEKMESİ */}
          {tab === 'add' && (
            <form onSubmit={handleAddItem}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Ürün Adı *</label>
                  <input style={S.input} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nutella Pankek" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Kategori *</label>
                  <select style={S.input} value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                    <option value="waffles">🧇 Waffle</option>
                    <option value="drinks">🥤 İçecek</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Fiyat (TL) *</label>
                  <input style={S.input} type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="350" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Açıklama</label>
                  <input style={S.input} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="İçerik bilgisi..." />
                </div>
              </div>
              <button type="submit" style={S.primaryBtn}>Ürünü Menüye Ekle</button>
            </form>
          )}

          {/* ŞİFRE SEKMESİ */}
          {tab === 'security' && (
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{
                background: '#edf9f8', border: '1px solid #b0e5e0', borderRadius: '16px',
                padding: '16px', marginBottom: '16px', fontSize: '12px', color: '#0f3c3a'
              }}>
                <strong style={{ fontSize: '14px' }}>🔐 Yönetici Şifrenizi Değiştirin</strong>
                <p style={{ margin: '4px 0 0', color: '#555' }}>
                  Müşterilerinizin panele erişememesi için şifrenizi güncelleyebilirsiniz.
                </p>
              </div>

              <form onSubmit={handleChangePin} style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>Yeni Şifre:</label>
                <input
                  style={{ ...S.input, marginTop: '6px', marginBottom: '12px', fontWeight: 700, fontSize: '16px' }}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Yeni şifre (en az 4 karakter)"
                  required
                />
                {pinMsg && (
                  <div style={{
                    background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '10px',
                    padding: '8px 12px', marginBottom: '12px', fontSize: '12px',
                    color: '#065f46', fontWeight: 700
                  }}>{pinMsg}</div>
                )}
                <button type="submit" style={S.primaryBtn}>Şifreyi Kaydet</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
