// Razorpay Type Definitions
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ------------------------------------------------------------------
// STEP 1: PASTE YOUR RAZORPAY KEY ID HERE TO ENABLE REAL PAYMENTS
// Example: 'rzp_test_1DP5mmOlF5HG'
// Leave empty '' to use the internal Mock Gateway (UPI/QR/Card UI).
// ------------------------------------------------------------------
const REAL_RAZORPAY_KEY_ID: string = ''; 

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Helper to check if the app is configured for real payments.
 */
export const isRazorpayActivated = (): boolean => {
    return REAL_RAZORPAY_KEY_ID.length > 0 && REAL_RAZORPAY_KEY_ID !== 'rzp_test_placeholder';
};

/**
 * Dynamically loads the Razorpay SDK script.
 */
const loadRazorpayScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Simulates a backend API call to create a Razorpay order.
 */
const createMockOrder = async (amount: number): Promise<PaymentOrder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `order_${Math.random().toString(36).substring(2, 15)}`,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
      });
    }, 500);
  });
};

interface PaymentOptions {
  amount: number;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

/**
 * Initiates the Razorpay payment flow.
 * NOTE: This is only called if isRazorpayActivated() is true.
 */
export const initiateDonation = async ({ amount, onSuccess, onFailure }: PaymentOptions) => {
  const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    onFailure('SDK_LOAD_FAILED');
    return;
  }

  try {
    const order = await createMockOrder(amount);

    const options = {
      key: REAL_RAZORPAY_KEY_ID,
      amount: order.amount, 
      currency: order.currency,
      name: "Karunya Kripa",
      description: "Donation for Animal Welfare",
      image: "https://cdn-icons-png.flaticon.com/512/2171/2171991.png",
      handler: function (response: any) {
        console.log("Payment Successful:", response);
        onSuccess(response);
      },
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      theme: {
        color: "#5e81f4"
      },
      modal: {
        ondismiss: function() {
            // onFailure('Cancelled');
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any){
        console.error("Payment Failed:", response.error);
        onFailure(response.error);
    });
    rzp1.open();

  } catch (error) {
    console.error("Error initiating payment:", error);
    onFailure(error);
  }
};