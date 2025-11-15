import React from 'react';

import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  const { language, t } = useLanguage();
  
  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo3.jpeg" alt="Smart Construction Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
            <div>
              <h1 className="text-3xl font-bold text-orange-500">{language === 'en' ? 'SMART' : 'البناء'}</h1>
              <h2 className="text-3xl font-bold text-orange-600">{language === 'en' ? 'CONSTRUCTION' : 'الذكي'}</h2>
            </div>
          </div>
          
          <div className="flex space-x-3">
<button
              onClick={onHelpClick}
              className="px-6 py-2 bg-white border border-orange-300 rounded-lg text-orange-600 
                       hover:bg-orange-50 transition-colors duration-200 font-medium"
            >
              <span>{t('help')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;