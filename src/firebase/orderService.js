import { db, isFirebaseConfigured } from './config';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY_ORDERS = 'waffloq_active_orders';

// Restoran Çağrı Zili (Ding-Dong) - Harici ses dosyasına ihtiyaç duymayan saf Web Audio API sentezleyici
export function playOrderSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // 1. Ton: 880 Hz (A5 zili)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // 2. Ton: 1046 Hz (C6 berrak restoran zili)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.18);
    gain2.gain.setValueAtTime(0.45, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 1.1);
  } catch (e) {
    console.log("Ses çalma izni bekleniyor:", e);
  }
}

export const orderService = {
  // Yeni sipariş gönder (Buluta ve Yerel Depoya)
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

    // Firebase Cloud Firestore'a Gönder
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        newOrder.id = docRef.id;
        console.log("✅ Sipariş buluta yazıldı. ID:", docRef.id);
      } catch (err) {
        console.error("Firestore sipariş kaydı hatası:", err);
      }
    }

    // Yerel depolamaya da kaydet
    const currentOrders = this.getLocalOrders();
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));

    // Yerel event fırlat
    window.dispatchEvent(new CustomEvent('waffloq_new_order', { detail: newOrder }));

    return newOrder;
  },

  // Canlı Siparişleri Dinle (onSnapshot ile gerçek zamanlı bulut dinleyici)
  subscribeToOrders(onUpdate, onNewOrderAlert) {
    let initialLoad = true;

    // 1. Firebase Firestore Canlı Dinleyici
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const cloudOrders = [];
          snapshot.forEach((doc) => {
            cloudOrders.push({ id: doc.id, ...doc.data() });
          });

          // Eğer yeni bir sipariş eklendiyse ve ilk açılış değilse sesli uyarı ver
          if (!initialLoad) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const addedData = change.doc.data();
                if (addedData.status === 'pending') {
                  playOrderSound();
                  if (onNewOrderAlert) {
                    onNewOrderAlert({ id: change.doc.id, ...addedData });
                  }
                }
              }
            });
          }

          initialLoad = false;
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(cloudOrders));
          onUpdate(cloudOrders);
        }, (error) => {
          console.warn("Firestore canlı dinleyici hatası:", error);
          // Hata durumunda yerel depoya dön
          onUpdate(this.getLocalOrders());
        });

        return unsubscribe;
      } catch (e) {
        console.error("Firestore listener kurulamadı:", e);
      }
    }

    // 2. Yerel Depo Fallback Dinleyicisi
    onUpdate(this.getLocalOrders());

    const handleLocalEvent = (e) => {
      const orders = this.getLocalOrders();
      onUpdate(orders);
      if (e && e.detail) {
        playOrderSound();
        if (onNewOrderAlert) {
          onNewOrderAlert(e.detail);
        }
      }
    };

    window.addEventListener('waffloq_new_order', handleLocalEvent);
    window.addEventListener('storage', () => onUpdate(this.getLocalOrders()));

    return () => {
      window.removeEventListener('waffloq_new_order', handleLocalEvent);
    };
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

  // Sipariş durumunu güncelle
  async updateOrderStatus(orderId, newStatus) {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
        console.log("✅ Bulut sipariş durumu güncellendi:", newStatus);
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
        console.log("✅ Buluttan sipariş silindi.");
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
  async clearAllOrders() {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        querySnapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, 'orders', docSnap.id));
        });
      } catch (err) {
        console.error("Firestore temizleme hatası:", err);
      }
    }

    localStorage.removeItem(STORAGE_KEY_ORDERS);
    return [];
  }
};
