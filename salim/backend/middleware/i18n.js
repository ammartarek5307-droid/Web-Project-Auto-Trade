const translations = {
  en: {
    'Server Error': 'Server Error',
    'Resource not found': 'Resource not found',
    'Duplicate field value entered': 'Duplicate field value entered',
    'Not authorized to access this route': 'Not authorized to access this route',
    'Invalid token': 'Invalid token',
  },
  ar: {
    'Server Error': 'خطأ في الخادم',
    'Resource not found': 'المورد غير موجود',
    'Duplicate field value entered': 'تم إدخال قيمة حقل مكررة',
    'Not authorized to access this route': 'غير مصرح للوصول إلى هذا المسار',
    'Invalid token': 'رمز غير صالح',
  }
};

const i18n = (req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('ar') ? 'ar' : 'en';
  
  req.t = (key) => {
    return translations[lang][key] || key;
  };
  
  next();
};

module.exports = i18n;
