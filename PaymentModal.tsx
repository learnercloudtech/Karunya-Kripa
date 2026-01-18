import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  
  // Default to the provided UPI ID, but allow user to edit it for testing
  const [vpa, setVpa] = useState('9845255777@kbl');

  // Generate a real UPI string based on the VPA and Amount
  useEffect(() => {
    const cleanVpa = vpa.trim();
    if (!cleanVpa) return;

    // Components needs to be encoded to ensure URL validity
    const payeeName = encodeURIComponent('Karunya Kripa');
    const note = encodeURIComponent('Donation');
    // Random transaction reference to prevent "duplicate transaction" errors during testing
    const tr = Math.floor(Math.random() * 1000000000).toString();

    // Standard UPI URL format
    // pa: Payee Address (VPA)
    // pn: Payee Name
    // am: Amount
    // cu: Currency
    // tn: Transaction Note
    // tr: Transaction Ref
    const upiString = `upi://pay?pa=${cleanVpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}&tr=${tr}`;
    
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`);
  }, [amount, vpa]);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Payment Gateway
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Amount Banner */}
          <div className="bg-brand-primary px-4 py-4 text-white flex justify-between items-center">
             <span className="text-sm font-medium opacity-90">Total Payable</span>
             <span className="text-2xl font-bold">₹{amount}</span>
          </div>

          <div className="flex h-[30rem]">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                <button 
                    onClick={() => setMethod('upi')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${method === 'upi' ? 'bg-white text-brand-primary border-brand-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                >
                    UPI / QR
                </button>
                <button 
                    onClick={() => setMethod('card')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${method === 'card' ? 'bg-white text-brand-primary border-brand-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                >
                    Card
                </button>
                <button 
                    onClick={() => setMethod('netbanking')}
                    className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${method === 'netbanking' ? 'bg-white text-brand-primary border-brand-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                >
                    Netbanking
                </button>
            </div>

            {/* Content Area */}
            <div className="w-2/3 p-6 overflow-y-auto relative">
                {method === 'upi' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">Scan with any UPI App</p>
                            <div className="bg-white border border-gray-200 inline-block p-2 rounded-lg shadow-sm">
                                {qrUrl ? <img src={qrUrl} alt="UPI QR" className="w-32 h-32" /> : <div className="w-32 h-32 bg-gray-100 animate-pulse"></div>}
                            </div>
                        </div>

                        {/* VPA Configuration Input for Testing */}
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-left">
                            <label className="block text-[10px] font-bold text-yellow-800 uppercase mb-1">
                                For Testing: Enter Valid UPI ID
                            </label>
                            <input 
                                type="text" 
                                value={vpa}
                                onChange={(e) => setVpa(e.target.value)}
                                className="block w-full text-xs border-yellow-300 rounded p-1.5 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-700"
                                placeholder="e.g. friend@okaxis"
                            />
                             <ul className="mt-2 list-disc list-inside text-[10px] text-yellow-800 space-y-1 leading-tight">
                                <li><strong>Self-Payment Error:</strong> You cannot pay to your own UPI ID from the same phone app.</li>
                                <li>Use a <strong>friend's UPI ID</strong> or a merchant ID to test successfully.</li>
                            </ul>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 bg-white text-xs text-gray-500">OR PAY USING</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={handlePay} disabled={isProcessing} className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-4 mr-2" />
                                Google Pay
                            </button>
                            <button onClick={handlePay} disabled={isProcessing} className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 mr-2" />
                                PhonePe
                            </button>
                        </div>
                    </div>
                )}

                {method === 'card' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Card Number</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div className="flex gap-2">
                             <div className="w-1/2">
                                <label className="block text-xs font-medium text-gray-700">Expiry</label>
                                <input type="text" placeholder="MM / YY" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                             </div>
                             <div className="w-1/2">
                                <label className="block text-xs font-medium text-gray-700">CVV</label>
                                <input type="password" placeholder="123" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                             </div>
                        </div>
                        <button 
                            onClick={handlePay}
                            disabled={isProcessing}
                            className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
                        </button>
                    </div>
                )}
                
                {method === 'netbanking' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Select your bank</p>
                        <div className="grid grid-cols-2 gap-2">
                             {['HDFC', 'SBI', 'ICICI', 'Axis'].map(bank => (
                                 <button key={bank} onClick={handlePay} disabled={isProcessing} className="border border-gray-300 rounded-md py-2 text-sm hover:bg-gray-50 hover:border-brand-primary transition-colors">
                                     {bank}
                                 </button>
                             ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;