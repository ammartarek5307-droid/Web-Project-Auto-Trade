'use strict';

// ============================================
// I18N DICTIONARY
// ============================================
const translations = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.browse': 'Browse Cars',
    'nav.favorites': 'Favorites',
    'nav.sell': 'Sell My Car',
    'nav.admin': 'Admin',
    'nav.login': 'Log In',
    'nav.logout': 'Logout',
    'nav.inbox': 'Inbox',
    'nav.settings': '⚙ Settings',
    
    // Auth Gate
    'auth.title.login': 'Welcome Back',
    'auth.subtitle.login': 'Sign in to access the marketplace',
    'auth.title.signup': 'Create Account',
    'auth.subtitle.signup': 'Join AutoTrade today',
    'auth.btn.login': 'Log In',
    'auth.btn.signup': 'Create Account',
    'auth.switch.signup': "Don't have an account?",
    'auth.switch.login': 'Already have an account?',
    'auth.btn.guest': 'Continue as Guest',
    'auth.label.username': 'Username',
    'auth.label.password': 'Password',
    'auth.label.phone': 'Phone Number',
    'auth.label.confirm': 'Confirm Password',
    
    // Hero
    'hero.badge': 'Egypt\'s Premium Auto Marketplace',
    'hero.title.part1': 'Find Your Perfect',
    'hero.title.part2': 'Drive',
    'hero.subtitle': 'Discover thousands of cars from trusted sellers across Egypt. Seamless, secure, and built for you.',
    'hero.btn.browse': 'Browse Cars',
    'hero.btn.sell': 'Post an Ad',
    'hero.stat.listings': 'Active Listings',
    'hero.stat.sellers': 'Verified Sellers',
    'hero.stat.users': 'Happy Users',
    
    // Categories section
    'cat.section.label': 'Categories',
    'cat.section.title': 'Browse by Body Style',
    'cat.suv.title': 'SUV',
    'cat.suv.desc': 'Spacious and powerful',
    'cat.sedan.title': 'Sedan',
    'cat.sedan.desc': 'Comfort and efficiency',
    'cat.hatch.title': 'Hatchback',
    'cat.hatch.desc': 'Compact and agile',
    
    // Featured cars
    'feat.section.label': 'Featured',
    'feat.section.title': 'Premium Selection',
    'feat.btn.viewall': 'View All Inventory',
    
    // Features section
    'features.card1.title': 'Trusted Sellers',
    'features.card1.desc': 'Every seller on AutoTrade is verified for a secure and trustworthy car buying experience.',
    'features.card2.title': 'Advanced Search',
    'features.card2.desc': 'Find exactly what you want with our powerful filters for price, make, year, and more.',
    'features.card3.title': 'Direct Messaging',
    'features.card3.desc': 'Communicate directly with buyers and sellers in real-time through our integrated messaging system.',
    
    // Car details
    'car.price': 'EGP',
    'car.mileage': 'km',
    'car.specs.make': 'Make',
    'car.specs.model': 'Model',
    'car.specs.year': 'Year',
    'car.specs.mileage': 'Mileage',
    'car.specs.transmission': 'Transmission',
    'car.specs.fuel': 'Fuel Type',
    'car.specs.color': 'Color',
    'car.specs.engine': 'Engine',
    'car.specs.city': 'City',
    'car.specs.condition': 'Condition',
    'car.seller.notes': 'Seller\'s Notes',
    'car.btn.message': 'Message Seller',
    'car.btn.bid': 'Place a Bid',
    'car.btn.report': 'Report Ad',
    
    // Browse page
    'browse.title': 'All Cars',
    'browse.subtitle': 'Browse all inventory',
    'browse.filter.all': 'All Cars',
    'browse.filter.suv': 'SUV',
    'browse.filter.sedan': 'Sedan',
    'browse.filter.hatch': 'Hatchback',
    'browse.btn.filters': 'Filters',
    'browse.sort.label': 'Sort by',
    'browse.sort.default': 'Default',
    'browse.sort.price_asc': 'Price: Low to High',
    'browse.sort.price_desc': 'Price: High to Low',
    'browse.sort.year_desc': 'Year: Newest First',
    'browse.sort.year_asc': 'Year: Oldest First',
    
    // Footer
    'footer.rights': '© 2026 AutoTrade. All rights reserved.',
    'footer.desc': 'The most trusted premium automotive marketplace in Egypt. Find your dream car today.',
    
    // Messages
    'msg.title': 'Messages',
    'msg.subtitle': 'Your conversations with buyers and sellers',
    
    // Settings Sidebar
    'settings.title': 'Settings',
    'settings.theme': 'Dark Mode',
    'settings.lang': 'اللغة العربية',
    'settings.account': 'Account',
    'settings.guest': 'Guest',
    'settings.btn.logout': 'Logout',
    'settings.btn.login': 'Log In',
    
    // General
    'general.loading': 'Loading...',
    'general.empty': 'No results found.',
    'general.guest_restricted': 'Requires an account',
    'general.guest_toast': 'You must log in to perform this action.',
  },
  ar: {
    // Nav
    'nav.home': 'الرئيسية',
    'nav.browse': 'تصفح السيارات',
    'nav.favorites': 'المفضلة',
    'nav.sell': 'بيع سيارتي',
    'nav.admin': 'الإدارة',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.inbox': 'الرسائل',
    'nav.settings': '⚙ الإعدادات',
    
    // Auth Gate
    'auth.title.login': 'مرحباً بعودتك',
    'auth.subtitle.login': 'سجل دخولك للوصول إلى السوق',
    'auth.title.signup': 'إنشاء حساب',
    'auth.subtitle.signup': 'انضم إلى أوتوتريد اليوم',
    'auth.btn.login': 'تسجيل الدخول',
    'auth.btn.signup': 'إنشاء حساب',
    'auth.switch.signup': 'ليس لديك حساب؟',
    'auth.switch.login': 'لديك حساب بالفعل؟',
    'auth.btn.guest': 'الاستمرار كزائر',
    'auth.label.username': 'اسم المستخدم',
    'auth.label.password': 'كلمة المرور',
    'auth.label.phone': 'رقم الهاتف',
    'auth.label.confirm': 'تأكيد كلمة المرور',
    
    // Hero
    'hero.badge': 'سوق السيارات الأول في مصر',
    'hero.title.part1': 'ابحث عن سيارتك',
    'hero.title.part2': 'المثالية',
    'hero.subtitle': 'اكتشف آلاف السيارات من بائعين موثوقين في جميع أنحاء مصر. سلس، آمن، ومصمم خصيصاً لك.',
    'hero.btn.browse': 'تصفح السيارات',
    'hero.btn.sell': 'انشر إعلاناً',
    'hero.stat.listings': 'إعلان نشط',
    'hero.stat.sellers': 'بائع موثوق',
    'hero.stat.users': 'مستخدم سعيد',
    
    // Categories section
    'cat.section.label': 'الفئات',
    'cat.section.title': 'تصفح حسب الشكل',
    'cat.suv.title': 'دفع رباعي',
    'cat.suv.desc': 'واسعة وقوية',
    'cat.sedan.title': 'سيدان',
    'cat.sedan.desc': 'الراحة والكفاءة',
    'cat.hatch.title': 'هاتشباك',
    'cat.hatch.desc': 'صغيرة ورشيقة',
    
    // Featured cars
    'feat.section.label': 'مميز',
    'feat.section.title': 'تشكيلة مميزة',
    'feat.btn.viewall': 'عرض كل السيارات',
    
    // Features section
    'features.card1.title': 'بائعون موثوقون',
    'features.card1.desc': 'يتم التحقق من كل بائع على أوتوتريد لتجربة شراء آمنة وموثوقة.',
    'features.card2.title': 'بحث متقدم',
    'features.card2.desc': 'ابحث عما تريده بالضبط من خلال فلاتر السعر والماركة والسنة والمزيد.',
    'features.card3.title': 'مراسلة مباشرة',
    'features.card3.desc': 'تواصل مباشرة مع المشترين والبائعين في الوقت الفعلي من خلال نظام المراسلة.',
    
    // Car details
    'car.price': 'ج.م',
    'car.mileage': 'كم',
    'car.specs.make': 'الماركة',
    'car.specs.model': 'الموديل',
    'car.specs.year': 'السنة',
    'car.specs.mileage': 'الممشى',
    'car.specs.transmission': 'ناقل الحركة',
    'car.specs.fuel': 'نوع الوقود',
    'car.specs.color': 'اللون',
    'car.specs.engine': 'المحرك',
    'car.specs.city': 'المدينة',
    'car.specs.condition': 'الحالة',
    'car.seller.notes': 'ملاحظات البائع',
    'car.btn.message': 'مراسلة البائع',
    'car.btn.bid': 'أضف مزايدة',
    'car.btn.report': 'الإبلاغ عن الإعلان',
    
    // Browse page
    'browse.title': 'جميع السيارات',
    'browse.subtitle': 'تصفح جميع السيارات المتوفرة',
    'browse.filter.all': 'كل السيارات',
    'browse.filter.suv': 'دفع رباعي',
    'browse.filter.sedan': 'سيدان',
    'browse.filter.hatch': 'هاتشباك',
    'browse.btn.filters': 'تصفية',
    'browse.sort.label': 'ترتيب حسب',
    'browse.sort.default': 'الافتراضي',
    'browse.sort.price_asc': 'السعر: الأقل إلى الأعلى',
    'browse.sort.price_desc': 'السعر: الأعلى إلى الأقل',
    'browse.sort.year_desc': 'السنة: الأحدث أولاً',
    'browse.sort.year_asc': 'السنة: الأقدم أولاً',
    
    // Footer
    'footer.rights': '© 2026 أوتوتريد. جميع الحقوق محفوظة.',
    'footer.desc': 'السوق الأول والأكثر موثوقية للسيارات في مصر. اعثر على سيارة أحلامك اليوم.',
    
    // Messages
    'msg.title': 'الرسائل',
    'msg.subtitle': 'محادثاتك مع المشترين والبائعين',
    
    // Settings Sidebar
    'settings.title': 'الإعدادات',
    'settings.theme': 'الوضع الداكن',
    'settings.lang': 'English',
    'settings.account': 'الحساب',
    'settings.guest': 'زائر',
    'settings.btn.logout': 'تسجيل الخروج',
    'settings.btn.login': 'تسجيل الدخول',
    
    // General
    'general.loading': 'جاري التحميل...',
    'general.empty': 'لا توجد نتائج.',
    'general.guest_restricted': 'يتطلب وجود حساب',
    'general.guest_toast': 'يجب عليك تسجيل الدخول أولاً.',
  }
};

