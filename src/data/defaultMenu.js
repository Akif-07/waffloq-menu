export const DEFAULT_CATEGORIES = [
  { id: 'waffles', name: '🧇 Waffle & Bowl', description: 'Taptaze çıtır hamur, zengin Belçika çikolatası ve taze meyveler' },
  { id: 'menus', name: '🍽️ Avantajlı Menüler', description: 'Waffle ve soğuk içecek menüleri' },
  { id: 'drinks', name: '🥤 İçecekler', description: 'Kutu meşrubat, doğal maden suyu ve soğuk çaylar' },
  { id: 'extras', name: '🍓 Ekstra Meyveler', description: 'Taze porsiyon meyve seçenekleri' }
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
  // 1. Waffloq Classic
  {
    id: 'waffloq-classic',
    categoryId: 'waffles',
    name: 'Waffloq Classic',
    price: 419,
    description: 'Belçika waffle hamuru, sütlü çikolata, beyaz çikolata, taze muz, çilek, fındık kırığı ve pirinç patlağı.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820789_1786987375283.jpg',
    available: true
  },
  // 2. Wafflloq Frambuaz
  {
    id: 'waffloq-frambuaz',
    categoryId: 'waffles',
    name: 'Wafflloq Frambuaz',
    price: 429,
    description: 'Çıtır waffle üzerine frambuaz sosu, muz dilimleri, taze çilek, sütlü çikolata ve beyaz çikolata.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820796_1786988142688.jpg',
    available: false
  },
  // 3. Wafflloq Special
  {
    id: 'waffloq-special',
    categoryId: 'waffles',
    name: 'Wafflloq Special',
    price: 459,
    description: 'Sütlü çikolata, beyaz çikolata, muz, çilek, fındık ve Antep fıstığı parçacıkları.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820791_1787062519420.jpg',
    available: true
  },
  // 4. Wafflloq Bowl
  {
    id: 'waffloq-bowl',
    categoryId: 'waffles',
    name: 'Wafflloq Bowl',
    price: 379,
    description: 'Belçika waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820792_1786987435529.jpg',
    available: true
  },
  // 5. Oreo Bowl Waffle
  {
    id: 'oreo-bowl-waffle',
    categoryId: 'waffles',
    name: 'Oreo Bowl Waffle',
    price: 389,
    description: 'Belçika waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek, Oreo parçacıkları.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820793_1786987747624.jpg',
    available: true
  },
  // 6. Special Bowl
  {
    id: 'special-bowl',
    categoryId: 'waffles',
    name: 'Special Bowl',
    price: 429,
    description: 'Özel kasede Belçika waffle hamuru, bol çikolata, muz, çilek, Antep fıstığı ve fındık parçaları.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820794_1787741165546.jpg',
    available: true
  },
  // 7. Cup Waffle
  {
    id: 'cup-waffle',
    categoryId: 'waffles',
    name: 'Cup Waffle',
    price: 349,
    description: 'Bardakta enfes Belçika waffle parçaları, sütlü çikolata, muz, çilek ve fındık.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820795_1786987492610.jpg',
    available: true
  },
  // 8. Frambuaz Cup
  {
    id: 'frambuaz-cup',
    categoryId: 'waffles',
    name: 'Frambuaz Cup',
    price: 359,
    description: 'Bardakta taze frambuaz sosu, muz, çilek, sütlü ve beyaz çikolata ile hazırlanan cup waffle.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820796_1786988142688.jpg',
    available: false
  },
  // 9. Special Cup
  {
    id: 'special-cup',
    categoryId: 'waffles',
    name: 'Special Cup',
    price: 369,
    description: 'Bardakta özel Antep fıstığı, fındık, çikolata, muz ve çilekli lezzet şöleni.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820797_1787740408480.jpg',
    available: true
  },
  // 10. Oreo Cup
  {
    id: 'oreo-cup',
    categoryId: 'waffles',
    name: 'Oreo Cup',
    price: 349,
    description: 'Bardakta Oreo parçacıkları, muz, çilek, sütlü çikolata ve beyaz çikolata.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820798_1786988777296.jpg',
    available: true
  },
  // 11. Mixer Waffle
  {
    id: 'mixer-waffle',
    categoryId: 'waffles',
    name: 'Mixer Waffle',
    price: 429,
    description: 'Özel meyve, çikolata ve süsleme kombinasyonlarıyla hazırlanan mikser waffle.',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&q=80',
    available: false
  },
  // 12. Waffloq Bubble Waffle
  {
    id: 'waffloq-bubble-waffle',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Waffle',
    price: 479,
    description: 'Özel bal peteği dokulu çıtır bubble waffle hamuru, muz, çilek, sütlü çikolata, fındık.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20927947_1787070876884.jpg',
    available: true
  },
  // 13. Waffloq Bubble Bowl
  {
    id: 'waffloq-bubble-bowl',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Bowl',
    price: 399,
    description: 'Özel bubble waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20930809_1787094409171.jpg',
    available: true
  },
  // 14. Waffloq Bubble Cup
  {
    id: 'waffloq-bubble-cup',
    categoryId: 'waffles',
    name: 'Waffloq Bubble Cup',
    price: 349,
    description: 'Özel bubble waffle hamuru, sütlü çikolata, beyaz çikolata, fındık kırığı, muz, çilek.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20930907_1787094967089.jpg',
    available: true
  },
  // 15. Waffloq Classic Menü
  {
    id: 'waffloq-classic-menu',
    categoryId: 'menus',
    name: 'Waffloq Classic Menü',
    price: 479,
    description: 'Waffloq Classic + Seçeceğiniz Soğuk Kutu İçecek avantajlı menü.',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20899628_1787740411109.jpg',
    available: true
  },
  // 16. Coca Cola (33 cl)
  {
    id: 'coca-cola-33cl',
    categoryId: 'drinks',
    name: 'Coca Cola (33 cl)',
    price: 70,
    description: 'Kutu soğuk meşrubat (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820800_1786970263831.png',
    available: true
  },
  // 17. Coca Cola Zero (33 cl)
  {
    id: 'coca-cola-zero-33cl',
    categoryId: 'drinks',
    name: 'Coca Cola Zero (33 cl)',
    price: 70,
    description: 'Şekersiz kutu soğuk meşrubat (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820801_1786970248100.jpg',
    available: true
  },
  // 18. Fanta (330 ml)
  {
    id: 'fanta-330ml',
    categoryId: 'drinks',
    name: 'Fanta (330 ml)',
    price: 70,
    description: 'Portakal aromalı kutu gazlı içecek (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/21040194_1787600962352.png',
    available: true
  },
  // 19. Sprite (330 ml)
  {
    id: 'sprite-330ml',
    categoryId: 'drinks',
    name: 'Sprite (330 ml)',
    price: 70,
    description: 'Limon aromalı ferahlatıcı kutu gazlı içecek (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/21040216_1787601104022.jpg',
    available: true
  },
  // 20. Fuse Tea Şeftali (33 cl)
  {
    id: 'fusetea-seftali-33cl',
    categoryId: 'drinks',
    name: 'Fuse Tea Şeftali (33 cl)',
    price: 70,
    description: 'Şeftali aromalı soğuk çay (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20899363_1786970226218.jpg',
    available: true
  },
  // 21. Fuse Tea Mango (33 cl)
  {
    id: 'fusetea-mango-33cl',
    categoryId: 'drinks',
    name: 'Fuse Tea Mango (33 cl)',
    price: 70,
    description: 'Mango aromalı ferahlatıcı soğuk çay (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20899371_1786970241165.png',
    available: true
  },
  // 22. Sade Soda
  {
    id: 'sade-soda',
    categoryId: 'drinks',
    name: 'Sade Soda',
    price: 40,
    description: 'Cam şişe doğal mineralli maden suyu (200 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20820802_1786970210111.png',
    available: true
  },
  // 23. Limonlu Soda
  {
    id: 'limonlu-soda',
    categoryId: 'drinks',
    name: 'Limonlu Soda',
    price: 45,
    description: 'Cam şişe ferahlatıcı limon aromalı maden suyu (200 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/21039887_1787598328426.jpg',
    available: true
  },
  // 24. Elmalı Soda
  {
    id: 'elmali-soda',
    categoryId: 'drinks',
    name: 'Elmalı Soda',
    price: 45,
    description: 'Cam şişe elma aromalı ferahlatıcı maden suyu (200 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/21040169_1787600670555.jpg',
    available: true
  },
  // 25. Uludağ Limonata (33 cl)
  {
    id: 'uludag-limonata-33cl',
    categoryId: 'drinks',
    name: 'Uludağ Limonata (33 cl)',
    price: 65,
    description: 'Ferahlatıcı kutu limonata (330 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20899347_1786970229666.jpg',
    available: false
  },
  // 26. Su
  {
    id: 'su',
    categoryId: 'drinks',
    name: 'Su',
    price: 25,
    description: 'Şişe doğal kaynak suyu (500 ml).',
    image: 'https://cdn.tgoapps.com/tgo2/spm/prod/meal/media/images/product/473555/20899375_1786970240982.jpg',
    available: true
  },
  // 27. Muz
  {
    id: 'extra-muz',
    categoryId: 'extras',
    name: 'Muz (Porsiyon)',
    price: 40,
    description: 'Taze dilimlenmiş muz porsiyonu.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
    available: true
  },
  // 28. Çilek
  {
    id: 'extra-cilek',
    categoryId: 'extras',
    name: 'Çilek (Porsiyon)',
    price: 50,
    description: 'Taze doğranmış çilek porsiyonu.',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80',
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
