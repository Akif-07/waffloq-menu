export const DEFAULT_CATEGORIES = [
  { id: 'waffles', name: '🧇 Waffle Çeşitleri', icon: 'Sparkles', description: 'Taptaze ve lezzetli özel waffle çeşitlerimiz' },
  { id: 'drinks', name: '🥤 İçecekler', icon: 'CupSoda', description: 'Serinletici meşrubat, soda ve su çeşitleri' }
];

export const WAFFLE_BUILDER_DATA = {
  bases: [],
  chocolates: [],
  fruits: [],
  toppings: [],
  sauces: [],
  iceCreams: []
};

export const DEFAULT_MENU_ITEMS = [
  // WAFFLE ÇEŞİTLERİ
  {
    id: 'waffloq-1',
    categoryId: 'waffles',
    name: 'Wafflloq Special',
    price: 459,
    description: 'Çikolata sos, muz, çilek, fındık, Antep fıstığı parçacıkları.',
    image: 'https://yemeksepeti.dhmedia.io/image/vso-so-backend/YS_TR/HTV565/attachment__1787569339222483160.jpg?width=600&height=600',
    available: true
  },
  {
    id: 'waffloq-2',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Waffle',
    price: 479,
    description: 'Özel bal peteği dokulu çıtır waffle hamuru, muz, çilek, yaban mersini.',
    image: 'https://yemeksepeti.dhmedia.io/image/vso-so-backend/YS_TR/HTV565/attachment__1787569290284395285.jpg?width=600&height=600',
    available: true
  },
  {
    id: 'waffloq-3',
    categoryId: 'waffles',
    name: 'Waffloq Klasik Waffle',
    price: 419,
    description: 'Waffloq Classic, taze çilek ve muz dilimlerinin sütlü çikolata ve beyaz çikolata ile birleştirildiği lezzetli bir kombinasyondur. Üzerine sütlü pirinç patlağı eklenerek servis edilir.',
    image: 'https://yemeksepeti.dhmedia.io/image/vso-so-backend/YS_TR/HTV565/attachment__1787569279438529235.jpg?width=600&height=600',
    available: true
  },
  {
    id: 'waffloq-4',
    categoryId: 'waffles',
    name: 'Wafflloq Frambuaz',
    price: 429,
    description: 'Çıtır waffle üzerine frambuaz sosu muz dilimi taze çilek sütlü çikolata ve beyaz çikolata ile hazırlanmış lezzetli bir tatlı.',
    image: 'https://yemeksepeti.dhmedia.io/image/vso-so-backend/YS_TR/HTV565/attachment__1787569316914415068.jpg?width=600&height=600',
    available: true
  },
  {
    id: 'waffloq-5',
    categoryId: 'waffles',
    name: 'Oreo Cup Waffle',
    price: 349,
    description: 'Oreo parçacıkları, muz, çilek, sütlü çikolata, beyaz çikolata.',
    image: 'https://yemeksepeti.dhmedia.io/image/global-menu-service/YS_TR/vendor/kb6p/product/5a0cddbf-3816-4953-9d6f-ee499b6090ec.jpg?width=600&height=600',
    available: true
  },
  {
    id: 'waffloq-6',
    categoryId: 'waffles',
    name: 'Waffloq Bowl',
    price: 379,
    description: 'Belçika waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&q=80',
    available: true
  },
  {
    id: 'waffloq-7',
    categoryId: 'waffles',
    name: 'Oreo Bowl Waffle',
    price: 389,
    description: 'Belçika waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek, Oreo parçacıkları.',
    image: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&q=80',
    available: true
  },
  {
    id: 'waffloq-8',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Bowl',
    price: 399,
    description: 'Özel bubble waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    available: true
  },
  {
    id: 'waffloq-9',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Cup',
    price: 349,
    description: 'Özel bubble waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://images.unsplash.com/photo-1504113888839-145c2907b3b0?w=600&q=80',
    available: true
  },

  // İÇECEKLER
  {
    id: 'drk-1',
    categoryId: 'drinks',
    name: 'Coca-Cola (330 ml)',
    price: 70,
    description: 'Kutu soğuk meşrubat (330 ml).',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    available: true
  },
  {
    id: 'drk-2',
    categoryId: 'drinks',
    name: 'Coca-Cola Zero (330 ml)',
    price: 70,
    description: 'Şekersiz kutu soğuk meşrubat (330 ml).',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
    available: true
  },
  {
    id: 'drk-3',
    categoryId: 'drinks',
    name: 'Fanta (330 ml)',
    price: 70,
    description: 'Portakal aromalı kutu gazlı içecek (330 ml).',
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&q=80',
    available: true
  },
  {
    id: 'drk-4',
    categoryId: 'drinks',
    name: 'Sprite (330 ml)',
    price: 70,
    description: 'Limon aromalı ferahlatıcı kutu gazlı içecek (330 ml).',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80',
    available: true
  },
  {
    id: 'drk-5',
    categoryId: 'drinks',
    name: 'Fuse Tea Şeftali (330 ml)',
    price: 70,
    description: 'Şeftali aromalı soğuk çay (330 ml).',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    available: true
  },
  {
    id: 'drk-6',
    categoryId: 'drinks',
    name: 'Fuse Tea Mango (330 ml)',
    price: 70,
    description: 'Mango & papatya aromalı soğuk çay (330 ml).',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80',
    available: true
  },
  {
    id: 'drk-7',
    categoryId: 'drinks',
    name: 'Sade Soda (200 ml)',
    price: 40,
    description: 'Cam şişe doğal zengin mineralli maden suyu (200 ml).',
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&q=80',
    available: true
  },
  {
    id: 'drk-8',
    categoryId: 'drinks',
    name: 'Limonlu Soda (200 ml)',
    price: 45,
    description: 'Cam şişe limon aromalı ferahlatıcı maden suyu (200 ml).',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80',
    available: true
  },
  {
    id: 'drk-9',
    categoryId: 'drinks',
    name: 'Elmalı Soda (200 ml)',
    price: 45,
    description: 'Cam şişe elma aromalı ferahlatıcı maden suyu (200 ml).',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80',
    available: true
  },
  {
    id: 'drk-10',
    categoryId: 'drinks',
    name: 'Su (500 ml)',
    price: 25,
    description: 'Şişe doğal kaynak suyu (500 ml).',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80',
    available: true
  }
];

export const SHOP_INFO = {
  name: 'WAFFLOQ',
  tagline: 'WAFFLE & TOASTERY',
  logo: '/logo.png',
  address: 'Waffloq Şubesi',
  phone: '0 (555) 000 00 00',
  wifiName: 'Waffloq_Guest',
  wifiPass: 'waffloq1234',
  openingHours: '10:00 - 01:00 (Hergün Açık)',
  instagram: '@waffloq'
};
