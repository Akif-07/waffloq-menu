import { db, isFirebaseConfigured } from './config';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DEFAULT_MENU_ITEMS, WAFFLE_BUILDER_DATA, DEFAULT_CATEGORIES } from '../data/defaultMenu';

// v3: Kullanıcının sunduğu güncel resmi Trendyol/TGO Yemek listesi
const STORAGE_KEY_MENU = 'waffloqmenu_items_v3';
const STORAGE_KEY_BUILDER = 'waffloqmenu_builder_v3';
const STORAGE_KEY_CATEGORIES = 'waffloqmenu_categories_v3';

export const menuService = {
  // Menü ürünlerini getir
  async getMenuItems() {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'menuItems'));
        if (!querySnapshot.empty) {
          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          return items;
        }
      } catch (err) {
        console.error("Firestore'dan menü okunamadı, yerel hafızaya dönülüyor:", err);
      }
    }

    // Yerel depolama kontrolü
    const saved = localStorage.getItem(STORAGE_KEY_MENU);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Eski önbellekleri temizle ve yeni listeyi kaydet
    localStorage.removeItem('waffloqmenu_items');
    localStorage.removeItem('waffloqmenu_items_v2');
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    return DEFAULT_MENU_ITEMS;
  },

  // Ürün güncelle
  async updateMenuItem(item) {
    if (isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'menuItems', item.id);
        await updateDoc(ref, item);
      } catch (err) {
        console.error("Firestore güncelleme hatası:", err);
      }
    }

    const current = await this.getMenuItems();
    const updated = current.map(i => i.id === item.id ? { ...i, ...item } : i);
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(updated));
    return updated;
  },

  // Yeni ürün ekle
  async addMenuItem(item) {
    const newItem = {
      ...item,
      id: item.id || `item-${Date.now()}`
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'menuItems', newItem.id), newItem);
      } catch (err) {
        console.error("Firestore ürün ekleme hatası:", err);
      }
    }

    const current = await this.getMenuItems();
    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(updated));
    return updated;
  },

  // Ürün sil
  async deleteMenuItem(id) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (err) {
        console.error("Firestore ürün silme hatası:", err);
      }
    }

    const current = await this.getMenuItems();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(updated));
    return updated;
  },

  // Waffle builder seçeneklerini getir
  async getBuilderData() {
    const saved = localStorage.getItem(STORAGE_KEY_BUILDER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return WAFFLE_BUILDER_DATA;
  },

  // Kategorileri getir
  async getCategories() {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  },

  // Menüyü varsayılana sıfırla
  async resetToDefaults() {
    localStorage.removeItem('waffloqmenu_items');
    localStorage.removeItem('waffloqmenu_items_v2');
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    localStorage.setItem(STORAGE_KEY_BUILDER, JSON.stringify(WAFFLE_BUILDER_DATA));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_MENU_ITEMS;
  }
};
