import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SHOP_INFO } from '../data/defaultMenu';
import { orderService, playOrderSound } from '../firebase/orderService';
import { isFirebaseConfigured, firebaseConfig, saveFirebaseConfig, removeFirebaseConfig } from '../firebase/config';

const PRODUCTION_URL = 'https://waffloq-menu--waffloqmenu.europe-west4.hosted.app';

// 🖨️ DKT-B823 80MM İZOLE ADİSYON YAZDIRICI (Boş sayfa ve taşma yapmaz)
export function printThermalReceipt(order) {
  if (!order) return;

  const oldFrame = document.getElementById('receipt-print-iframe');
  if (oldFrame) {
    oldFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'receipt-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const itemsHtml = (order.items || []).map(it => `
    <div style="margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
        <span style="max-width: 48mm; word-break: break-word;">${it.name}</span>
        <span style="white-space: nowrap;">${it.quantity || 1}x ${(it.price || 0) * (it.quantity || 1)} TL</span>
      </div>
      ${it.specialNote ? `<div style="font-size: 11px; padding-left: 6px; color: #222; font-style: italic;">${it.specialNote}</div>` : ''}
    </div>
  `).join('');

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Adisyon - Masa #${order.tableNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 72mm;
            margin: 0 auto;
            padding: 2mm 1mm 6mm 1mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            line-height: 1.35;
            color: #000000;
            background: #ffffff;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .row { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="text-center" style="margin-bottom: 6px;">
          <div style="font-size: 18px; font-weight: 900; letter-spacing: 2px;">*** WAFFLOQ ***</div>
          <div style="font-size: 12px; font-weight: bold; margin-top: 2px;">WAFFLE & TOASTERY</div>
          <div style="font-size: 11px; margin-top: 2px;">ADİSYON / SİPARİŞ FİŞİ</div>
          <div style="font-size: 12px; margin-top: 4px;">================================</div>
        </div>

        <div style="font-size: 22px; font-weight: 900; text-align: center; border: 2px solid #000; padding: 4px; margin: 6px 0;">
          MASA #${order.tableNumber}
        </div>

        <div style="font-size: 12px; margin-bottom: 4px;">
          <div class="row"><span>TARİH :</span> <span>${order.orderDate || new Date().toLocaleDateString('tr-TR')}</span></div>
          <div class="row"><span>SAAT  :</span> <span>${order.timeFormatted || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div class="row"><span>FİŞ NO:</span> <span>#${String(order.id || '').slice(-6).toUpperCase()}</span></div>
          <div class="row"><span>DURUM :</span> <span>${order.status === 'pending' ? 'BEKLIYOR' : order.status === 'preparing' ? 'HAZIRLANIYOR' : 'TAMAMLANDI'}</span></div>
        </div>

        <div style="font-size: 12px; margin: 4px 0;">--------------------------------</div>
        <div class="row bold" style="font-size: 12px;">
          <span>ÜRÜN</span>
          <span>AD.  TUTAR</span>
        </div>
        <div style="font-size: 12px; margin: 4px 0;">--------------------------------</div>

        <div style="margin-bottom: 6px;">
          ${itemsHtml}
        </div>

        <div style="font-size: 12px; margin: 4px 0;">================================</div>
        <div class="row bold" style="font-size: 18px; margin: 6px 0;">
          <span>TOPLAM :</span>
          <span>${order.totalAmount || 0} TL</span>
        </div>
        <div style="font-size: 12px; margin: 4px 0;">================================</div>

        <div class="text-center" style="font-size: 11px; margin-top: 8px;">
          <div>Wi-Fi: ${SHOP_INFO.wifiName} | Şifre: ${SHOP_INFO.wifiPass}</div>
          <div style="margin-top: 4px; font-weight: bold;">Bizi Tercih Ettiğiniz İçin</div>
          <div>Teşekkür Ederiz! Afiyet Olsun.</div>
        </div>

        <!-- Otomatik Kesim Payı (Feed) -->
        <div style="height: 10mm;"></div>
      </body>
    </html>
  `;

  const frameDoc = iframe.contentWindow.document;
  frameDoc.open();
  frameDoc.write(receiptHtml);
  frameDoc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 200);
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
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'history' | 'items' | 'add' | 'qr' | 'cloud' | 'security'
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [historyDateFilter, setHistoryDateFilter] = useState('today'); // 'today' | 'all' | 'cancelled'
  
  // Yeni Sipariş Bildirim Banner'ı
  const [orderAlert, setOrderAlert] = useState({ show: false, table: '', amount: 0, time: '' });

  // 80mm Termal Adisyon Yazdırma State
  const [receiptModalOrder, setReceiptModalOrder] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);

  // Şifre değiştirme state
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // Firebase Bulut Ayarları Formu
  const [cloudApiKey, setCloudApiKey] = useState(firebaseConfig.apiKey || '');
  const [cloudProjectId, setCloudProjectId] = useState(firebaseConfig.projectId || 'waffloqmenu');
  const [cloudAppId, setCloudAppId] = useState(firebaseConfig.appId || '');
  const [cloudAuthDomain, setCloudAuthDomain] = useState(firebaseConfig.authDomain || 'waffloqmenu.firebaseapp.com');
  const [cloudStorageBucket, setCloudStorageBucket] = useState(firebaseConfig.storageBucket || 'waffloqmenu.appspot.com');

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

  // CANLI SİPARİŞ DİNLEYİCİSİ (onSnapshot)
  useEffect(() => {
    const unsubscribe = orderService.subscribeToOrders(
      (updatedOrders) => {
        setOrders(updatedOrders || []);
      },
      (newOrder) => {
        setOrderAlert({
          show: true,
          table: newOrder.tableNumber || '?',
          amount: newOrder.totalAmount || 0,
          time: newOrder.timeFormatted || 'Az önce'
        });

        // Eğer otomatik adisyon yazdırma açıksa doğrudan yazdır
        if (autoPrint) {
          handlePrintReceipt(newOrder);
        }

        setTimeout(() => {
          setOrderAlert(prev => ({ ...prev, show: false }));
        }, 12000);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [autoPrint]);

  // Aktif Siparişler (Bekleyen & Hazırlanan)
  const activeOrders = useMemo(() => {
    return orders.filter(o => o && (o.status === 'pending' || o.status === 'preparing'));
  }, [orders]);

  // Arşiv / Geçmiş Siparişler (Teslim Edilen & İptal Edilen)
  const historyOrders = useMemo(() => {
    return orders.filter(o => o && (o.status === 'completed' || o.status === 'cancelled'));
  }, [orders]);

  // Bugünün Tarihi
  const todayStr = new Date().toLocaleDateString('tr-TR');

  // Günlük İstatistikler (Bugünkü Ciro & Sipariş Sayıları)
  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => {
      if (!o) return false;
      if (o.orderDate) return o.orderDate === todayStr;
      if (o.createdAt) {
        return new Date(o.createdAt).toLocaleDateString('tr-TR') === todayStr;
      }
      return false;
    });

    const completedToday = todayOrders.filter(o => o.status === 'completed');
    const cancelledToday = todayOrders.filter(o => o.status === 'cancelled');
    const todayRevenue = completedToday.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      todayTotalCount: todayOrders.length,
      todayCompletedCount: completedToday.length,
      todayCancelledCount: cancelledToday.length,
      todayRevenue
    };
  }, [orders, todayStr]);

  // Sipariş Durumu İlerletme (Bekliyor -> Hazırlanıyor -> Tamamlandı)
  const handleAdvanceStatus = async (order) => {
    const next = order.status === 'pending' ? 'preparing' : 'completed';
    const updated = await orderService.updateOrderStatus(order.id, next);
    setOrders(updated || []);
  };

  // Sipariş İptali (status: 'cancelled')
  const handleCancelOrder = async (order) => {
    if (confirm(`Masa #${order.tableNumber} siparişini İPTAL etmek istediğinize emin misiniz?`)) {
      const updated = await orderService.updateOrderStatus(order.id, 'cancelled');
      setOrders(updated || []);
    }
  };

  // Siparişi Tekrar Aktife Alma
  const handleReactivateOrder = async (order) => {
    const updated = await orderService.updateOrderStatus(order.id, 'pending');
    setOrders(updated || []);
    setActiveTab('orders');
  };

  // Siparişi Kalıcı Olarak Silme
  const handleDeleteOrder = async (orderId) => {
    if (confirm('Bu sipariş kaydı veritabanından kalıcı olarak silinecek. Emin misiniz?')) {
      const updated = await orderService.deleteOrder(orderId);
      setOrders(updated || []);
    }
  };

  // Tüm Siparişleri Temizle
  const handleClearAll = async () => {
    if (confirm('Tüm aktif ve geçmiş siparişler veritabanından kalıcı olarak silinecek! Emin misiniz?')) {
      await orderService.clearAllOrders();
      setOrders([]);
    }
  };

  // 🖨️ 80mm Termal Adisyon Yazdırma
  const handlePrintReceipt = (order) => {
    printThermalReceipt(order);
  };

  const handleSaveCloudConfig = (e) => {
    e.preventDefault();
    if (!cloudApiKey.trim() || !cloudProjectId.trim()) {
      alert("Lütfen en azından API Key ve Project ID alanlarını giriniz.");
      return;
    }
    const newConfig = {
      apiKey: cloudApiKey.trim(),
      projectId: cloudProjectId.trim(),
      authDomain: cloudAuthDomain.trim() || `${cloudProjectId.trim()}.firebaseapp.com`,
      storageBucket: cloudStorageBucket.trim() || `${cloudProjectId.trim()}.appspot.com`,
      appId: cloudAppId.trim() || "1:258128994674:web:420808d70786df7ab97deb"
    };
    saveFirebaseConfig(newConfig);
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

  // Filtrelenmiş Sipariş Geçmişi
  const filteredHistoryOrders = useMemo(() => {
    return historyOrders.filter(o => {
      if (historyDateFilter === 'today') {
        if (o.orderDate) return o.orderDate === todayStr;
        if (o.createdAt) return new Date(o.createdAt).toLocaleDateString('tr-TR') === todayStr;
        return true;
      }
      if (historyDateFilter === 'cancelled') {
        return o.status === 'cancelled';
      }
      return true;
    });
  }, [historyOrders, historyDateFilter, todayStr]);

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


      {/* 🔔 YENİ SİPARİŞ GELİNCE YANIP SÖNEN ÇAĞRI BANNER'I */}
      {orderAlert.show && (
        <div style={{
          backgroundColor: '#ea580c',
          color: '#ffffff',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 800,
          fontSize: '15px',
          boxShadow: '0 8px 25px rgba(234, 88, 12, 0.4)',
          position: 'sticky',
          top: 0,
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <div>
              <span>YENİ MASA SİPARİŞİ GELDİ! — MASA #{orderAlert.table}</span>
              <span style={{ marginLeft: '12px', fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 10px', borderRadius: '8px' }}>
                Tutar: {orderAlert.amount} TL • {orderAlert.time}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                setActiveTab('orders');
                setOrderAlert(prev => ({ ...prev, show: false }));
              }}
              style={{
                backgroundColor: '#ffffff',
                color: '#ea580c',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Siparişi İncele
            </button>
            <button
              onClick={() => setOrderAlert(prev => ({ ...prev, show: false }))}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
                backgroundColor: isFirebaseConfigured ? '#059669' : '#d97706',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {isFirebaseConfigured ? '🟢 BULUT CANLI BAĞLI' : '🟡 YEREL MOD'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#7ed1cb' }}>
              Restoran POS • 80mm Adisyon & Mutfak Ekranı
            </p>
          </div>
        </div>

        {/* Hızlı Butonlar & Termal Yazıcı Durumu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Otomatik Fiş Yazdırma Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: autoPrint ? '#14532d' : '#0f3c3a',
            border: autoPrint ? '1px solid #22c55e' : '1px solid #17625e',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#ffffff'
          }}>
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>🖨️ Otomatik Adisyon</span>
          </label>

          <button
            onClick={() => playOrderSound()}
            title="Sipariş zil sesini test et"
            style={{
              backgroundColor: '#0f3c3a',
              color: '#7ed1cb',
              border: '1px solid #17625e',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔊 Zili Test Et
          </button>

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
        {/* 1. Aktif Siparişler */}
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
          <span>🔔 Aktif Siparişler ({activeOrders.length})</span>
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

        {/* 2. Sipariş Geçmişi & Rapor */}
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'history' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'history' ? '#0f3c3a' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>📜 Sipariş Geçmişi & Günlük Rapor ({historyOrders.length})</span>
        </button>

        {/* 3. Menü & Fiyat */}
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

        {/* 4. Yeni Ürün Ekle */}
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

        {/* 5. Masa QR Kod & Stand */}
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
          📱 Masa QR Kod & Stand
        </button>

        {/* 6. Bulut Bağlantısı */}
        <button
          onClick={() => setActiveTab('cloud')}
          style={{
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'cloud' ? '3px solid #23958e' : '3px solid transparent',
            color: activeTab === 'cloud' ? '#0f3c3a' : '#64748b',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🔥 Bulut Bağlantısı</span>
        </button>

        {/* 7. Şifre Ayarları */}
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
        
        {/* 1. SEKME: AKTİF SİPARİŞLER (MUTFAK EKRANI - SADECE BEKLEYEN VE HAZIRLANANLAR) */}
        {activeTab === 'orders' && (
          <div>
            {/* GÜNLÜK KASA & CİRO ÖZET ÇUBUĞU */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '16px 24px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📊 Bugünkü Restoran Özeti ({todayStr}):
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Toplam Sipariş: </span>
                    <strong style={{ color: '#0f3c3a' }}>{stats.todayTotalCount} Adet</strong>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Teslim Edilen: </span>
                    <strong style={{ color: '#166534' }}>{stats.todayCompletedCount} Adet</strong>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>İptal Edilen: </span>
                    <strong style={{ color: '#dc2626' }}>{stats.todayCancelledCount} Adet</strong>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                padding: '10px 20px',
                borderRadius: '16px',
                textAlign: 'right'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Bugünkü Toplam Ciro:
                </span>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d' }}>
                  {stats.todayRevenue} TL
                </div>
              </div>
            </div>

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
                  Masalardan Gelen Aktif Siparişler ({activeOrders.length})
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Her siparişi tek tıkla 80mm termal yazıcınızdan (DKT-B823) yazdırabilirsiniz.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                  Bekleyen: <strong style={{ color: '#d97706' }}>{pendingCount}</strong> | Hazırlanan: <strong style={{ color: '#2563eb' }}>{preparingCount}</strong>
                </span>
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '56px', marginBottom: '14px' }}>🔔</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f3c3a', margin: '0 0 6px 0' }}>
                  Şu Anda Bekleyen Aktif Sipariş Yok
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '460px', margin: '0 auto' }}>
                  Tüm siparişler teslim edildi veya bekleyen çağrı yok. Müşteriler QR kodla sipariş verdikçe zil çalarak buraya düşecektir.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setActiveTab('history')}
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📜 Sipariş Geçmişini Görüntüle ({historyOrders.length})
                  </button>
                  <button
                    onClick={() => playOrderSound()}
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Zili Test Et
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '18px'
              }}>
                {activeOrders.map(order => {
                  if (!order) return null;
                  const isPending = order.status === 'pending';
                  const isPreparing = order.status === 'preparing';

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

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Hızlı Adisyon Yazdır Butonu */}
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              style={{
                                backgroundColor: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="80mm Termal Adisyon Yazdır"
                            >
                              🖨️ Fiş
                            </button>

                            {/* Kalıcı Silme Butonu */}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{
                                backgroundColor: '#fef2f2',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                              title="Veritabanından Tamamen Sil"
                            >
                              🗑
                            </button>
                          </div>
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
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    marginTop: '4px',
                                    fontWeight: 600
                                  }}>
                                    {item.specialNote}
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

                      {/* Alt Tutar & İlerleme / Adisyon / İptal Butonları */}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Durum İlerleme Butonu */}
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '12px',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              backgroundColor: isPending ? '#f59e0b' : '#10b981',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {isPending ? '⏳ Siparişi Onayla & Hazırla' : '✅ Masaya Teslim Edildi (Arşivle)'}
                          </button>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {/* 80mm Adisyon Yazdır Butonu */}
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #0f3c3a',
                                backgroundColor: '#0f3c3a',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              🖨️ Adisyon Yazdır (80mm)
                            </button>

                            {/* Siparişi İptal Et Butonu */}
                            <button
                              onClick={() => handleCancelOrder(order)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #fca5a5',
                                backgroundColor: '#fff',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: '#dc2626'
                              }}
                              title="Siparişi İptal Et"
                            >
                              ❌ İptal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. SEKME: 📜 SİPARİŞ GEÇMİŞİ & GÜNLÜK RAPOR */}
        {activeTab === 'history' && (
          <div>
            {/* Üst Rapor Kartı */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f3c3a', margin: 0 }}>
                    📜 Sipariş Geçmişi & Kasa Raporu
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Tamamlanan ve iptal edilen tüm siparişlerin kayıtları burada saklanır.
                  </p>
                </div>

                {historyOrders.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🗑 Tüm Geçmişi Temizle
                  </button>
                )}
              </div>

              {/* İstatistik Kutuları */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px'
              }}>
                <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    Bugünkü Toplam Ciro:
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
                    {stats.todayRevenue} TL
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Bugünkü Toplam Sipariş:
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                    {stats.todayTotalCount} Adet
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    Teslim Edilen:
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#166534', marginTop: '4px' }}>
                    {stats.todayCompletedCount} Adet
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                    İptal Edilen:
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>
                    {stats.todayCancelledCount} Adet
                  </div>
                </div>
              </div>
            </div>

            {/* Filtreleme Butonları */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setHistoryDateFilter('today')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: historyDateFilter === 'today' ? '#0f3c3a' : '#ffffff',
                  color: historyDateFilter === 'today' ? '#ffffff' : '#475569',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                📅 Bugün ({todayStr})
              </button>
              <button
                onClick={() => setHistoryDateFilter('all')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: historyDateFilter === 'all' ? '#0f3c3a' : '#ffffff',
                  color: historyDateFilter === 'all' ? '#ffffff' : '#475569',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                Tüm Geçmiş ({historyOrders.length})
              </button>
              <button
                onClick={() => setHistoryDateFilter('cancelled')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: historyDateFilter === 'cancelled' ? '#dc2626' : '#ffffff',
                  color: historyDateFilter === 'cancelled' ? '#ffffff' : '#475569',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                🚫 İptal Edilenler
              </button>
            </div>

            {/* Geçmiş Sipariş Listesi */}
            {filteredHistoryOrders.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '50px 20px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '44px', marginBottom: '10px' }}>📜</div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f3c3a', margin: '0 0 4px 0' }}>
                  Kayıtlı Geçmiş Sipariş Bulunmuyor
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Masaya teslim edilen veya iptal edilen siparişler burada kalıcı olarak arşivlenir.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '16px'
              }}>
                {filteredHistoryOrders.map(order => {
                  const isCancelled = order.status === 'cancelled';
                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '18px',
                        border: isCancelled ? '2px solid #fca5a5' : '1px solid #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div>
                        {/* Başlık ve Durum */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              backgroundColor: '#0f3c3a',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '13px',
                              padding: '4px 10px',
                              borderRadius: '10px'
                            }}>
                              MASA #{order.tableNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {order.orderDate || ''} • {order.timeFormatted || ''}
                            </span>
                          </div>

                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: isCancelled ? '#fee2e2' : '#dcfce7',
                            color: isCancelled ? '#dc2626' : '#166534'
                          }}>
                            {isCancelled ? '🚫 İptal Edildi' : '✅ Teslim Edildi'}
                          </span>
                        </div>

                        {/* Kalemler */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                          {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                              <span><strong>{item.quantity || 1}x</strong> {item.name}</span>
                              <span style={{ fontWeight: 700, color: '#475569' }}>{(item.price || 0) * (item.quantity || 1)} TL</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alt Bölüm: Toplam ve Butonlar */}
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Tutar:</span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: isCancelled ? '#94a3b8' : '#0f3c3a', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                            {order.totalAmount || 0} TL
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handlePrintReceipt(order)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '10px',
                              border: '1px solid #0f3c3a',
                              backgroundColor: '#0f3c3a',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            🖨️ Adisyon Fişi
                          </button>

                          <button
                            onClick={() => handleReactivateOrder(order)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#f8fafc',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: '#334155'
                            }}
                            title="Tekrar Aktif Siparişlere Gönder"
                          >
                            🔄 Aktif Et
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '10px',
                              border: '1px solid #fca5a5',
                              backgroundColor: '#fef2f2',
                              fontSize: '12px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            title="Veritabanından Kalıcı Olarak Sil"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SEKME: ÜRÜN & FİYAT LİSTESİ */}
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  onClick={() => setSelectedCategoryFilter('menus')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: selectedCategoryFilter === 'menus' ? '#0f3c3a' : '#f1f5f9',
                    color: selectedCategoryFilter === 'menus' ? '#ffffff' : '#475569'
                  }}
                >
                  🍽️ Menüler
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

            {/* Kart Listesi */}
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
                        {item.categoryId === 'drinks' ? '🥤 İçecek' : item.categoryId === 'menus' ? '🍽️ Menü' : '🧇 Waffle'}
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

        {/* 4. SEKME: YENİ ÜRÜN EKLE */}
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
                    <option value="menus">🍽️ Avantajlı Menüler</option>
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

        {/* 5. SEKME: MASA QR KODLARI & STAND ÜRETİCİ */}
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

        {/* 6. SEKME: 🔥 BULUT BAĞLANTISI */}
        {activeTab === 'cloud' && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f3c3a', margin: '0 0 4px 0' }}>
                  🔥 Canlı Bulut Veritabanı (Firebase Firestore)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Müşteri telefonlarından verilen siparişlerin dükkan ekranına canlı düşmesi için bulut bağlantısı
                </p>
              </div>

              <span style={{
                backgroundColor: isFirebaseConfigured ? '#dcfce7' : '#fee2e2',
                color: isFirebaseConfigured ? '#166534' : '#991b1b',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800
              }}>
                {isFirebaseConfigured ? '🟢 BULUT AKTİF' : '🔴 BAĞLANTI BEKLİYOR'}
              </span>
            </div>

            {isFirebaseConfigured ? (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ color: '#166534', margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800 }}>
                  🎉 Tebrikler! Bulut Bağlantınız Başarıyla Çalışıyor!
                </h4>
                <p style={{ color: '#15803d', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  • Müşteriler masalardan sipariş verdiğinde anında bu ekrana düşer.<br />
                  • Sayfayı yenilemenize gerek yoktur, <code>onSnapshot</code> canlı dinleyici açıktır.<br />
                  • Yeni sipariş geldiğinde <strong>restoran zili (Ding-Dong)</strong> çalar.<br />
                  • <strong>DKT-B823</strong> termal yazıcınızdan tek tıkla 80mm adisyon çıktısı alabilirsiniz.
                </p>

                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => playOrderSound()}
                    style={{
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Zil Sesini Test Et
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Bulut bağlantı ayarını sıfırlamak istediğinize emin misiniz?")) {
                        removeFirebaseConfig();
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Bağlantıyı Sıfırla
                  </button>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSaveCloudConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Firebase API Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AIzaSy..."
                    value={cloudApiKey}
                    onChange={(e) => setCloudApiKey(e.target.value)}
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
                    Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="waffloqmenu"
                    value={cloudProjectId}
                    onChange={(e) => setCloudProjectId(e.target.value)}
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
                    App ID (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="1:1234567890:web:abcdef"
                    value={cloudAppId}
                    onChange={(e) => setCloudAppId(e.target.value)}
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
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    placeholder="waffloqmenu.firebaseapp.com"
                    value={cloudAuthDomain}
                    onChange={(e) => setCloudAuthDomain(e.target.value)}
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

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#0f3c3a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 60, 58, 0.25)'
                }}
              >
                🔥 Bulut Bağlantısını Güncelle
              </button>
            </form>
          </div>
        )}

        {/* 7. SEKME: ŞİFRE AYARLARI */}
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
                placeholder="Örn: 4 haneli yeni şifre"
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
