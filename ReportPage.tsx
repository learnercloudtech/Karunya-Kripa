import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';

const ReportPage: React.FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();

  const reportOptions = [
    { type: 'emergency', label: t('report_type_emergency'), path: '/report/emergency' },
    { type: 'abuse', label: t('report_type_abuse'), path: '/report/abuse' },
    { type: 'missing', label: t('report_type_missing_pet'), path: '/report/missing' },
    { type: 'found', label: t('report_type_found_pet'), path: '/report/found' },
    { type: 'sterilization', label: t('report_type_sterilization'), path: '/report/sterilization' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-center mb-8 text-text-primary">{t('report_page_title')}</h1>
      <div className="space-y-4">
        {reportOptions.map((option) => (
          <Card 
            key={option.type} 
            onClick={() => navigate(option.path)}
            hoverEffect={true}
            className="border-l-4 border-brand-primary"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">{option.label}</h2>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportPage;