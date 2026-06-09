'use strict';

// ============================================
// I18N DICTIONARY
// ============================================
const translations = {
  en: {
    'page.title': 'AutoTrade | Find Your Dream Car',
    
    // Nav
    'nav.home': 'Home',
    'nav.browse': 'Browse Cars',
    'nav.favorites': 'Favorites',
    'nav.sell': 'Sell My Car',
    'nav.admin': 'Admin',
    'nav.login': 'Log In',
    'nav.logout': 'Logout',
    'nav.inbox': 'Inbox',
    'nav.mylistings': 'My Listings',
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
    'auth.btn.showpass': 'Show',
    'auth.btn.hidepass': 'Hide',
    
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
    'cat.section.subtitle': 'Find exactly what you are looking for',
    
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
    'features.card4.title': 'Save Favorites',
    'features.card4.desc': 'Save the cars you like and return to them anytime.',
    'features.section.label': 'Why AutoTrade',
    'features.section.title': 'Built for serious car buyers',
    
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
    'browse.page.title': 'Browse Cars | AutoTrade',
    'browse.title': 'All Cars',
    'browse.subtitle': 'Browse all inventory',
    'browse.search.title': 'Refine Search',
    'browse.search.label': 'Search',
    'browse.search.ph': 'Make, model, keyword...',
    'browse.price.label': 'Price Range',
    'browse.price.min': 'Min',
    'browse.price.max': 'Max',
    'browse.price.apply': 'Apply',
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
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    
    // Messages
    'msg.page.title': 'Messages | AutoTrade',
    'msg.title': 'Messages',
    'msg.subtitle': 'Your conversations with buyers and sellers',
    'msg.empty.convo': 'Start a conversation with the seller',
    'msg.ph.type': 'Type a message...',
    'msg.read': 'Read',
    'msg.empty.title': 'No conversations yet',
    'msg.empty.desc': 'When you message a seller, your conversations will appear here.',
    'msg.ph.search': 'Search conversations...',
    'msg.select.convo': 'Select a conversation to view messages',
    'msg.loading': 'Loading messages...',
    'msg.error': 'Error loading messages',
    'msg.empty.chat': 'No messages yet. Start the conversation!',
    'msg.just_now': 'Just now',
    'msg.err.not_found': 'Listing not found.',
    'msg.err.no_seller': 'Unable to contact seller — seller information is missing.',
    'msg.err.self': 'You cannot message yourself.',
    'msg.about': 'About',
    'msg.err.send_failed': 'Failed to send message.',
    'msg.time.mins': 'm ago',
    'msg.time.hours': 'h ago',
    
    // Favorites
    'fav.page.title': 'My Favorites | AutoTrade',
    'fav.title': 'My Favorites',
    'fav.empty.title': 'No favorite cars yet',
    'fav.empty.desc': 'Save the cars you like by clicking the heart icon. They will appear here.',
    
    // My Listings
    'mylist.page.title': 'My Listings | AutoTrade',
    'mylist.title': 'My Listings',
    'mylist.empty.title': 'You haven\'t listed any cars yet',
    'mylist.empty.desc': 'List your car to reach thousands of buyers.',
    'mylist.btn.delete': 'Delete Listing',
    'mylist.confirm.delete': 'Are you sure you want to delete this listing?',
    'mylist.toast.success': 'Listing deleted successfully',
    'mylist.toast.error': 'Failed to delete listing',
    'mylist.count': '{0} listed cars',
    'mylist.error': 'Error loading listings',
    
    // Sell Page
    'sell.form.title': 'Listing Details',
    'sell.form.desc': 'Fields marked with * are required.',
    'sell.section.vehicle': 'Vehicle Information',
    'sell.section.location': 'Approximate Location',
    'sell.section.photos': 'Car Photos',
    'sell.section.contact': 'Contact Details',
    'sell.label.year': 'Year of Manufacture',
    'sell.label.mileage': 'Mileage (km)',
    'sell.label.price': 'Asking Price (EGP)',
    'sell.label.map': 'Click on the map to set your car\'s approximate location',
    'sell.label.desc': 'Additional Description (Optional)',
    'sell.label.name': 'Full Name',
    'sell.ph.make': 'e.g. Toyota',
    'sell.ph.model': 'e.g. Corolla',
    'sell.ph.year': 'e.g. 2021',
    'sell.ph.mileage': 'e.g. 45000',
    'sell.ph.price': 'e.g. 450000',
    'sell.ph.color': 'e.g. White, Black, Grey',
    'sell.ph.engine': 'e.g. 1.6L 4-Cylinder',
    'sell.ph.desc': 'e.g. Car is well-maintained, one owner, regular dealership maintenance.',
    'sell.ph.name': 'Full Name',
    'sell.ph.phone': 'e.g. 01012345678',
    'sell.select.category': 'Select Category',
    'sell.select.city': 'Select City',
    'sell.trans.auto': 'Automatic',
    'sell.trans.manual': 'Manual',
    'sell.trans.cvt': 'CVT',
    'sell.fuel.gasoline': 'Gasoline',
    'sell.fuel.diesel': 'Diesel',
    'sell.fuel.electric': 'Electric',
    'sell.fuel.hybrid': 'Hybrid',
    'sell.map.set': 'Location set',
    'sell.map.hint': '🔒 Only a 2 km radius area will be shown to buyers — your exact location stays private.',
    'sell.hint.desc': 'This description appears on the car\'s detail page for buyers.',
    'sell.photo.text': 'Click to upload or drag and drop images',
    'sell.photo.hint': 'JPEG, PNG, WebP, GIF — up to 10MB each — max 8 photos',
    'sell.hint.name': 'Only letters and spaces are allowed.',
    'sell.btn.submit': 'Publish Ad',
    'sell.btn.submitting': 'Submitting...',
    'sell.btn.pending': 'Pending Approval',
    
    // Sell Errors & Toasts
    'sell.err.req_make': 'Please enter the car make.',
    'sell.err.req_model': 'Please enter the car model.',
    'sell.err.req_category': 'Please select a category.',
    'sell.err.req_year': 'Please enter the manufacturing year.',
    'sell.err.year_range': 'Year must be between 1990 and {0}.',
    'sell.err.req_mileage': 'Please enter mileage in km.',
    'sell.err.invalid_mileage': 'Please enter a valid mileage (0 – 1,000,000).',
    'sell.err.req_price': 'Please enter the price in EGP.',
    'sell.err.min_price': 'Price must be at least 10,000 EGP.',
    'sell.err.max_price': 'Price is too high. Please check the value.',
    'sell.err.req_name': 'Please enter your name.',
    'sell.err.name_short': 'Name must be at least 3 characters.',
    'sell.err.name_invalid': 'Full name must contain letters and spaces only.',
    'sell.err.invalid_phone': 'Please enter a valid Egyptian number (e.g. 01012345678).',
    'sell.err.req_photo': 'Please upload at least one photo of your car.',
    'sell.err.max_photos': 'Maximum {0} photos allowed.',
    'sell.err.img_type': '\"${0}\" is not a valid image. Only JPEG, PNG, WebP, and GIF are accepted.',
    'sell.err.img_size': '\"${0}\" exceeds 10MB limit.',
    'sell.err.img_only': 'Only image files (JPEG, PNG, WebP, GIF) are accepted.',
    'sell.err.fix_errors': 'Please fix the errors in the form.',
    'sell.err.submit_failed': 'Failed to submit listing.',
    'sell.err.network': 'Network error — could not submit listing. Please try again.',
    'sell.toast.submitted': 'Your ad has been submitted and is pending admin approval!',
    'sell.confirm.line1': 'Ad submitted successfully!',
    'sell.confirm.line2': 'Your listing is under review. Once approved by an admin, it will appear in the listings.',
    
    // Settings Sidebar
    'details.page.title': 'Car Details | AutoTrade',
    'details.crumb': 'Car Details',
    'car.specs.title': 'Specifications',
    'car.btn.delete': 'Delete My Listing',
    'car.btn.fav_add': 'Add to Favorites',
    'car.btn.fav_remove': 'Remove from Favorites',
    'car.location.title': 'Approximate Location',
    'car.location.privacy': '🔒 Exact location is hidden for the seller\'s privacy. The car is somewhere within the highlighted area.',
    'car.fav.added': 'Added to favorites!',
    'car.fav.removed': 'Removed from favorites',
    
    // Report Modal
    'car.report.title': 'Report Listing',
    'car.report.reason': 'Reason for reporting',
    'car.report.select': 'Select a reason',
    'car.report.reason.price': 'Overpriced',
    'car.report.reason.fake': 'Fake/Incorrect Information',
    'car.report.reason.scam': 'Suspected Scam',
    'car.report.reason.duplicate': 'Duplicate Listing',
    'car.report.reason.other': 'Other',
    'car.report.details': 'Additional Details',
    'car.report.details.ph': 'Please explain the issue (optional)',
    'car.report.submit': 'Submit Report',
    'car.report.error': 'Please select a reason.',
    'car.report.success': 'Report submitted successfully. Thank you.',
    
    // Bidding
    'bid.no_bids': 'No bids yet',
    'bid.highest': 'Highest',
    'bid.history': 'Bid History',
    'bid.place_title': 'Place a Bid',
    'bid.asking_price': 'Asking Price',
    'bid.highest_bid': 'Highest Bid',
    'bid.total_bids': 'Total Bids',
    'bid.login_prompt': 'Log in to place a bid on this vehicle',
    'bid.min_bid': 'Minimum bid:',
    'bid.increment': 'increment',
    'bid.place_btn': 'Place Bid',
    'bid.placing': 'Placing...',
    
    // Browse
    'browse.page.title': 'Browse Cars | AutoTrade',
    'browse.search.title': 'Refine Search',
    'browse.search.label': 'Search',
    'browse.search.ph': 'Make, model, keyword...',
    'browse.price.label': 'Price Range',
    'browse.price.min': 'Min',
    'browse.price.max': 'Max',
    'browse.price.apply': 'Apply',
    'browse.filter.clear': 'Clear All Filters',
    'browse.btn.post': 'Post Your Ad',
    'browse.btn.filters': 'Filters',
    'browse.sort.label': 'Sort by',
    'browse.sort.default': 'Default',
    'browse.sort.price_asc': 'Price: Low to High',
    'browse.sort.price_desc': 'Price: High to Low',
    'browse.sort.year_desc': 'Year: Newest First',
    'browse.sort.year_asc': 'Year: Oldest First',
    'browse.empty.icon': 'No Results',
    'browse.empty.title': 'No cars match your search',
    'browse.empty.desc': 'Try different keywords or clear the search filters.',
    'browse.cars_avail': 'cars available',
    'browse.showing_cars': 'Showing {0} of {1} cars',
    'browse.min': 'Min',
    'browse.max': 'Max',
    'browse.active_filters': '{0} active filter(s)',
    'browse.filtered': 'Filtered:',
    
    // Cards
    'card.private_seller': 'Private Seller',
    'card.photos': 'photos',
    
    // Auth Validations & Toasts
    'auth.ph.username': 'Enter your username',
    'auth.ph.password': 'Enter your password',
    'auth.ph.choose_username': 'Choose a username',
    'auth.ph.phone': 'e.g. +20 101 234 5678',
    'auth.ph.create_pass': 'Create a strong password',
    'auth.ph.confirm': 'Confirm your password',
    'auth.err.network': 'Could not connect to the server. Please try again.',
    'auth.err.pass_length': 'Password must be at least {0} characters.',
    'auth.err.pass_upper': 'Password must contain at least one uppercase letter.',
    'auth.err.pass_number': 'Password must contain at least one number.',
    'auth.err.pass_special': 'Password must contain at least one special character.',
    'auth.err.user_length_min': 'Username must be at least 3 characters.',
    'auth.err.user_length_max': 'Username must be 20 characters or less.',
    'auth.err.user_invalid': 'Username can only contain letters, numbers, and underscores.',
    'auth.err.req_user': 'Please enter your username.',
    'auth.err.req_pass': 'Please enter your password.',
    'auth.err.req_phone': 'Please enter your phone number.',
    'auth.err.invalid_phone': 'Please enter a valid phone number.',
    'auth.err.pass_match': 'Passwords do not match.',
    'auth.toast.welcome_back': 'Welcome back, {0}!',
    'auth.toast.welcome_new': 'Welcome to AutoTrade, {0}!',
    'auth.btn.signing_in': 'Signing in...',
    'auth.btn.creating_account': 'Creating account...',
    'auth.btn.show': 'Show',
    'auth.btn.hide': 'Hide',
    
    // Cities
    'city.cairo': 'Cairo',
    'city.giza': 'Giza',
    'city.alexandria': 'Alexandria',
    'city.newcairo': 'New Cairo',
    'city.6oct': '6th of October',
    'city.mansoura': 'Mansoura',
    'city.tanta': 'Tanta',
    'city.assiut': 'Assiut',
    'city.luxor': 'Luxor',
    'city.aswan': 'Aswan',
    'city.zagazig': 'Zagazig',
    'city.portsaid': 'Port Said',
    'city.suez': 'Suez',
    'city.hurghada': 'Hurghada',
    'city.sharm': 'Sharm El Sheikh',
    
    // Settings Sidebar
    'settings.title': 'Settings',
    'settings.theme': 'Dark Mode',
    'settings.lang': 'اللغة العربية',
    'settings.account': 'Account',
    'settings.guest': 'Guest',
    'settings.not_logged': 'Not Logged In',
    'settings.guest_access': 'Guest Access',
    'settings.role.admin': 'Administrator',
    'settings.role.user': 'User',
    'settings.btn.logout': 'Logout',
    'settings.btn.login': 'Log In',
    'settings.btn.editProfile': 'Edit Profile',
    'settings.edit.title': 'Edit Profile',
    'settings.edit.subtitle': 'Update your account details',
    'settings.edit.pass_optional': 'New Password (Optional)',
    'settings.edit.pass_ph': 'Leave blank to keep current',
    'settings.edit.cancel': 'Cancel',
    'settings.edit.save': 'Save',
    'settings.edit.saving': 'Saving...',
    'settings.toast.logged_out': 'You have been logged out.',
    'settings.toast.no_changes': 'No changes made.',
    'settings.toast.profile_updated': 'Profile updated successfully!',
    'settings.toast.update_failed': 'Failed to update profile.',
    
    // General
    'general.loading': 'Loading...',
    'general.empty': 'No results found.',
    'general.guest_restricted': 'Requires an account',
    'general.guest_toast': 'You must log in to perform this action.',
    'general.view_details': 'View Details',
    'general.network_err': 'A network error occurred.',
    
    // Hero extra
    'hero.stat.satisfaction': 'Satisfaction',
    'hero.subtitle2': 'Enter the details below and your car will be visible to thousands of buyers',
  },
  ar: {
    'page.title': 'أوتوتريد | ابحث عن سيارة أحلامك',
    
    // Nav
    'nav.home': 'الرئيسية',
    'nav.browse': 'تصفح السيارات',
    'nav.favorites': 'المفضلة',
    'nav.sell': 'بيع سيارتي',
    'nav.admin': 'الإدارة',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.inbox': 'الرسائل',
    'nav.mylistings': 'إعلاناتي',
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
    'auth.btn.showpass': 'إظهار',
    'auth.btn.hidepass': 'إخفاء',
    
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
    'cat.section.subtitle': 'ابحث عما تريده بالضبط',
    
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
    'features.card4.title': 'حفظ في المفضلة',
    'features.card4.desc': 'احفظ السيارات التي تعجبك وارجع إليها في أي وقت.',
    'features.section.label': 'لماذا أوتوتريد',
    'features.section.title': 'مصمم لمشتري السيارات الجادين',
    
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
    'browse.page.title': 'تصفح السيارات | أوتوتريد',
    'browse.title': 'جميع السيارات',
    'browse.subtitle': 'تصفح جميع الإعلانات',
    'browse.search.title': 'تضييق نطاق البحث',
    'browse.search.label': 'البحث',
    'browse.search.ph': 'الماركة، الموديل، كلمة مفتاحية...',
    'browse.price.label': 'نطاق السعر',
    'browse.price.min': 'الحد الأدنى',
    'browse.price.max': 'الحد الأقصى',
    'browse.price.apply': 'تطبيق',
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
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    
    // Messages
    'msg.page.title': 'الرسائل | أوتوتريد',
    'msg.title': 'الرسائل',
    'msg.subtitle': 'محادثاتك مع المشترين والبائعين',
    'msg.empty.convo': 'ابدأ محادثة مع البائع',
    'msg.ph.type': 'اكتب رسالة...',
    'msg.read': 'مقروء',
    'msg.empty.title': 'لا توجد محادثات بعد',
    'msg.empty.desc': 'عندما تراسل بائعاً، ستظهر محادثاتك هنا.',
    'msg.ph.search': 'البحث في المحادثات...',
    'msg.select.convo': 'اختر محادثة لعرض الرسائل',
    'msg.loading': 'جاري تحميل الرسائل...',
    'msg.error': 'خطأ في تحميل الرسائل',
    'msg.empty.chat': 'لا توجد رسائل بعد. ابدأ المحادثة!',
    'msg.just_now': 'الآن',
    'msg.err.not_found': 'الإعلان غير موجود.',
    'msg.err.no_seller': 'تعذر الاتصال بالبائع — معلومات البائع مفقودة.',
    'msg.err.self': 'لا يمكنك مراسلة نفسك.',
    'msg.about': 'بخصوص',
    'msg.err.send_failed': 'فشل في إرسال الرسالة.',
    'msg.time.mins': 'دقيقة مضت',
    'msg.time.hours': 'ساعة مضت',
    
    // Favorites
    'fav.page.title': 'مفضلتي | أوتوتريد',
    'fav.title': 'مفضلتي',
    'fav.empty.title': 'لا توجد سيارات مفضلة بعد',
    'fav.empty.desc': 'احفظ السيارات التي تعجبك بالنقر على أيقونة القلب. ستظهر هنا.',
    
    // My Listings
    'mylist.page.title': 'إعلاناتي | أوتوتريد',
    'mylist.title': 'إعلاناتي',
    'mylist.empty.title': 'لم تقم بنشر أي سيارات بعد',
    'mylist.empty.desc': 'انشر سيارتك للوصول إلى آلاف المشترين.',
    'mylist.btn.delete': 'حذف الإعلان',
    'mylist.confirm.delete': 'هل أنت متأكد أنك تريد حذف هذا الإعلان؟',
    'mylist.toast.success': 'تم حذف الإعلان بنجاح',
    'mylist.toast.error': 'فشل في حذف الإعلان',
    'mylist.count': '{0} سيارات مدرجة',
    'mylist.error': 'خطأ في تحميل الإعلانات',
    
    // Sell Page
    'sell.form.title': 'تفاصيل الإعلان',
    'sell.form.desc': 'الحقول المميزة بـ * مطلوبة.',
    'sell.section.vehicle': 'معلومات السيارة',
    'sell.section.location': 'الموقع التقريبي',
    'sell.section.photos': 'صور السيارة',
    'sell.section.contact': 'بيانات الاتصال',
    'sell.label.year': 'سنة الصنع',
    'sell.label.mileage': 'الممشى (كم)',
    'sell.label.price': 'السعر المطلوب (جنيه)',
    'sell.label.map': 'انقر على الخريطة لتحديد الموقع التقريبي لسيارتك',
    'sell.label.desc': 'وصف إضافي (اختياري)',
    'sell.label.name': 'الاسم الكامل',
    'sell.ph.make': 'مثال: تويوتا',
    'sell.ph.model': 'مثال: كورولا',
    'sell.ph.year': 'مثال: 2021',
    'sell.ph.mileage': 'مثال: 45000',
    'sell.ph.price': 'مثال: 450000',
    'sell.ph.color': 'مثال: أبيض، أسود، رمادي',
    'sell.ph.engine': 'مثال: 1.6 لتر 4 سلندر',
    'sell.ph.desc': 'مثال: السيارة بحالة جيدة، مالك أول، صيانة دورية.',
    'sell.ph.name': 'الاسم الكامل',
    'sell.ph.phone': 'مثال: 01012345678',
    'sell.select.category': 'اختر الفئة',
    'sell.select.city': 'اختر المدينة',
    'sell.trans.auto': 'أوتوماتيك',
    'sell.trans.manual': 'يدوي',
    'sell.trans.cvt': 'سي في تي',
    'sell.fuel.gasoline': 'بنزين',
    'sell.fuel.diesel': 'ديزل',
    'sell.fuel.electric': 'كهرباء',
    'sell.fuel.hybrid': 'هجين',
    'sell.map.set': 'تم تحديد الموقع',
    'sell.map.hint': '🔒 سيتم عرض منطقة بقطر 2 كم فقط للمشترين — موقعك الدقيق يبقى خاصاً.',
    'sell.hint.desc': 'يظهر هذا الوصف في صفحة تفاصيل السيارة للمشترين.',
    'sell.photo.text': 'انقر للرفع أو اسحب وأفلت الصور',
    'sell.photo.hint': 'JPEG, PNG, WebP, GIF — حتى 10 ميجابايت لكل صورة — بحد أقصى 8 صور',
    'sell.hint.name': 'يسمح بالأحرف والمسافات فقط.',
    'sell.btn.submit': 'نشر الإعلان',
    'sell.btn.submitting': 'جاري الإرسال...',
    'sell.btn.pending': 'في انتظار الموافقة',
    
    // Sell Errors & Toasts
    'sell.err.req_make': 'يرجى إدخال ماركة السيارة.',
    'sell.err.req_model': 'يرجى إدخال موديل السيارة.',
    'sell.err.req_category': 'يرجى اختيار الفئة.',
    'sell.err.req_year': 'يرجى إدخال سنة الصنع.',
    'sell.err.year_range': 'يجب أن تكون السنة بين 1990 و {0}.',
    'sell.err.req_mileage': 'يرجى إدخال عدد الكيلومترات.',
    'sell.err.invalid_mileage': 'يرجى إدخال مسافة صحيحة (0 – 1,000,000).',
    'sell.err.req_price': 'يرجى إدخال السعر بالجنيه المصري.',
    'sell.err.min_price': 'يجب أن يكون السعر 10,000 جنيه على الأقل.',
    'sell.err.max_price': 'السعر مرتفع جداً. يرجى التحقق من القيمة.',
    'sell.err.req_name': 'يرجى إدخال اسمك.',
    'sell.err.name_short': 'يجب أن يتكون الاسم من 3 أحرف على الأقل.',
    'sell.err.name_invalid': 'يجب أن يحتوي الاسم على أحرف ومسافات فقط.',
    'sell.err.invalid_phone': 'يرجى إدخال رقم مصري صحيح (مثل: 01012345678).',
    'sell.err.req_photo': 'يرجى رفع صورة واحدة على الأقل لسيارتك.',
    'sell.err.max_photos': 'الحد الأقصى {0} صور مسموح بها.',
    'sell.err.img_type': '"${0}" ليست صورة صالحة. مقبول: JPEG، PNG، WebP، GIF فقط.',
    'sell.err.img_size': '"${0}" يتجاوز الحد الأقصى 10MB.',
    'sell.err.img_only': 'يُقبل فقط ملفات الصور (JPEG، PNG، WebP، GIF).',
    'sell.err.fix_errors': 'يرجى تصحيح الأخطاء في النموذج.',
    'sell.err.submit_failed': 'فشل في إرسال الإعلان.',
    'sell.err.network': 'خطأ في الشبكة — تعذر إرسال الإعلان. يرجى المحاولة مجدداً.',
    'sell.toast.submitted': 'تم إرسال إعلانك وهو في انتظار موافقة المشرف!',
    'sell.confirm.line1': 'تم إرسال الإعلان بنجاح!',
    'sell.confirm.line2': 'إعلانك قيد المراجعة. بمجرد الموافقة عليه سيظهر في القائمة.',
    
    // Car Details
    'details.page.title': 'تفاصيل السيارة | أوتوتريد',
    'details.crumb': 'تفاصيل السيارة',
    'car.specs.title': 'المواصفات',
    'car.btn.delete': 'حذف إعلاني',
    'car.btn.fav_add': 'أضف إلى المفضلة',
    'car.btn.fav_remove': 'إزالة من المفضلة',
    'car.location.title': 'الموقع التقريبي',
    'car.location.privacy': '🔒 الموقع الدقيق مخفي لخصوصية البائع. السيارة موجودة في مكان ما داخل المنطقة المظللة.',
    'car.fav.added': 'تمت الإضافة إلى المفضلة!',
    'car.fav.removed': 'تمت الإزالة من المفضلة',
    
    // Report Modal
    'car.report.title': 'الإبلاغ عن الإعلان',
    'car.report.reason': 'سبب الإبلاغ',
    'car.report.select': 'اختر سبباً',
    'car.report.reason.price': 'سعر مبالغ فيه',
    'car.report.reason.fake': 'معلومات مزيفة/خاطئة',
    'car.report.reason.scam': 'اشتباه في احتيال',
    'car.report.reason.duplicate': 'إعلان مكرر',
    'car.report.reason.other': 'أخرى',
    'car.report.details': 'تفاصيل إضافية',
    'car.report.details.ph': 'يرجى شرح المشكلة (اختياري)',
    'car.report.submit': 'إرسال البلاغ',
    'car.report.error': 'يرجى اختيار سبب.',
    'car.report.success': 'تم إرسال البلاغ بنجاح. شكرًا لك.',
    
    // Bidding
    'bid.no_bids': 'لا توجد مزايدات بعد',
    'bid.highest': 'الأعلى',
    'bid.history': 'سجل المزايدات',
    'bid.place_title': 'قدم مزايدة',
    'bid.asking_price': 'السعر المطلوب',
    'bid.highest_bid': 'أعلى مزايدة',
    'bid.total_bids': 'إجمالي المزايدات',
    'bid.login_prompt': 'سجل الدخول لتقديم مزايدة على هذه السيارة',
    'bid.min_bid': 'الحد الأدنى:',
    'bid.increment': 'زيادة',
    'bid.place_btn': 'مزايدة',
    'bid.placing': 'جاري...',
    
    // Browse
    'browse.page.title': 'تصفح السيارات | أوتوتريد',
    'browse.search.title': 'تصفية البحث',
    'browse.search.label': 'بحث',
    'browse.search.ph': 'الماركة، الموديل، كلمة مفتاحية...',
    'browse.price.label': 'نطاق السعر',
    'browse.price.min': 'الأدنى',
    'browse.price.max': 'الأقصى',
    'browse.price.apply': 'تطبيق',
    'browse.filter.clear': 'مسح جميع الفلاتر',
    'browse.btn.post': 'انشر إعلانك',
    'browse.btn.filters': 'فلاتر',
    'browse.sort.label': 'ترتيب حسب',
    'browse.sort.default': 'الافتراضي',
    'browse.sort.price_asc': 'السعر: من الأقل للأعلى',
    'browse.sort.price_desc': 'السعر: من الأعلى للأقل',
    'browse.sort.year_desc': 'السنة: الأحدث أولاً',
    'browse.sort.year_asc': 'السنة: الأقدم أولاً',
    'browse.empty.icon': 'لا توجد نتائج',
    'browse.empty.title': 'لا توجد سيارات تطابق بحثك',
    'browse.empty.desc': 'جرب كلمات مفتاحية مختلفة أو امسح فلاتر البحث.',
    'browse.cars_avail': 'سيارات متاحة',
    'browse.showing_cars': 'عرض {0} من {1} سيارة',
    'browse.min': 'الأدنى',
    'browse.max': 'الأقصى',
    'browse.active_filters': '{0} فلتر نشط',
    'browse.filtered': 'تمت التصفية:',
    
    // Cards
    'card.private_seller': 'بائع خاص',
    'card.photos': 'صور',
    
    // Auth Validations & Toasts
    'auth.ph.username': 'أدخل اسم المستخدم',
    'auth.ph.password': 'أدخل كلمة المرور',
    'auth.ph.choose_username': 'اختر اسم مستخدم',
    'auth.ph.phone': 'مثال: +20 101 234 5678',
    'auth.ph.create_pass': 'أنشئ كلمة مرور قوية',
    'auth.ph.confirm': 'تأكيد كلمة المرور',
    'auth.err.network': 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
    'auth.err.pass_length': 'يجب أن تتكون كلمة المرور من {0} أحرف على الأقل.',
    'auth.err.pass_upper': 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.',
    'auth.err.pass_number': 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.',
    'auth.err.pass_special': 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.',
    'auth.err.user_length_min': 'يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل.',
    'auth.err.user_length_max': 'يجب أن يتكون اسم المستخدم من 20 حرفًا كحد أقصى.',
    'auth.err.user_invalid': 'اسم المستخدم يمكن أن يحتوي على أحرف وأرقام وشرطة سفلية فقط.',
    'auth.err.req_user': 'يرجى إدخال اسم المستخدم.',
    'auth.err.req_pass': 'يرجى إدخال كلمة المرور.',
    'auth.err.req_phone': 'يرجى إدخال رقم الهاتف.',
    'auth.err.invalid_phone': 'يرجى إدخال رقم هاتف صحيح.',
    'auth.err.pass_match': 'كلمات المرور غير متطابقة.',
    'auth.toast.welcome_back': 'مرحباً بعودتك، {0}!',
    'auth.toast.welcome_new': 'مرحباً بك في أوتوتريد، {0}!',
    'auth.btn.signing_in': 'جاري تسجيل الدخول...',
    'auth.btn.creating_account': 'جاري إنشاء الحساب...',
    'auth.btn.show': 'إظهار',
    'auth.btn.hide': 'إخفاء',
    
    // Cities
    'city.cairo': 'القاهرة',
    'city.giza': 'الجيزة',
    'city.alexandria': 'الإسكندرية',
    'city.newcairo': 'القاهرة الجديدة',
    'city.6oct': 'السادس من أكتوبر',
    'city.mansoura': 'المنصورة',
    'city.tanta': 'طنطا',
    'city.assiut': 'أسيوط',
    'city.luxor': 'الأقصر',
    'city.aswan': 'أسوان',
    'city.zagazig': 'الزقازيق',
    'city.portsaid': 'بورسعيد',
    'city.suez': 'السويس',
    'city.hurghada': 'الغردقة',
    'city.sharm': 'شرم الشيخ',
    
    'settings.title': 'الإعدادات',
    'settings.theme': 'الوضع الداكن',
    'settings.lang': 'English',
    'settings.account': 'الحساب',
    'settings.guest': 'زائر',
    'settings.not_logged': 'غير مسجل الدخول',
    'settings.guest_access': 'وصول الزائر',
    'settings.role.admin': 'مدير النظام',
    'settings.role.user': 'مستخدم',
    'settings.btn.logout': 'تسجيل الخروج',
    'settings.btn.login': 'تسجيل الدخول',
    'settings.btn.editProfile': 'تعديل الملف الشخصي',
    'settings.edit.title': 'تعديل الملف الشخصي',
    'settings.edit.subtitle': 'تحديث بيانات حسابك',
    'settings.edit.pass_optional': 'كلمة المرور الجديدة (اختياري)',
    'settings.edit.pass_ph': 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية',
    'settings.edit.cancel': 'إلغاء',
    'settings.edit.save': 'حفظ',
    'settings.edit.saving': 'جاري الحفظ...',
    'settings.toast.logged_out': 'تم تسجيل خروجك.',
    'settings.toast.no_changes': 'لم يتم إجراء أي تغييرات.',
    'settings.toast.profile_updated': 'تم تحديث الملف الشخصي بنجاح!',
    'settings.toast.update_failed': 'فشل تحديث الملف الشخصي.',
    
    // General
    'general.loading': 'جاري التحميل...',
    'general.empty': 'لا توجد نتائج.',
    'general.guest_restricted': 'يتطلب وجود حساب',
    'general.guest_toast': 'يجب عليك تسجيل الدخول أولاً.',
    'general.view_details': 'عرض التفاصيل',
    'general.network_err': 'حدث خطأ في الشبكة.',
    
    // Hero extra
    'hero.stat.satisfaction': 'رضا العملاء',
    'hero.subtitle2': 'أدخل التفاصيل أدناه وستكون سيارتك مرئية لآلاف المشترين',
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
  // Apply once early for static elements, then again after auth/settings inject their elements
  setTimeout(applyTranslations, 50);
  setTimeout(applyTranslations, 350);
});
