
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';
import { defaultNews } from '../services/geminiService';
import { NewsArticle } from '../types';


const HomePage: React.FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const ACT_WEBSITE = "https://www.animalcaretrustindia.org";

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary leading-tight">
              {t('hero_title')}
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              {t('hero_subtitle')}
            </p>
            <button
              onClick={() => navigate('/volunteer')}
              className="mt-8 bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              {t('join_community')}
            </button>
          </div>
          <div className="relative flex justify-center items-center">
             <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-200 rounded-full blur-xl opacity-70"></div>
             <img src="https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?q=80&w=778&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="A happy, friendly dog outdoors" className="relative w-full max-w-sm rounded-lg" />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1737985430767-df6836b5094c?q=80&w=774&auto=format=fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="A volunteer caring for a cat" className="rounded-lg shadow-xl w-full aspect-[3/4] object-cover" />
                <img src="https://images.unsplash.com/photo-1613205286476-9c2450122546?q=80&w=1884&auto=format=fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="A volunteer holding a small white dog" className="rounded-lg shadow-xl w-full aspect-[3/4] object-cover mt-8" />
            </div>
            <div>
                 <h2 className="text-3xl md:text-4xl font-bold font-serif text-text-primary">{t('about_us_title')}</h2>
                 <p className="mt-4 text-text-secondary">{t('about_us_p1')}</p>
                 <p className="mt-4 text-text-secondary">{t('about_us_p2')}</p>
                 <p className="mt-4 text-text-secondary">{t('about_us_p3')}</p>
                 <a 
                   href={ACT_WEBSITE}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="mt-6 inline-block text-brand-primary font-semibold hover:underline"
                 >
                   {t('learn_more')}
                 </a>
            </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-text-primary">{t('what_we_do_title')}</h2>
         <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
                <h3 className="text-xl font-bold font-serif text-text-primary">{t('what_we_do_abc')}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t('what_we_do_abc_desc')}</p>
            </Card>
             <Card className="p-6">
                <h3 className="text-xl font-bold font-serif text-text-primary">{t('what_we_do_vaccination')}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t('what_we_do_vaccination_desc')}</p>
            </Card>
             <Card className="p-6">
                <h3 className="text-xl font-bold font-serif text-text-primary">{t('what_we_do_adoptions')}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t('what_we_do_adoptions_desc')}</p>
            </Card>
             <Card className="p-6">
                <h3 className="text-xl font-bold font-serif text-text-primary">{t('what_we_do_rescue')}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t('what_we_do_rescue_desc')}</p>
            </Card>
        </div>
      </section>

      {/* New Image Gallery Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-text-primary">Meet Some of Our Friends</h2>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <img src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=800&auto=format=fit=crop" alt="A portrait of a Jack Russell Terrier dog" className="rounded-lg shadow-lg aspect-square object-cover transform hover:scale-105 transition-transform duration-300"/>
            <img src="https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=800&auto=format=fit=crop" alt="A yawning tabby kitten" className="rounded-lg shadow-lg aspect-square object-cover transform hover:scale-105 transition-transform duration-300"/>
            <img src="https://images.unsplash.com/photo-1597127875452-138259b1932e?q=80&w=774&auto=format=fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="A small fluffy white puppy" className="rounded-lg shadow-lg aspect-square object-cover transform hover:scale-105 transition-transform duration-300"/>
            <img src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format=fit=crop" alt="A tabby cat relaxing on a sofa" className="rounded-lg shadow-lg aspect-square object-cover transform hover:scale-105 transition-transform duration-300"/>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-text-primary">{t('latest_news_title')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-text-secondary">{t('latest_news_subtitle')}</p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {defaultNews.map((article, index) => (
                <Card hoverEffect key={index}>
                    <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover"/>
                    <div className="p-6">
                        <h3 className="text-lg font-bold font-serif text-text-primary">{t(`news_${index + 1}_title` as any)}</h3>
                        <p className="mt-2 text-sm text-text-secondary">{article.summary}</p>
                        <a href="#" onClick={(e) => e.preventDefault()} className="mt-4 inline-block text-brand-primary font-semibold text-sm">
                          {t('read_more')}
                        </a>
                    </div>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
