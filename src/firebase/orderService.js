import { db, isFirebaseConfigured } from './config';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY_ORDERS = 'waffloq_active_orders';

export const orderService = {
  // Yeni sipariş gönder
  async sendOrder(orderData) {
    const newOrder = {
      id: `ord-${Date.now()}`,
      tableNumber: orderData.tableNumber || 'Belirtilmedi',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      totalCount: orderData.totalCount || 0,
      status: 'pending', // 'pending' (Bekliyor) | 'preparing' (Hazırlanıyor) | 'completed' (Teslim Edildi)
      createdAt: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        newOrder.id = docRef.id;
      } catch (err) {
        console.error("Firestore sipariş kaydı hatası:", err);
      }
    }

    // Yerel depolamaya da ekle
    const currentOrders = this.getLocalOrders();
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));

    // Diğer sekmelere / yöneticiye özel event fırlat
    window.dispatchEvent(new CustomEvent('waffloq_new_order', { detail: newOrder }));

    return newOrder;
  },

  // Tüm aktif siparişleri getir
  getLocalOrders() {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  // Sipariş durumunu güncelle (Bekliyor -> Hazırlanıyor -> Teslim Edildi)
  async updateOrderStatus(orderId, newStatus) {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      } catch (err) {
        console.error("Firestore durum güncelleme hatası:", err);
      }
    }

    const currentOrders = this.getLocalOrders();
    const updated = currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated;
  },

  // Siparişi sil / tamamla
  async deleteOrder(orderId) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (err) {
        console.error("Firestore sipariş silme hatası:", err);
      }
    }

    const currentOrders = this.getLocalOrders();
    const updated = currentOrders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
    return updated;
  },

  // Tüm siparişleri temizle
  clearAllOrders() {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    return [];
  }
};
