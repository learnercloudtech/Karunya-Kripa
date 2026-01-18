import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';
import { API_BASE_URL } from '../lib/config';

const VolunteerPage: React.FC = () => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setInterests(prev => [...prev, value]);
    } else {
      setInterests(prev => prev.filter(interest => interest !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const response = await fetch(`${API_BASE_URL}/api/volunteers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, interests }),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to register. Please try again.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = 'Cannot connect to the server. Please check your backend and CORS configuration.';
            }
            throw new Error(errorMessage);
        }

        setSubmitted(true);

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8 bg-green-100 border-l-4 border-green-500">
                <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
                <p className="mt-2 text-green-700">Your volunteer registration has been received. We will contact you shortly with more information.</p>
            </Card>
        </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-text-primary">{t('volunteer_title')}</h1>
        <p className="mt-2 text-text-secondary">{t('volunteer_subtitle')}</p>
      </div>
      <Card>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary">{t('volunteer_form_name')}</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">{t('volunteer_form_email')}</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary">{t('volunteer_form_phone')}</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary">{t('volunteer_form_interests')}</label>
              <div className="mt-3 space-y-3">
                {['Rescue & Transport', 'Adoption Events', 'Fundraising', 'Community Outreach'].map(interest => (
                  <div key={interest} className="flex items-center">
                    <input id={interest} name="interests" type="checkbox" value={interest} onChange={handleInterestChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                    <label htmlFor={interest} className="ml-3 block text-sm text-text-secondary">{interest}</label>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
              {isSubmitting ? 'Registering...' : t('volunteer_submit')}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default VolunteerPage;
