import React, { useState, useMemo } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { AdoptionAnimal } from '../types';
import Card from '../components/Card';

const mockAnimals: AdoptionAnimal[] = [
  { id: '1', name: 'Buddy', age: '2 years', breed: 'Indie', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'A friendly and playful companion who loves long walks.' },
  { id: '2', name: 'Lucy', age: '1 year', breed: 'Domestic Shorthair', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'Sweet and gentle, Lucy is a lovely cat who enjoys quiet naps and chin scratches.' },
  { id: '3', name: 'Rocky', age: '4 years', breed: 'Indie', imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'A loyal and protective friend looking for a calm home.' },
  { id: '4', name: 'Daisy', age: '6 months', breed: 'Puppy', imageUrl: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'Full of energy and curiosity, this pup is ready to learn.' },
  { id: '5', name: 'Max', age: '3 years', breed: 'Indie Mix', imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'A calm and loving dog that enjoys lounging around.' },
  { id: '6', name: 'Zoe', age: '8 months', breed: 'Kitten', imageUrl: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?q=80&w=400&h=300&fit=crop&ixlib=rb-4.0.3', description: 'A playful and curious kitten who loves chasing toys.' },
];

const AdoptionPage: React.FC = () => {
  const { t } = useLocalization();
  const [breedFilter, setBreedFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

  const uniqueBreeds = useMemo(() => {
    const breeds = new Set(mockAnimals.map(animal => animal.breed));
    return ['all', ...Array.from(breeds)];
  }, []);

  const ageCategories = {
    all: t('all_ages'),
    puppy: t('age_puppy'),
    young: t('age_young'),
    adult: t('age_adult'),
  };

  const checkAgeCategory = (ageString: string, category: string): boolean => {
    if (category === 'all') return true;
    
    const [value, unit] = ageString.split(' ');
    const numValue = parseInt(value, 10);

    if (unit.includes('month')) {
        return category === 'puppy';
    }

    if (unit.includes('year')) {
        if (numValue < 1) return category === 'puppy';
        if (numValue >= 1 && numValue < 3) return category === 'young';
        if (numValue >= 3) return category === 'adult';
    }

    return false;
  };

  const filteredAnimals = useMemo(() => mockAnimals.filter(animal => {
    const breedMatch = breedFilter === 'all' || animal.breed === breedFilter;
    const ageMatch = ageFilter === 'all' || checkAgeCategory(animal.age, ageFilter);
    return breedMatch && ageMatch;
  }), [breedFilter, ageFilter, t]);


  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-text-primary">{t('adoption_title')}</h1>
        <p className="mt-2 text-text-secondary">{t('adoption_subtitle')}</p>
      </div>

      <div className="mb-8">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="breed-filter" className="block text-sm font-medium text-text-primary">{t('filter_by_breed')}</label>
              <select 
                id="breed-filter" 
                value={breedFilter} 
                onChange={e => setBreedFilter(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
              >
                {uniqueBreeds.map(breed => (
                  <option key={breed} value={breed}>{breed === 'all' ? t('all_breeds') : breed}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="age-filter" className="block text-sm font-medium text-text-primary">{t('filter_by_age')}</label>
              <select 
                id="age-filter" 
                value={ageFilter} 
                onChange={e => setAgeFilter(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
              >
                {Object.entries(ageCategories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAnimals.map(animal => (
            <Card key={animal.id} className="flex flex-col">
              <img src={animal.imageUrl} alt={animal.name} className="w-full h-48 object-cover" />
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-text-primary">{animal.name}</h2>
                <p className="text-sm text-text-secondary">{animal.breed} &bull; {animal.age}</p>
                <p className="mt-2 text-text-secondary text-sm flex-grow">{animal.description}</p>
                <button className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                  {t('adopt_me')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Card className="inline-block p-8">
            <p className="text-xl text-text-secondary">{t('no_animals_found')}</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdoptionPage;