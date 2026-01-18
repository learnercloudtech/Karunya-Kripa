import React from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { NavLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  const ACT_WEBSITE = "https://www.animalcaretrustindia.org";

  return (
    <footer className="bg-gray-200 text-text-secondary pt-10">
      <div className="container mx-auto px-4">
        <div className="relative mb-10">
           <img src="https://images.unsplash.com/photo-1727822323320-50d2d9cbda8c?q=80&w=1740&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="A person petting a happy dog" className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-10">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold font-serif text-text-primary mb-2">{t('app_title')}</h3>
            <p className="text-sm">
              {t('footer_about')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-text-primary mb-2">{t('footer_explore')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={ACT_WEBSITE} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                  &rsaquo; {t('footer_about_us')}
                </a>
              </li>
              <li>
                <a href={ACT_WEBSITE} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                  &rsaquo; {t('footer_gallery')}
                </a>
              </li>
            </ul>
          </div>
           <div>
            <h3 className="text-lg font-bold font-serif text-text-primary mb-2">{t('footer_links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/faq" className="hover:text-brand-primary transition-colors">&rsaquo; {t('footer_faq')}</NavLink></li>
              <li><NavLink to="/privacy" className="hover:text-brand-primary transition-colors">&rsaquo; {t('footer_privacy')}</NavLink></li>
              <li><NavLink to="/terms" className="hover:text-brand-primary transition-colors">&rsaquo; {t('footer_terms')}</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-text-primary mb-2">{t('footer_contact')}</h3>
             <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                <a href="mailto:animalcaretrust@gmail.com" className="hover:text-brand-primary">animalcaretrust@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                <a href="tel:+919845255777" className="hover:text-brand-primary">+91 98452 55777</a>
              </li>
            </ul>
            <div className="mt-4">
                <h4 className="text-sm font-semibold text-text-primary mb-2">{t('footer_follow_us')}</h4>
                <div className="flex items-center gap-4">
                    <a href="https://www.instagram.com/animalcaretrust" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.116 0-3.483.011-4.692.068-2.61.118-3.766 1.272-3.884 3.884-.057 1.208-.067 1.575-.067 4.692s.01 3.483.067 4.692c.118 2.61 1.274 3.766 3.884 3.884 1.209.057 1.575.067 4.692.067s3.483-.01 4.692-.067c2.61-.118 3.766-1.274 3.884-3.884.057-1.209.067-1.575.067-4.692s-.01-3.483-.067-4.692c-.118-2.612-1.274-3.766-3.884-3.884-1.208-.057-1.575-.067-4.692-.067zM12 6.837c-2.846 0-5.163 2.317-5.163 5.163s2.317 5.163 5.163 5.163 5.163-2.317 5.163-5.163-2.317-5.163-5.163-5.163zm0 8.531c-1.853 0-3.368-1.515-3.368-3.368s1.515-3.368 3.368-3.368 3.368 1.515 3.368 3.368-1.515 3.368-3.368 3.368zm4.933-8.825c-.598 0-1.082.484-1.082 1.082s.484 1.082 1.082 1.082 1.082-.484 1.082-1.082-.484-1.082-1.082-1.082z"/></svg>
                    </a>
                     <a href="https://www.facebook.com/animalcaretrust" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                    </a>
                    <a href="https://twitter.com/animalcaretrust" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 py-4 text-center">
            <p className="text-xs">&copy; {new Date().getFullYear()} {t('footer_copyright')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;