// ============================================
// I18N SYSTEM
// ============================================

function getCurrentLang() {
  return localStorage.getItem('at_lang') || 'en';
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ar') lang = 'en';
  localStorage.setItem('at_lang', lang);
  
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  
  applyTranslations();
  updateLanguageToggleUI();
}

function toggleLanguage() {
  const current = getCurrentLang();
  setLanguage(current === 'en' ? 'ar' : 'en');
}

function applyTranslations() {
  const lang = getCurrentLang();
  const dict = translations[lang];
  if (!dict) return;

  // Translate elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      // Don't overwrite icon HTML if we're just updating text
      if (el.tagName.toLowerCase() === 'button' && el.querySelector('svg')) {
        const span = el.querySelector('span:not(.nav-badge)');
        if (span) span.textContent = dict[key];
        else {
          // If no span, carefully replace text node
          for (let i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
              el.childNodes[i].textContent = ' ' + dict[key];
            }
          }
        }
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Translate placeholders with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
  
  // Custom translation function if needed by other components
  if (typeof window.onLanguageChange === 'function') {
    window.onLanguageChange(lang, dict);
  }
}

// Get single translation string
function t(key) {
  const lang = getCurrentLang();
  return translations[lang][key] || key;
}

// ============================================
// LANGUAGE TOGGLE UI
// ============================================
function injectLanguageToggle() {
  const existing = document.getElementById('floating-lang-toggle');
  if (existing) return;

  const btn = document.createElement('button');
  btn.id = 'floating-lang-toggle';
  btn.className = 'floating-lang-toggle';
  btn.addEventListener('click', toggleLanguage);
  
  document.body.appendChild(btn);
  updateLanguageToggleUI();
}

function updateLanguageToggleUI() {
  const btn = document.getElementById('floating-lang-toggle');
  if (!btn) return;
  
  const lang = getCurrentLang();
  if (lang === 'en') {
    btn.textContent = 'عربي';
    btn.setAttribute('aria-label', 'Switch to Arabic');
  } else {
    btn.textContent = 'EN';
    btn.setAttribute('aria-label', 'Switch to English');
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language on load
  const savedLang = getCurrentLang();
  if (savedLang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }
  
  injectLanguageToggle();
  // We need to wait for rendering to finish before applying
  setTimeout(applyTranslations, 50);
});
