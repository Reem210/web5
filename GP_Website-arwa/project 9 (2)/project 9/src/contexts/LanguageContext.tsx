import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'upload.bim': 'UPLOAD BIM',
    'click.to.upload': 'CLICK HERE TO UPLOAD',
    'floor.level': 'FLOOR LEVEL',
    'enter.here': 'ENTER HERE',
    'min.column.width': 'MINIMUM COLUMN WIDTH (OPTIONAL)',
    'max.distance': 'MAXIMUM DISTANCE BETWEEN COLUMNS (OPTIONAL)',
    'deviation.tolerance': 'DEVIATION TOLERANCE THRESHOLD (OPTIONAL)',
    'start': 'Start',
    'processing': 'Processing...',
    'help': 'Help',
    'language': 'العربية',
    'smart.construction': 'SMART CONSTRUCTION',
    'help.title': 'Help',
    'help.description': 'This application helps you analyze BIM files for construction projects.',
    'loading': 'LOADING...',
    'upload.success': 'File uploaded successfully!'
  },
  ar: {
    'upload.bim': 'رفع نموذج BIM',
    'click.to.upload': 'اضغط هنا للرفع',
    'floor.level': 'مستوى الطابق',
    'enter.here': 'أدخل هنا',
    'min.column.width': 'الحد الأدنى لعرض العمود (اختياري)',
    'max.distance': 'الحد الأقصى للمسافة بين الأعمدة (اختياري)',
    'deviation.tolerance': 'حد التفاوت المسموح به (اختياري)',
    'start': 'ابدأ',
    'processing': 'جاري المعالجة...',
    'help': 'مساعدة',
    'language': 'English',
    'smart.construction': 'البناء الذكي',
    'help.title': 'مساعدة',
    'help.description': 'يساعدك هذا التطبيق على تحليل ملفات BIM لمشاريع البناء.',
    'loading': 'جاري التحميل...',
    'upload.success': 'تم رفع الملف بنجاح!'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};