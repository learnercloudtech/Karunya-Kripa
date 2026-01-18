import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import { Language } from '../types';
import { PawPrint } from './icons/PawPrint';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLocalization();
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      // Show manual instructions if automatic prompt is unavailable (e.g. iOS)
      alert(t('install_manual_instruction'));
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.KN : Language.EN);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand-primary font-semibold' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold text-text-primary">{t('app_title')}</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>{t('nav_home')}</NavLink>
            <NavLink to="/report" className={navLinkClass}>{t('nav_report')}</NavLink>
            <NavLink to="/adopt" className={navLinkClass}>{t('nav_adopt')}</NavLink>
            <NavLink to="/volunteer" className={navLinkClass}>{t('nav_volunteer')}</NavLink>
            <NavLink to="/donate" className={navLinkClass}>{t('nav_donate')}</NavLink>
            <NavLink to="/admin" className={navLinkClass}>{t('nav_admin')}</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 text-sm font-medium text-brand-primary bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <DownloadIcon />
                <span className="hidden sm:inline">{t('download_app')}</span>
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 bg-gray-200"
            >
              <span className="sr-only">Toggle Language</span>
              <span
                className={`${
                  language === Language.KN ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              >
                <span
                  className={`${
                    language === Language.KN ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                  } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                >
                  <span className="text-xs font-bold text-gray-600">EN</span>
                </span>
                <span
                  className={`${
                    language === Language.KN ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                  } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                >
                  <span className="text-xs font-bold text-brand-primary">ಕ</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;