
import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';
import { initiateDonation, isRazorpayActivated } from '../services/paymentService';
import PaymentModal from '../components/PaymentModal';

const DonatePage: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'money' | 'food' | 'supplies' | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleDonateClick = (type: 'money' | 'food' | 'supplies') => {
    setActiveTab(type === activeTab ? null : type);
    setPaymentStatus(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    // If Real Razorpay Key is NOT present, show the custom Mock Gateway
    if (!isRazorpayActivated()) {
        setShowPaymentModal(true);
        return;
    }

    // Otherwise use Real Razorpay
    setIsProcessing(true);
    setPaymentStatus(null);

    await initiateDonation({
        amount: numAmount,
        onSuccess: (data) => {
            setIsProcessing(false);
            setPaymentStatus('success');
            setAmount('');
        },
        onFailure: (error) => {
            setIsProcessing(false);
            setPaymentStatus('error');
        }
    });
  };

  const handleMockSuccess = () => {
      setPaymentStatus('success');
      setAmount('');
      setShowPaymentModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-text-primary">{t('donate_title')}</h1>
        <p className="mt-2 text-text-secondary">{t('donate_subtitle')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MONEY DONATION CARD */}
        <Card hoverEffect={false} className={`text-center transition-all duration-300 ${activeTab === 'money' ? 'ring-2 ring-brand-primary shadow-lg scale-105' : ''}`}>
            <div className="p-8">
              <h2 className="text-xl font-semibold text-brand-primary">{t('donate_type_money')}</h2>
              <p className="text-sm text-text-secondary mt-2">{t('donate_money_desc')}</p>
              
              {activeTab === 'money' ? (
                  <div className="mt-6 animate-fadeIn">
                     {paymentStatus === 'success' ? (
                         <div className="bg-green-50 p-4 rounded-lg">
                             <div className="text-green-500 text-4xl mb-2">✓</div>
                             <h3 className="text-green-800 font-bold">{t('payment_success_title')}</h3>
                             <p className="text-green-700 text-xs mt-1">{t('payment_success_message')}</p>
                             <button 
                                onClick={() => setPaymentStatus(null)}
                                className="mt-4 text-xs text-green-700 underline hover:text-green-900"
                             >
                                Donate again
                             </button>
                         </div>
                     ) : (
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1 text-left">{t('donation_amount_label')}</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-400 sm:text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 pl-7 focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                                        placeholder="500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>
                            {paymentStatus === 'error' && (
                                <p className="text-xs text-red-600 mb-3">{t('payment_failed')}</p>
                            )}
                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 flex justify-center items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('donation_processing')}
                                    </>
                                ) : t('donate_button')}
                            </button>
                        </form>
                     )}
                  </div>
              ) : (
                <button 
                    onClick={() => handleDonateClick('money')}
                    className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                >
                    Donate Now
                </button>
              )}
            </div>
        </Card>

        {/* FOOD DONATION CARD */}
        <Card hoverEffect={true} className="text-center">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-brand-primary">{t('donate_type_food')}</h2>
              <p className="text-sm text-text-secondary mt-2">Help us keep their bowls full.</p>
              <button 
                onClick={() => alert("Please contact +91 98452 55777 for food drops.")}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Contact to Drop
              </button>
            </div>
        </Card>

        {/* SUPPLIES DONATION CARD */}
        <Card hoverEffect={true} className="text-center">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-brand-primary">{t('donate_type_supplies')}</h2>
              <p className="text-sm text-text-secondary mt-2">Blankets, medicines, and more.</p>
              <button 
                onClick={() => alert("Please contact +91 98452 55777 for supply drops.")}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Contact to Drop
              </button>
            </div>
        </Card>
      </div>

      <div className="mt-12 text-center text-text-secondary bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-2">Other Payment Methods</h3>
            <p className="text-sm">We accept all major UPI apps (Google Pay, PhonePe, Paytm) and Cards via our secure gateway.</p>
            <div className="flex justify-center gap-4 mt-4 grayscale opacity-60">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
            </div>
      </div>

      {/* Internal Mock Payment Gateway Modal */}
      {showPaymentModal && (
          <PaymentModal 
            amount={parseFloat(amount)} 
            onClose={() => setShowPaymentModal(false)} 
            onSuccess={handleMockSuccess}
          />
      )}

    </div>
  );
};

export default DonatePage;
