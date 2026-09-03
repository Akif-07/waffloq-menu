# 🧇 WaffloQMenu - Modern Waffle QR Menü & Yönetim Sistemi

Waffle dükkanları için özel olarak geliştirilmiş, mobil öncelikli (mobile-first), interaktif Waffle Tasarlayıcı (Waffle Builder) ve Masa QR Kod oluşturucu içeren modern QR Menü web uygulaması.

Firebase Spark (Ücretsiz) planı ile tam uyumludur.

---

## 🌟 Öne Çıkan Özellikler

- 🧇 **İnteraktif Waffle Atölyesi (Builder):** Müşteriler hamur (Klasik, Kakaolu, Bubble), sürülebilir çikolata (Nutella, Lotus, Dubai Fıstığı vb.), taze meyveler, çıtırlar ve sosları adım adım seçerek kendi waffle tabağını oluşturabilir ve dinamik fiyatı görebilir.
- 📱 **Mobil Öncelikli & Ultra Hızlı:** QR kodu okutulduğunda anında açılan, akıcı ve şık tema.
- 🏷️ **Masa Numarası Tanıma:** `?masa=4` veya `?table=12` parametresi ile açıldığında otomatik masa tespiti.
- 🖨️ **Masa QR Kod & Stand Oluşturucu:** Dükkandaki tüm masalar için yüksek çözünürlüklü, yazdırılabilir masa standı QR kodları üretme.
- ⚙️ **Dükkan Yönetim Paneli (Admin):** Fiyatları anlık güncelleme, stokta biten ürünleri tek tıkla "Tükendi" yapma, yeni ürün ekleme.
- 📶 **Müşteri Wi-Fi Paylaşımı:** Tek tıkla Wi-Fi şifresi kopyalama.
- 🔥 **Firebase Cloud Firestore & LocalStorage Desteği:** Firebase bağlıyken buluttan, bağlı değilken yerel depolamadan sıfır kesintiyle çalışma.

---

## 🚀 Hızlı Başlangıç (Yerel Geliştirme)

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. Tarayıcınızda açın:
   - Ana Menü: `http://localhost:3000`
   - Masa 5 QR Deneyimi: `http://localhost:3000/?masa=5`

---

## 🔥 Firebase Kurulumu (Spark / Ücretsiz Plan)

### 1. Firebase Projesi Oluşturma
1. [Firebase Console](https://console.firebase.google.com/)'a gidin ve **waffloqmenu** adında bir proje oluşturun.
2. Spark (No-Cost) planında kaldığınızdan emin olun.

### 2. Firestore Veritabanını Açma
1. Firebase Console sol menüsünden **Firestore Database** sekmesine tıklayın.
2. **Create database** butonuna basın ve başlangıç için *Test Mode* seçeneğiyle aktifleştirin.

### 3. Yapılandırma Bilgilerini Ekleme
Firebase Console > Proje Ayarları > Web Uygulaması Ekle (`</>`) adımıyla verilen konfigürasyon bilgilerini `.env` dosyasına kaydedin:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=waffloqmenu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=waffloqmenu
VITE_FIREBASE_STORAGE_BUCKET=waffloqmenu.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Firebase Hosting ile Canlıya Alma

1. Firebase CLI'ı yükleyin (yüklü değilse):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Projeyi derleyin ve yayınlayın:
   ```bash
   npm run build
   firebase deploy
   ```

Artık `https://waffloqmenu.web.app` adresinden QR menünüz tüm müşterilerinize anında hizmet vermeye hazırdır!
